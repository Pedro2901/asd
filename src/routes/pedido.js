const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Order = require("../models/pedidos");
const Product = require("../models/products");
const Restaurant = require("../models/restaurante");
const { isAuthenticated } = require("../helpers/auth");
function getNextStatus(currentStatus) {
  switch (currentStatus) {
    case "Aceptado":
      return "Recibido";
    case "Recibido":
      return "En dirección";
    case "En dirección":
      return "Realizado";
    case "Realizado":
      return "|Realizado|";
    default:
      return "Aceptado";
  }
}

router.get("/Pedido/estado", isAuthenticated, async (req, res) => {
  const restaurant = await Restaurant.findOne({ user: req.user.id });

  const orders = await Order.find({ restaurant: restaurant._id }).populate(
    "products"
  );
  console.log("orderxd: ", orders);
  res.render("pedidos/pedidoRestaurante", { orders });
});

router.get("/pedidos/domiciliario", isAuthenticated, async (req, res) => {
  try {
    const orders = await Order.find({
      $and: [
        { Domiciliario: req.user.id },
        { isActive: true },
        { status: { $ne: "|Realizado|" } },
      ],
    });
    console.log("Domiciliario: ", orders);
    res.render("pedidos/EntregaPedidos", { orders });
  } catch (error) {
    console.error(error);
    res.render("pedidos/EntregaPedidos");
  }
});

router.get("/pedidos/disponiblesUR", isAuthenticated, async (req, res) => {
  let orders = await Order.find({
    $and: [{ status: "Enviado" }, { isActive: true }],
  });

  // Asignar un número aleatorio a cada orden y ordenarlas
  orders = orders.map(order => {
    order = order.toObject(); // Convertir el documento Mongoose a un objeto JavaScript para poder agregar nuevas propiedades
    order.randomNumber = Math.floor(Math.random() * 91) + 10;
    return order;
  });

  // Ordenar las órdenes por el número aleatorio
  orders.sort((a, b) => a.randomNumber - b.randomNumber);

  if (orders && orders.length > 0 && orders[0].Domiciliario === undefined) {
    const products = orders[0].products;
    res.render("pedidos/pedidos", { orders: orders });
  } else {
    res.render("pedidos/pedidos");
  }
});


router.get("/pedido/disponibles", isAuthenticated, async (req, res) => {

  const order = await Order.find({
    $and: [{ status: "Enviado" }, { isActive: true }],
  }).sort({ date: -1 });

  //console.log("encontre:", order);
  if (order && order.Domiciliario === undefined) {
    const products = order.products;
    res.render("pedidos/pedidos", { orders: order });
  } else {
    res.render("pedidos/pedidos");
  }
});
router.post("/pedido/tomar/:id", isAuthenticated, async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id });
  if (order.status === "Realizado") {
    const restaurant = await Restaurant.findOne({ _id: order.restaurant });
    restaurant.domiciliosRealizados += 1;
    await restaurant.save();
    order.isActive = false;
    await order.save();
  }

  //console.log("pedidoOrder: ",order)
  if (order.Domiciliario === undefined) {
    order.Domiciliario = req.user.id;
  }
  //console.log("order status:", order.status)
  const cambio = getNextStatus(order.status);
  order.status = cambio;
  await order.save();

  if (req.user.roles === "restaurante") {
    res.redirect("/pedido/estado");
  } else {
    if (req.user.roles === "domiciliario") {
      res.redirect("/pedidos/domiciliario");
    }
  }
});

// router.get('/pedidos/domiciliario',isAuthenticated,async (req,res)=>{

//   const order = await Order.find({ Domiciliario: req.user.id });
//   console.log("im still standing")
//   console.log("EncontraPedidos:",order)
//   res.render("pedidos/EntregaPedidos",{order})
// })

router.post("/pedido/actualizar", isAuthenticated, async (req, res) => {});

router.get("/pedido/envio/:id", isAuthenticated, async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id });
  // console.log("ordersito: ", order.status);

  console.log("entro");
  order.status = "Enviado";
  await order.save();

  res.render("about");
});

router.get("/order/carrito", isAuthenticated, async (req, res) => {
  const order = await Order.findOne({ status: "Creado" });
  // console.log("order:",order)
  if (order && order.status === "Creado") {
    const subtotals = order.products.map((item) => item.price * item.quantity);
    const totalPrice = subtotals.reduce((acc, subtotal) => acc + subtotal, 0);

    res.render("pedidos/pedidoDom", { order, totalPrice });
  } else {
    res.render("pedidos/pedidoDom");
    req.flash("error_msg", "Vacio");
  }
});

