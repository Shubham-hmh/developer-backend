const express =require("express");
const { createBrand, updateBrand, getBrand, getAllBrand, deleteBrand } = require("../controller/brandCtrl");
const router =express.Router();
const { authMiddleware, isAdmin } = require("../middleware/authMiddleware");


router.post("/",authMiddleware,isAdmin,createBrand);
router.put("/:id",authMiddleware,isAdmin,updateBrand);
router.get("/:id",authMiddleware,getBrand);
router.get("/",authMiddleware,getAllBrand);
router.delete("/:id",authMiddleware,isAdmin,deleteBrand);


module.exports=router;