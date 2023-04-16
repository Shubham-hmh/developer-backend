const express = require("express");
const db = require("./config/db");
const { notFound, errorHandler } = require("./middleware/errorHandler");
const app =express();
const dotenv =require('dotenv').config();
const port =process.env.port || 5000;
const cookieParser =require("cookie-parser");
const morgan =require("morgan");
const authRouter =require("./routes/authRoute");
const productRouter =require("./routes/productRoute");
const blogRouter =require("./routes/blogRoute");
const categoryRouter =require("./routes/prodcategoryRoute");
const blogCategoryRouter =require("./routes/blogCatRoute");
const brandRouter =require("./routes/brandRoute");
const couponRouter =require("./routes/couponRoute");
const enqRouter =require("./routes/enqRoute");
const colorRouter = require("./routes/colorRoute");

const cors = require("cors");

db();
app.use(express.json());
app.use(cors());     
app.use(cookieParser());
app.use(morgan("dev"));
app.use("/api/user",authRouter);
app.use("/api/product",productRouter);
app.use("/api/blog",blogRouter);
app.use("/api/category",categoryRouter);
app.use("/api/blogcategory",blogCategoryRouter);
app.use("/api/brand",brandRouter);
app.use("/api/coupon",couponRouter);
app.use("/api/enquiry", enqRouter);
app.use("/api/color", colorRouter);



app.use(notFound);
app.use(errorHandler);
 app.listen(port , ()=>{
    console.log(`server is running on port : ${port}`);
 })