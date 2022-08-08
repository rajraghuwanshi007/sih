var mongoose = require('mongoose');

const passportLocalMongoose = require('passport-local-mongoose');
const findOrCreate = require('mongoose-findorcreate');
const passport = require('passport');


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
      img:
	{
		data: Buffer,
		contentType: String
	}
});


userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);
const User=mongoose.model("User", userSchema)
passport.use(User.createStrategy());

module.exports= User;