const mongoose = require("mongoose");
const { config } = require("../config/secret");

main().catch((err) => console.log(err));

async function main() {
  // כדי למנוע הצגת אזהרה
  mongoose.set("strictQuery", false);
  // וזה לווינדוס 11
  await mongoose.connect(
    `mongodb+srv://${config.db_user}:${config.db_password}@cluster0.v3l6j1t.mongodb.net/atid22`
    // `mongodb+srv://${config.db_user}:${config.db_password}@drinkorderparty.mxpvewi.mongodb.net/final`
  );
  console.log("mongo connect atid22 local");
  // use `await mongoose.connect('mongodb://user:password@localhost:27017/test');` if your database has auth enabled
}
