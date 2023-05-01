const mongoose =require('mongoose');
const express =require( 'express');
const app = express();
mongoose
  .connect(
      "mongodb+srv://pruebapedro:290190@cluster0.vbjacuv.mongodb.net/miprimera?retryWrites=true&w=majority",
    
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => {
    console.log('Connected.');
  })
  .catch((err) => {
    console.log('There was an error with connection!');
    console.log(err);
  });
mongoose.Promise = global.Promise;

