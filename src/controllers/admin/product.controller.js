const { Product, Category, ProductImage,OrderItem,CartItem } = require("../../models");
const { Op } = require("sequelize");
const fs = require("fs");
const path = require("path");


exports.showProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;

    const search = req.query.search || "";
    const categoryId = req.query.category || "";

    const whereCondition = {};

    if (search) {
      whereCondition.title = {
        [Op.iLike]: `%${search}%` 
      };
    }

    if (categoryId) {
      whereCondition.categoryId = categoryId;
    }

    const { rows: products, count } = await Product.findAndCountAll({
      where: whereCondition,
      include: [
        {
          model: Category,
          attributes: ["id", "name"]
        },
        {
          model: ProductImage,
          attributes: ["path"],
          limit: 1
        }
      ],
      limit,
      offset,
      order: [["createdAt", "DESC"]]
    });

    const categories = await Category.findAll({
      attributes: ["id", "name"]
    });

    const totalPages = Math.ceil(count / limit);

    return res.render("admin/products/index", {
      products,
      categories,
      currentPage: page,
      totalPages,
      search,
      selectedCategory: categoryId
    });

  } catch (error) {
    console.error("Admin product list error:", error);
    return res.status(500).send("Something went wrong");
  }
};


exports.showCreateProduct = async (req, res) => {
  try {
    const categories = await Category.findAll({
      attributes: ["id", "name"]
    });

    return res.render("admin/products/create", {
      categories
    });
  } catch (error) {
    console.error("Create product page error:", error);
    return res.status(500).send("Something went wrong");
  }
};


exports.createProduct = async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      qtyAvailable,
      categoryId
    } = req.body;

    const product = await Product.create({
      title,
      description,
      price,
      qtyAvailable,
      categoryId,
      createdBy: req.user.id
    });

    if (req.file) {
      await ProductImage.create({
        productId: product.id,
        path: `/uploads/products/${req.file.filename}`
      });
    }

    return res.redirect("/admin/products");

  } catch (error) {
    console.error("Create product error:", error);
    return res.status(500).send("Product creation failed");
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;

    const orderExists =await OrderItem.findOne({
      where: { productId }
    });

    if (orderExists) {
      return res.status(400).send(
        "Cannot delete product. It exists in customer orders."
      );
    }

    await CartItem.destroy({
      where: { productId }
    });

    const image = await ProductImage.findOne({ where: { productId } });
    if (image) {
      const imagePath = path.join(__dirname, "../../", image.path);

      if (fs.existsSync(imagePath)){ 
        fs.unlinkSync(imagePath);
      }
      await image.destroy();
    }

    await Product.destroy({ where: { id: productId } });

    return res.redirect("/admin/products");

  } catch (err) {
    console.error("Delete product error:", err);
    return res.status(500).send("Product deletion failed");
  }
};


exports.showEditProduct = async (req, res) => {
  try {
    const productId = req.params.id;

    const product = await Product.findByPk(productId, {
      include: [
        Category,
        { model: ProductImage, limit: 1 }
      ]
    });

    if (!product) {
      return res.redirect("/admin/products");
    }

    const categories = await Category.findAll();

    return res.render("admin/products/edit", {
      product,
      categories
    });

  } catch (error) {
    console.error("Show edit product error:", error);
    return res.redirect("/admin/products");
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const {
      title,
      description,
      price,
      qtyAvailable,
      categoryId
    } = req.body;

    const [updated] = await Product.update(
      { title, description, price, qtyAvailable, categoryId },
      { where: { id: productId } }
    );

    if (!updated) {
      return res.status(404).send("Product not found");
    }

    if (req.file) {
      const oldImage = await ProductImage.findOne({
        where: { productId }
      });

      if (oldImage) {
        const oldPath = path.join(__dirname, "../../", oldImage.path);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
        await oldImage.destroy();
      }

      await ProductImage.create({
        productId,
        path: `/uploads/products/${req.file.filename}`
      });
    }

    return res.redirect("/admin/products");

  } catch (error) {
    console.error("Update product error:", error);
    return res.status(500).send("Product update failed");
  }
};
