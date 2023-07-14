const express = require("express");
const auth = require("../middlewares/auth");
const authAdmin = require("../middlewares/authAdmin");
const { OrderModel, validateOrder } = require("../models/orderModel");
const { ProductModel } = require("../models/productModel");
const { UserModel } = require("../models/userModel");
const router = express.Router();

router.get("/", authAdmin, async (req, res) => {
  try {
    let orders = await OrderModel.find({});
    res.json(orders);
  } catch (err) {
    console.log(err);
    res.status(502).json({ err });
  }
});

router.get("/single/:id", auth , async (req, res) => {
  let orderId = req.params.id;
  try {
    let orders = await OrderModel.findOne({_id:orderId});
    res.json(orders);
  } catch (err) {
    console.log(err);
    res.status(502).json({ err });
  }
});

router.get("/:id", async (req, res) => {
  let userId = req.params.id;
  try {
    let data = await OrderModel.find({ user_id: userId });
    res.json(data); 
  } catch (err) {
    console.log(err);
    res.status(502).json({ err });
  }
});

router.patch("/status/:id", authAdmin, async (req, res) => {
  try {
    // req.body.status = this.OrderModel.status => in order to swith pending and recived configuration
    let data = await OrderModel.updateOne(
      { _id: req.params.id },
      { status: req.body.status }
    );
    res.json(data);
  } catch (err) {
    console.log(err);
    res.status(502).json({ err });
  }
});


router.post("/", auth, async (req, res) => {
    console.log(req.body);
    
  let validateBody = validateOrder(req.body);
  console.log('reached1');
  
  if (validateBody.error) {
    return res.status(400).json(validateBody.error.details);
  }
  try {
    let order = new OrderModel(req.body);
    let user = await UserModel.findOne({ _id: req.tokenData._id });
    console.log('reached2');
    
    order.name = user.name;
    order.user_id = user._id;
    
    // לא לשמור בטוקן את המספר טלפון ולא כתובת, לשלןף דרך היוזר איי די את המידע הרגיש של המשתמש
    // להתמש דרך היוזר איי די
    if (order.phone == "" || order.phone == null) {
      order.phone = user.phone;
    }
    if (order.city == "" || order.city == null) {
      order.city = user.city;
    }
    if (order.address == "" || order.address == null) {
      order.address = user.address;
    }
    console.log('reached3');
    order.products_ar = user.cart;
    order.delivery_msg = req.body.delivery_msg;
    order.order_price = req.body.order_price;
    await order.save();
    await UserModel.updateOne({ _id: user._id }, { cart: [] });
    await UserModel.updateOne({ _id: user._id }, { newProductsInCart: 0 });
    user.newProductsInCart = 0;
    console.log(user.newProductsInCart);
    console.log(user);
    
    await user.save();
    res.json(order);
  } catch (err) {
    console.log(err);
    res.status(502).json(err);
  }
});



router.delete("/:idDel", async (req, res) => {
  try {
    let idDel = req.params.idDel;
    let data = await OrderModel.deleteOne({ _id: idDel });
    // deleteOne will delete one and not many
    // if the delete is successful we will recive
    // deleteCount:1
    res.json(data);
  } catch (err) {
    console.log(err);
    res.status(502).json({ err });
  }
});

// Add to cart(Button) => with local storage in front-end

module.exports = router;
