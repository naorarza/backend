const jwt = require("jsonwebtoken");
const {config} = require("../config/secret");

const authAdmin = async (req,res,next) => {
  let token = req.header("x-api-key");
  if(!token){
    return res.status(401).json({msg:"You need to send token to this endpoint url"})
  }
  try{
    let decodeToken = jwt.verify(token,config.tokenSecret);
    // add to req , so the next function will recognize
    // the tokenData/decodeToken
    if(decodeToken.role != 'owner'){
      if(decodeToken.role != "admin"){
         return res.status(401).json({msg:"your not an admin!"})
      }
    }
    req.tokenData = decodeToken;
    next();
  }
  catch(err){
    console.log(err);
    return res.status(401).json({msg:"Token invalid or expired, log in again or you hacker!"})
  }
}


module.exports = authAdmin;