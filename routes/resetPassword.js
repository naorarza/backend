const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const { UserModel } = require("../models/userModel");
const crypto = require("crypto");
const bcrypt = require("bcrypt");

router.post("/", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await UserModel.findOne({ email });
    // console.log(user);

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // generate reset password token and set expiration time
    const resetPasswordToken = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = resetPasswordToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    
    await user.save();

    // send email with reset password link
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      service:'gmail',
      secure: false,
      auth: {
        user: "drinkorderpartyweb@gmail.com",
        pass: "dqawfnbimamqtmku",
      },
    });
    
    const mailOptions = {
      from: "drinkorderparty@gmail.com",
      to: email,
      subject: "DOP - Reset Password",
      text: `היי לבקשתך לשינוי סיסמא שלחנו את האימייל הזה, במידה ולא אתה ביקשת לשנות את הסיסמא אתה יכול להתעלם: https://drink-web.netlify.app/reset-password/${resetPasswordToken}`,
      //   ${process.env.CLIENT_URL}
    };
    
    await transporter.sendMail(mailOptions);

    return res
      .status(200)
      .json({ message: "Reset password link has been sent to your email" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.post('/resetpsw', async (req, res) => {
  const { token , password } = req.body;
  console.log(token.token);
  
  try { 
    // find user by reset token and check expiration time
    const user = await UserModel.findOne({ 
      resetPasswordToken: token.token,
    });

    if (!user) {
      return res.status(400).json({ message: 'הקישור פג תוקף' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    // update user password
    user.password = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();
    
    res.status(200).json({ message: 'הסיסמא שונתה בהצלחה' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'תקלה פנימית בשרת!' });
  }
});

module.exports = router;
