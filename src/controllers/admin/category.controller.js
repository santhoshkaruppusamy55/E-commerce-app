const { Category } = require("../../models");

exports.showCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      order: [["createdAt", "DESC"]]
    });

    return res.render("admin/categories/index", {
      categories
    });
  } catch (error) {
    console.error("Show categories error:", error);
    return res.status(500).send("Something went wrong");
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.redirect("/admin/categories");
    }

    await Category.create({ name });

    return res.redirect("/admin/categories");
  } catch (error) {
    console.error("Create category error:", error);
    return res.redirect("/admin/categories");
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;

    await Category.destroy({
      where: { id: categoryId }
    });

    return res.redirect("/admin/categories");
  } catch (error) {
    console.error("Delete category error:", error);
    return res.redirect("/admin/categories");
  }
};
