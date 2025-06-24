const express = require("express");
const app = express();
const userModel = require("./models/user");
const postModel = require("./models/post");
const path = require("path");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());


app.get("/", (req, res) => {
    res.render("index");
});

app.post("/register", async (req, res) => {
    let { username, name, age, email, password } = req.body;
    let user = await userModel.findOne({ email })
    if (user) return res.status(500).send({ message: "User already exists" })

    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(password, salt, async (err, hash) => {
            let user = await userModel.create({
                username,
                name,
                age,
                email,
                password: hash,
            });
            let token = jwt.sign({email: email, userid: user._id}, "sssshh");
            res.cookie("token",token);
            res.send("user registered");
        })
    })
})

app.get("/login",(req,res)=>{
    res.render("login")
})

app.get("/profile",isLoggedIn, async(req,res)=>{
    let user  = await userModel.findOne({email: req.user.email}).populate("posts");
    
    res.render("profile", {user});
});

app.get("/like/:id",isLoggedIn, async(req,res)=>{
    let post  = await postModel.findOne({_id: req.params.id}).populate("user");

    if(post.likes.indexOf(req.user.userid)==-1){
        post.likes.push(req.user.userid);
    }else{
        post.likes.splice(post.likes.indexOf(req.user.userid),1);
    }

    
    await post.save();
    res.redirect("/profile");
});

app.post("/post",isLoggedIn, async(req,res)=>{
    let user  = await userModel.findOne({email: req.user.email});
    let {content} = req.body;

    let post  = await postModel.create({
        user: user._id,
        content,
    });

    user.posts.push(post._id);
    await user.save();
    res.redirect("/profile");
   
});

app.post("/login", async (req, res) => {
    let {email, password } = req.body;

    let user = await userModel.findOne({ email })
    if (!user) return res.status(500).send("something went wrong..")

    bcrypt.compare(password, user.password, (err,result)=>{
        if(result){
            
            let token = jwt.sign({email: email, userid: user._id}, "sssshh");
            res.cookie("token",token);
            res.redirect("/profile")
            
        } 
        else res.redirect("/login");
    })
});

app.get("/logout",(req,res)=>{
    res.cookie("token", "");
    res.redirect("/login");
})


function isLoggedIn(req, res, next) {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).send("You must be logged in");
    }

    try {
        const data = jwt.verify(token, "sssshh");
        req.user = data;
        next(); // ✅ Only call next() if verification succeeds
    } catch (err) {
        return res.status(401).send("Invalid or expired token");
    }
}

app.listen(3000);