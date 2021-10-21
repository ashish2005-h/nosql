const express = require("express"); 
const ejs = require("ejs");
const path = require('path');
const cookieparser = require('cookie-parser');
const multer = require('multer');
const user= require("./user.js");
const bodyParser = require("body-parser");
const {check, validationResult} = require("express-validator");
const urlencodedParser = bodyParser.urlencoded({extended:false});
const port = process.env.PORT || 3000;
const session = require('express-session');
const detail = user.Register;
const prod = user.Product;
var app = express();
app.use(express.json());
app.use(express.static(__dirname + '/views'));
app.set("view engine", "ejs");
app.use(express.json());
app.use(cookieparser());
app.use(session({
    secret:"thisissecret",
    resave:false,
    saveUninitialized:false
}))
var Storage = multer.diskStorage({
    destination:'./views/uploads',
    filename:(req,file,cb) =>{
        cb(null,file.fieldname+"_"+Date.now()+path.extname(file.originalname))
    }
});
var upload = multer({
    storage:Storage
}).single('image');
app.listen(port, () => {
    console.log(`Listening on ${port}`);
});
const isAuth = (req, res, next) =>{
    if(req.session.isAuth){
        next()
    }
    else{
        res.render('login',{name:'Please Login First'});
    }
}
app.get("/", async(req, res) => {
    let s = await prod.find();
    console.log(s);
     res.render("index",{data:s});
});
app.route("/register")
    .get(async(req, res) =>{
       
        res.render("register");
    })
    .post(urlencodedParser, [
        check('name',"Name Required")
         .notEmpty()
         .bail()
         .matches(/^[A-Za-z ]+$/)
         .withMessage('Name should contain only characters'),
        check('userid',"Username Required")
        .notEmpty()
        .bail()
        .isLength({min:5})
        .withMessage('Username should be 5+ long')
        .bail()
        .matches(/^[A-Za-z0-9]+$/)
        .withMessage('Username should be alphanumeric')
        .custom(async function(value){
			let user = await detail.findOne({userid:value});
            if(user){
                throw new Error("Username Already Taken");
            }
            return true;
        }),
        check('email','Invalid Email address')
        .notEmpty()
        .withMessage('Email Required')
        .bail()
        .isEmail()
        .normalizeEmail()
        .custom(async function(value){
			let user = await detail.findOne({email:value});
            if(user){
                throw new Error('Email-Id Already Exists');
            }
            return true;
        }),
        check('contact','Enter phone number of length 10')
        .notEmpty()
        .withMessage('Contact Required')
        .bail()
        .isLength({ min: 10, max:10 }),
        check('password')
        .notEmpty()
        .withMessage('Password Required')
        .bail()
        .isLength({ min: 8 })
        .withMessage('Please enter a password at least 8 character.')
        .bail()
        .matches(
          /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[a-zA-Z\d@$.!%*#?&]/)
          .withMessage(' should contain At least one uppercase,At least one lower case,At least one special character.'),
        check('age')  
        .notEmpty()
        .withMessage('Age required')
        .bail()
        .isNumeric({min:18, max:100})
        .withMessage('Invalid age entered'),
        check('cpassword').custom((value, { req }) => {
            if (value !== req.body.password) {
              throw new Error('Password confirmation does not match password');
            }
        
            // Indicates the success of this synchronous custom validator
            return true;}),
        check('gender','Gender Required')    
        .isLength({min:1})
    ],
        async (req, res) =>{

        const errors = validationResult(req)
        if(!errors.isEmpty()){
            //return res.status(422).jsonp(errors.array())
            const alert = errors.array();
            res.render('register',{alert})
        }
        else{
        let s = new detail(req.body);
        let result = await s.save();
        console.log(result)
        res.redirect('/login');
        }
    })    
app.route("/login")
.get((req, res) => {
    res.render("login",{name:""});
})
.post(urlencodedParser,async (req, res)=>{
    const username = req.body.userid;
    const pass = req.body.password;
        let user = await detail.findOne({userid:username});
  
    if(!user){
        res.render("login",{name:"Inavlid credentials!"});
        req.session.isAuth = false;
    }
    if(pass != user.password){
        res.render("login",{name:"Inavlid credentials!"});
        req.session.isAuth = false;
    }
    if(username == user.name){
        req.session.isAuth = true;
        console.log(req.session);
        console.log(req.session.id);
        console.log(user);
        req.session.user = user.name;
        req.session.save();
        res.redirect('/admin');
    }
    req.session.isAuth = true;
    console.log(req.session);
    console.log(req.session.id);
    console.log(user);
    req.session.user = user.name;
    req.session.userid = user.userid;
    req.session.save();
    res.redirect('/home');
})
app.get('/home',isAuth,async(req,res) =>{
    let s = await prod.find();
    console.log(s);
    res.render('Home',{name:req.session.user,data:s});
})
app.get('/admin', isAuth, (req, res) => {
    res.render('admin',{name:'admin1'});
})
app.get('/logout',(req, res) =>{
    req.session.destroy((err) =>{
        if(err) throw err;
    })
    res.redirect('/login');
})
app.get('/product',isAuth,async (req, res) => {
    let data = await prod.find();
    console.log(data);
    res.render('product',{name:'admin1',userData:data});
})
app.get('/products',isAuth,async (req, res) => {
    let data = await prod.find();
    console.log(data);
    res.send(data);
})
app.get('/add',isAuth,async (req, res) => {
    res.render('add',{name:'admin1',name1:""});
})
app.post('/add',upload,isAuth,async(req, res) =>{

    var product = new prod({
        name:req.body.name,
        modelno:req.body.modelno,
        brand:req.body.brand,
        description:req.body.description,
        features:req.body.features,
        image:req.file.filename,
        Quantity: req.body.Quantity,
        price:req.body.price
    })
   let result = await product.save();
   console.log(result);
   res.redirect('/product');
})
app.get('/delete/:id',isAuth,urlencodedParser,async(req, res)=>{
       let d = await prod.deleteOne({ "_id": req.params.id});
       res.redirect('/product');
        console.log(req.params.id);
        //let d = await prod.deleteOne({_id: req.params.id});
        //res.redirect('/product')
})
app.get('/edit/:id',isAuth,urlencodedParser,async(req, res)=>{
    console.log(req.params.id)
    let docs = await prod.findOne({_id: req.params.id});
    console.log(docs);
    res.render('edit',{data: docs,name:'Admin'});
})
app.get('/editw',urlencodedParser,(req, res)=>{
    res.send('hii');
    console.log(req.body.modelno); 
})
app.post('/editw',isAuth,urlencodedParser,async(req, res) =>{
    let s = await prod.updateOne({ "_id": req.body.id }, { "$set": { "name": req.body.name,
    "modelno":req.body.modelno,
    "brand":req.body.brand,
    "description":req.body.description,
    "features":req.body.features,
    "Quantity": req.body.Quantity,
    "price":req.body.price}})
    res.redirect('/product');
})
app.get('/upnewimg',isAuth,urlencodedParser,upload,(req, res)=>{
    console.log(req.body.id);
res.redirect('/product');
})
app.post('/upnewimg',isAuth,upload,async(req, res)=>{
     console.log(req.body.id);
     let s = await prod.updateOne({"_id":req.body.id},{"$set":{"image":req.file.filename}});
     res.redirect('/product');
})
