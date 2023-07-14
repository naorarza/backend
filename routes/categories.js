const express = require("express");
const auth  = require("../middlewares/auth");
const authAdmin = require("../middlewares/authAdmin");
const { CategorieModel, validateCat } = require("../models/categorieModel");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    let data = await CategorieModel.find({});
    res.json(data);
  } catch (err) {
    console.log(err);
    res.status(502).json({ err });
  }
});

router.post("/", authAdmin , async(req,res) => {   

    let validateBody = validateCat(req.body);
    if(validateBody.error){
        return res.status(400).json(validateBody.error.details);
    }
    try {
        let category = new CategorieModel(req.body);
        category.admin_id = req.tokenData._id;
        await category.save();
        res.json(category);
    }catch(err){
        console.log(err);
        res.status(502).json({err});
    }

})

router.put("/:id", authAdmin ,async(req,res) => {
    let validBody = validateCat(req.body);
    if(validBody.error){
      return res.status(400).json(validBody.error.details);
    }
    try{
      let id = req.params.id;
   
      let data;
      // if(req.tokenData.role == "admin"){
        data =  await CategorieModel.updateOne({_id:id},req.body);
      // }
         // הוספנו גם בשאילתא שיוזר איי די צריך להיות שווה לאיי די 
      // בטוקן ככה שמשתמש א' לא יוכל בטעות לערוך למשתמש ב' את הרשומה
      // else{
      // data =  await CategorieModel.updateOne({_id:id,user_id:req.tokenData._id},req.body);
      // }
      res.json(data);
    }
    catch(err){
      console.log(err);
      res.status(502).json({err})
    }
  })

module.exports = router;
