// Libraries required
const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const dotenv = require('dotenv');
const morgan= require('morgan');
const multer = require('multer');
const path = require('path');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const passportConfig = require('./passportConfig');
const cors = require('cors')

// ROUTER FILES
const userRoute = require('./routes/users');
const authRoute = require('./routes/auth');
const postsRoute = require('./routes/posts');

//meta data
const app = express();
const PORT = 8800;

dotenv.config();
app.use(cors())
//CONNECTING TO DATABASE
mongoose.connect("mongodb+srv://deepanshu:deepanshu@cluster0.5ckqr.mongodb.net/social")
    .then(()=>{
        console.log("Connected to Database!");
    }).catch((err)=>{
        console.log(err);
    });
app.use("/images", express.static(path.join(__dirname, "public/images")));

//MIDDLEWARES
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended :true}))
app.use(helmet());
app.use(morgan("common"));
app.use(passport.initialize());

const storage = multer.diskStorage({
    destination: (req,file,cb) =>{
        cb(null, "public/images");
    },
    filename: (req,file,cb) =>{
        cb(null, req.body.name );
    }
});

const upload = multer({ storage:storage });

app.post("/api/upload", upload.single("file"), (req,res)=>{
    try{ 
        console.log(req.file);
        return res.status(200).json("File uploaded!");
    }catch(err){
        console.log(err);
    }
})

// Routers
app.use('/api/users', passport.authenticate('jwt', {session:false}), userRoute);
app.use('/api/auth',authRoute);
app.use('/api/posts', passport.authenticate('jwt', {session:false}), postsRoute);

app.get("/", (req,res)=>{
    res.send("Welcome to homepage");
});

app.get("/users", (req,res)=>{
    res.send("Welcome to Users");
});

app.get('/api/authenticated',passport.authenticate('jwt', {session:false}),(req,res)=>{
    const user = req.user;
    res.status(200).json({isAuthenticated: true, user});
})

app.listen(process.env.PORT || PORT, ()=>{
    console.log("Server listening on port "+ PORT);
})