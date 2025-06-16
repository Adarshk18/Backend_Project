const express = require("express");
const app= express();
const userModel = require("./models/user");
const path = require("path");
const cookieParser = require("cookie-parser");

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());


app.get("/",(req,res)=>{
    res.render("index");
});

app.post("/create",(req,res)=>{
    let {username, name, age, email, password} = req.body;
    let user = userModel.create({
        username,
        name,
        age,
        email,
        password,
    });

    res.send(user);
})

app.listen(3000);