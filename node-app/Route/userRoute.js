const express = require('express');
const app = express();
const userSchema = require('../Schema/userSchema.js'); // Import the user schema
const tweetSchema = require("../Schema/tweetSchema.js")
const bcrypt = require('bcrypt');
const validator = require('validator');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const auth = require("../Auth/auth.js")
const jwt = require('jsonwebtoken');
const multer = require('multer');
const countryList = require('../Auth/country.js');
const nodemailer = require('nodemailer');
const upload = multer();
const router = express.Router();



// reg v1

//reg v2 
router.post("/register-v2" , upload.single('pimage'), async (req,res)=>{
    try{
        var body = req.body;
        const { password,confirmPassword , username ,email ,dob, name ,bio,country } = body;

        if(validator.isEmpty(password) || validator.isEmpty(confirmPassword) || validator.isEmpty(username) || validator.isEmpty(email) || validator.isEmpty(name) || validator.isEmpty(bio) || validator.isEmpty(dob)||validator.isEmpty(country)){
            return res.status(409).json({err:true, message: 'details can not be blanked' });
        }

        // check length of username
        if (!validator.isLength(username, { min: 5, max: 25 })) {
            return res.status(409).json({err:true, message: 'username Length should atleast 5 and 25 max: ' });
        }
        
        // check for valid email
        if(!validator.isEmail(email)){
            return res.status(400).json({err:true, message: 'Invalid email format' });
        }

        // check for valid email
        if(password!=confirmPassword){
            return res.status(400).json({ err:true, message:  'password and confirm password can not be matched' });
        }

        // check for strong password
        if(!validator.isStrongPassword(password)){
            return res.status(400).json({err:true, message:  'Passwrd should have alleast one digit,one special char ,one capital and small char'});
        }

       
        if(!countryList.includes(country)){
            return res.status(400).json({err:true, message: 'Invalid Country Name'});
        }


        // Check if the username is already taken
        const existingUsername = await userSchema.findOne({ username });
        
        // Check if the email is already taken
        const existingEmail = await userSchema.findOne({ email });
        

        // response if one of two is true
        if (existingEmail || existingUsername) {
        return res.status(400).json({ err:true, message:  'Email / Username is already registered or blank' });
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
        res.status(200).json({err:false ,message:"You are registered.." ,obj:temp})

    } catch(err){
        console.log(err)
        res.status(400).json({err:true,message:"Internal Server err" ,errobj:err});
    }
})



// login
router.post("/login", async (req,res)=>{

    try{
        const { email ,password } = req.body;

        //console.log(req.body);
        
        // check if details are not empty
        if (validator.isEmpty(email) || validator.isEmpty(password)) {
            return res.status(400).json({ err:true,  message: 'email /passwor can not be blank !!!' });
        }

        // check for valid email
        if(!validator.isEmail(email)){
            return res.status(400).json({err:true, message: 'Invalid email format' });
        }

        // Check if the email is already taken
        const existingUser = await userSchema.findOne({ email });
            
        // response no user
        if (!existingUser) {
        return res.status(400).json({err:true, message: 'Email / Username can not be found ' });
        }

        //check password
        var flag = await bcrypt.compare(password,existingUser.password);
        //console.log(flag);
        
        if(!flag){
            return res.status(400).json({err:true, message: 'Wrong password ' });
        }

        var token = await existingUser.generateAuthToken();
        //console.log("token: " + token);

        // //add jwt token for cookies
        // res.cookie('jwt', token, { httpOnly: false, maxAge: 36000000000 }); // 1 hour expiration

        res.cookie('jwt', token, {
            httpOnly: true,
            maxAge: 360000000, // 1 hour in milliseconds
            path: '/',
        });

        // login sucsee
        res.status(200).json({err:false,message:"Login Sucsess...",mail:existingUser.email ,id:existingUser._id});

    }catch(err){
        // err code
        console.log(err);
        res.status(400).json({err:true,message:"Internal Server err" ,errobj:err});
    }
})



// login
router.post("/login-v2", async (req,res)=>{

    try{
        const { email ,password } = req.body;

        //console.log(req.body);
        
        // check if details are not empty
        if (validator.isEmpty(email) || validator.isEmpty(password)) {
            return res.status(400).json({ err:true,  message: 'email /passwor can not be blank !!!' });
        }

        // check for valid email
        if(!validator.isEmail(email)){
            return res.status(400).json({err:true, message: 'Invalid email format' });
        }

        // Check if the email is already taken
        const existingUser = await userSchema.findOne({ email });
            
        // response no user
        if (!existingUser) {
        return res.status(400).json({err:true, message: 'Email / Username can not be found ' });
        }

        //check password
        var flag = await bcrypt.compare(password,existingUser.password);
        //console.log(flag);
        
        if(!flag){
            return res.status(400).json({err:true, message: 'Wrong password ' });
        }

        var token = await existingUser.generateAuthToken();
        //console.log("token: " + token);

        // // //add jwt token for cookies
        // // res.cookie('jwt', token, { httpOnly: false, maxAge: 36000000000 }); // 1 hour expiration

        // res.cookie('jwt', token, {
        //     httpOnly: true,
        //     maxAge: 360000000, // 1 hour in milliseconds
        //     path: '/',
        // });

        // login sucsee
        res.status(200).json({err:false,message:"Login Sucsess...",mail:existingUser.email ,id:existingUser._id,token});

    }catch(err){
        // err code
        console.log(err);
        res.status(400).json({err:true,message:"Internal Server err" ,errobj:err});
    }
})



function generateOTP(length) {
    const min = 10 ** (length - 1);
    const max = (10 ** length) - 1;
    return Math.floor(min + Math.random() * (max - min + 1)).toString();
}


// Assuming nodemailer transport is configured

/*
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'selfielectronic@gmail.com',  // Your Gmail email address
        pass: 'oeuz vwnf nvrr csdj'          // Your Gmail password or an app-specific password
    },
    tls: {
        servername: 'smtp.gmail.com',
      }
});
*/

const transporter = nodemailer.createTransport({
    pool: true,
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    tls: {
      servername: 'smtp.gmail.com',
    },
    service: 'gmail',
    auth: {
        user: 'selfielectronic@gmail.com',  // Your Gmail email address
        pass: 'oeuz vwnf nvrr csdj'          // Your Gmail password or an app-specific password
    },
});




router.post("/forget-password1", async (req,res)=>{
    try{
        const {email} =  req.body;
        
        console.log(email)

        // check for email is empty or blank
        if(validator.isEmpty(email)){
            return res.status(400).json({err:true,message:"Email Is Empty"});
        }

        // check given email exist or not 
        const user = await userSchema.findOne({email:email});

        //console.log(user)

        if(!user){
            return res.status(400).json({err:true,message:"user can not be found"})
        }

        // otp genrated date
        const date = new Date();
        // Check if an OTP has been sent within the last 5 minutes
        //if (user.forgetPass.otpGeneratedAt && (date - user.forgetPass.otpGeneratedAt) < 5 * 60 * 1000) {
            //return res.status(400).json({err:true, message: "Try again after 5 minutes"});
        //}

        //genrating otp
        const otp =   generateOTP(6);
        
        // saving otp and daete in 
        user.forgetPass.otp =otp;
        user.forgetPass.otpGeneratedAt = date;
        const uu = await user.save();

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
                return res.status(500).json({err:true, message: 'Error sending OTP via email' });
            }
            console.log('Email sent:', info.response);
            res.json({err:false, message: 'OTP sent successfully',user:user.email,uu:uu});
        });


    }catch(err){
        console.log('done');
        console.log(err);
        res.status(400).json({err:true,message:"Internal Server err" ,errobj:err});  
    }
})

