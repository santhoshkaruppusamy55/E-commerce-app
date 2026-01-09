require("dotenv").config(); 
const express=require("express");
const app=express();
const path=require("path");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");

const authRoutes=require("./routes/v1/auth.routes");
const adminProductRoutes=require("./routes/admin/product.routes");
const adminCategoryRoutes = require("./routes/admin/category.routes");
const userProductRoutes = require("./routes/v1/product.routes");
const userCartRoutes=require("./routes/v1/cart.routes");
const orderRoutes=require("./routes/v1/order.routes");
const errorMiddleware=require("./middlewares/error.middleware");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.set('view engine', 'ejs');
app.set("views", path.join(__dirname, "views"));
app.use("/uploads", express.static("uploads"));

app.use("/v1/auth",authRoutes);
app.use("/admin/products",adminProductRoutes);
app.use("/admin/categories", adminCategoryRoutes);
app.use("/v1/products", userProductRoutes);
app.use("/v1/cart",userCartRoutes);
app.use("/v1/orders", orderRoutes);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(errorMiddleware);
app.use((req, res) => {
  res.status(404).sendFile(
    path.join(__dirname, "public/errors/404.html")
  );
});

module.exports=app;
