const slugify = require("slugify");

module.exports = (sequelize, DataTypes) => {
  const Category = sequelize.define(
    "Category",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      slug: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      }
    },
    {
      tableName: "categories",
      timestamps: true
    }
  );

  Category.beforeValidate((category) => {
    if (category.name) {
      category.slug = slugify(category.name, {
        lower: true,
        strict: true
      });
    }
  });

  Category.associate = (models) => {
      Category.hasMany(models.Product, {
        foreignKey: "categoryId"
      });
  };


  return Category;
};
