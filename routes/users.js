const express = require("express");
const bcrypt = require("bcrypt");

const {
  UserModel,
  validateUser,
  validateLogin,
  createToken,
} = require("../models/userModel");
const auth = require("../middlewares/auth");
const authAdmin = require("../middlewares/authAdmin");
const { ProductModel } = require("../models/productModel");
const ObjectId = require("mongodb").ObjectId;

const router = express.Router();

// מאזין לכניסה לראוט של העמוד בית לפי מה שנקבע לראוטר
// בקובץ הקונפיג

// add an auth to detect wich user is entering the get request
router.get("/", async (req, res) => {
  res.json({ msg: "Users end point , docs: ..." });
});

router.get("/usersListAll", authAdmin, async (req, res) => {
  try {
    let data = await UserModel.find({});
    res.json(data);
  } catch (err) {
    console.log(err);
    res.status(502).json({ err });
  }
});

router.get("/usersList", authAdmin, async (req, res) => {
  let perPage = Math.min(req.query.perPage, 20) || 10;
  let page = req.query.page - 1 || 0;
  try {
    let data = await UserModel.find({})
      .limit(perPage)
      .skip(page * perPage);
    res.json(data);
  } catch (err) {
    console.log(err);
    res.status(502).json({ err });
  }
});

router.get("/count", async (req, res) => {
  let perPage = Math.min(req.query.perPage, 20) || 10;
  try {
    // countDocuments -> מחזיר את כמות הרשומות
    let count = await UserModel.countDocuments({});
    res.json({ count, pages: Math.ceil(count / perPage) });
  } catch (err) {
    console.log(err);
    res.status(502).json({ err });
  }
});

// auth -> פונקציית מידל וואר שפועלת ראשונה ואם מצליחה מפעילה נקסט שמפעיל את הפונקציה
// הבאה בשרשור של הראוטר
router.get("/userInfo", auth, async (req, res) => {
  try {
    // req.tokenData -> מגיע מהפונקציה הקודמת שאספה לתוכו את המדיע של הטוקן שיש בו איי די של משתמש
    // the password will not return with the data -> {password:0}
    let user = await UserModel.findOne(
      { _id: req.tokenData._id },
      { password: 0 }
    );
    res.json(user);
    // res.json({msg:"success. ",tokenData:req.tokenData})
  } catch (err) {
    console.log(err);
    res.status(502).json({ err });
  }
});

// sign up
router.post("/", async (req, res) => {
  // בודק אם הבאדי שמגיע מצד לקוח תקין
  let validBody = validateUser(req.body);
  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }
  try {
    let user = new UserModel(req.body);
    user.password = await bcrypt.hash(user.password, 10);
    await user.save();
    user.password = "******";
    res.status(201).json(user);
  } catch (err) {
    // דורש שבקומפס נגדיר באינדקס של המייל שהוא יוניקי
    // 11000 -> מאפיין קיים כבר במערכת במקרה שלנו המייל ככה שצד לקוח
    // יידע שהשגיאה היא שהמייל כבר קיים במערכת
    if (err.code == 11000) {
      return res.status(400).json({
        msg: "Email already in use,\nForgot ur password?",
        code: 11000,
      });
    }
    console.log(err);
    res.status(502).json({ err });
  }
});

