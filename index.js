const express = require('express');
const ejs = require('ejs');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local');
require('dotenv').config();
const bodyParser =require("body-parser");
const mongoose=require("mongoose");
const { db } = require('../../Users/rajra/Downloads/sih-project/model/User');
const { sensitiveHeaders } = require('http2');
var multer = require('multer');
const fs=require("fs");
const path =require("path");
const alert =require("alert")


const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())

var storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, 'uploads')
	},
	filename: (req, file, cb) => {
		cb(null, file.fieldname + '-' + Date.now())
	}
});

var upload = multer({ storage: storage });

app.use(session({
    secret: "Our little secret.",               //take from env
    resave: false,
    saveUninitialized: false
  }));
  
  app.use(passport.initialize());
  app.use(passport.session());

 mongoose.connect("mongodb://localhost:27017/sih");
const User=require("./model")

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});


app.get("/",(req,res)=>{
    res.render("home")
});

app.get("/login",(req,res)=>{
    res.render("login");
});

app.post("/login", function(req, res){

    const user = new User({
      username: req.body.username,
      password: req.body.password
    });
    
    const username=req.body.username;

    req.login(user, function(err){
      if (err) {
        console.log(err);
      } else {
        passport.authenticate("local")(req, res, function(){
          res.redirect("/user/"+username);
        });
      }
    });
  
  });

app.get("/register",(req,res)=>{
    res.render("register");
});

app.post("/register", upload.single('image'),function(req, res){
    const username=req.body.username;
    User.register({username: req.body.username, fullname: req.body.fullname, contact:req.body.contact, aadharnum:req.body.aadharnum, role:req.body.role, img: {
			data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)),
			contentType: 'image/png'
		} }, req.body.password, function(err, user){
      if (err) {
        console.log(req.body);
        console.log(err);
        alert("The username is already taken")
        res.redirect("/register");
      } else {
        passport.authenticate("local")(req, res, function(){
          res.redirect("/user/"+username);
        });
      }
    });
  
  });

app.get("/user/:username",(req,res)=>{
  if(req.isAuthenticated()){
    const username=req.params.username;
    User.find({username: username},(err,user)=>{
    res.render("user",{users: user});
    });
}else{
  window.alert("please login/register first");
  res.redirect("/");
}

});

app.get("/logout", function(req, res){
  req.logout((err)=>{
    console.log(err);
  });
  res.redirect("/");
});

app.listen(3000||process.env.PORT,()=>{
    console.log("listening on port 3000");
});