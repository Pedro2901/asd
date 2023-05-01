const express = require("express");
const router=express.Router();
//el metodo router me permite crear un objeto que me puede facilitar la creacion de rutas
//ahora crearemos rutas del servidor

router.get('/',(req,res)=>{
res.render('index.hbs');
})

router.get('/about',(req,res)=>{
res.render('about');
})
    
module.exports=router;