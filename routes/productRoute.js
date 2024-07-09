const express = require("express");
const { createProduct, getaProduct, getAllProduct, updateProduct, deleteProduct, addToWishList, rating, uploadImages } = require ("../controller/productCtrl");

const {isAdmin,authMiddleware} =require("../middleware/authMiddleware");
const { uploadPhoto, productImgResize } = require("../middleware/uploadImages");
const router = express.Router();

router.put("/upload/:id",authMiddleware,isAdmin,uploadPhoto.array('images',5),productImgResize,uploadImages);

router.post("/",authMiddleware, isAdmin , createProduct);
router.get("/:id",getaProduct);
router.put("/wishlist",authMiddleware, addToWishList);
router.put("/rating",authMiddleware, rating);
router.get("/",getAllProduct);
router.put("/:id",authMiddleware, isAdmin , updateProduct);
router.delete("/:id",authMiddleware, isAdmin , deleteProduct);


module.exports = router;