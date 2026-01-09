
module.exports=(sequelize,DataTypes)=>{
    const Order=sequelize.define("Order",
        {
            id:{
                type:DataTypes.INTEGER,
                primaryKey:true,
                autoIncrement:true
            },
            userId:{
                type:DataTypes.INTEGER,
                allowNull:false
            },
            total:{
                type:DataTypes.DECIMAL(10,2),
                allowNull:false
            },
            status:{
                type:DataTypes.ENUM("Placed","Processing","Shipped","Delivered"),
                defaultValue:"Placed"
            },
            shippingName: DataTypes.STRING,
            shippingEmail: DataTypes.STRING,
            shippingPhone: DataTypes.STRING,
            shippingAddress: DataTypes.TEXT,
        },
        {
            tableName:"orders",
            timestamps:true
        }
    );

    Order.associate=(models)=>{
        Order.belongsTo(models.User,{foreignKey:"userId"});
        Order.hasMany(models.OrderItem,{foreignKey:"orderId"});
    };

    return Order;
}