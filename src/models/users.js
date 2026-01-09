const bcrypt=require("bcrypt");

module.exports=(sequelize,DataTypes)=>{
    const User=sequelize.define("User",
        {
            id:{
                type:DataTypes.INTEGER,
                autoIncrement:true,
                primaryKey:true
            },
            name:{
                type:DataTypes.STRING,
                allowNull:false
            },
            email:{
                type:DataTypes.STRING,
                allowNull:false,
                unique:true
            },
            password:{
                type:DataTypes.STRING,
                allowNull:false
            },
            is_admin:{
                type:DataTypes.BOOLEAN,
                defaultValue:false
            }
        },
        {
            timestamps:true,
            tableName:"users"
        }
    );
    User.beforeCreate(async(user)=>{
        user.password=await bcrypt.hash(user.password,10);
    });

    User.prototype.comparePassword=function(password){
        return bcrypt.compare(password,this.password);
    };

    User.associate=(models)=>{
        User.hasOne(models.Cart,{foreignKey:"userId"});
        User.hasMany(models.Order,{foreignKey:"userId"});

    }
    return User;
}