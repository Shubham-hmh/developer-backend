const Razorpay =require('razorpay');
const instance =new Razorpay({
    key_id:"rzp_test_xf6mecNHaDBJZm",
    key_secret:"IBtI87K7C8c9n5fnyjlSfN1F"
});

const checkout =async(req,res)=>{
    const {amount}=req.body;
    const option ={
        amount:amount,
        currency:"INR"
    }
    const order =await instance.orders.create(option)
    res.json({success:true,
    order})
}



const paymentVerification =async(req,res)=>{
   const {razorpayOrderId, razorpayPaymentId} =req.body;
   res.json({
    razorpayOrderId,razorpayPaymentId
   })
}

module.exports={checkout,paymentVerification}