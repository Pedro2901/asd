//manera para autenticar usuario
const passport = require("passport");
const localStrategy = require("passport-local").Strategy;
const User = require("../models/users");

passport.use(
  new localStrategy(
    {
      usernameField: "email",
    },
    async (email, contra, done) => {
      try {
        console.log(email)
        
        const user = await User.findOne({ 
          $and: [
          {email: email },
          { isActive: true }
        ]
        });
        console.log("-----")
        console.log(user)
        if (!user) {
          console.log("usuario no existe")
          return done(null, false, { message: "Not User found." });
        }

        
        const isMatch = await user.matchPassword(contra);
        console.log(isMatch)
        if (!isMatch){
          return done(null, false, { message: "Incorrect Password." });
        }
        
        console.log(user)
        return done(null, user);
      } catch (error) {
        done(error);
      }
    }
  )
);



passport.serializeUser((user, done) => {
  console.log("serialize")
  done(null, user.id);
});


passport.deserializeUser((id, done) => {
  console.log("deserializee")
  User.findById(id).exec().then(user => {
    done(null, user);
  }).catch(err => {
    done(err, null);
  });
});
