
const User = require("../models/userModel");
const Product = require("../models/productModel");
const Coupon = require("../models/couponModel");
const Cart = require("../models/cartModel");
const Order = require("../models/orderModel");
const crypto = require("crypto");
const asyncHandler = require("express-async-handler");
const { generateToken } = require("../config/jwtToken");
const validateMongoDbId = require("../utils/validateMongodbId");
const { generateRefreshToken } = require("../config/refreshToken");
const jwt = require("jsonwebtoken");
const sendEmail = require("./emailCtrl");
const uniqid = require("uniqid");

const createUser = asyncHandler(async (req, res) => {
    const email = req.body.email;
    const findUser = await User.findOne({ email: email });

    if (!findUser) {
        //create new user 
        const newUser = await User.create(req.body);
        res.json(newUser);
    }
    else {
        throw new Error("User Already Exists !")
    }
});

const loginUserCtrl = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    //check if user exists or not 
    const findUser = await User.findOne({ email });
    if (findUser && await findUser.isPasswordMatched(password)) {
        const refreshToken = await generateRefreshToken(findUser?._id);
        const updateuser = await User.findByIdAndUpdate(findUser.id, {
            refreshToken: refreshToken,
        }, { new: true });
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            maxAge: 72 * 60 * 60 * 1000,
        });
        res.json({
            _id: findUser?._id,
            firstname: findUser?.firstname,
            lastname: findUser?.lastname,
            email: findUser?.email,
            mobile: findUser?.mobile,
            token: generateToken(findUser?._id)
        });
    }
    else {
        throw new Error("Invalid Credentials !");
    }

});

// login Admin 
const loginAdmin = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    //check if user exists or not 
    const findAdmin = await User.findOne({ email });
    if (findAdmin.role !== 'admin') throw new Error("Not authorized !");

    if (findAdmin && await findAdmin.isPasswordMatched(password)) {
        const refreshToken = await generateRefreshToken(findAdmin?._id);
        const updateuser = await User.findByIdAndUpdate(findAdmin.id, {
            refreshToken: refreshToken,
        }, { new: true });
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            maxAge: 72 * 60 * 60 * 1000,
        });
        res.json({
            _id: findAdmin?._id,
            firstname: findAdmin?.firstname,
            lastname: findAdmin?.lastname,
            email: findAdmin?.email,
            mobile: findAdmin?.mobile,
            token: generateToken(findAdmin?._id)
        });
    }
    else {
        throw new Error("Invalid Credentials !");
    }

});

//handle refresh token 
const handleRefreshToken = asyncHandler(async (req, res) => {
    const cookie = req.cookies;
    if (!cookie?.refreshToken) throw new Error("No refresh token in cookies");
    const refreshToken = cookie.refreshToken;
    const user = await User.findOne({ refreshToken });
    if (!user) throw new Error("No Refresh Token present in db or not matched.");
    jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
        if (err || user.id !== decoded.id) {
            throw new Error("There is something wrong with refresh token");
        }
        const accessToken = generateToken(user?._id);
        res.json({ accessToken });
    });

});

// logout functionality .
const logout = asyncHandler(async (req, res) => {
    const cookie = req.cookies;
    console.log(cookie);
    if (!cookie?.refreshToken) throw new Error("No refresh token in cookies");
    const refreshToken = cookie.refreshToken;
    const user = await User.findOne({ refreshToken });
    if (!user) {
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: true,
        });
        return res.sendStatus(204); //forbidden
    }
    await User.findOneAndUpdate(refreshToken, {
        refreshToken: "",
    });
    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: true,
    });
    return res.sendStatus(204);


});

const updateUser = asyncHandler(async (req, res) => {
    // const {id}=req.params;
    const { _id } = req.user;
    validateMongoDbId(_id);
    try {
        const updatedUser = await User.findByIdAndUpdate(_id, {
            firstname: req?.body?.firstname,
            lastname: req?.body?.lastname,
            email: req?.body?.email,
            mobile: req?.body?.mobile,

        }, {
            new: true
        });
        res.json({ updatedUser });

    } catch (error) {
        throw new Error(error);
    }
})

// get all user 
const getallUser = asyncHandler(async (req, res) => {
    try {
        const getUser = await User.find();
        res.json(getUser);
    } catch (error) {
        throw new Error(error);

    }
})

