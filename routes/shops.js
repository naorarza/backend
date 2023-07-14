const express = require("express");
const { ShopModel , validateShop } = require("../models/shopModel");
// משתנה שמקבל יכולות מיוחדת של האקספרס
const router = express.Router();

router.get("/" , async(req,res) => {
//   res.json({msg: "shops work"})
try {
    let data = await ShopModel.find({});
    res.json(data);
}catch(err){
    console.log(err);
    res.status(502).json({err});
}

})

router.post("/", async(req,res) => {
    let validateBody = validateShop(req.body);
    if(validateBody.error){
        return res.status(400).json(validateBody.error.details);
    }
    try {
        // req.params , req.query , req.body
        let product = new ShopModel(req.body);
        await product.save();
        res.json(product);
    }catch(err){
        console.log(err);
        res.status(502).json({err});
    }

})

router.delete("/:idDel", async (req,res) => {
    try {
        let idDel = req.params.idDel;
        let data = await ShopModel.deleteOne({_id:idDel});
        // deleteOne will delete one and not many
        // if the delete is successful we will recive
        // deleteCount:1
        res.json(data);
    }catch(err){
        console.log(err);
        res.status(502).json({err});
    }
})

module.exports = router;