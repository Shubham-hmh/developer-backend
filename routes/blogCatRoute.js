const express =require("express");
const { createCategory, updateCategory, getCategory, getAllCategory, deleteCategory } = require("../controller/blogCatCtrl");
const router =express.Router();
const { authMiddleware, isAdmin } = require("../middleware/authMiddleware");


router.post("/",authMiddleware,isAdmin,createCategory);
router.put("/:id",authMiddleware,isAdmin,updateCategory);
router.get("/:id",authMiddleware,getCategory);
router.get("/",authMiddleware,getAllCategory);
router.delete("/:id",authMiddleware,isAdmin,deleteCategory);


module.exports=router;