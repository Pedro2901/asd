const express = require("express");
const path = require("path");
const Handlebars = require("handlebars");
const { engine } = require("express-handlebars");
const methodOverride = require("method-override");
const session = require("express-session");
const {
  allowInsecurePrototypeAccess,
} = require("@handlebars/allow-prototype-access");
const insecureHandlebars = allowInsecurePrototypeAccess(Handlebars);
const flash = require("connect-flash");
const passport = require("passport");

//initializations
const app = express();

require("./database");
require("./config/passport");
const helpers = require("./config/handlebars.js");

//settings
app.set("port", process.env.PORT || 3000);
app.set("views", path.join(__dirname, "views"));

app.engine(
  ".hbs",
  engine({
    defaultLayout: "main",

    handlebars: allowInsecurePrototypeAccess(Handlebars),

    layoutsDir: path.join(app.get("views"), "layouts"),

    partialsDir: path.join(app.get("views"), "partials"),

    extname: ".hbs",
    helpers: {
      if_equal: function (a, b, opts) {
        if (a == b) {
          return opts.fn(this);
        } else {
          return opts.inverse(this);
        }
      },

      sumQuantities: function (items) {
        return items.reduce((total, item) => total + item.cantidad, 0);
      },
      multiply: function (value1, value2) {
        return value1 * value2;
      },

      total: function (products) {
        let total = 0;
        for (const product of products) {
          total += product.price * product.quantity;
        }
        return total;
      },
    },
  })
);

app.set("view engine", ".hbs");
console.log(path.join(__dirname, "view"));

app.use(express.urlencoded({ extended: false }));

app.use(methodOverride("_method"));

app.use(flash());
app.use(
  session({
    secret: "mySecret",
    resave: true,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  res.locals.user = req.user;

  next();
});

app.use(require("./routes/users"));
app.use(require("./routes/restaurante.js"));
app.use(require("./routes/productos.js"));
app.use(require("./routes/pedido.js"));

//Static Files
app.use(express.static(path.join(__dirname, "public")));
//Server is listenning
app.listen(app.get("port"), () => {
  console.log(`server on port ${app.get("port")}`);
});