// ?user_id= &role=
// משנה תפקיד של משתמש
router.patch("/:role/:_id", authAdmin, async (req, res) => {
  try {
    // ישנה את הרול של המשתמש שבקווארי של היוזר איי די
    // לערך שנמצא בקווארי של רול
    let _id = req.params._id;
    let role = req.params.role;
    let userToChange = (await UserModel.findOne({ _id })) || null;
    if (userToChange == null) {
      return res.json({ msg: "This user id not exist" });
    }
    // לא מאפשר למשתמש עצמו לשנות את התפקיד שלו
    // או לשנות את הסופר אדמין
    if (req.tokenData.role != "owner") {
      if (userToChange._id == req.tokenData._id) {
        return res.status(401).json({ msg: "You cant change your role!" });
      }
      if (userToChange.role == "admin") {
        return res
          .status(401)
          .json({ msg: "You cant change another admin role!" });
      }
      if (userToChange.role == "owner") {
        return res.status(401).json({ msg: "You cant change the owner role!" });
      }
    }
    const data = await UserModel.updateOne({ _id: userToChange._id }, { role });
    res.json(data);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

router.delete("/delete/:idDel", authAdmin, async (req, res) => {
  try {
    let idDel = req.params.idDel;
    let user = await UserModel.findOne({ _id: idDel });
    if (idDel == req.tokenData._id)
      return res.json({ msg: "You cant delete yourself!" });
    if (user.role == "admin" && req.tokenData.role != "owner") {
      return res.json({ msg: "You cant delete another admin!" });
    }
    if (user.role == "owner") {
      return res.json({ msg: "You cant delete the Owner!!" });
    }
    const data = await UserModel.deleteOne({ _id: idDel });
    res.json(data);
  } catch (err) {
    console.log(err);
    res.status(502).json({ err });
  }
});

// users/login
router.post("/login", async (req, res) => {
  let validBody = validateLogin(req.body);
  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }
  try {
    //  אם בכלל קיים מייל שנשלח בבאדי במסד
    let user = await UserModel.findOne({ email: req.body.email });
    if (!user) {
      return res.status(401).json({ msg: "Email not found, sign up!" });
    }

    // אם הסיסמא המוצפנת של הרשומה שנמצא לפי המייל מתאימה לסיסמא בבאדי
    let passValid = await bcrypt.compare(req.body.password, user.password);
    if (!passValid) {
      return res.status(401).json({ msg: "Password worng!" });
    }

    // token -> אם השם של המאפיין זהה לשם של משתנה או פרמטר בבלוק של פונקציה
    // אין צורך לעשות נקודתיים ולכתוב אותו שוב shorhad props object
    let token = createToken(user._id, user.role);
    // res.json({token:token})

    // sending the user as well in order to recive hes values
    // user.password = undefined;
    // res.json({user,token})

    res.json({ token });
    // res.json({msg:"Success, need to send you token later"})
  } catch (err) {
    console.log(err);
    res.status(502).json({ msg: "There problem, come back later" });
  }

  // לשלוח טוקן
});

// users/loginGoogle
router.post("/loginGoogle", async (req, res) => {
  try {
    //  אם בכלל קיים סאב שנשלח בבאדי במסד
    console.log(req.body);
    
    let user = await UserModel.findOne({ googleSub: req.body.sub });
    console.log(req.body.sub);
    if (!user) {
      return res.status(401).json({ msg: "עליך למלא פרטים נוספים על מנת להתחבר עם גוגל" });
    }
    if (user === null) {
      return res.status(401).json({ msg: "עליך למלא פרטים נוספים על מנת להתחבר עם גוגל" });
    }

    // token -> אם השם של המאפיין זהה לשם של משתנה או פרמטר בבלוק של פונקציה
    // אין צורך לעשות נקודתיים ולכתוב אותו שוב shorhad props object
    let token = createToken(user._id, user.role);
    // res.json({token:token})

    // sending the user as well in order to recive hes values
    // user.password = undefined;
    // res.json({user,token})

    res.json({ token });
    // res.json({msg:"Success, need to send you token later"})
  } catch (err) {
    console.log(err);
    res.status(502).json({ msg: "There problem, come back later" });
  }

  // לשלוח טוקן
});

router.put("/cart/:productId", auth, async (req, res) => {
  try {
    let productId = req.params.productId;
    let plusArr = await ProductModel.findOne({ _id: productId });
    let user = await UserModel.findOne({ _id: req.tokenData._id });
    let current = user.cart;
    current.push(plusArr);
    let newProduct = await UserModel.updateOne(
      { _id: user._id },
      { cart: current }
    );
    res.json(newProduct);
  } catch (err) {
    console.log(err);
    res.status(502).json({ msg: "There problem, come back later" });
  }
});

router.get("/products", auth, async (req, res) => {
  let user = await UserModel.findOne({ _id: req.tokenData._id });
  res.json(user.cart);
});

router.get("/newProduct", auth, async (req, res) => {
  // console.log("newProduct");
  let user = await UserModel.findOne({ _id: req.tokenData._id });
  res.json(user.newProductsInCart);
});

router.put("/productNum/:upOrDown", auth, async (req, res) => {
  // console.log("up and down");

  try {
    let user = await UserModel.findOne({ _id: req.tokenData._id });
    const upOrDown = req.params.upOrDown.toString();

    if (upOrDown === "up") {
      let amount = user.newProductsInCart + 1;
      let newCartAmount = await UserModel.updateOne(
        { _id: user._id },
        { newProductsInCart: amount }
      );
      return res.json(newCartAmount);
    } else if (upOrDown === "down") {
      let amount = user.newProductsInCart - 1;
      let newCartAmount = await UserModel.updateOne(
        { _id: user._id },
        { newProductsInCart: amount }
      );
      return res.json(newCartAmount);
    }
  } catch (err) {
    console.log(err);
    res.status(502).json({ msg: "There problem, come back later" });
  }
});

router.put("/google", auth, async (req, res) => {
  console.log(req.body);
  
  try{
    let user = await UserModel.findOne({_id:req.tokenData._id});
    let userSub = await UserModel.updateOne(
      { _id: user._id },
      { googleSub: req.body.sub }
    ).updateOne({ _id: user._id },
      { profile_img: req.body.picture });
    // user.profile_img = req.body.picture;
    
    return res.json(userSub);
  }
  catch(err){
    console.log(err);
    res.status(502).json({err})
  }
});

router.delete("/product/all", auth, async (req, res) => {
  try {
    let user = await UserModel.findOne({ _id: req.tokenData._id });
    await UserModel.updateOne({ _id: user._id }, { cart: [] });
    await UserModel.updateOne({ _id: user._id }, { newProductsInCart: 0 });

    res.json(user.cart);
  } catch (err) {
    console.log(err);
    res.status(502).json({ msg: "Something went wrong" });
  }
});

router.delete("/product/delete/:_id", auth, async (req, res) => {
  try {
    let user = await UserModel.findOne({ _id: req.tokenData._id });
    const product = user.cart.findIndex((item) =>
      item._id.equals(ObjectId(req.params._id))
    );
    if (product >= 0) {
      user.cart.splice(product, 1); // remove the item from the cart array
      user.newProductsInCart--;
      await user.save(); // save the updated user document
    }
    res.json(product);
  } catch (err) {
    console.log(err);
    res.status(502).json({ msg: "There problem, come back later" });
  }
});

router.put("/profile", auth, async (req, res) => {
  try {
    let changeProfile = await UserModel.updateOne(
      { _id: req.tokenData._id },
      { profile_img: req.body.img_url }
    );
    res.json(changeProfile);
  } catch (err) {
    console.log(err);
    res.status(502).json({ err });
  }
});

router.put("/darkmode", auth, async (req, res) => {
  try {
    let changeProfile = await UserModel.updateOne(
      { _id: req.tokenData._id },
      { darkMode: req.body.isDarkMode }
    );
    res.json(changeProfile);
  } catch (err) {
    console.log(err);
    res.status(502).json({ err });
  }
});

router.put("/profile/reset", auth, async (req, res) => {
  try {
    let changeProfile = await UserModel.updateOne(
      { _id: req.tokenData._id },
      { profile_img: "https://freesvg.org/img/abstract-user-flat-4.png" }
    );
    res.json(changeProfile);
  } catch (err) {
    console.log(err);
    res.status(502).json({ err });
  }
});

router.put("/product/:_id/:upOrDown", auth, async (req, res) => {
  try {
    let user = await UserModel.findOne({ _id: req.tokenData._id });
    const index = user.cart.findIndex((item) =>
      item._id.equals(ObjectId(req.params._id))
    );

    if (index >= 0) {
      if (req.params.upOrDown === "up") {
        user.cart[index].amount_product = user.cart[index].amount_product + 1;
      }
      if (req.params.upOrDown === "down") {
        user.cart[index].amount_product = user.cart[index].amount_product - 1;
      }
    }

    await UserModel.updateOne({ _id: user._id }, user);
    await user.save();

    res.status(201).json(user.cart[index].amount_product);
  } catch (err) {
    console.log(err);
    res.status(502).json({ err });
  }
});

module.exports = router;
