const mongoose =require("mongoose");
const passportLocal=require("passport-local-mongoose");

const userSchema=new mongoose.Schema({
email:{
    type:String,
    require:true,
}
})

userSchema.plugin(passportLocal);

module.exports=mongoose.model("User",userSchema)