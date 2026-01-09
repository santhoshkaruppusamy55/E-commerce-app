const { Product, Category, ProductImage,Cart } = require("../../models");
const { Op } = require("sequelize");

exports.listProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;

    const { q, category, priceMin, priceMax, inStock, sort } = req.query;

    const where = {};

    if (q) where.title = { [Op.iLike]: `%${q}%` };
    if (category) where.categoryId = category;

    if (priceMin || priceMax) {
      where.price = {};
      if (priceMin) where.price[Op.gte] = priceMin;
      if (priceMax) where.price[Op.lte] = priceMax;
    }

    if (inStock === "true") {
      where.qtyAvailable = { [Op.gt]: 0 };
    }

    let order = [["createdAt", "DESC"]];
    if (sort === "price_asc") order = [["price", "ASC"]];
    if (sort === "price_desc") order = [["price", "DESC"]];

    const { rows: products, count } = await Product.findAndCountAll({
      where,
      include: [
        Category,
        { model: ProductImage, limit: 1 }
      ],
      limit,
      offset,
      order
    });

    const categories = await Category.findAll();

    res.json({
      products,
      categories,
      currentPage: page,
      totalPages: Math.ceil(count / limit)
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load products" });
  }
};

exports.showProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [
        Category,
        { model: ProductImage, limit: 1 }
      ]
    });
    
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load product" });
  }
};