//get single user
const getUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
        const user = await User.findById(id);
        res.json({
            user
        });
    } catch (error) {
        throw new Error(error);

    }
})

//delete user
const deleteUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
        const user = await User.findByIdAndDelete(id);
        res.json({ User });
    } catch (error) {
        throw new Error(error);

    }
});

const blockUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);

    try {
        const block = await User.findByIdAndUpdate(
            id, {
            isBlocked: true,
        },
            {
                new: true,
            }
        );
        res.json({
            message: "User Blocked "
        })

    } catch (error) {
        throw new Error(error);

    }
});

const unblockUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);

    try {
        const unblock = await User.findByIdAndUpdate(
            id, {
            isBlocked: false,
        },
            {
                new: true,
            }
        );
        res.json({
            message: "User unblocked "
        })

    } catch (error) {
        throw new Error(error);

    }

});

const updatePassword = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    const { password } = req.body;
    validateMongoDbId(_id);
    const user = await User.findById(_id);
    if (password) {
        user.password = password;
        const updatedPassword = await user.save();
        res.json(updatedPassword)
    }
    else {
        res.json(user);
    }
});

const forgotPasswordToken = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    console.log(email, user);

    if (!user) throw new Error("User not found with this email");

    try {
        const token = await user.createPasswordResetToken();
        await user.save();
        const resetURL = `Hi ,please follow this link to change password This link is valid till 10 minutes from now.<a href ="http://localhost:3000/reset-password/${token}>Click here </a>`
        const data = {
            to: email,
            text: "Hey user @",
            subject: "Forgot Password Link",
            htm: resetURL
        };
        sendEmail(data);
        res.json(token);
    } catch (error) {
        throw new Error(error);

    }

});


const resetPassword = asyncHandler(async (req, res) => {
    const { password } = req.body;
    const { token } = req.params;
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() }
    });
    if (!user) throw new Error("Token Expired ,Please try again ");
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    res.json(user);
});

const getWishlist = asyncHandler(async (req, res) => {
    const { _id } = req.user;

    try {
        const findUser = await User.findById(_id).populate("wishlist");
        res.json(findUser);

    } catch (error) {
        throw new Error(error);

    }
})

// save user address ------>
const saveAddress = asyncHandler(async (req, res, next) => {
    const { _id } = req.user;
    validateMongoDbId(_id);
    try {
        const updatedUser = await User.findByIdAndUpdate(_id, {
            address: req?.body?.address,

        }, {
            new: true
        });
        res.json({ updatedUser });

    } catch (error) {
        throw new Error(error);
    }
});

const userCart = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    const { productId,color,quantity,price } = req.body;
    validateMongoDbId(_id);
    try {
 
        let newCart = await new Cart({
            userId: _id,
            productId,
            color,
            price,
            quantity
        }).save();
        res.json(newCart);


    } catch (error) {
        throw new Error(error);

    }
});

const getCart = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    validateMongoDbId(_id);
    try {
        const cart = await Cart.find({ userId: _id }).populate("productId").populate("color");
        res.json(cart);

    } catch (error) {
        throw new Error(error);
    }
});

const removeProductFromCart =asyncHandler(async(req,res)=>{
    const { _id } = req.user;
    const {cartItemId}=req.params;
    validateMongoDbId(_id);
    try {
        const deleteProductFromCart = await Cart.deleteOne({userId:_id,_id:cartItemId})
        res.json(deleteProductFromCart);
    } catch (error) {
        throw new Error(error);
    }
});

const updateProductQuantityFromCart =asyncHandler(async(req,res)=>{
    const { _id } = req.user;
    const {cartItemId,newQuantity}=req.params;
    validateMongoDbId(_id);

    try   {
        const cartItem = await Cart.findOne({userId:_id,_id:cartItemId})
        cartItem.quantity=newQuantity;
        cartItem.save();
        res.json(cartItem);
    } catch (error) {
        throw new Error(error);
    }
});


const createOrder=asyncHandler(async(req,res)=>{
    const {shippingInfo,orderItems,totalPrice,totalPriceAfterDiscount,paymentInfo} =req.body;
    const {_id}=req.user;
    try {
        const order =await Order.create({
            shippingInfo,orderItems,totalPrice,totalPriceAfterDiscount,paymentInfo,user:_id
        })
        res.json({
            order,
            success:true
        })
    } catch (error) {
        throw new Error(error);
        
    }

})

