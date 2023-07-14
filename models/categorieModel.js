const mongoose = require("mongoose");
const Joi = require("joi");

let schema = new mongoose.Schema({
  name: String,
  admin_id:String,
  code_url: String,
  info: String,
  type: String,
},{versionKey:false});
exports.CategorieModel = mongoose.model("categories", schema);

exports.validateCat = (_reqBody) => {
  let joiSchema = Joi.object({
    name: Joi.string().min(1).max(100).required(),
    admin_id: Joi.string().allow("",null),
    code_url: Joi.string().min(1).max(999).required(),
    info: Joi.string().min(1).max(400).required(),
    type: Joi.string().min(1).max(999).required()
  });
  return joiSchema.validate(_reqBody);
};
