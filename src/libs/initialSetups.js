import Role from '../models/roles'
import { Schema, model } from "mongoose";

export const createRoles=async ()=>{
    //es para contar si ya existen documentos borramos el contador de roles

   try {
    const count=await Role.estimatedDocumentCount()

    if(count>0)return;
    //promise all ejecuta todas las funciones al mismo tiempo 
    //para ganar mas rendimiento 
    const values = await Promise.all([
        new Role({ name: "user" }).save(),
        new Role({ name: "admin" }).save(),
        new Role({ name: "domiciliario" }).save(),
        new Role({ name: "restaurante" }).save(),
      ]);

      console.log(values)
   } catch (error) {
    console.error(error)
   }
}