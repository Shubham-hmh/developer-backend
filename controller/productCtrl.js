
const Product = require("../models/productModel");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const slugify = require("slugify");
const fs =require("fs");
const validateMongoDbId = require("../utils/validateMongodbId");
const cloudinaryUploadImg = require("../utils/cloudinary");

const createProduct = asyncHandler(async (req, res) => {
    try {
        if (req.body.title) {
            req.body.slug = slugify(req.body.title);
        }
        const newProduct = await Product.create(req.body);
        res.json(newProduct);

    } catch (error) {
        throw new Error(error);

    }

});

const updateProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
        if (req.body.title) {
            req.body.slug = slugify(req.body.title);
        }

        const updateProduct = await Product.findOneAndUpdate(id, req.body, { new: true });
        res.json(updateProduct);

    } catch (error) {
        throw new Error(error);

    }

});

const deleteProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    try {

        const updateProduct = await Product.findByIdAndDelete(id);
        res.json("product deleted !");

    } catch (error) {
        throw new Error(error);

    }

});

const getaProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    try { 
        // add populate ????
        const findProduct = await Product.findById(id).populate("color");
        res.json(findProduct);

    } catch (error) {
        throw new Error(error);

    }
})

const getAllProduct = asyncHandler(async (req, res) => {
    try {

        //filtering 
        const queryObj = { ...req.query };
        const excludeFields = ["page", "sort", "limit", "fields"];
        excludeFields.forEach((el) => delete queryObj[el]);

        console.log(queryObj, req.query);
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
        console.log(JSON.parse(queryStr));

        let query = Product.find(JSON.parse(queryStr));


        // const getallProducts1=await Product.where("category").equals(req.query.category);

        // const getallProducts = await Product.find({
        //     brand: req.query.brand,
        //     category: req.query.category,
        // });


        // Sorting ---->
        if (req.query.sort) {
            const sortBy = req.query.sort.split(",").join(" ");
            query = query.sort(sortBy);
        }

        else {
            query = query.sort('-createAt');
        }

        // limiting the fields ---->
        if (req.query.sort) {
            const fields = req.query.fields.split(",").join(" ");
            query = query.select(fields);
        }

        else {
            query = query.select('-__v');
        }

        // pagination ----------->
        const page = req.query.page;
        const limit = req.query.limit;
        const skip = (page - 1) * limit;
        query = query.skip(skip).limit(limit);

        if (req.query.page) {
            const productCount = await Product.countDocuments();
            if (skip >= productCount) throw new Error("This Page does not exists");
        }
        const product = await query;
        res.json(product);

    } catch (error) {
        throw new Error(error);

    }
});

const addToWishList = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    const { prodId } = req.body;
    try {
        const user = await User.findById(_id);
        console.log(user);
        const alreadyadded = user.wishlist.find((id) => id.toString() === prodId);
        if (alreadyadded) {
            let user = await User.findByIdAndUpdate(_id, { $pull: { wishlist: prodId }, }, { new: true });
            res.json(user);
        }

        else {
            let user = await User.findByIdAndUpdate(_id, { $push: { wishlist: prodId }, }, { new: true });
            res.json(user);

        }

    } catch (error) {
        throw new Error(error);

    }
});

const rating = asyncHandler(async (req, res) => {
    // get login user 

    const { _id } = req.user;
    const { star, prodId, comment } = req.body;
    try {
        const product = await Product.findById(prodId);
        let alreadyRated = product.ratings.find((userId) => userId.postedby.toString() === _id.toString());

        if (alreadyRated) {
            const updateRating = await Product.updateOne(
                {
                    ratings: { $elemMatch: alreadyRated },
                },
                {
                    $set: { "ratings.$.star": star, "ratings.$.comment": comment },
                },
                {
                    new: true
                }
            );
            // res.json(updateRating);

        } else {
            const rateProduct = await Product.findByIdAndUpdate(prodId, {
                $push: {
                    ratings: {
                        star: star,
                        comment: comment,
                        postedby: _id,
                    }
                }
            }, { new: true });
            // res.json(rateProduct);

        }
        const getallratings = await Product.findById(prodId);
        let totalRating = getallratings.ratings.length;
        let ratingsum = getallratings.ratings.map((item) => item.star).reduce((prev, curr) => prev + curr, 0);
        let actualRating = Math.round(ratingsum / totalRating);
        let finalProduct = await Product.findByIdAndUpdate(prodId, {
            totalrating: actualRating
        }, { new: true });

        res.json(finalProduct);

    } catch (error) {
        throw new Error(error);
    }


});

const uploadImages = asyncHandler(async (req, res) => {
    const { id } = req.params;
    console.log(id);
    validateMongoDbId(id);
    try {
        const uploader = (path) => cloudinaryUploadImg(path, "images");
        const urls = [];
        const files = req.files;
        for (const file of files) {
            const { path } = file;
            const newpath = await uploader(path);
            urls.push(newpath);
            fs.unlinkSync(path);
            
        }
        const findProduct = await Product.findByIdAndUpdate(id,
            {
                images: urls.map((file) => {
                    return file;
                }),
            },
            {
                new: true
            }
        );
        res.json(findProduct);
    } catch (error) {
        throw new Error(error);

    }
});


module.exports = { createProduct, getaProduct, getAllProduct, updateProduct, deleteProduct, addToWishList, rating, uploadImages }