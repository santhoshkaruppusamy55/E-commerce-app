
module.exports=(sequelize,DataTypes)=>{
    const ProductImage=sequelize.define("ProductImage",
        {
            id:{
                type:DataTypes.INTEGER,
                autoIncrement:true,
                primaryKey:true
            },
            productId: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            path:{
                type:DataTypes.STRING,
                allowNull:false
            }
        },{
            tableName:"product_images",
            timestamps:true
        }
    );

    ProductImage.associate = (models) => {
        ProductImage.belongsTo(models.Product, {
            foreignKey: "productId"
        });
    };

    return ProductImage;
}