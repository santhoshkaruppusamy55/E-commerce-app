const request = require("supertest");
const jwt = require("jsonwebtoken");
const app = require("../app");
const redisClient = require("../config/redis.config");

const {
  sequelize,
  User,
  Category,
  Product,
  Cart,
  CartItem,
  Order,
  OrderItem
} = require("../models");

describe("Orders Integration Tests", () => {
  let user;
  let otherUser;
  let category;
  let product;
  let token;
  let jti;

  const authCookie = () => [`accessToken=${token}`];

  beforeAll(async () => {
    await sequelize.authenticate();
  });

  beforeEach(async () => {
 
    await OrderItem.destroy({ where: {} });
    await Order.destroy({ where: {} });
    await CartItem.destroy({ where: {} });
    await Cart.destroy({ where: {} });
    await Product.destroy({ where: {} });
    await Category.destroy({ where: {} });
    await User.destroy({ where: {} });

    user = await User.create({
      name: "Order User",
      email: "order@test.com",
      password: "password123"
    });

    otherUser = await User.create({
      name: "Other User",
      email: "other@test.com",
      password: "password123"
    });

    
    category = await Category.create({
      name: "Electronics"
    });


    product = await Product.create({
      title: "iPhone 15",
      price: 1000,
      qtyAvailable: 5,
      createdBy: user.id,
      categoryId: category.id
    });

    
    jti = `jti-${Date.now()}`;
    token = jwt.sign(
      { sub: user.id, jti, is_admin: false },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" }
    );

    await redisClient.sadd(`user:${user.id}:sessions`, jti);
  });

  afterAll(async () => {
    await redisClient.quit();
    await sequelize.close();
  });


  describe("POST /v1/orders", () => {
    it("places order, copies items, decrements stock, clears cart", async () => {
      const cart = await Cart.create({ userId: user.id });

      await CartItem.create({
        cartId: cart.id,
        productId: product.id,
        qty: 2,
        unitPrice: product.price
      });

      const res = await request(app)
        .post("/v1/orders")
        .set("Cookie", authCookie())
        .send({
          shippingName: "John Doe",
          shippingEmail: "john@test.com",
          shippingPhone: "9876543210",
          shippingAddress: "123 Main Street, Chennai"
        });

      expect(res.status).toBe(302);

      const order = await Order.findOne({ where: { userId: user.id } });
      expect(order).not.toBeNull();

      const orderItems = await OrderItem.findAll({
        where: { orderId: order.id }
      });
      expect(orderItems.length).toBe(1);
      expect(orderItems[0].qty).toBe(2);

      const updatedProduct = await Product.findByPk(product.id);
      expect(updatedProduct.qtyAvailable).toBe(3);

      const remainingCartItems = await CartItem.findAll({
        where: { cartId: cart.id }
      });
      expect(remainingCartItems.length).toBe(0);
    });

    it("rolls back transaction if stock is insufficient", async () => {
      const cart = await Cart.create({ userId: user.id });

      await CartItem.create({
        cartId: cart.id,
        productId: product.id,
        qty: 10,
        unitPrice: product.price
      });

      const res = await request(app)
        .post("/v1/orders")
        .set("Cookie", authCookie())
        .send({
          shippingName: "John Doe",
          shippingEmail: "john@test.com",
          shippingPhone: "9876543210",
          shippingAddress: "123 Main Street, Chennai"
        });

      expect(res.status).toBe(302);

      const order = await Order.findOne();
      expect(order).toBeNull();

      const unchangedProduct = await Product.findByPk(product.id);
      expect(unchangedProduct.qtyAvailable).toBe(5);
    });
  });

 
  describe("GET /v1/orders/data", () => {
    it("returns only own orders with pagination", async () => {
      await Order.create({
        userId: user.id,
        total: 1000,
        shippingName: "John",
        shippingEmail: "john@test.com"
      });

      await Order.create({
        userId: otherUser.id,
        total: 2000,
        shippingName: "Other",
        shippingEmail: "other@test.com"
      });

      const res = await request(app)
        .get("/v1/orders/data?page=1")
        .set("Cookie", authCookie());

      expect(res.status).toBe(200);
      expect(res.body.orders.length).toBe(1);
      expect(res.body.orders[0].userId).toBe(user.id);
    });
  });


  describe("GET /v1/orders/data/:id", () => {
    it("200 if owner", async () => {
      const order = await Order.create({
        userId: user.id,
        total: 1000,
        shippingName: "John",
        shippingEmail: "john@test.com"
      });

      const res = await request(app)
        .get(`/v1/orders/data/${order.id}`)
        .set("Cookie", authCookie());

      expect(res.status).toBe(200);
      expect(res.body.order.id).toBe(order.id);
    });

    it("404 if not found", async () => {
      const res = await request(app)
        .get("/v1/orders/data/99999")
        .set("Cookie", authCookie());

      expect(res.status).toBe(404);
    });

    it("404 if accessing foreign order", async () => {
      const order = await Order.create({
        userId: otherUser.id,
        total: 2000,
        shippingName: "Other",
        shippingEmail: "other@test.com"
      });

      const res = await request(app)
        .get(`/v1/orders/data/${order.id}`)
        .set("Cookie", authCookie());

      expect(res.status).toBe(404);
    });
  });
});
