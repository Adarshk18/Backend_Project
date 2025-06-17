const express = require("express");
const app = express();
const userModel = require("./models/user");
const postModel = require("./models/post");
const path = require("path");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());


app.get("/", (req, res) => {
    res.render("index");
});

app.post("/register", async (req, res) => {
    let { username, name, age, email, password } = req.body;
    let user = await userModel.findOne({ email })
    if (user) return res.status(201).send({ message: "User already exists" })

    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(password, salt, async (err, hash) => {
            let createdUser = await userModel.create({
                username,
                name,
                age,
                email,
                password,
            });
            let token = jwt.sign({email: email, userid: user._id}, "sssshh");
            res.cookie("token",token);
            res.send("user registered");
        })

    })




})

app.listen(3000);