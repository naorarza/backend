const mongoose = require("mongoose");
const Joi = require("joi");
// ספרייה שיודעת לעבוד עם טוקן
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
  name:String,
  dob: String,
  email: String,
  username: String,
  password: String,
  city:String,
  address:String,
  phone:String,
  googleSub:String,
  role: { type: String, default: "user" },
  date_created: {
    type: Date,
    default: Date.now,
  },
  cart: [],
  profile_img: { type: String , default: 'https://freesvg.org/img/abstract-user-flat-4.png' },
  newProductsInCart:{type: Number , default:0},
  resetPasswordToken: {
    type: String,
    default: null,
  },
  resetPasswordExpires: {
    type: Date,
    default: null,
  },
  darkMode:{type:Boolean , default:true},
},{versionKey:false});

exports.UserModel = mongoose.model("users", userSchema);

exports.createToken = (user_id,role) => {
  // מייצר טוקן שמכיל את האיי די של המשתתמש
  // מילה סודית, שאסור לחשוף אם תחשף ניתן לייצר טוקנים
  // אופציה:תוקף של הטוקן , במקרה שלנו שעה
  let token = jwt.sign({ _id: user_id,role:role }, "monkeysSecret", {
    expiresIn: "2days",
  });
  return token;
};

exports.validateUser = (_reqBody) => {
  let joiSchema = Joi.object({
    name: Joi.string().min(2).max(150).required(),
    username: Joi.string().min(2).max(150).required(),
    dob: Joi.string().min(9).max(10).required(),
    // email -> בודק שהכתובת נראת הגיונית
    email: Joi.string().min(2).max(150).email().required(),
    googleSub: Joi.string(),
    profile_img: Joi.string(),
    password: Joi.string().min(3).max(150).required(),
    city:Joi.string().min(3).max(150).required(),
    address:Joi.string().min(3).max(999).required(),
    phone:Joi.string().min(10).max(13).required(),
    postal_code:Joi.number().required(),
    resetToken: {
      type: String,
      default: null,
    },
    resetTokenExpires: {
      type: Date,
      default: null,
    },
  });
  return joiSchema.validate(_reqBody);
};

exports.validateLogin = (_reqBody) => {
  let joiSchema = Joi.object({
    email: Joi.string().min(2).max(150).required(),
    password: Joi.string().min(3).max(150).required(),
  });
  return joiSchema.validate(_reqBody);
};
