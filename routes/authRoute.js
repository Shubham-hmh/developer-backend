const express = require("express");
const { createUser, loginUserCtrl, getallUser, getUser, deleteUser, updateUser, blockUser, unblockUser, handleRefreshToken, logout, updatePassword, forgotPasswordToken, resetPassword, loginAdmin, getWishlist, saveAddress, userCart, getCart, emptyCart, applyCoupon, createOrder, getOrders, updateOrderStatus, removeProductFromCart, updateProductQuantityFromCart, getMyOrders } = require("../controller/userCtrl");
const { authMiddleware, isAdmin } = require("../middleware/authMiddleware");
const { updateOne } = require("../models/userModel");
const { checkout, paymentVerification } = require("../controller/paymentCtrl");
const router = express.Router();

router.post("/register", createUser);
router.post("/forgot-password-token",forgotPasswordToken);
router.put("/reset-password/:token",resetPassword);
// router.put("/order/update-order/:id",authMiddleware,isAdmin,updateOrderStatus);


router.post("/login", loginUserCtrl);
router.post("/admin-login", loginAdmin);
router.post("/cart",authMiddleware, userCart);

// router.post("/cart/applycoupon",authMiddleware,applyCoupon);
router.post("/cart/create-order",authMiddleware,createOrder);
router.post("/order/checkout",authMiddleware,checkout);
router.post("/order/paymentVerification",authMiddleware,paymentVerification);


router.get("/all-user",getallUser);
router.get("/getmyorders",authMiddleware, getMyOrders);
router.get("/refresh",handleRefreshToken);
router.get("/logout",logout);
router.put("/password",authMiddleware, updatePassword);

router.get("/wishlist",authMiddleware, getWishlist);
router.get("/cart", authMiddleware, getCart);
router.get("/:id",authMiddleware,isAdmin, getUser);
// router.delete("/empty-cart",authMiddleware,emptyCart);
router.delete("/delete-product-cart/:cartItemId",authMiddleware,removeProductFromCart);
router.delete("/update-product-cart/:cartItemId/:newQuantity",authMiddleware,updateProductQuantityFromCart);





router.delete("/:id",deleteUser);
router.put("/edit-user",authMiddleware,updateUser);
router.put("/save-address",authMiddleware,saveAddress);

router.put("/block-user/:id",authMiddleware,isAdmin,blockUser);
router.put("/unblock-user/:id",authMiddleware,isAdmin,unblockUser);



module.exports = router;