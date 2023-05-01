const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Product = require("../models/products");
const Restaurant = require("../models/restaurante");
const { isAuthenticated } = require("../helpers/auth");

router.delete("/product/delete/:id", isAuthenticated, async (req, res) => {
  const product = await Product.findOne({ _id: req.params.id });
  console.log(req.params.id);
  product.isActive = false;
  await product.save();
  req.flash("success_msg", "Eliminado de forma exitosa");
  res.redirect("/notes");
});

router.get("/product/edit/:id", isAuthenticated, async (req, res) => {
  const product = await Product.findOne({ _id: req.params.id });
  console.log(product);
  res.render("products/editProduct", { product });
});

router.put("/product/editPro/:id", isAuthenticated, async (req, res) => {
  const { name, price, category } = req.body;
  await Product.findByIdAndUpdate(req.params.id, { name, price, category });
  req.flash("success_msg", "producto actualizada de forma exitosa");
  res.redirect("/restaurant/products");
});

router.post("/products", isAuthenticated, async (req, res) => {
  const product = new Product(req.body);
  await product.save();
  res.json(product);
});

router.get("/products/create", isAuthenticated, async (req, res) => {
  const restaurant = await Restaurant.find({ user: req.user.id });

  res.render("products/createProducto", { restaurant });
});

router.post("/products/create", isAuthenticated, async (req, res) => {
  const restaurant = await Restaurant.findOne({ user: req.user.id });

  const { name, price, category } = req.body;
  const producto = new Product(req.body);
  producto.Restaurant = restaurant._id;

  producto.isActive = true;

  const restaurantID = restaurant._id.toString();
  producto.restaurant = restaurantID;

  await producto.save();

  req.flash("success_msg", "producto agregado exitosamente");
  res.redirect("/restaurant");
});

router.get("/products", async (req, res) => {});

router.put("/products/:id", async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.json(product);
});

module.exports = router;
