require("dotenv").config();
// console.log(process.env.USER_DB);

// כל המשתנים שצריכים להיות סודיים יהיו בקובץ הזה
exports.config = {
  db_user:process.env.USER_DB,
  db_password:process.env.PASS_DB,
  tokenSecret:process.env.TOKEN_SECRET,
  db_url:""
}

