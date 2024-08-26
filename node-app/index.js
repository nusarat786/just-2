const express = require('express');
const app = express();
const dbConnect = require("./Mongoose/connect.js")
const userSchema = require('./Schema/userSchema.js'); // Import the user schema
const tweetSchema = require("./Schema/tweetSchema.js")
const bcrypt = require('bcrypt');
const validator = require('validator');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const auth = require("./Auth/auth.js")
const jwt = require('jsonwebtoken');
const multer = require('multer');
const countryList = require('./Auth/country.js');
const nodemailer = require('nodemailer');
const tweetRoutes = require('./Route/tweetRoute.js');
const userRoutes = require('./Route/userRoute.js');
const path = require("path");
//const 

// Configure multer for handling file uploads
const upload = multer();

dbConnect();

//console.log(countryList)
// Middleware to parse JSON in the request body
app.use(express.json());

// cookie parser
app.use(cookieParser());

// cors 
app.use(cors({ credentials: true, origin: 'http://localhost:3000' }));


// using tweet routes
app.use('/tweetRoutes', tweetRoutes);

// using tweet routes
app.use('/userRoutes', userRoutes);


// reg v1

app.post("/register" , async (req,res)=>{
    try{
        var body = req.body;
        const { password , username ,email } = body;


        // check length of username
        if (!validator.isLength(username, { min: 5, max: 25 })) {
            return res.status(400).json({ error: 'username Length should atleast 5 and 25 max: ' });
        }
        
        // check for valid email
        if(!validator.isEmail(email)){
            return res.status(400).json({ error: 'Invalid email format' });
        }

        // check for strong password
        if(!validator.isStrongPassword(password)){
            return res.status(400).json({error: 'Passwrd should have alleast one digit,one special char ,one capital and small char'})
        }

        // Check if the username is already taken
        const existingUsername = await userSchema.findOne({ username });
        
        // Check if the email is already taken
        const existingEmail = await userSchema.findOne({ email });
        
        // response if one of two is true
        if (existingEmail || existingUsername) {
        return res.status(400).json({ error: 'Email / Username is already registered or blank' });
        }

        // password hashed
        var hashedPassword = await bcrypt.hash(password, 10); // 10 is the number of salt rounds

        // new obj created for user
        var newUserObj = {
            username : username,
            email: email,
            password:hashedPassword
        }
        
        // userSchema obj created
        var newUser = new userSchema(newUserObj);
        const temp = await newUser.save();
        //console.log(temp);
        res.status(200).json({message:"You are registered.."})

    } catch(err){
        res.status(501).json(err);
    }
})


//reg v2 
app.post("/register-v2" , upload.single('pimage'), async (req,res)=>{
    try{
        var body = req.body;
        const { password,confirmPassword , username ,email ,dob, name ,bio,country } = body;

        if(validator.isEmpty(password) || validator.isEmpty(confirmPassword) || validator.isEmpty(username) || validator.isEmpty(email) || validator.isEmpty(name) || validator.isEmpty(bio)){
            return res.status(400).json({ error: 'details can not be blanked' });
        }

        // check length of username
        if (!validator.isLength(username, { min: 5, max: 25 })) {
            return res.status(400).json({ error: 'username Length should atleast 5 and 25 max: ' });
        }
        
        // check for valid email
        if(!validator.isEmail(email)){
            return res.status(400).json({ error: 'Invalid email format' });
        }

        // check for valid email
        if(password!=confirmPassword){
            return res.status(400).json({ error: 'password and confirm password can not be matched' });
        }

        // check for strong password
        if(!validator.isStrongPassword(password)){
            return res.status(400).json({error: 'Passwrd should have alleast one digit,one special char ,one capital and small char'});
        }

        // check for country name
        console.log(countryList);
        if(!countryList.includes(country)){
            return res.status(400).json({error: 'Invalid Country Name'});
        }


        // Check if the username is already taken
        const existingUsername = await userSchema.findOne({ username });
        
        // Check if the email is already taken
        const existingEmail = await userSchema.findOne({ email });
        

        // response if one of two is true
        if (existingEmail || existingUsername) {
        return res.status(400).json({ error: 'Email / Username is already registered or blank' });
        }

        // password hashed
        var hashedPassword = await bcrypt.hash(password, 10); // 10 is the number of salt rounds

        const currentDate = new Date();

        // Check if a profile picture was uploaded
        let pimageData = null;
        if (req.file) {
            // Convert the binary data to Base64
            pimageData = req.file.buffer.toString('base64');
        }

        // new obj created for user
        var newUserObj = {
            username : username,
            email: email,
            name:name,
            password:hashedPassword,
            dob:dob,
            joined:currentDate,
            pimage: pimageData,
            bio:bio,
            country:country,
        }
        
        // userSchema obj created
        var newUser = new userSchema(newUserObj);
        const temp = await newUser.save();
        //console.log(temp);
        res.status(200).json({err:false,message:"You are registered.." ,userobj:temp})

    } catch(err){
        console.log(err)
        res.status(501).json({err:true,message:"Internal Server error" ,errobj:err});
    }
})



