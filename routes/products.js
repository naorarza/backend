const express= require("express");
const authAdmin = require("../middlewares/authAdmin");
const { validateProduct, ProductModel } = require("../models/productModel");
const router = express.Router();

router.get("/", async(req,res) => {
  try{
    let data = await ProductModel.find({});
    res.json(data)
  }
  catch(err){
    console.log(err);
    res.status(502).json({err})
  }
})

router.get("/menu", async(req,res) => {
  try{
    let data = await ProductModel.find({inMenu:true});
    res.json(data)
  }
  catch(err){
    console.log(err);
    res.status(502).json({err})
  }
})

router.get("/products", async(req,res) => {
  try{
    let data = await ProductModel.find({inMenu:false});
    res.json(data)
  }
  catch(err){
    console.log(err);
    res.status(502).json({err})
  }
})

router.get("/:id" , async(req,res) => {
  try{
    let data = await ProductModel.findOne({_id:req.params.id});
    res.json(data);
  }
  catch(err){
    console.log(err);
    res.status(502).json({err})
  }
})

router.post('/upload', authAdmin , async(req,res) => {

  let validBody = validateProduct(req.body);
  if(validBody.error){
    return res.status(401).json(validBody.error.details);
  }
  try{
    let product = new ProductModel(req.body);
    await product.save();
    res.json(product);
  }
  catch(err){
    console.log(err);
    res.status(502).json({err})
  }
})

router.put("/:id", authAdmin, async(req,res) => {
  try{
    let idPut = req.params.id;
    let product = await ProductModel.updateOne({_id:idPut}, req.body);
    res.json(product);
  }
  catch(err){
    console.log(err);
    res.status(502).json({err})
  }
})

// 
router.delete("/:idDel" , authAdmin , async(req,res) => {
  try{
    let idDelete = req.params.idDel;
    let product = await ProductModel.deleteOne({_id:idDelete});
    res.json(product);
  }
  catch(err){
    console.log(err);
    res.status(502).json({err})
  }
})


module.exports = router;