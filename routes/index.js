const router = require('express').Router()
const axios = require("axios");
const RegisteredUser = require('../models/Registered')
const User = require('../models/User')
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

//importing middleware
const { ensureAuth, ensureGuest } = require('../middleware/auth')


router.get("/", ensureGuest, async(req,res)=>{
    res.render('home')
})

router.get('/login', ensureGuest ,(req, res) => {
    res.render('login')
})

router.post("/login",async function(req,res){
    const email = req.body.email;
    const password = req.body.password;
    try{
        let user = await RegisteredUser.findOne({ email: email })
        if(user){
            bcrypt.compare(password, user.password, function(err, result) {  
                if(result===true){
                    const token = jwt.sign({email:email},process.env.JWT_SECRET,{expiresIn: 60000})
                    let options = {
                        path:"/news",
                        sameSite:true,
                        maxAge: 60000, // would expire after 1 minuite
                        httpOnly: true, // The cookie only accessible by the web server
                    }
                    res.cookie('x-access-token',token, options)
                    req.session.message = user.firstName 
                    res.redirect("/news");
                }else{
                    res.redirect("/login");
                }
            });
        }
        else{
            res.redirect("/register")
        }
    } catch(err){
        console.log(err)
        res.redirect("/login")
    }
})

router.get('/register', ensureGuest ,(req, res) => {
    res.render('register')
})

router.post("/register",async function(req,res){
    const email = req.body.email;
    const password = req.body.password;
    try{
        let user = await RegisteredUser.findOne({ email: email })
        let user1 = await User.findOne({email : email})
        if(user || user1){
            res.redirect("/login")
        }
        else{
            bcrypt.hash(password,2, async (err,hash) => {
                const new_User = new RegisteredUser({
                    firstName : req.body.firstName,
                    lastName : req.body.lastName,
                    email : email,
                    password : hash,
                })
                try{
                    await new_User.save()
                    const token = jwt.sign({email:email},process.env.JWT_SECRET,{expiresIn:'1h'})
                    let options = {
                        path:"/news",
                        sameSite:true,
                        maxAge: 60000, // would expire after 1 minuite
                        httpOnly: true, // The cookie only accessible by the web server
                    }
                    res.cookie('x-access-token',token, options)
                    req.session.message = new_User.firstName 
                    res.redirect("/news")
                } catch(err){
                    console.log(err)
                    res.redirect("/register")
                }
            })
        }
    } catch(err){
        console.log(err)
        res.redirect("/register")
    }
})

router.get("/news",ensureAuth, async(req,res)=>{
    let response = await axios.get(`https://newsapi.org/v2/everything?q=cricket&apiKey=a22fb0ce14d9440dba11b65fbfcaf025`)
    if(req.user === undefined){
        res.render('news', {firstName:req.session.message, data: response.data.articles})
    }
    else{
        res.render('news', {firstName:req.user.firstName, data: response.data.articles})
    }
})

module.exports=router;
