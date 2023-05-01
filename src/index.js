//express handlebars es para un motor de plantillas de express
//express- session es para crear sesiones dentro del servidor
//method override es para extender la funcionalidad de los formularios
//mongoose es la base de datos
//passport es para autenticarte el usuario
//bycryptjs , permite añadir algun algoritmo y añadir un hash a una contraseña
//connect-flash , para mandar un mensaje entre multiples vistas
//passport y passport es para el proceso de autenticar
const express = require("express");
const path = require("path");
const Handlebars = require('handlebars')
const {engine} = require('express-handlebars')

const methodOverride = require("method-override");
const session = require("express-session");
const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access')
const insecureHandlebars = allowInsecurePrototypeAccess(Handlebars)
const flash=require('connect-flash')
const passport=require('passport')
import {createRoles} from './libs/initialSetups.js'
//initializations
const app = express();
createRoles()
require('./database');
require('./config/passport');
const helpers=require('./config/handlebars.js');

// El resto de tu código de app.js aquí

//settings
app.set("port", process.env.PORT || 3000);
app.set("views", path.join(__dirname, "views"));




//aqui se usa handlebars este es para que sepan como seran llamados nuestros archivos de las views
app.engine(
  '.hbs',
  engine({
   
    //Estas propiedades son para saber de que manera usaremos las vistas
    //el nombre del archivo principal sera main donde estara el diseño principal
    defaultLayout: 'main',
    //defaultLayout:false,
    handlebars: allowInsecurePrototypeAccess(Handlebars),
    //layouts es diseños en ingles es donde estara la plantilla principal de toda nuestra aplicacion(header footer , etc)
    //ahora debemos darle la direccion de donde esta la carpeta layouts
    layoutsDir: path.join(app.get('views'), 'layouts'),
    //estas son pequeñas partes de html que podemos reutilizar en cualquier vista
    //ahora debemos darle la direccion de donde esta la carpeta de partials
    partialsDir: path.join(app.get('views'), 'partials'),
    //este es para colocarle que extension tendra nuestros archivos (.hbs)
    extname: '.hbs',
    helpers:{
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




//a pesar de todo no la estamos usando , para usarla usaremos el app.set
app.set("view engine", ".hbs");
console.log(path.join(__dirname, "view"));
//Middlewares
//urlencoded sirve para cuando un formulario nos mande un dato , nosotros podamos entenderlo
app.use(express.urlencoded({ extended: false }));
//methodOverride es un middlewares de express
//este nos permite que los formularios nos permitan mandar otros tipos de metodos
//no solo get o post sino tambien put y delete
//para eso mandaremos un imput oculto '._method'
app.use(methodOverride("_method"));
//session se configura como un objeto
//session es un modulo de sesion para express
app.use(flash())
app.use(
  session({
    secret: "mySecret",
    resave: true,
    saveUninitialized: true,  
  })
);

app.use(passport.initialize());
app.use(passport.session()  ); 
app.use(flash());


//Global Variables
app.use((req,res,next)=>{
  res.locals.success_msg=req.flash('success_msg');
  res.locals.error_msg=req.flash('error_msg')
  res.locals.error=req.flash('error');
  res.locals.user=req.user;
  
  next();
})

//routes
//estas seran las url que iran en la carpeta de routes
app.use(require("./routes/index"));
app.use(require("./routes/notes"));
app.use(require("./routes/users"));
app.use(require('./routes/restaurante.js'))
app.use(require('./routes/productos.js'))
app.use(require('./routes/pedido.js'))

//Static Files
app.use(express.static(path.join(__dirname,'public')))
//Server is listenning
app.listen(app.get("port"), () => {
  console.log(`server on port ${app.get("port")}`);
});
