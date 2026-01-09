const slugify=require("slugify");

module.exports=(sequelize,DataTypes)=>{
    const Product=sequelize.define("Product",
        {
            id:{
                type:DataTypes.INTEGER,
                primaryKey: true, 
                autoIncrement:true,
                allowNull:false
            },
            title:{
                type:DataTypes.STRING,
                allowNull:false
            },
            slug:{
                type:DataTypes.STRING,
                allowNull:false,
                unique:true
            },
            description:{
                type:DataTypes.TEXT,
                allowNull:true
            },
            createdBy: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            price:{
                type:DataTypes.DECIMAL(10,2),
                allowNull:false,
                validate: { min: 0 }
            },
            qtyAvailable:{
                type:DataTypes.INTEGER,
                allowNull:false
            },
            categoryId: {
                type: DataTypes.INTEGER,
                allowNull: false
            }
        },
        {
            timestamps:true,
            tableName:"products"
        }
    );

    Product.beforeValidate((product)=>{
        if(product.title){
            product.slug=slugify(product.title,{
                lower:true,
                strict:true
            });
        }
    });

    Product.associate = (models) => {
        Product.belongsTo(models.Category, {
            foreignKey: "categoryId",
            onDelete: "CASCADE"
        });
        Product.hasMany(models.ProductImage, { foreignKey: "productId"});
        Product.hasMany(models.CartItem, { foreignKey: "productId" });
        Product.hasMany(models.OrderItem, { foreignKey: "productId" });
    };

    
    return Product;
}