const express= require('express');
const mongoose= require("mongoose");
const path= require('path');
const app= express();
const Craving= require('./models/user.js');
const User=require("./models/owner.js");
const session=require("express-session");
const flash=require("connect-flash");
const passport=require("passport")
const LocalStrategy=require("passport-local");

const { MongoClient } = require('mongodb');
const ExcelJS = require('exceljs');



const ejsM= require("ejs-mate");

app.engine("ejs",ejsM);
app.use(express.urlencoded({extended:true}));


main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/craving');
}





app.set("view engine","ejs");
app.use(express.static(path.join(__dirname,"views")));
app.use(express.urlencoded({extended:true}));

app.use(session(
    {
        secret:"cravingfoodisawesome",
        resave:false,
        saveUninitialized:true,
    
    cookie:{
        expires:Date.now() + 7*24*60*60*1000,
        maxAge:7*24*60*60*1000,
        httpOnly:true
    }}


));

app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req,res,next)=>{ 
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    res.locals.user=req.user;
    
    next();
})



const mongoUrl = 'mongodb://localhost:27017'; // Replace with your MongoDB connection string
const dbName = 'craving'; // Replace with your database name
const collectionName = 'cravings'; // Replace with your collection name

app.get('/download-excel', async (req, res) => {
    try {
      // Connect to MongoDB without the deprecated useUnifiedTopology option

  let data= await Craving.find();
//   console.log(nam);
// res.send("hello");
  
      //Query the MongoDB collection for data
// const data = await db.collection(collectionName).find().toArray();
      console.log(data);
      // Create Excel workbook and worksheet
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Cravings');
  
//       // Add data to the worksheet
      worksheet.columns = [
        { header: 'Number', key: 'number', width: 15 },
        // Add more colum      ns if needed
      ];
  
    
      data.forEach((item) => {
        worksheet.addRow({ number: item.number });
    });

    // worksheet.save();
  
      // Set up response headers for Excel file download
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=cravings.xlsx');
  
      // Send the Excel file to the client
      await workbook.xlsx.write(res);
      res.end();
  
      // Close MongoDB connection
    //   await client.close();
    } catch (error) {
      console.error(error);
      res.send("error");
    }
  });



app.get("/getExcel",(req,res)=>{
    res.render("getExcel.ejs");
})









app.get("/signup",(req,res)=>{
    res.render("newUser.ejs")
})

app.post("/signup",async(req,res)=>{
    try{
    let{mail,username,password,confo}=req.body;
    if(password!==confo){
        throw new Error("password doesn't match");
    }
    else{
    const newUser= new User({mail,username});
    await User.register(newUser,password);  
    await newUser.save();
    req.flash("success","hello new user");
    
    res.redirect("/login");
    }}
    catch(e){
        req.flash("error",e.message);
        res.redirect("signup")
    }
})

app.get("/login",(req,res)=>{
    res.render("user.ejs")
})

app.post("/login",passport.authenticate('local',{failureRedirect:'/login',failureFlash:true}),(req,res)=>{
    req.flash("success","hello Faiz");
    res.redirect("/register")
})


app.post("/logout",async(req,res,next)=>{ 
    req.logout((err)=>{ 
        if(err){ 
            next(err)
     }else{ 
            req.flash("success","You Logged Out");
            res.redirect('/login');
        }
    });      
    
  
})




app.get("/register",(req,res)=>{
    if(!req.user){
        res.redirect("/login");
    }else{
    res.render("register.ejs");
    }
    // res.render("register.ejs");
})

app.post("/register",async(req,res)=>{
    
    let {num}=req.body;

    const re =/^[0-9]+$/;
    
    let ans=await Craving.findOne({number:num});
    console.log(ans);



    if(num.length!=10 || !re.test(num)){
        req.flash("error","It's a invalid number");
    }
    else if(ans==null){
     const crav= new Craving({number:num});
     await crav.save();
     req.flash("success","We're thrilled to have you at CRAVINGS.");
     
    }
    else{
        req.flash("success","We're delighted to see you again , you are already a registered user at CRAVINGS!")
    }
    res.redirect("/register");
})





app.listen(8080,()=>{
    console.log("hello");
})