function generateOTP(length) {
    const min = 10 ** (length - 1);
    const max = (10 ** length) - 1;
    return Math.floor(min + Math.random() * (max - min + 1)).toString();
}

// Assuming nodemailer transport is configured
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'selfielectronic@gmail.com',  // Your Gmail email address
        pass: 'oeuz vwnf nvrr csdj'          // Your Gmail password or an app-specific password
    },
    tls: {
        // This configuration allows self-signed certificates
        rejectUnauthorized: false
    }
});


app.post("/forget-password", async (req,res)=>{
    try{
        var email =  req.query.email;
        
        console.log(email)

        if(validator.isEmpty(email)){
            return res.status(400).json({message:"Email Is Empty"});
        }

        const user = await userSchema.findOne({email:email});

        if(!user){
            return res.status(400).json({message:"user can not be found"})
        }

        const date = new Date();
        // Check if an OTP has been sent within the last 5 minutes
        if (user.forgetPass.otpGeneratedAt && (date - user.forgetPass.otpGeneratedAt) < 5 * 60 * 1000) {
            return res.status(400).json({ message: "Try again after 5 minutes"});
        }


        const otp =   generateOTP(6);
        
        
        user.forgetPass.otp =otp;
        user.forgetPass.otpGeneratedAt = date;
        user.save();

        // Send OTP via email
        const mailOptions = {
            from: 'selfielectronic@gmail.com',   // Sender's email address
            to: user.email,                 // User's email address
            subject: 'Password Reset OTP',
            text: `Twitter clone Your OTP for password reset is: ${otp}`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
                return res.status(500).json({ message: 'Error sending OTP via email' });
            }
            console.log('Email sent:', info.response);
            res.json({ message: 'OTP sent successfully',user:user });
        });



    }catch(err){
        console.log(err);
        
        if(err.name==="CastError"){
           return res.status(400).json({message:"Invalid User id",erro: err});
        }
       res.status(400).json(err)
        
    }
})


// check for otp
app.post("/verify-otp", async (req,res)=>{
    try{

        const email =  req.query.email;
        const otp   =  req.query.otp;
        const password = req.query.password;
        const cpassword = req.query.cpassword;
        
        
        console.log(email)

        if(validator.isEmpty(email) || validator.isEmpty(otp) ){
            return res.status(400).json({message:"Email/Otp Is Empty"});
        }

        const user = await userSchema.findOne({
            email: email,
            'forgetPass.otp': otp,
        });
    
        if(!user){
            return res.status(400).json({message:"wrong otp"});
        }

        if(password != cpassword){
            return res.status(400).json({message:"password and confirm password can not be matched"});
        }


        const hashedPassword = await bcrypt.hash(password,10);
        
        user.password = hashedPassword;
        user.forgetPass.otp = null;
        await user.save();

        
        res.status(200).json({message:"done....",user:user});

    }catch(err){
        console.log(err);
        
        if(err.name==="CastError"){
           return res.status(400).json({message:"Invalid User id",erro: err});
        }
       res.status(400).json(err)
        
    }
})


// http://localhost:4000/verify-otp?email=nusarat93@outlook.com&otp=633292&password=Aa%23789456123&cpassword=Aa%23789456123



//update user
app.post("/edit-user" ,auth, upload.single('pimage'), async (req,res)=>{
    try{
        var body = req.body;
        const user = req.user;
        const { dob, name ,bio,country } = body;

        if(validator.isEmpty(name) || validator.isEmpty(bio) || validator.isEmpty(country) || validator.isEmpty(dob)){
            return res.status(400).json({ error: 'details can not be blanked' });
        }

        
        // check for country name
        //console.log(countryList);
        if(!countryList.includes(country)){
            return res.status(400).json({error: 'Invalid Country Name'});
        }


        // Check if a profile picture was uploaded
        let pimageData = null;
        if (req.file) {
            // Convert the binary data to Base64
            pimageData = req.file.buffer.toString('base64');
        }

        if(pimageData==null){
            pimageData=user.pimage;
        }

         // Update user details in the database
        const updatedUser = await userSchema.findByIdAndUpdate(
            user._id,
            {
                $set: {
                    dob,
                    name,
                    bio,
                    country,
                    pimage: pimageData || user.pimage,
                },
            },
            { new: true }
        );

        
        res.status(200).json({message:"Data Updated.." ,obj:updatedUser})

    } catch(err){
        console.log(err)
        res.status(501).json({errr:err});
    }
})


