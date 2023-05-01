const express = require("express");
const router = express.Router();
const User=require('../models/users')
const passport=require('passport');
const Restaurant=require('../models/restaurante')
const Product = require('../models/products');
const{isAuthenticated}=require('../helpers/auth')

router.get('/restaurant/actualizar',isAuthenticated,async(req,res)=>{
  try {
    const restaurant = await Restaurant.findOne({
        $and: [
            { user: req.user.id },
            { isActive: true }
        ]
    });

    res.render('restaurant/EditRestaurant',{restaurant})
} catch (error) {
    console.error(error);
    req.flash('success_msg','No hay restaurante')
    res.redirect('/restaurant')   
  }


})


router.get("/restaurant/products",isAuthenticated,async(req,res)=>{
  const restaurant=await Restaurant.findOne({user:req.user.id})
  //console.log("restaurant:",restaurant)
  const productos=await Product.find({
    $and: [
    {restaurant:restaurant._id},
    { isActive: true }
    
  ]
  })
   

  // console.log("producto:",productos)
  res.render("products/producto",{productos})
  });
  

  router.post('/restaurant/create',isAuthenticated,async (req, res) => {
    const {name,category,isActive,user,direccion}=req.body
    const restaurant = new Restaurant(req.body);
    restaurant.user=req.user.id;
    restaurant.isActive=true;
    //console.log("restaurant es:",restaurant)

    await restaurant.save();
   
    req.flash('success_msg','Restaurante agregado exitosamente')
            res.redirect('/restaurant')
  } );

  router.get('/restaurant/create',isAuthenticated,async(req,res)=>{
   res.render("restaurant/createRestaurant")
  });


router.get('/restaurant',isAuthenticated,async (req, res) => {
    const restaurant=await Restaurant.find({
      $and: [
      {user:req.user.id},
      { isActive: true }
    ]
    });
  
    res.render("restaurant/restaurante",{restaurant})
  });




router.put('/restaurant/actualizar/:id',isAuthenticated, async (req, res) => {
    
  const restaurant = await Restaurant.findByIdAndUpdate(req.params.id, req.body, { new: true });
  req.flash('success_msg','Restaurante Actualizado')
  res.redirect('/restaurant')
  });



router.delete('/restaurant/eliminar/:id',isAuthenticated, async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({
        $and: [
            { user: req.user.id },
            { isActive: true }
        ]
    });
    restaurant.isActive=false;
    await restaurant.save()
    res.redirect('/restaurant')
    req.flash('success_msg','Restaurante eliminado')
} catch (error) {
    console.error(error);
    req.flash('success_msg','No hay restaurante')
    res.redirect('/restaurant')   
  }
  });



module.exports = router;