// const emptyCart = asyncHandler(async (req, res) => {
//     const { _id } = req.user;
//     validateMongoDbId(_id);
//     try {
//         const user = await User.findOne({ _id });
//         const cart = await Cart.findOneAndRemove({ orderBy: user._id });
//         res.json(cart);
//     }
//     catch (err) {
//         throw new Error(err);
//     }
// });

// const applyCoupon = asyncHandler(async (req, res) => {
//     const { coupon } = req.body;
//     console.log(coupon);
//     const { _id } = req.user;
//     validateMongoDbId(_id);
//     const validCoupon = await Coupon.findOne({ name: coupon });
//     console.log(validCoupon);
//     if (validCoupon === null) {
//         throw new Error("Invalid Coupon!")
//     }

//     const user = await User.findOne({ _id });
//     let { products, cartTotal } = await Cart.findOne({ orderBy: user._id }).populate("products.product");
//     let totalAfterDiscount = (
//         cartTotal - (cartTotal * validCoupon.discount) / 100
//     ).toFixed(2);
//     await Cart.findOneAndUpdate(
//         { orderBy: user._id },
//         { totalAfterDiscount },
//         { new: true }
//     );
//     res.json(totalAfterDiscount);
// });

// const createOrder = asyncHandler(async (req, res) => {
//     const { COD, couponApplied } = req.body;
//     const { _id } = req.user;
//     validateMongoDbId(_id);
//     try {
//         if (!COD) throw new Error("Create cash order failed !");
//         const user = await User.findById(_id);
//         const usercart = await Cart.findOne({ orderBy: user._id });
//         let finalAmount = 0;
//         if (couponApplied && usercart.totalAfterDiscount) {
//             finalAmount = usercart.totalAfterDiscount;

//         }
//         else {
//             finalAmount = usercart.cartTotal;
//         }
//         let newOrder = await new Order({
//             products: usercart.products,
//             paymentIntent: {
//                 id: uniqid(),
//                 method: "COD",
//                 amount: finalAmount,
//                 status: "Cash on Delivery",
//                 created: Date.now(),
//                 currency: "usd",

//             },
//             orderBy: user._id,
//             orderStatus: "Cash on Delivery"
//         }).save();
//         let update = usercart.products.map((item) => {
//             return {
//                 updateOne: {
//                     filter: { _id: item.product._id },
//                     update: { $inc: { quantity: +item.count, sold: +item.count } },

//                 }
//             }
//         });
//         const updated = await Product.bulkWrite(update, {});
//         res.json({ message: "Success" });

//     } catch (error) {
//         throw new Error(error);
//     }
// });

// const getOrders = asyncHandler(async (req, res) => {
//     const { _id } = req.user;
//     validateMongoDbId(_id);
//     try {
//         const userorders = await Order.findOne({ orderBy: _id }).populate('products.product').exec();
//         res.json(userorders);
//     }
//     catch (err) {
//         throw new Error(err);
//     }
// });

// const updateOrderStatus = asyncHandler(async (req, res) => {
//     const { status } = req.body;
//     const { id } = req.params;
//     validateMongoDbId(id);
//   try {
//     const findOrder = await Order.findByIdAndUpdate(id, {
//         orderStatus: status,
//         paymentIntent:{
//             status:status,
//         }
//     },

//         { new: true });
//         res.json(findOrder);
    
//   } catch (error) {
//     throw new Error (error);
    
//   }

// });

const getMyOrders =asyncHandler(async(req,res)=>{
    const {_id} =req.user;

    try {
        const orders =await Order.find({user:_id}).populate("user").populate("orderItems.product").populate("orderItems.color");
        res.json({
            orders
        })
        
    } catch (error) {
        throw new Error(error)
        
    }
})

module.exports = {
    createUser, loginUserCtrl, getallUser, deleteUser, loginAdmin, saveAddress,
    removeProductFromCart,updateProductQuantityFromCart ,
    getUser, updateUser, blockUser, unblockUser, handleRefreshToken, 
    getWishlist, userCart, 
    logout, updatePassword, forgotPasswordToken, resetPassword, getCart, createOrder ,getMyOrders
    // emptyCart, applyCoupon, createOrder, updateOrderStatus,getOrders,
}