const indexR = require("./index");
const usersR = require("./users");
const ordersR = require("./orders");
const categoriesR = require("./categories");
const productsR = require("./products");
const uploadsR = require("./uploads");
const updatesR = require("./updates");
const resetsR = require("./resetPassword");
const eventsR = require("./events");


exports.routesInit = (app) => {
  app.use("/",indexR);
  app.use("/users",usersR);
  app.use("/orders",ordersR);
  app.use("/categories",categoriesR);
  app.use("/products",productsR);
  app.use("/uploads",uploadsR);
  app.use("/updates",updatesR);
  app.use("/resetPassword",resetsR);
  app.use("/events",eventsR);
}
