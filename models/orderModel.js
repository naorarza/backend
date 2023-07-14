const mongoose = require("mongoose");
const Joi = require("joi");
// ספרייה שיודעת לעבוד עם טוקן
const jwt = require("jsonwebtoken");

const orderSchema = new mongoose.Schema(
  {
    name: String, // Users collection
    user_id: String, // Users collection
    city: String,
    address: String,
    products_ar: Array, // Products collection
    isPresent: { type: Boolean, default: false },
    delivery_msg: String,
    phone: String,
    order_price: Number,
    order_date: { type: Date, default: Date.now() },
    status: { type: String, default: "ממתין לאישור" },
  },
  { versionKey: false }
);

exports.OrderModel = mongoose.model("orders", orderSchema);

exports.validateOrder = (_reqBody) => {
  let joiSchema = Joi.object({
    city: Joi.string().min(3).allow(null, ""),
    address: Joi.string().min(3).allow(null, ""),
    // products_ar:Joi.array().min(1).max(9999).required(),
    isPresent: Joi.boolean().required(),
    delivery_msg: Joi.string().min(10).max(500).allow(null, ""),
    phone: Joi.string().allow(null, ""),
    order_price:Joi.number(),
  });
  return joiSchema.validate(_reqBody);
};
