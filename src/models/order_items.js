
module.exports=(sequelize,DataTypes)=>{
    const OrderItem=sequelize.define("OrderItem",
        {
            id:{
                type:DataTypes.INTEGER,
                primaryKey:true,
                autoIncrement:true
            },
            orderId:{
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            productId:{
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            qty: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            unitPrice: {
                type: DataTypes.DECIMAL(10,2),
                allowNull: false
            }

        },
        {
            tableName:"order_items",
            timestamps:true
        }
    );

    OrderItem.associate=(models)=>{
        OrderItem.belongsTo(models.Order,{foreignKey:"orderId"});
        OrderItem.belongsTo(models.Product,{foreignKey:"productId"});
    }

    return OrderItem;
}