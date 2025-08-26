const express = require('express');
const app = express();
const path = require('path');
// step 2 setup cookie-parser
const cookieParser = require('cookie-parser');
// step 4 requiring bcrypt
const bcrypt = require('bcrypt');
//step 8 requiring user model
const userModel = require('./models/user')
// step 12 require JsonWebToken
const jwt = require('jsonwebtoken');
// step 22 requiring post model
const postModel = require('./models/post');
// step  setting session and flash message
const session = require('express-session');
const flash = require('connect-flash');
// step 24 multer setup
const multer = require('multer');

app.use(session({
    secret: "faham123",
    resave: false,
    saveUninitialized: true
}));
app.use(flash());
// middleware to pass flash messages to views
app.use((req, res, next) => {
    res.locals.success_msg = req.flash("success_msg");
    res.locals.error_msg = req.flash("error_msg");
    next();
});
// step 27 upload path join
app.use('/uploads',express.static(path.join(__dirname,'uploads')));

app.set("view engine","ejs");
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname, "assets")));
// step 3 use cookieParser
app.use(cookieParser());
// step 1 setting cookies
app.get('/',(req,res)=>{
    res.render("index.ejs");
})
//step 5 kuch nhi
// step 9 creating register route
app.post('/register',(req,res)=>{
    let{name,username,email,password} = req.body;
    // step 11 hashing password
    bcrypt.genSalt(10,(err,salt)=>{
        bcrypt.hash(password,salt,async(err,hash)=>{
            let createdUser = await userModel.create({
                name,
                username,
                email,
                password:hash
            })
            // step13 creating jwt token to login
            let token = jwt.sign({email},"faham123");
            res.cookie("token",token);
            res.redirect("/login");
        })
    })    // res.send(createdUser);
})
// step 16 creating Login route
app.post('/login',async function(req,res){
    // step 17 checking email
    let user = await userModel.findOne({email:req.body.email});
    if(user){
        // step 18 checking password
        let isMatch = await bcrypt.compare(req.body.password,user.password);
        if(isMatch){
            let token = jwt.sign({email:req.body.email},"faham123");
            res.cookie("token",token);
            res.redirect("/post");
        }
        else{
            res.send("something went wrong");
        }
    }
})

// step 14 logout route
app.get('/logout',(req,res)=>{
    res.cookie("token","");
    res.redirect("/");
})

//step 10 get register route
app.get('/register',(req,res)=>{
    res.render("register.ejs")
})

// step 15 get login route
app.get('/login',(req,res)=>{
    res.render("login.ejs");
})
// step 19 creating post route
// step 21 protecting post route using loggedin function
app.get('/post',isLoggedIn,(req,res)=>{
    res.render("post.ejs")
})
// step 25 multer configuration
const storage = multer.diskStorage({
    destination: function(req,file,cb){
        cb(null,"uploads/");
    },
    filename: function(req,file,cb){
        cb(null,Date.now() + path.extname(file.originalname));
    }
})
const upload = multer({storage: storage});
// step 20 setting condition for post route
function isLoggedIn(req,res,next){
    if(req.cookies.token){
        try {
            const data = jwt.verify(req.cookies.token, "faham123"); 
            req.user = data;  // store user data
            return next();
        } catch (err) {
            req.flash("error_msg", "Session expired! Please login again.");
            return res.redirect("/login");
        }
    }else{
        req.flash("error_msg", "You need to log in first to post.");
        return res.redirect("/login");
    }
}

// step 23 creating post request
app.post('/post',isLoggedIn,upload.fields([{name:'pic1'},{name:'pic2'}]),async(req,res)=>{
    let {title,content1, content2,pic1,pic2} = req.body;
    let user = await userModel.findOne({email:req.user.email});
    let newPost = await postModel.create({
        user: user._id,
        title,
        content1,
        content2,
        pic1: req.files.pic1 ? req.files.pic1[0].filename : null,
        pic2: req.files.pic2 ? req.files.pic2[0].filename : null
    });
    req.flash("success_msg","Post created successfully!");
    res.redirect("/post");
})


app.listen(3000); 