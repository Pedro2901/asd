const express = require("express");
const router = express.Router();
const User=require('../models/users')
const passport=require('passport');
const Order=require('../models/pedidos')
const Product=require('../models/products')
const Restaurant=require('../models/restaurante')
const{isAuthenticated}=require('../helpers/auth')

//const rolescontroller = require('./roles')
//el metodo router me permite crear un objeto que me puede facilitar la creacion de rutas
//ahora crearemos rutas del servidor

router.delete('/users/eliminar/:id', isAuthenticated, async (req, res) => {
  try {
      const user = await User.findOne({ _id: req.params.id });

      if (!user) {
          req.flash('error_msg', 'Usuario no encontrado');
          return res.redirect("/about");
      }

      user.isActive = false;
      await user.save();
      req.flash('success_msg', 'Usuario eliminado exitosamente');
      res.redirect("/users/logout");
  } catch (error) {
      console.error(error);
      req.flash('error_msg', 'Error al eliminar usuario');
      res.redirect("/users/logout");
  }
});


router.put('/users/update/:id', isAuthenticated, async (req, res) => {
  try {
    const {email, nombre, contra, numCelular, direccion, roles} = req.body;
    const predUser = await User.findOne({_id:req.params.id});

    if(contra !== "") {
      const newContra = await User.encryptPassword2(contra);
      await User.findByIdAndUpdate(req.params.id, {email, nombre, contra: newContra, numCelular, direccion, roles});
    } else {
      await User.findByIdAndUpdate(req.params.id, {email, nombre, numCelular, direccion, roles});
    }

    req.flash('success_msg', "Actualización realizada");
    res.redirect('/about');

  } catch (error) {
    console.error(error);
    req.flash('error_msg', "Hubo un error durante la actualización");
    res.redirect('/about');
  }
});

router.get('/users/info/:id',isAuthenticated,async (req,res)=>{
  const user= await User.findOne({_id:req.params.id})

  res.render("users/info",{user})
})
router.get("/users/pedidos",isAuthenticated,async (req,res)=>{
  const orders = await Order.find({ user: req.user.id });
  console.log("asd: ", orders)
  res.render("users/pedidos",{orders})
})

router.post("/users/pedidos/:id",isAuthenticated,async (req,res)=>{
  const orders = await Order.findOne({ _id: req.params.id });
  console.log("asd: ", orders)
  orders.status="Realizado"
  await orders.save()
  res.redirect("/about")
})
router.get("/users/signin", (req, res) => {
  res.render("users/Ingresar");
});

router.post("/users/signin",passport.authenticate('local',{
  successRedirect:"/about",
  failureRedirect:"/users/signin",
  failureFlash:true,
}))

router.get("/users/signup", (req, res) => {
  res.render("users/Registrar");
});

router.post("/users/signup", async (req, res) => {
//  console.log(req.body);

  const { email, nombre, contra, numCelular, direccion, roles } = req.body;

  const newUser = new User({
    email,
    nombre, 
    contra,
    numCelular,
    direccion,
    roles,
  });
//  console.log("los roles son:",roles)
  // if (!roles) {
  //   const role = await Role.find({ name: "user" });

  //   const roleId = role.length > 0 ? role[0]._id.toString() : null;
  //   console.log(roleId);
  //   newUser.roles = roleId;
  //   console.log("Roleid es este:", role[0]._id.toString());
    
  // } else {
  //   const foundRoles = await Role.find({ name: { $in: roles } });
  //   console.log("Roles encontrados:", foundRoles);

  //   newUser.roles = foundRoles.map((role) => role.name);
  // }
 

  let errors = [];

  if (nombre.length <= 0) {
   // console.log("paso por aqui");
    errors.push({ text: "Por favor ingrese su nombre" });
  }
 

  if (nombre.length < 4) {
    errors.push({ text: "El usuario debe tener minimo 4 caracteres" });
  }

  if (contra.length <= 3) {
    errors.push({ text: "La contraseña debe ser minimo de 4 caracteres" });
  }
 
  if (errors.length > 0) {
    res.render("users/Registrar", {
      email,
      nombre,
      contra,
      numCelular,
      direccion,
      roles,
    });
  } 
  else {
   
   const emailUser= await User.findOne({email:email});
  //console.log("emailuser",email)
   if(emailUser){
    
   req.flash('error_msg','El correo ya existe');
   res.redirect("/users/signin")
   
   }else{
  
    

   
   newUser.contra=await newUser.encryptPassword(contra)  
   //console.log("Despues de encriptar:",newUser)
   await newUser.save()
   req.flash('success_msg',"Registro exitoso")
   res.redirect('/users/signin')
  }
  }
});

router.get("/users/logout", function(req, res, next) {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect("/");
  });
});

module.exports = router;
