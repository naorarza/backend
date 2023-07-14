const mongoose = require("mongoose");
const Joi = require("joi");

let schema = new mongoose.Schema({
product_name:String,
img_url:String,
product_price:Number,
amount_product: { type:Number , default:1},
info:String,
category:String,// category collection
inMenu:Boolean,
newProductDate: {type: Date , default: new Date(new Date().setDate(new Date().getDate() + 30))}
}, {versionKey:false})
exports.ProductModel = mongoose.model("products",schema)

exports.validateProduct = (_reqBody) => {
let joiSchema = Joi.object({
product_name:Joi.string().min(3).max(50).required(),
img_url:Joi.string().min(1).max(999).required(),
product_price:Joi.number().min(1).max(999).required(),
amount_product:Joi.number(),
category:Joi.string().allow(null,''),
info:Joi.string().min(1).max(999).required(),
inMenu:Joi.boolean().required(),

})
return joiSchema.validate(_reqBody)
}