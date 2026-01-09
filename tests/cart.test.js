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
  CartItem
} = require("../models");

describe("Cart Integration Tests", () => {
  let user;
  let category;
  let product;
  let token;
  let jti;

  const authCookie = () => [`accessToken=${token}`];

  beforeAll(async () => {
    await sequelize.authenticate();
  });

  beforeEach(async () => {

    await CartItem.destroy({ where: {} });
    await Cart.destroy({ where: {} });
    await Product.destroy({ where: {} });
    await Category.destroy({ where: {} });
    await User.destroy({ where: {} });

    user = await User.create({
      name: "Test User",
      email: "cart@test.com",
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
      {
        sub: user.id,
        jti,
        is_admin: false
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" }
    );

    await redisClient.sadd(`user:${user.id}:sessions`, jti);
  });

  afterAll(async () => {
    await redisClient.quit();
    await sequelize.close();
  });

  
  describe("GET /cart/data", () => {
    it("200 → empty cart", async () => {
      const res = await request(app)
        .get("/v1/cart/data")
        .set("Cookie", authCookie());

      expect(res.status).toBe(200);
      expect(res.body.cart).toBeNull();
    });

    it("200 → cart with items", async () => {
      const cart = await Cart.create({ userId: user.id });
      await CartItem.create({
        cartId: cart.id,
        productId: product.id,
        qty: 2,
        unitPrice: product.price
      });

      const res = await request(app)
        .get("/v1/cart/data")
        .set("Cookie", authCookie());

      expect(res.status).toBe(200);
      expect(res.body.cart.CartItems.length).toBe(1);
    });
  });

  describe("POST /cart/items", () => {
    it("creates new item", async () => {
      const res = await request(app)
        .post("/v1/cart/items")
        .set("Cookie", authCookie())
        .send({
          productId: product.id,
          qty: 2
        });

      expect(res.status).toBe(200);

      const item = await CartItem.findOne();
      expect(item.qty).toBe(2);
    });

    it("increments qty if item already exists", async () => {
      const cart = await Cart.create({ userId: user.id });
      await CartItem.create({
        cartId: cart.id,
        productId: product.id,
        qty: 2,
        unitPrice: product.price
      });

      const res = await request(app)
        .post("/v1/cart/items")
        .set("Cookie", authCookie())
        .send({
          productId: product.id,
          qty: 2
        });

      expect(res.status).toBe(200);

      const item = await CartItem.findOne();
      expect(item.qty).toBe(4);
    });

    it("rejects invalid product", async () => {
      const res = await request(app)
        .post("/v1/cart/items")
        .set("Cookie", authCookie())
        .send({
          productId: 99999,
          qty: 1
        });

      expect(res.status).toBe(404);
    });

    it("rejects qty greater than stock", async () => {
      const res = await request(app)
        .post("/v1/cart/items")
        .set("Cookie", authCookie())
        .send({
          productId: product.id,
          qty: 10
        });

      expect(res.status).toBe(400);
    });
  });

  describe("PATCH /cart/items/:id", () => {
    let cartItem;

    beforeEach(async () => {
      const cart = await Cart.create({ userId: user.id });
      cartItem = await CartItem.create({
        cartId: cart.id,
        productId: product.id,
        qty: 2,
        unitPrice: product.price
      });
    });

    it("updates qty", async () => {
      const res = await request(app)
        .patch(`/v1/cart/items/${cartItem.id}`)
        .set("Cookie", authCookie())
        .send({ qty: 3 });

      expect(res.status).toBe(200);

      await cartItem.reload();
      expect(cartItem.qty).toBe(3);
    });

    it("rejects qty < 1", async () => {
      const res = await request(app)
        .patch(`/v1/cart/items/${cartItem.id}`)
        .set("Cookie", authCookie())
        .send({ qty: 0 });

      expect(res.status).toBe(400);
    });

    it("rejects qty greater than stock", async () => {
      const res = await request(app)
        .patch(`/v1/cart/items/${cartItem.id}`)
        .set("Cookie", authCookie())
        .send({ qty: 10 });

      expect(res.status).toBe(400);
    });
  });


  describe("DELETE /cart/items/:id", () => {
    it("204 → removes item", async () => {
      const cart = await Cart.create({ userId: user.id });
      const item = await CartItem.create({
        cartId: cart.id,
        productId: product.id,
        qty: 1,
        unitPrice: product.price
      });

      const res = await request(app)
        .delete(`/v1/cart/items/${item.id}`)
        .set("Cookie", authCookie());

      expect(res.status).toBe(204);
    });
  });
});