app.post("/login", async (req,res)=>{

    try{
        const { email ,password } =  req.body;
        
        console.log("REQ BODY " + req.body);
        
        // check if details are not empty
        if (validator.isEmpty(email) || validator.isEmpty(password)) {
            return res.status(400).json({ error: 'email /passwor can not be blank !!!' });
        }

        // check for valid email
        if(!validator.isEmail(email)){
            return res.status(400).json({ error: 'Invalid email format' });
        }


        // Check if the email is already taken
        const existingUser = await userSchema.findOne({ email });
            
        // response no user
        if (!existingUser) {
        return res.status(400).json({ error: 'Email / Username can not be found ' });
        }

        //check password
        
        //console.log(existingUser.password);
        //console.log(hashedPassword)
        var flag = await bcrypt.compare(password,existingUser.password);
        console.log(flag);
        
        if(!flag){
            return res.status(400).json({ error: 'Wrong password ' });
        }

        var token = await existingUser.generateAuthToken();
        console.log("token: " + token);

        //add jwt token for cookies
        res.cookie('jwt', token, { httpOnly: true, maxAge: 3600000000000000 }); // 1 hour expiration

        // login sucsee
        res.status(200).json({message:"Login Sucsess..."});

    }catch(err){
        console.log(err);
        res.status(501).json(err);
    }
})




app.get("/filter",auth ,(req,res)=>{
    res.status(200).json({"message": "filter scucsee"});
    //var a = req.cookies.jwt;
    //console.log(a);
})

//app.get()


app.get("/user-detail/:userId" ,async (req,res)=>{

    try{
        
        const uid = req.params.userId;
        

        if(validator.isEmpty(uid)){
           return res.status(400).json({message:"invalid user id"});
        }


        const user = await userSchema.findById(uid);

        if(!user){
            return res.status(400).json({message:"unable to found user id"});
         }

        res.status(200).json(user);
    

    }catch(err){
         console.log(err);
         if(err.name==="CastError"){
            return res.status(400).json({message:"Invalid User id",erro: err});
        }
        res.status(400).json(err)
    }

})



// get by user name
app.get("/user-detail-uname/:username" ,async (req,res)=>{

    try{
        
        const uname= req.params.username;

        if(validator.isEmpty(uname)){
            return res.status(400).json({message:"User Name Can Not Be Blank"})
        }

        const user = await userSchema.findOne({username:uname});

        res.status(200).json(user);
    }catch(err){
         console.log(err);
         if(err.name==="CastError"){
            return res.status(400).json({message:"Invalid User id",erro: err})
        }
        res.status(400).json(err)
    }

})


// get by user names
app.get("/user-details-uname/:username" ,async (req,res)=>{

    try{
        
        const uname= req.params.username.trim();

        if(validator.isEmpty(uname)){
            return res.status(400).json({message:"User Name Can Not Be Blank"})
        }

        const users = await userSchema.find({ username: { $regex: new RegExp(uname, 'i') } });

        if(!users){
            return res.status(400).json({message:"No User Found"})
        }


        res.status(200).json(users);
    }catch(err){
         console.log(err);
         if(err.name==="CastError"){
            return res.status(400).json({message:"Invalid User id",erro: err})
        }
        res.status(400).json(err)
    }

})



// get by name
app.get("/user-details-name/:name" ,async (req,res)=>{

    try{
        
        const name= req.params.name.trim();

        if(validator.isEmpty(name)){
            return res.status(400).json({message:"User Name Can Not Be Blank"})
        }

        const users = await userSchema.find({ name: { $regex: new RegExp(name, 'i') } });

        if(!users){
            return res.status(400).json({message:"No User Found"})
        }

        res.status(200).json(users);
    }catch(err){
         console.log(err);
         if(err.name==="CastError"){
            return res.status(400).json({message:"Invalid User id",erro: err})
        }
        res.status(400).json(err)
    }

})


// combined

