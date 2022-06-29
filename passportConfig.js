const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('./models/User');
const bcrypt = require('bcrypt');
const JwtStrategy = require('passport-jwt').Strategy;

const cookieExtractor = req =>{
  let token = null;
  if(req && req.cookies){
      token = req.cookies["access_token"];
  }
  return token;
}

passport.use(new JwtStrategy({
  jwtFromRequest : cookieExtractor,
  secretOrKey : "This is a secret key"
}, (payload,done)=>{
  User.findById(payload.sub, (err,user)=>{
    if(err)
      done(err,false);
    if(user)
      return done(null,user)

    return done(null,false);
  })
}));

passport.use(new LocalStrategy(async (username, password, done) => {
    const user = await User.findOne({ username: username });

    if (!user) {
      console.log("Incorrect Username");
      return done(null, false, { message: 'Incorrect username.' });
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      console.log("Incorrect Password");
      return done(null, false, { message: 'Incorrect password.' });
    }
    return done(null, user);
  })
);
