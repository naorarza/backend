const mongoose = require("mongoose");
// Joi - מאפשר אימות של מידע שמגיע מצד לקוח בצד שרת
// לפני שהוא עובד לצד של המסד
const Joi = require("joi");

const eventSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  event_name: String,
  text: String,
});

exports.EventModel = mongoose.model("event", eventSchema);

exports.validateEvent = (_reqBody) => {
  let joiSchema = Joi.object({
    name: Joi.string().min(2).max(30).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().min(10).max(13).required(),
    event_name: Joi.string().min(2).max(30).required(),
    text: Joi.string().min(2).max(600).allow("", null),
  });
  return joiSchema.validate(_reqBody);
};
