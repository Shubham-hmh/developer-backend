const Brand =require("../models/brandModel");
const asyncHandler =require("express-async-handler");
const validateMongoDbId =require("../utils/validateMongodbId");



const createBrand =asyncHandler(async (req,res)=>{
    try {
        const newBrand =await Brand.create(req.body);
        res.json(newBrand);
        
    } catch (error) {
        throw new Error(error);
        
    }
});

const updateBrand =asyncHandler(async (req,res)=>{
    const {id}=req.params;
    validateMongoDbId(id);

    try {
        const newBrand =await Brand.findByIdAndUpdate(id,req.body,{new:true});
        res.json(newBrand);
        
    } catch (error) {
        throw new Error(error);
        
    }
});

const getBrand =asyncHandler(async (req,res)=>{
    const {id}=req.params;
    validateMongoDbId(id);

    try {
        const newBrand =await Brand.findById(id);
        res.json(newBrand);
        
    } catch (error) {
        throw new Error(error);
        
    }
});

const getAllBrand =asyncHandler(async (req,res)=>{
    try {
        const newBrand =await Brand.find();
        res.json(newBrand);
        
    } catch (error) {
        throw new Error(error);
        
    }
});

const deleteBrand =asyncHandler(async (req,res)=>{
    const {id}=req.params;
    validateMongoDbId(id);
    try {
        const newBrand =await Brand.findByIdAndDelete(id);
        res.json(newBrand);
        
    } catch (error) {
        throw new Error(error);
        
    }
});

module.exports={createBrand,updateBrand,getBrand,getAllBrand,deleteBrand}