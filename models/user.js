
const mongoose=require("mongoose")

const schema=new mongoose.Schema({
    number:{
        type:String,
        require:true
    }
})

module.exports= mongoose.model("Craving",schema);
