const express =require("express");
const { createBlog, updateBlog, getBlog, getAllBlogs, deleteBlog, likeBlog, disLikeBlog ,uploadImages} = require("../controller/blogCtrl");
const router =express.Router();
const { uploadPhoto, blogImgResize } = require("../middleware/uploadImages");

const { authMiddleware, isAdmin } = require("../middleware/authMiddleware");


router.post('/', authMiddleware,isAdmin,createBlog);
router.put("/upload/:id",authMiddleware,isAdmin,uploadPhoto.array('images',2),blogImgResize,uploadImages);

router.put("/likes",authMiddleware,likeBlog);
router.put("/dislikes",authMiddleware,disLikeBlog);

router.put("/:id",authMiddleware,isAdmin, updateBlog);
router.get("/:id",getBlog);
router.delete("/:id",authMiddleware,isAdmin,deleteBlog);
router.get("/",getAllBlogs);

module.exports=router;