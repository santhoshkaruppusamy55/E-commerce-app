const request = require("supertest");
const app = require("../app");
const {
  sequelize,
  Product,
  Category,
  ProductImage
} = require("../models");

let electronics;
let books;
let iphone;
let macbook;
let nodeBook;

describe("PRODUCT API TESTS", () => {

  beforeEach(async () => {
   
    await sequelize.sync({ force: true });

    electronics = await Category.create({ name: "Electronics" });
    books = await Category.create({ name: "Books" });

    iphone = await Product.create({
      title: "iPhone 15",
      description: "Apple phone",
      price: 80000,
      qtyAvailable: 5,
      categoryId: electronics.id,
      createdBy: 1
    });

    macbook = await Product.create({
      title: "MacBook Pro",
      description: "Apple laptop",
      price: 200000,
      qtyAvailable: 0,
      categoryId: electronics.id,
      createdBy: 1
    });

    nodeBook = await Product.create({
      title: "Node.js Book",
      description: "Programming book",
      price: 500,
      qtyAvailable: 10,
      categoryId: books.id,
      createdBy: 1
    });

  
    await ProductImage.create({
      productId: iphone.id,
      path: "/uploads/products/iphone.jpg"
    });

    await ProductImage.create({
      productId: nodeBook.id,
      path: "/uploads/products/node.jpg"
    });
  });

  afterAll(async () => {
    await sequelize.close();
  });


  describe("GET /v1/products/api", () => {

    it("should list products with pagination", async () => {
      const res = await request(app).get("/v1/products/api");

      expect(res.statusCode).toBe(200);
      expect(res.body.products).toBeDefined();
      expect(res.body.categories).toBeDefined();
      expect(res.body.currentPage).toBe(1);
      expect(res.body.totalPages).toBeGreaterThan(0);
    });

    it("should filter by search query (q)", async () => {
      const res = await request(app)
        .get("/v1/products/api?q=iphone");

      expect(res.statusCode).toBe(200);
      expect(res.body.products.length).toBe(1);
      expect(res.body.products[0].title).toContain("iPhone");
    });

    it("should filter by category", async () => {
      const res = await request(app)
        .get(`/v1/products/api?category=${books.id}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.products.length).toBe(1);
      expect(res.body.products[0].title).toContain("Book");
    });

    it("should filter by price range", async () => {
      const res = await request(app)
        .get("/v1/products/api?priceMin=1000&priceMax=100000");

      expect(res.statusCode).toBe(200);
      expect(res.body.products.length).toBe(1);
      expect(Number(res.body.products[0].price)).toBeGreaterThan(1000);
    });

    it("should filter in-stock products only", async () => {
      const res = await request(app)
        .get("/v1/products/api?inStock=true");

      expect(res.statusCode).toBe(200);
      expect(res.body.products.every(p => p.qtyAvailable > 0)).toBe(true);
    });

    it("should sort by price ascending", async () => {
      const res = await request(app)
        .get("/v1/products/api?sort=price_asc");

      const prices = res.body.products.map(p => Number(p.price));
      const sorted = [...prices].sort((a, b) => a - b);

      expect(prices).toEqual(sorted);
    });

    it("should include product images", async () => {
      const res = await request(app)
        .get("/v1/products/api");

      expect(res.body.products[0].ProductImages).toBeDefined();
    });

  });



  describe("GET /v1/products/api/:id", () => {

    it("should return product detail for valid id", async () => {
      const res = await request(app)
        .get(`/v1/products/api/${iphone.id}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.id).toBe(iphone.id);
      expect(res.body.Category).toBeDefined();
    });

    it("should return 404 for invalid product id", async () => {
      const res = await request(app)
        .get("/v1/products/api/999999");

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe("Product not found");
    });

  });

});
