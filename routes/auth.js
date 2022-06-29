const express = require('express');
const router = express.Router();
const User = require("../models/User");
const bcrypt = require('bcrypt');
const passport = require('passport');
const JWT = require('jsonwebtoken');
const passportConfig = require('../passportConfig');

const signToken = (userID) =>{
    return JWT.sign({
        iss : 'Fake Company',
        sub : userID,
    }, "This is a secret key", {expiresIn: '1h'})
}

// REGISTER
router.post('/register', async (req,res)=>{

    try{
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        const newUser = new User({
            ...req.body,
            password: hashedPassword
        });

        const user = await newUser.save();
        res.status(200).json(user);
    }catch(err){
        res.status(500).json(err);
    }
});

// LOGIN

router.post("/login", passport.authenticate('local', {session:false}), (req,res)=>{
    if(req.isAuthenticated()){
        const user = req.user;
        const token = signToken(user._id);
        res.cookie("access_token", token, {httpOnly: true, sameSite: true});
        res.status(200).json(user);
    }
});

router.get("/logout", passport.authenticate('jwt', {session: false}), (req, res)=>{
    res.clearCookie('access_token');
    res.status(200).json({user: null, success: true});
})

module.exports = router;