// router.post('/order',
// async (req, res) => {
//     const order = new Order(req.body);
//     await order.save();
//     res.json(order);
//   });
router.get("/order", isAuthenticated, async (req, res) => {
  const searchQuery = req.query.query;
  // console.log("Search es este:",searchQuery)
  const regex = new RegExp(searchQuery, "i");
  // console.log("aca",regex)
  try {
    const results = await Restaurant.find({
      $and: [{ name: regex }, { isActive: true }],
    }).sort({ domiciliosRealizados: -1 });

    //  console.log(results)
    res.render("pedidos/Busqueda", { results });
  } catch (err) {
    res.status(500).send("Error en la búsqueda");
    res.render("about");
    req.flash("success_msg", "No se encontraron restaurantes relacionados");
  }
});

router.get("/order/:id", isAuthenticated, async (req, res) => {
  //console.log("miralo",req.params.id)
  const productos = await Product.find({
    $and: [{ restaurant: req.params.id }, { isActive: true }],
  });
  // console.log(productos)
  res.render("pedidos/restUserView", { productos });
});

router.post("/order/editarSR/:id", isAuthenticated, async (req, res) => {
  const { quantity } = req.body;
  const productId = req.params.id;
  //console.log("cantidad es: ",quantity)
  const userId = req.user.id;

  const productos = await Product.findById(productId);
  const productName = productos.name;
  const productPrice = productos.price;
  //console.log("productos es: ",productos)
  //console.log("nombre: ",productName)
  //console.log("precio: ",productPrice)

  try {
    let cart = await Order.findOne({ status: "Creado" });

    if (!cart) {
      cart = new Order({ user: userId });
    }

    const productIndex = cart.products.findIndex(
      (p) => p.product.toString() === productId
    );

    console.log("cart:", cart.status);

    if (productIndex >= 0) {
      console.log("entro");

      cart.products[productIndex].quantity =
        Number(cart.products[productIndex].quantity) + Number(quantity);
    }

    cart.restaurant = productos.restaurant;

    cart.products = cart.products.filter((product) => product.quantity > 0);
    // console.log("antes de mandar: ",cart.products)
    await cart.save();

    req.flash("success_msg", "producto editado");
    res.redirect(`/order/carrito`);
  } catch (error) {
    req.flash("error_msg", "Error al editar el producto");
    res.redirect("/order");
  }
});

router.post("/order/add/:id", isAuthenticated, async (req, res) => {
  const { quantity } = req.body;
  const productId = req.params.id;
  console.log("cantidad es: ", quantity);
  const userId = req.user.id;

  const productos = await Product.findById(productId);
  const productName = productos.name;
  const productPrice = productos.price;
  //console.log("productos es: ",productos)
  //console.log("nombre: ",productName)
  //console.log("precio: ",productPrice)

  try {
    // Encuentra el carrito del usuario
    let cart = await Order.findOne({ status: "Creado" });
    // console.log("cart:",cart)
    if (!cart) {
      // Si no existe un carrito, crea uno nuevo
      cart = new Order({ user: userId });
    }

    // Busca si el producto ya está en el carrito
    //const productIndex = cart.products.findIndex((p) => p.product.toString() === productId);

    const productIndex = cart.products.findIndex(
      (p) => p.product.toString() === productId
    );
    //console.log("contador: ",productIndex)
    console.log("cart:", cart.status);
    //&& cart.status==="Pending"
    if (productIndex >= 0) {
      console.log("entro");

      cart.products[productIndex].quantity =
        Number(cart.products[productIndex].quantity) + Number(quantity);
    } else {
      console.log("else");
      const newProduct = {
        product: productId,
        quantity,
        name: productName,
        price: productPrice,
      };
      cart.products.push(newProduct);
    }

    cart.restaurant = productos.restaurant;
    console.log("antes de mandar: ", cart.products);
    await cart.save();

    req.flash("success_msg", "Producto añadido al carrito");
    res.redirect(`/order/${productos.restaurant}`);
  } catch (error) {
    req.flash("error_msg", "Error al añadir el producto al carrito");
    res.redirect("/order");
  }
});

module.exports = router;