//iuu
router.post("/forget-password", async (req,res)=>{
    try{
        const {email} =  req.body;
        
        console.log(email)

        // check for email is empty or blank
        if(validator.isEmpty(email)){
            return res.status(400).json({err:true,message:"Email Is Empty"});
        }

        // check given email exist or not 
        const user = await userSchema.findOne({email:email});

        //console.log(user)

        if(!user){
            return res.status(400).json({err:true,message:"user can not be found"})
        }

        // OTP generation and date
        const otp = generateOTP(6);
        const date = new Date();

        // Update OTP and date in the database
        const updatedUser = await userSchema.findOneAndUpdate(
            { _id: user._id }, // Filter
            { $set: { "forgetPass.otp": otp, "forgetPass.otpGeneratedAt": date } }, // Update
            { new: true } // Return updated document
        );

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
                return res.status(500).json({err:true, message: 'Error sending OTP via email' });
            }
            console.log('Email sent:', info.response);
            res.json({err:false, message: 'OTP sent successfully', user: user.email, updatedUser: updatedUser});
        });

    } catch(err){
        console.log(err);
        res.status(400).json({err:true,message:"Internal Server err" ,errobj:err});  
    }
})



// check for otp
router.post("/verify-otp", async (req,res)=>{
    try{

        const email =  req.body.email;
        const otp   =  req.body.otp;
        const password = req.body.password;
        const cpassword = req.body.cpassword;
        
        
        //console.log(email)

        if(validator.isEmpty(email) || validator.isEmpty(otp) ){
            return res.status(400).json({err:true,message:"Email/Otp Is Empty"});
        }

        const user = await userSchema.findOne({
            email: email,
            'forgetPass.otp': otp,
        });
    
        if(!user){
            return res.status(400).json({err:true,message:"wrong otp"});
        }

        if(password != cpassword){
            return res.status(400).json({err: true,message:"password and confirm password can not be matched"});
        }


        const hashedPassword = await bcrypt.hash(password,10);
        
        user.password = hashedPassword;
        user.forgetPass.otp = null;
        await user.save();

        
        res.status(200).json({err:false, message:"Password Changed Successfully",user:user});

    }catch(err){
        console.log(err);
        
        if(err.name==="CastError"){
           return res.status(400).json({err:true,message:"Invalid User id",erro: err});
        }
        
        res.status(400).json({err:true,message:"Internal Server err" ,errobj:err});
        
    }
})


