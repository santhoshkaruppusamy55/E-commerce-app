module.exports = (sequelize, DataTypes) => {
  const Cart = sequelize.define(
    "Cart",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true
      }
    },
    {
      tableName: "carts",
      timestamps: true
    }
  );

  Cart.associate = (models) => {
    Cart.belongsTo(models.User, {
      foreignKey: "userId",
      onDelete: "CASCADE"
    });

    Cart.hasMany(models.CartItem, {
      foreignKey: "cartId",
      onDelete: "CASCADE"
    });
  };

  return Cart;
};
