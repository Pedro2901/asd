const mongoose = require("mongoose");
const { Schema } = mongoose;
const {} =require ('../helpers/auth')

const NoteSchema = new Schema({
  title: {
    type: String,
    required: [true, "Favor añade el titulo"],
  },
  description: {
    type: String,
    required: [true, "Favor escribir una descripción"],
  },
  date: {
    type: Date,
    default: Date.now,
  },

  user:{type:String}
});
//al crear un schema estamos creando un tipo de clase
module.exports = mongoose.model("Note", NoteSchema);
