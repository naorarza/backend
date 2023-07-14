const jwt = require("jsonwebtoken");
const {config} = require("../config/secret");

const auth = async (req,res,next) => {
  let token = req.header("x-api-key");
  if(!token){
    return res.status(401).json({msg:"You need to send token to this endpoint url"})
  }
  try{
    let decodeToken = jwt.verify(token,config.tokenSecret);
    // add to req , so the next function will recognize
    // the tokenData/decodeToken

    req.tokenData = decodeToken;
    next();
  }
  catch(err){
    console.log(err);
    return res.status(401).json({msg:"Token invalid or expired, log in again or you hacker!"})
  }
}

module.exports = auth;

// auth for admin only
// const authAdmin = async(req,res,next) => {
//   let token = req.header("x-api-key");
//   if(!token){
//     return res.status(401).json({msg:"You must send token in the header to this endpoint"})
//   }
//   try{
//     // בודק אם הטוקן תקין או בתקוף
//     let decodeToken = jwt.verify(token, config.tokenSecret);
//     let admin = await UserModel.findOne({_id:decodeToken._id});
//     // בודק אם הטוקן שייך לאדמין
//     if(admin.role != "admin"){
//       return res.status(401).json({msg:"Just admin can be in this endpoint"})
//     }
//     // req -> יהיה זהה בכל הפונקציות שמורשרות באותו ראוטר
//     req.tokenData = admin;
    
//     // לעבור לפונקציה הבאה בשרשור
//     next();
//   }
//   catch(err){
//     return res.status(401).json({msg:"Token invalid or expired"})
//   }
// }

// module.exports = authAdmin;