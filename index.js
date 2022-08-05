const express = require('express');
const ejs = require('ejs');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const crypto = require('crypto');
// const db = require('../db');
require('dotenv').config();
const bodyParser =require("body-parser");
const mongoose=require("mongoose");
const passportLocalMongoose = require('passport-local-mongoose');
const findOrCreate = require('mongoose-findorcreate');
const { db } = require('../../Users/rajra/Downloads/sih-project/model/User');
const { sensitiveHeaders } = require('http2');


const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
    secret: "Our little secret.",               //take from env
    resave: false,
    saveUninitialized: false
  }));
  
  app.use(passport.initialize());
  app.use(passport.session());

 mongoose.connect("mongodb://localhost:27017/sih");
const userSchema= new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required: true,
      },
      fullname: {
        type: String,
        // unique: true,
        required: true,
      },
      contact: {
        type: Number,
        unique: true,
        required: true,
      },
      aadharnum: {
        type: Number,
        unique: true,
        required: true,
      },
      password: {
        type: String,
        minlength: 6,
      },
      role: {
        type: String,
        default: "Basic",
        required: true,
      },
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);


const User =mongoose.model("User", userSchema);

passport.use(User.createStrategy());

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

app.post("/register", function(req, res){
    // console.log("raj");
    const username=req.body.username;
    // console.log(username);
    User.register({username: req.body.username, fullname: req.body.fullname, contact:req.body.contact, aadharnum:req.body.aadharnum, role:req.body.role }, req.body.password, function(err, user){
      if (err) {
        console.log(err);
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
  // console.log(req.params);
    User.find({username: username},(err,user)=>{
    // console.log(user);
    res.render("user",{users: user});
    });
}else{
  res.send("please login/register first")
}

  // console.log(raj);console.log(raj.contact);
    // res.render("user");
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