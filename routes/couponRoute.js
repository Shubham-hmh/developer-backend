const express =require("express");
const { createCoupon, getAllCoupon, updateCoupon, getCoupon, deleteCoupon } = require("../controller/couponCtrl");
const router =express.Router();
const { authMiddleware, isAdmin } = require("../middleware/authMiddleware");


router.post("/",authMiddleware,isAdmin,createCoupon);
router.put("/:id",authMiddleware,isAdmin,updateCoupon);
router.get("/:id",authMiddleware,getCoupon);
router.get("/",authMiddleware,isAdmin, getAllCoupon);
router.delete("/:id",authMiddleware,isAdmin,deleteCoupon);


module.exports =router;