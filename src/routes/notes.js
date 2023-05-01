const express = require("express");
const router=express.Router();
//el metodo router me permite crear un objeto que me puede facilitar la creacion de rutas
//ahora crearemos rutas del servidor
const Note=require('../models/Note');

const{isAuthenticated}=require('../helpers/auth')
//este es el modelo de datos

router.get('/notes/Add-Notes',isAuthenticated,(req,res)=>{
res.render('notes/newNotes')
})


router.post('/notes/New-Notes',isAuthenticated  ,async (req,res)=>{
        const {title,description}=req.body
        
        let errors=[];
        if(!title ){
            errors.push({text:'Por favor escribe un titulo'});
        }
        if(!description){
        errors.push({text:'por favor escribe una descripcion'});
        }
        if(errors.length>0){
        
            res.render('notes/newNotes',{
                errors,
                title,
                description,
            });
        }else{
            const newNote=new Note({title,description});
            newNote.user=req.user.id;
           await newNote.save()
            console.log(newNote)
            req.flash('success_msg','Nota agregada exitosamente')
            res.redirect('/restaurant')
        }
    
    })

router.get('/notes',isAuthenticated, async (req,res)=>{
   const notes=await Note.find({user:req.user.id}).sort({date:'descending'});
   res.render('notes/all-notes',{notes})
});

router.get('/notes/Edit/:_id',isAuthenticated,async (req,res)=>{
    const note= await Note.findById(req.params._id);   
res.render('notes/edit-notes',{note});
})

router.put('/notes/edit-notes/:id',isAuthenticated,async(req,res)=>{
const{title,description}=req.body;
 await Note.findByIdAndUpdate(req.params.id,{title, description});
 req.flash('success_msg','nota actualizada de forma exitosa')
 res.redirect("/notes");
})



router.delete('/notes/delete/:id',isAuthenticated, async (req,res)=>{
    await Note.findByIdAndDelete(req.params.id)
    console.log(req.params.id)
    req.flash('success_msg','Eliminado de forma exitosa')
    res.redirect('/notes')
})
module.exports=router;