const {
  sequelize,
  Cart,
  CartItem,
  Product,
  Order,
  OrderItem
} = require("../../models");
const { Op } = require("sequelize");

const emailQueue = require("../../queues/email.queue");

exports.placeOrder = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const userId = req.user.id;
    const {
      shippingName,
      shippingEmail,
      shippingPhone,
      shippingAddress
    } = req.body;

    const cart = await Cart.findOne({ where: { userId }, transaction: t });
    if (!cart) {
      await t.rollback();
      return res.redirect("/v1/cart");
    }

    const cartItems = await CartItem.findAll({
      where: { cartId: cart.id },
      include: [Product],
      transaction: t
    });

    if (cartItems.length === 0) {
      await t.rollback();
      return res.redirect("/v1/cart");
    }

    let total = 0;

    for (const item of cartItems) {
      if (item.qty > item.Product.qtyAvailable) {
        await t.rollback();
        return res.redirect("/v1/cart");
      }
      total += item.qty * item.unitPrice;
    }

    const order = await Order.create({
      userId,
      total,
      shippingName,
      shippingEmail,
      shippingPhone,
      shippingAddress
    }, { transaction: t });

    for (const item of cartItems) {
      await OrderItem.create({
        orderId: order.id,
        productId: item.productId,
        qty: item.qty,
        unitPrice: item.unitPrice
      }, { transaction: t });

      const updated = await Product.update(
        {
          qtyAvailable: sequelize.literal(`"qtyAvailable" - ${item.qty}`)
        },
        {
          where: {
            id: item.productId,
            qtyAvailable: { [Op.gte]: item.qty }
          },
          transaction: t
        }
      );

      if (updated[0] === 0) {
        throw new Error("Stock changed");
      }
    }

    await CartItem.destroy({
      where: { cartId: cart.id },
      transaction: t
    });

    await t.commit();

    await emailQueue.add("email", {
      type: "order-confirmation",
      to: shippingEmail,
      payload: {
        orderId: order.id,
        total,
        items: cartItems.map(item => ({
          title: item.Product.title,
          qty: item.qty,
          unitPrice: item.unitPrice
        }))
      }
    });

    return res.redirect(`/v1/orders/${order.id}`);

  } catch (err) {
    await t.rollback();
    console.error(err);
    res.status(500).send("Order failed");
  }
};

exports.listOrders = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 10;
  const offset = (page - 1) * limit;

  const { rows: orders, count } = await Order.findAndCountAll({
    where: { userId: req.user.id },
    order: [["createdAt", "DESC"]],
    limit,
    offset
  });

  res.json({
    orders,
    currentPage: page,
    totalPages: Math.ceil(count / limit)
  });
};

exports.showOrder = async (req, res) => {
  const order = await Order.findOne({
    where: {
      id: req.params.id,
      userId: req.user.id
    },
    include: [{ model: OrderItem, include: [Product] }]
  });

  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  res.json({ order });
};
