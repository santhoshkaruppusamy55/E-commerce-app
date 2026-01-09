const { Cart, CartItem, Product } = require("../../models");

exports.getCart = async (req, res) => {
  const cart = await Cart.findOne({
    where: { userId: req.user.id },
    include: [{ model: CartItem, include: [Product] }]
  });

  res.json({ cart });
};

exports.addItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, qty } = req.body;

    const quantity = parseInt(qty, 10);

    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (quantity > product.qtyAvailable) {
      return res.status(400).json({
        message: "Quantity exceeds available stock"
      });
    }

    const [cart] = await Cart.findOrCreate({ where: { userId } });

    const cartItem = await CartItem.findOne({
      where: { cartId: cart.id, productId }
    });

    if (cartItem) {
      const newQty = cartItem.qty + quantity;

      if (newQty > product.qtyAvailable) {
        return res.status(400).json({
          message: "Quantity exceeds available stock"
        });
      }

      await cartItem.update({ qty: newQty });
    } else {
      await CartItem.create({
        cartId: cart.id,
        productId,
        qty: quantity,
        unitPrice: product.price
      });
    }

    return res.status(200).json({ message: "Item added to cart" });

  } catch (err) {
    console.error("Add item error:", err);
    return res.status(500).json({
      message: "Failed to add item to cart"
    });
  }
};


exports.updateItem = async (req, res) => {
  try {
    const { qty } = req.body;
    const itemId = req.params.id;

    const quantity = parseInt(qty, 10);

    const cartItem = await CartItem.findOne({
      where: { id: itemId },
      include: [Product]
    });

    if (!cartItem) {
      return res.status(404).json({
        message: "Cart item not found"
      });
    }

    if (quantity > cartItem.Product.qtyAvailable) {
      return res.status(400).json({
        message: "Quantity exceeds available stock"
      });
    }

    await cartItem.update({ qty: quantity });

    return res.status(200).json({
      message: "Cart item updated successfully"
    });

  } catch (err) {
    console.error("Update cart item error:", err);
    return res.status(500).json({
      message: "Failed to update cart item"
    });
  }
};


// exports.removeItem = async (req, res) => {
//   try {
//     const itemId = req.params.id;

//     const deleted = await CartItem.destroy({
//       where: { id: itemId }
//     });

//     if (!deleted) {
//       return res.status(404).json({
//         message: "Cart item not found"
//       });
//     }

//     return res.status(200).json({
//       message: "Item removed from cart"
//     });

//   } catch (err) {
//     console.error("Remove cart item error:", err);
//     return res.status(500).json({
//       message: "Failed to remove cart item"
//     });
//   }
// };

exports.removeItem = async (req, res) => {
  const deleted = await CartItem.destroy({
    where: { id: req.params.id }
  });

  if (!deleted) {
    return res.status(404).json({ message: "Cart item not found" });
  }

  return res.status(204).send();
};



exports.showCheckout = async (req, res) => {
  const cart = await Cart.findOne({
    where: { userId: req.user.id },
    include: [{ model: CartItem, include: [Product] }]
  });

  if (!cart || cart.CartItems.length === 0) {
    return res.status(400).json({ message: "Cart is empty" });
  }
  
  const items = cart.CartItems.sort(
    (a, b) => (b.qty * b.unitPrice) - (a.qty * a.unitPrice)
  );

  res.json({ cart, items });
};