const {Images,Product}=require('../models');


exports.getAllImages=async(req,res)=>{
    const {productid}=req.params;

    const product=await Product.findAll({where:{
        product_id:productid
    }})

    if(!product){
        return res.status(404).json({message:"No Product Found"});
    }

    const images= await Images.findAll({where:{
        productid
    }});
    return res.json({images});
    
}