// http://localhost:4000/verify-otp?email=nusarat93@outlook.com&otp=633292&password=Aa%23789456123&cpassword=Aa%23789456123



//update user
router.post("/edit-user" ,auth, upload.single('pimage'), async (req,res)=>{
    try{
        var body = req.body;
        const user = req.user;

        //console.log("user");
        //console.log(user);
        const { dob, name ,bio,country } = body;

        if(validator.isEmpty(name) || validator.isEmpty(bio) || validator.isEmpty(country) || validator.isEmpty(dob)){
            return res.status(400).json({err:true, message: 'details can not be blanked' });
        }

        // check for country name
        //console.log(countryList);
        if(!countryList.includes(country)){
            return res.status(400).json({err:true, message: 'Invalid Country Name'});
        }


        // Check if a profile picture was uploaded
        let pimageData = null;
        if (req.file) {
            // Convert the binary data to Base64
            pimageData = req.file.buffer.toString('base64');
        }

        if(pimageData==null){
            //pimageData=user.pimage;
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
        
        
        
        res.status(200).json({err:false,message:"Data Updated.." ,obj:updatedUser})

    } catch(err){
        console.log(err)
        res.status(400).json({err:true,message:"Internal Server err" ,errobj:err});
        
    }
})




// get user by id
router.get("/user-detail/:userId" ,async (req,res)=>{

    try{
        
        const uid = req.params.userId;
        
        if(validator.isEmpty(uid)){
           return res.status(400).json({err:true,message:"invalid user id"});
        }


        const user = await userSchema.findById(uid);

        if(!user){
            return res.status(400).json({err:true,message:"unable to found user id"});
         }

        res.status(200).json({err:false,message:"user profile is fetched",userObj:user});
    

    }catch(err){
         console.log(err);
         if(err.name==="CastError"){
            return res.status(400).json({err:true,message:"unable to found user id ",errobj: err});
        }
        res.status(400).json({err:true,message:"Internal Server err" ,errobj:err});
    }

})



// get by user name
router.get("/user-detail-uname/:username" ,async (req,res)=>{

    try{
        
        const uname= req.params.username;

        if(validator.isEmpty(uname)){
            return res.status(400).json({err:true,message:"User Name Can Not Be Blank"})
        }

        const user = await userSchema.findOne({username:uname});

        if(!user){
            return res.status(400).json({err:true,message:"No User Found With The Name"})
        }

        res.status(200).json({err:false,message:"user object is fethched",userObj:user});
    }catch(err){
         console.log(err);
         if(err?.name==="CastError"){
            return res.status(400).json({err:true,message:"Invalid User id",errobj: err})
        }
        res.status(400).json({err:true,message:"Internal Server err" ,errobj:err});
    }

})


// get by user names
router.get("/user-details-uname/:username" ,async (req,res)=>{

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
router.get("/user-details-name/:name" ,async (req,res)=>{

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

router.get("/user-details/:name/:page", async (req, res) => {
    try {
        const uname = req.params.name.trim();
        const page = parseInt(req.params.page) || 1; // Use query parameter for page, default to page 1
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
            paginationInfo

        });
    } catch (err) {
        console.log(err);
        if (err.name === "CastError") {
            return res.status(400).json({ message: "Invalid User id", error: err });
        }
        res.status(500).json({ message: "Internal Server Error", error: err });
    }
});


router.get("/user-details-v2/:name/:page", async (req, res) => {
    try {
        const uname = req.params.name.trim();
        const page = parseInt(req.params.page) || 1; // Use query parameter for page, default to page 1
        const pageSize = 10; // Set the number of items per page

        if (validator.isEmpty(uname)) {
            return res.status(400).json({err:true, message: "Username cannot be blank" });
        }

        let query;
        if (uname[0] === '@') {
            query = { username: { $regex: new RegExp(uname.substring(1), 'i') } };
        } else {
            query = { name: { $regex: new RegExp(uname, 'i') } };
        }

        const totalUsers = await userSchema.countDocuments(query);
        
        const users = await userSchema.find(query)
            .skip((page - 1) * pageSize)
            .limit(pageSize);

        const tp = Math.ceil(totalUsers / pageSize);
        
        if(page>tp){
            return res.status(400).json({ err:true, message: "page number is invalid / no any user found" });
        }

        if (users.length === 0) {
            return res.status(400).json({ err:true, message: "No User Found" });
        }


          //console.log(totalPages)
      const paginationInfo = {
        currentPage: page,
        totalPages: Math.ceil(users.length / pageSize),
        pageSize,
        totaltweet: users.length
    };

        

        // Include pagination information in the response
        res.status(200).json({
            err:false,
            message:"users are fetched",
            usersObj:users,
            paginationInfo:{
            currentPage: page,
            totalPages: Math.ceil(totalUsers / pageSize),
            pageSize,
            totalUsers
            }
        });
    } catch (err) {
        console.log(err);
        if (err.name === "CastError") {
            return res.status(400).json({ message: "Invalid User id", error: err });
        }
        res.status(500).json({ message: "Internal Server Error", error: err });
    }
});



// follow - un foolow
router.post("/follow/:uid", auth, async (req, res) => {
    try {
        // Getting user id to follow/unfollow
        const uid = req.params.uid;

        // Checking if user id is empty
        if (!uid) {
            return res.status(400).json({ error: true, message: "User ID cannot be empty." });
        }

        // Checking if user exists
        const userExist = await userSchema.exists({ _id: uid });
        if (!userExist) {
            return res.status(400).json({ error: true, message: "User not found." });
        }

        // Getting authenticated user
        const currentUser = req.user;

        // Getting user to follow/unfollow
        const userToFollow = await userSchema.findById(uid);

        // Check if already following
        const isFollowing = currentUser.following.includes(uid);
        const isFollowedByUser = userToFollow.followers.includes(currentUser._id);

        // If already following, unfollow
        if (isFollowing && isFollowedByUser) {
            currentUser.following.pull(uid);
            userToFollow.followers.pull(currentUser._id);
        } 
        // If not following, follow
        else {
            currentUser.following.push(uid);
            userToFollow.followers.push(currentUser._id);
        }

        // Saving updated users
        await currentUser.save();
        await userToFollow.save();

        return res.status(200).json({
            error: false,
            message: isFollowing ? "User unfollowed." : "User followed.",
            following: currentUser.following,
            followers: userToFollow.followers
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: true, message: "Internal Server Error" });
    }
});



router.get('/feed/',auth, async (req, res) => {
    try {
        const userId =  req.user?._id;
        
        // Get the user's information
        const user = await userSchema.findById(userId);
        
        if (!user) {
            return res.status(404).json({ err: true, message: 'User not found' });
        }

        // Calculate the timestamp 10 hours ago
        const tenHoursAgo = new Date(Date.now() - 10 * 60 * 60 * 1000);

        // Find tweets, replies, and likes of users the particular user is following within the last 10 hours
        const tweets = await tweetSchema
            .find({
                $and: [
                    {
                        $or: [
                            { user: { $in: user.following } }, // Tweets by followed users
                            { _id: { $in: user.replied } }, // Replies by the user
                            { _id: { $in: user.liked } } // Likes by the user
                        ]
                    },
                    { createdAt: { $gte: tenHoursAgo } } // Tweets created within the last 10 hours
                ]
            },{_id: 1, user: 1})
            .sort({ createdAt: -1 }) // Sort tweets by creation time in descending order
            .populate({ path: 'user', select: '_id' }) // Populate user information
            .limit(10); // Limit the number of tweets to 10

        // Find the last tweet made by any user within the last 10 hours
        const lastTweet = await tweetSchema
            .findOne({ createdAt: { $gte: tenHoursAgo } })
            .sort({ createdAt: -1 })
            .populate({ path: 'user', select: '_id username' });

        // Response object
        const response = {
            err: false,
            message: 'Feed fetched successfully',
            tweets,
            lastTweet: lastTweet ? { userId: lastTweet.user._id, tweetId: lastTweet._id } : null
        };

        res.status(200).json(response);
    } catch (err) {
        console.log(err);
        res.status(500).json({ err: true, message: 'Internal Server Error' });
    }
});




router.get('/feed/:page', auth, async (req, res) => {
    try {
        const userId = req.user?._id;
        const page = parseInt(req.params.page) || 1; // Default to page 1
        const limit = 10; // Number of tweets per page

        // Get the user's information
        const user = await userSchema.findById(userId);
        
        if (!user) {
            return res.status(404).json({ err: true, message: 'User not found' });
        }

        // Calculate the timestamp 10 hours ago
        const tenHoursAgo = new Date(Date.now() - 10 * 60 * 60 * 1000);

        // Count total number of tweets within the last 10 hours
        const totalTweets = await tweetSchema.countDocuments({
            $and: [
                {
                    $or: [
                        { user: { $in: user.following } }, // Tweets by followed users
                        { _id: { $in: user.replied } }, // Replies by the user
                        { _id: { $in: user.liked } }, // Likes by the user
                        
                    ]
                },
                { createdAt: { $gte: tenHoursAgo } } // Tweets created within the last 10 hours
            ]
        });

        // Calculate total number of pages
        const totalPages = Math.ceil(totalTweets / limit);

        // Validate page number
        if (page < 1 || page > totalPages) {
            return res.status(400).json({ err: true, message: 'Invalid page number' });
        }

        // Calculate skip value for pagination
        const skip = (page - 1) * limit;

        // Find tweets, replies, and likes of users the particular user is following within the last 10 hours with pagination
        const tweets = await tweetSchema
            .find({
                $and: [
                    {
                        $or: [
                            { user: { $in: user.following } }, // Tweets by followed users
                            { _id: { $in: user.replied } }, // Replies by the user
                            { _id: { $in: user.liked } } // Likes by the user
                        ]
                    },
                    { createdAt: { $gte: tenHoursAgo } } // Tweets created within the last 10 hours
                ]
            }, {_id: 1, user: 1})
            .sort({ createdAt: -1 }) // Sort tweets by creation time in descending order
            .populate({ path: 'user', select: '_id' }) // Populate user information
            .skip(skip)
            .limit(limit); // Limit the number of tweets per page

        // Find the last tweet made by any user within the last 10 hours
        const lastTweet = await tweetSchema
            .findOne({ createdAt: { $gte: tenHoursAgo } })
            .sort({ createdAt: -1 })
            .populate({ path: 'user', select: '_id username' });

        // Response object
        const response = {
            err: false,
            message: 'Feed fetched successfully',
            tweets,
            pagination: {
                totalPages,
                currentPage: page,
                totalTweets,
                tweetperpage:limit
            },
            lastTweet: lastTweet ? { userId: lastTweet?.user?._id, tweetId: lastTweet?._id } : null
        };

        res.status(200).json(response);
    } catch (err) {
        console.log(err);
        res.status(500).json({ err: true, message: 'Internal Server Error' });
    }
});








// Export the router
module.exports = router;