app.get("/user-details/:name", async (req, res) => {
    try {
        const uname = req.params.name.trim();
        const page = parseInt(req.query.page) || 1; // Use query parameter for page, default to page 1
        const pageSize = 10; // Set the number of items per page

        if (validator.isEmpty(uname)) {
            return res.status(400).json({ message: "Username cannot be blank" });
        }

        let users;
        if (uname[0] === '@') {
            users = await userSchema.find({ username: { $regex: new RegExp(uname.substring(1), 'i') } })
                .skip((page - 1) * pageSize)
                .limit(pageSize);
        } else {
            users = await userSchema.find({ name: { $regex: new RegExp(uname, 'i') } })
                .skip((page - 1) * pageSize)
                .limit(pageSize);
        }

        if (users.length === 0) {
            return res.status(400).json({ message: "No User Found" });
        }

        // Include pagination information in the response
        res.status(200).json({
            users,
            currentPage: page,
            totalPages: Math.ceil(users.length / pageSize),
            pageSize,
        });
    } catch (err) {
        console.log(err);
        if (err.name === "CastError") {
            return res.status(400).json({ message: "Invalid User id", error: err });
        }
        res.status(500).json({ message: "Internal Server Error", error: err });
    }
});




    
// POST endpoint for creating a new tweet
app.post("/tweet",auth,async (req,res)=>{
    
    try {

        const token = req.cookies.jwt;
        const tokenObj = jwt.verify(token,"mynameisnusarathaveliwalaiammcastudent");
        
        const { text } = req.body;
    
        // Create a new tweet using the Tweet model
        const newTweet = new tweetSchema({
            text:text,
            user:tokenObj._id,
            
        });
    
        // Save the tweet to the database
        const savedTweet = await newTweet.save();
        
        // Update the user's tweets array with the new tweet's _id
        await userSchema.findByIdAndUpdate({_id:tokenObj._id}, { $push: { tweets: savedTweet._id } });

        // Send the saved tweet as the response
        res.json(savedTweet);
    } catch (error) {
      console.error('Error creating tweet:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });



// POST endpoint for creating a new tweet
app.post("/tweet-v2",auth,async (req,res)=>{
    
    try {

        console.log(req.user.country);
        const token = req.cookies.jwt;
        const tokenObj = jwt.verify(token,"mynameisnusarathaveliwalaiammcastudent");
        
        const { text } = req.body;
        
        // Extract hashtags from the tweet text
        const hashtags = text.match(/#\w+/g) || [];

        // Remove duplicate hashtags
        const uniqueHashtags = [...new Set(hashtags)];


    
        // Create a new tweet using the Tweet model
        const newTweet = new tweetSchema({
            text:text,
            user:tokenObj._id,
            hashtags:uniqueHashtags,
            country:req.user.country,
        });
    
        // Save the tweet to the database
        const savedTweet = await newTweet.save();
        
        // Update the user's tweets array with the new tweet's _id
        await userSchema.findByIdAndUpdate({_id:tokenObj._id}, { $push: { tweets: savedTweet._id } });

        // Send the saved tweet as the response
        res.json(savedTweet);
    } catch (error) {
      console.error('Error creating tweet:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });



// POST endpoint for creating a new tweet
app.post("/tweet-v3",auth,async (req,res)=>{
    
    try {
        const { text } = req.body;
        
        // Extract hashtags from the tweet text
        const hashtags = text.match(/#\w+/g) || [];

        // Remove duplicate hashtags
        const uniqueHashtags = [...new Set(hashtags)];


    
        // Create a new tweet using the Tweet model
        const newTweet = new tweetSchema({
            text:text,
            user:req.user._id,
            hashtags:uniqueHashtags,
            country:req.user.country,
        });
    
        // Save the tweet to the database
        const savedTweet = await newTweet.save();
        
        // Update the user's tweets array with the new tweet's _id
        await userSchema.findByIdAndUpdate({_id:req.user._id}, { $push: { tweets: savedTweet._id } });

        // Send the saved tweet as the response
        res.json(savedTweet);
    } catch (error) {
      console.error('Error creating tweet:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });



// tweet with image
app.post("/tweet-v4",auth,upload.single('timage'),async (req,res)=>{
    
    try {
        const { text } = req.body;
        
        // Extract hashtags from the tweet text
        const hashtags = text.match(/#\w+/g) || [];

        // Remove duplicate hashtags
        const uniqueHashtags = [...new Set(hashtags)];


        
        // Check if a profile picture was uploaded
        let pimageData = null;
        if (req.file) {
            // Convert the binary data to Base64
            pimageData = req.file.buffer.toString('base64');
        }


        // Create a new tweet using the Tweet model
        const newTweet = new tweetSchema({
            text:text,
            user:req.user._id,
            hashtags:uniqueHashtags,
            country:req.user.country,
            timage:pimageData
        });
    
        
        // Save the tweet to the database
        const savedTweet = await newTweet.save();
        
        // Update the user's tweets array with the new tweet's _id
        await userSchema.findByIdAndUpdate({_id:req.user._id}, { $push: { tweets: savedTweet._id } });

        // Send the saved tweet as the response
        res.json(savedTweet);
    } catch (error) {
      console.error('Error creating tweet:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });





// like tweet

/*
app.post("/like-tweet/:tweetid",auth , async(req,res)=>{
    try{
        // geting tweet id
        var tId = req.params.tweetid;
        
        // getting jwt token from twt
        const token = req.cookies.jwt;
        
        //checking wether tweet id is empty or not
        if(validator.isEmpty(tId)){
            return res.status(400).json({message:"tweet id is empty: "});
        }

        //
        const tweetExists = await tweetSchema.exists({ _id:tId });
        console.log(tweetExists)

        // if tweet is empty err res will be thrown
        if(!tweetExists){
            return res.status(400).json({message:"tweet id is empty: "});
        }

        
        // fetching tweet 
        const tweet = await tweetSchema.findById(tId);
        console.log(tweet);

        // getting user obj from token
        const verifyuser = jwt.verify(token,"mynameisnusarathaveliwalaiammcastudent");
        
        
        // Check if user id  is already in the likes array
        const indexToRemove = tweet.likes.indexOf(verifyuser._id);
        console.log(tweet.likes.length);
        
        if (indexToRemove != -1) {
            
            // If already liked, remove the user's ID from the likes array
            tweet.likes.splice(indexToRemove, 1);
            const updatedTweet = await tweet.save();
            return res.status(200).json({message:"Like Removed"});
        
        } else {
            
            // If not liked, add the user's ID to the likes array
            tweet.likes.push(verifyuser._id);
            const updatedTweet = await tweet.save();
            //console.log(updatedTweet);
            return res.status(200).json({message:"Liked"});

        }
        

    }catch(err){
        if(err.name==="CastError"){
            return res.status(400).json({message:"Invalid tweet id",erro: err})
        }
        res.status(400).json(err)
    }


})

*/



// like

// like tweet
app.post("/like/:tweetId",auth , async(req,res)=>{
    try{
        // geting tweet id
        var tid = req.params.tweetId;
        
        // getting jwt token from cookies
        const token = req.cookies.jwt;
        
        //checking wether user id is empty or not
        if(validator.isEmpty(tid)){
            return res.status(400).json({message:" user id is empty: "});
        }

        //user exist or not checking
        const tweetExist = await tweetSchema.exists({ _id:tid });
        //console.log(userExist)

        // if tweet does't exist err will be thrown
        if(!tweetExist){
            return res.status(400).json({message:"twee id is invalid: "});
        }

        
        // getting user obj from token
            //getting user id
        const getId = jwt.verify(token,"mynameisnusarathaveliwalaiammcastudent");
            //getting user obj
        const user = await userSchema.findOne({_id:getId._id});
        //console.log(user)
        
        // getting tweet obj
        const tweet = await tweetSchema.findOne({_id:tid});


        // Check if tweet id  is already in the Liked list
        const indexToRemoveLiked = user.liked.indexOf(tweet._id);

        // check if supper id is alredy in the supper user following list
        const indexToRemoveLikes = tweet.likes.indexOf(user._id);
        //console.log(tweet.likes.length);
        
        // if it is alredy it will be rmoved from both
        if (indexToRemoveLiked != -1) {
            
            // If already liked, remove the user's ID from the likes array
            user.liked.splice(indexToRemoveLiked, 1);
            tweet.likes.splice(indexToRemoveLikes,1);
            
            const updateuser = await user.save();
            const updatetweet = await tweet.save();
            return res.status(200).json(
                {message:"Tweet DisLike ",
                user : updateuser,
                tweet: updatetweet
                });
        
        // else we will try to add at both locations
        } else {
            
            // If not liked, add the user's ID to the likes array
            user.liked.push(tweet._id);
            tweet.likes.push(user._id);
            const updateuser = await user.save();
            const updatetweet = await tweet.save();
            //console.log(updatedTweet);
            return res.status(200)
            .json(
                {message:"Tweet Liked ",
                user : updateuser,
                tweet: updatetweet
                });
        }
        

    }catch(err){
        //console.log(err);
        if(err.name==="CastError"){
            return res.status(400).json({message:"Invalid Tweet id",erro: err})
        }
        res.status(400).json(err)
    }


})


// repost

app.post("/repost/:tweetId",auth , async(req,res)=>{
    try{
        // geting tweet id
        var tid = req.params.tweetId;
        
        // getting jwt token from cookies
        const token = req.cookies.jwt;
        
        //checking wether user id is empty or not
        if(validator.isEmpty(tid)){
            return res.status(400).json({message:" user id is empty: "});
        }

        //user exist or not checking
        const tweetExist = await tweetSchema.exists({ _id:tid });
        //console.log(userExist)

        // if tweet does't exist err will be thrown
        if(!tweetExist){
            return res.status(400).json({message:"twee id is invalid: "});
        }

        
        // getting user obj from token
            //getting user id
        const getId = jwt.verify(token,"mynameisnusarathaveliwalaiammcastudent");
            //getting user obj
        const user = await userSchema.findOne({_id:getId._id});
        //console.log(user)
        
        // getting tweet obj
        const tweet = await tweetSchema.findOne({_id:tid});


        // Check if tweet id  is already in the reposted list
        const indexToRemoveReposted = user.reposted.indexOf(tweet._id);

        // check if user id is alredy in the tweet repost  list
        const indexToRemoveReposts = tweet.reposts.indexOf(user._id);
        //console.log(tweet.likes.length);
        
        // if it is alredy it will be rmoved from both
        if (indexToRemoveReposted != -1) {
            
            // If already liked, remove the user's ID from the likes array
            user.reposted.splice(indexToRemoveReposted, 1);
            tweet.reposts.splice(indexToRemoveReposts,1);
            
            const updateuser = await user.save();
            const updatetweet = await tweet.save();
            return res.status(200).json(
                {message:"Tweet Repost Removed ",
                user : updateuser,
                tweet: updatetweet
                });
        
        // else we will try to add at both locations
        } else {
            
            // If not liked, add the user's ID to the likes array
            user.reposted.push(tweet._id);
            tweet.reposts.push(user._id);
            const updateuser = await user.save();
            const updatetweet = await tweet.save();
            //console.log(updatedTweet);
            return res.status(200)
            .json(
                {message:"Tweet Reposted ",
                user : updateuser,
                tweet: updatetweet
                });
        }
        

    }catch(err){
        //console.log(err);
        if(err.name==="CastError"){
            return res.status(400).json({message:"Invalid Tweet id",erro: err})
        }
        res.status(400).json(err)
    }


})


// book_marked

app.post("/book-mark/:tweetId",auth , async(req,res)=>{
    try{
        // geting tweet id
        var tid = req.params.tweetId;
        
        // getting jwt token from cookies
        const token = req.cookies.jwt;
        
        //checking wether user id is empty or not
        if(validator.isEmpty(tid)){
            return res.status(400).json({message:" user id is empty: "});
        }

        //user exist or not checking
        const tweetExist = await tweetSchema.exists({ _id:tid });
        //console.log(userExist)

        // if tweet does't exist err will be thrown
        if(!tweetExist){
            return res.status(400).json({message:"twee id is invalid: "});
        }

        
        // getting user obj from token
            //getting user id
        const getId = jwt.verify(token,"mynameisnusarathaveliwalaiammcastudent");
            //getting user obj
        const user = await userSchema.findOne({_id:getId._id});
        //console.log(user)
        
        // getting tweet obj
        const tweet = await tweetSchema.findOne({_id:tid});


        // Check if tweet id  is already in the reposted list
        const indexToRemoveBookMarked = user.bookmarked.indexOf(tweet._id);

        // check if user id is alredy in the tweet repost  list
        const indexToRemoveBookMarks = tweet.bookmarks.indexOf(user._id);
        //console.log(tweet.likes.length);
        
        // if it is alredy it will be rmoved from both
        if (indexToRemoveBookMarked != -1) {
            
            // If already liked, remove the user's ID from the likes array
            user.bookmarked.splice(indexToRemoveBookMarked, 1);
            tweet.bookmarks.splice(indexToRemoveBookMarks,1);
            
            const updateuser = await user.save();
            const updatetweet = await tweet.save();
            return res.status(200).json(
                {message:"Tweet BookMarked Removed ",
                user : updateuser,
                tweet: updatetweet
                });
        
        // else we will try to add at both locations
        } else {
            
            // If not liked, add the user's ID to the likes array
            user.bookmarked.push(tweet._id);
            tweet.bookmarks.push(user._id);
            const updateuser = await user.save();
            const updatetweet = await tweet.save();
            //console.log(updatedTweet);
            return res.status(200)
            .json(
                {message:"Tweet BookMarked ",
                user : updateuser,
                tweet: updatetweet
                });
        }
        

    }catch(err){
        console.log(err);
        if(err.name==="CastError"){
            return res.status(400).json({message:"Invalid Tweet id",erro: err})
        }
        res.status(400).json(err)
    }


})



app.post("/delete-tweet/:tweetId", auth, async (req, res) => {
    try {
        const tweetId = req.params.tweetId;
        const user = req.user;

        // Ensure that the tweet belongs to the authenticated user
        const tweetObj = await tweetSchema.findOne({ _id: tweetId, user: user._id });

        if (!tweetObj) {
            return res.status(404).json({ message: "Tweet not found or does not belong to the user" });
        }

        // Delete the tweet
        const twobj = await tweetSchema.deleteOne({ _id: tweetId, user: user._id });

        res.status(200).json({ message: "Tweet deleted successfully" ,tweet:tweetObj });

    } catch (err) {
        console.error(err);

        if (err.name === "CastError") {
            return res.status(400).json({ message: "Invalid Tweet ID", error: err });
        }

        res.status(500).json({ error: 'Internal Server Error' });
    }
});









//tweet view count

app.post("/tweet/:tweetid",async (req,res)=>{
    
    try{

        var tid = req.params.tweetid;
        //console.log(tid);
        if(validator.isEmpty(tid)){
            return res.status(400).json({message:"empty tweet id o"});
        }

        const tweet = await tweetSchema.findById(tid);
        
        console.log(tweet);
        
        if(!tweet){
            return res.status(400).json({message:"invalid tweet id "});
        }

        // Update the view count in the database
        const result = await tweetSchema.updateOne(
            { _id: tid },
            { $inc: { views: 1 } }
        );
        
        console.log(result);
        res.status(200).json(tweet);

    }catch(err){
        console.log(err);
        if(err.name==="CastError"){
            return res.status(400).json({message:"Invalid User id",erro: err})
        }
        res.status(400).json(err)
    }
})

//comment on tweet
app.post('/comment/:tweetId',auth, async (req,res)=>{
    try{
        //get tweet id
        const tid =  req.params.tweetId;
        
        // get jwt token
        const token = req.cookies.jwt;

        // get user id of commenter from token
        const userId = jwt.verify(token,"mynameisnusarathaveliwalaiammcastudent");
        
        // get text of comment
        const text = req.body.text;

        // check if tweet id is empty or not
        if(validator.isEmpty(tid)){
            return res.status(400).json({message:"empty tweet id: "});
        }

        // check wether tesxt message is not empty
        if(validator.isEmpty(text)){
            return res.status(400).json({message:"empty tweet id: "});
        }

        // check weather given tweet(on wivh is commented) id exist
        const isTweet = await tweetSchema.exists({_id:tid});

        if(!isTweet){
            return res.status(400).json({message:"No Tweet Found: "});
        }


        

        //const user = await userSchema.findById(userId);

        // Create a new tweet /comment using the Tweet model
        const newTweet = new tweetSchema({
            text:text,
            user:userId._id
        });

        // save a tweet /comment
        const savedTweet = await newTweet.save();
        
        
        // Update the user's tweets array with the new tweet / comment
        const u = await userSchema.findByIdAndUpdate({_id:userId._id}, { $push: { tweets: savedTweet._id } },{ new: true });


        // add tweet as comment to a specific tweet 
        const pt = await tweetSchema.findOneAndUpdate({_id:tid},{$push:{comments:savedTweet._id}},{ new: true });
        
        res.status(200).json({
            message:"Commented",
            user : u,
            parentTweet: pt,
            comment:savedTweet
        });



    }catch(err){
        console.log(err);
    }
})



// GET endpoint for fetching a user's tweets with pagination
app.get('/tweets/:userId/:page', async (req, res) => {
    try {
      const userId = req.params.userId;
      const page = parseInt(req.params.page) || 1; // Default to page 1
      const limit = 25;
  
      const user = await userSchema.findById(userId);
  
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      const totalTweets = user.tweets.length;
      const totalPages = Math.ceil(totalTweets / limit);
  
      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;

      //console.log(totalPages)
      if(totalPages<page){
        return res.status(401).json({message:"Page no: " + page  + "  Is Invalid"})
      }
      
      /*
      const userTweets = await tweetSchema.find({ _id: { $in: user.tweets } })
      .sort({ createdAt: -1 }) // Optional: Sort tweets by creation time in descending order
      .populate('user'); // Assuming you want to populate the "user" field in each tweet
      */
      
      const userTweets = await tweetSchema.find({ _id: { $in: user.tweets } })
        .sort({ createdAt: -1 }) // Optional: Sort tweets by creation time in descending order
        .populate({ path: 'user', select: '-password -tokens -tweets -followers -following' })
        .skip(startIndex)
        .limit(endIndex);
        
    
        //const paginatedTweets = userTweets.slice(startIndex, endIndex);

        const paginationInfo = {
        totalTweets,
        totalPages,
        currentPage: page,
        tweetsPerPage: limit,
        };

        res.json({ tweets: userTweets, pagination: paginationInfo });
    } catch (error) {
        console.error('Error fetching user tweets:', error);
        res.status(500).json({ error: 'Internal Server Error' });
        }
  });





/*
app.get("/" , (req,res)={
    res
})
*/

// follow user
app.post("/follow/:userid",auth , async(req,res)=>{
    try{
        // geting user id
        var uid = req.params.userid;
        
        // getting jwt token from cookies
        const token = req.cookies.jwt;
        
        //checking wether user id is empty or not
        if(validator.isEmpty(uid)){
            return res.status(400).json({message:" supper user id is empty: "});
        }

        //user exist or not checking
        const userExist = await userSchema.exists({ _id:uid });
        console.log(userExist)

        // if userExist is empty err res will be thrown
        if(!userExist){
            return res.status(400).json({message:"user id is invalid: "});
        }

        
        // fetching supper user obj 
        const supperuser = await userSchema.findById(uid);
        //console.log(user);

        // getting user obj from token
            //getting user id
        const getId = jwt.verify(token,"mynameisnusarathaveliwalaiammcastudent");
            //getting user obj
        const user = await userSchema.findOne({_id:getId._id});
        //console.log(user)
        
        // Check if user id  is already in the supper user follower list
        const indexToRemovesupuser = supperuser.followers.indexOf(supperuser._id);

        // check if supper id is alredy in the supper user following list
        const indexToRemoveuser = user.following.indexOf(user._id);
        //console.log(tweet.likes.length);
        
        // if it is alredy it will be rmoved from both
        if (indexToRemovesupuser != -1) {
            
            // If already liked, remove the user's ID from the likes array
            supperuser.followers.splice(indexToRemovesupuser, 1);
            user.following.splice(indexToRemoveuser,1);
            
            
            const updateSupper = await supperuser.save();
            const updateuser = await user.save();
            return res.status(200).json({message:"Unfollowed User"});
        
        // else we will try to add at both locations
        } else {
            
            // If not liked, add the user's ID to the likes array
            supperuser.followers.push(supperuser._id);
            user.following.push(user._id);
            const updateSupper = await supperuser.save();
            const updateuser = await user.save();
            //console.log(updatedTweet);
            return res.status(200).json({message:"followed "});

        }
        

    }catch(err){
        //console.log(err);
        if(err.name==="CastError"){
            return res.status(400).json({message:"Invalid User id",erro: err})
        }
        res.status(400).json(err)
    }

})



// Function to get top 10 trending hashtags in the last 10 hours
const getTrendingHashtags = async (country) => {
    
    
    
    const tenHoursAgo = new Date(Date.now() - 10 * 60 * 60 * 1000);
  
    const tweets = await tweetSchema.find({
      createdAt: { $gte: tenHoursAgo },
      country: country
    }).exec();
  
    const hashtagCounts = {};
  
    // Aggregate and count hashtags from all tweets
    tweets.forEach((tweet) => {
      tweet.hashtags.forEach((hashtag) => {
        hashtagCounts[hashtag] = (hashtagCounts[hashtag] || 0) + 1;
      });
    });
  
    // Sort hashtags by counts in descending order
    const sortedHashtags = Object.keys(hashtagCounts).sort(
      (a, b) => hashtagCounts[b] - hashtagCounts[a]
    );
  
    // Return the top 10 hashtags with counts
    const topTrendingHashtags = sortedHashtags.slice(0, 10).map((hashtag) => ({
      hashtag,
      count: hashtagCounts[hashtag],
    }));
  
    return topTrendingHashtags;
  };
  
  // API endpoint to get top 10 trending hashtags
  app.get('/trending-hashtags', auth, async (req, res) => {
    try {

      user = req.user;  
      const trendingHashtags = await getTrendingHashtags(user.country);
      res.json({ trendingHashtags });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });


// get id




app.get("/get-tweets/:hashtag/:pageNumber", auth, async (req, res) => {
    try {
        var hashtag = req.params.hashtag;
        const pageNumber = parseInt(req.params.pageNumber);

        const tenHoursAgo = new Date(Date.now() - 10 * 60 * 60 * 1000);
       
        hashtag = "#"+hashtag; // Encode the hashtag


        console.log(hashtag);
        // Find tweets with the specified hashtag created in the last 10 hours
        const tweets = await tweetSchema.find({
            hashtags: hashtag,
            createdAt: { $gte: tenHoursAgo },
            country:req.user.country
        })
        .sort({ createdAt: -1 }) // Sort by creation date in descending order
        .skip((pageNumber - 1) * 10) // Skip tweets on previous pages
        .limit(10) // Limit to 10 tweets per page
        .exec();

        res.json({ tweets });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



// Catch-all route to serve React's index.html
app.get('*', (req, res) => {
    console.log(path.join(__dirname, '../build', 'index.html'))
    res.sendFile(path.join(__dirname, '../build', 'index.html'));
  });

app.listen(4000, function(err){
    if (err) console.log("Error in server setup")
    console.log("Server listening on Port", 4000);
})