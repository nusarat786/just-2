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


// POST endpoint for creating a new tweet
router.post("/tweet",auth,async (req,res)=>{
    
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
router.post("/tweet-v2",auth,async (req,res)=>{
    
    try {

        //console.log(req.user.country);
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
router.post("/tweet-v3",auth,async (req,res)=>{
    
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
router.post("/tweet-v4",auth,upload.single('timage'),async (req,res)=>{
    
    try {
        const  {text}  = req.body;
        
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
        res.json({err:"false",message:"Tweeted" ,tweetid:savedTweet._id});
    } catch (err) {
      console.log(err);
      res.status(500).json({err:"true", message: 'Internal Server Error',errobj:err });
    }
  });



// like tweet
router.post("/like/:tweetId",auth , async(req,res)=>{
    try{
        // geting tweet id
        var tid = req.params.tweetId;
        
        
        //checking wether user id is empty or not
        if(validator.isEmpty(tid)){
            return res.status(400).json({err:"true",message:" user id is empty: "});
        }

        //user exist or not checking
        const tweetExist = await tweetSchema.exists({ _id:tid });
        //console.log(userExist)

        // if tweet does't exist err will be thrown
        if(!tweetExist){
            return res.status(400).json({err:"true",message:"twee id is invalid: "});
        }
 
        //getting user obj
        const user = req.user
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
            return res.status(200)
            .json(
                {
                err:"false",
                message:"tweet is dis-liked",
                userliked : updateuser.liked,
                userid: updateuser._id,
                tweetlikes: updatetweet.likes,
                tweetid:updatetweet._id
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
                {
                err:"false",
                message:"tweet is liked",
                userliked : updateuser.liked,
                userid: updateuser._id,
                tweetlikes: updatetweet.likes,
                tweetid:updatetweet._id
                });
        }
        
    }catch(err){
        //console.log(err);
        if(err.name==="CastError"){
            return res.status(400).json({err:"true" ,message:"Invalid Tweet id",errobj: err})
        }
        res.status(400).json({err:"true" ,message:"Invalid Tweet id",errobj: err})    
    }
})

// get liked tweets
router.get('/liked-tweets/:userid/:page', async (req, res) => {
    try {
    
      const userid= req.params.userid;
      // page
      const page = parseInt(req.params.page) || 1; // Default to page 1
      const limit = 25;
  
      const user = await userSchema.findById(userid);
  
      if (!user) {
        return res.status(404).json({err:"true" ,message:"user can not be found"});
      }
  
      const totalTweets = user.liked.length;
      const totalPages = Math.ceil(totalTweets / limit);
      
      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;

      //const paginatedTweets = userTweets.slice(startIndex, endIndex);
      const paginationInfo = {
        totalTweets,
        totalPages,
        currentPage: page,
        tweetsPerPage: limit,
        };

      //console.log(totalPages)
      if(totalPages<page){
        
        if(totalPages==0){
            return res.status(401).json({err:"true",message:"No Liked Tweet For User Found" ,paginationInfo:paginationInfo});
        }
        return res.status(401).json({err:"true",message:"Page no: " + page  + "  Is Invalid" ,paginationInfo:paginationInfo});
      }
      
      
      
      

     // const userLikedTweets = await tweetSchema
     //   .find({
     //       _id: { $in: user.liked }   // liked tweets
     //   })
     //   .sort({ createdAt: -1 })
     //   .populate({
     //       path: 'user',
     //       select: '-password -tokens -tweets -followers -following -pimage -country -forgetPass -dob -joined -liked -reposted -bookmarked -bio -commented'
     //   })
     //   .skip(startIndex)
     //   .limit(endIndex);
     
     //userLikedTweets // Reverse the order of the tweets

        const userLikedTweets = await tweetSchema
        .find({ _id: { $in: user.liked } },{_id: 1, user: 1})   // liked tweets
        .sort({ createdAt: -1 })
        .populate({
            path: 'user',
            select: '_id user' // Projection to include only _id and user fields
        })
        .skip(startIndex)
        .limit(endIndex);
        

        //console.log(userTweets[0].user._id);
        res.status(200).
        json(
            {
            err:"false" ,
            message:"Tweet are retrived ", 
            tweets: userLikedTweets, 
            pagination: paginationInfo 
        });
    
    } catch (error) {
        console.log(error);
        if(error.name==="CastError"){
            return res.status(400).json({err:"true" ,message:"Invalid Tweet id",errobj: error}) 
        }

        res.status(400).json({err:"true" ,message:"Internal Server Err",errobj: error})  
    }

  });


// repost a tweet
router.post("/repost/:tweetId",auth , async(req,res)=>{
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
                {
                message:"Tweet Repost Removed ",
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
                {
                message:"Tweet Reposted ",
                user : updateuser,
                tweet: updatetweet
                });
        }
        

    }catch(err){
        //console.log(err);
        if(err.name==="CastError"){
            return res.status(400).json({err:"true" ,message:"Invalid tweet Id",errobj: err})
        }
        res.status(400).json({err:"true" ,message:"Invalid Tweet id",errobj: err})
        
    }


})


// repost a tweet-v2
router.post("/repost-v2/:tweetId",auth , async(req,res)=>{
    try{
        // geting tweet id
        var tid = req.params.tweetId;
        
       
        //checking wether user id is empty or not
        if(validator.isEmpty(tid)){
            return res.status(400).json({err:"true",message:" tweet id is empty: "});
        }

        //user exist or not checking
        const tweetExist = await tweetSchema.exists({ _id:tid });
        //console.log(userExist)

        // if tweet does't exist err will be thrown
        if(!tweetExist){
            return res.status(400).json({err:"true",message:"tweet can not be found" ,});
        }

        //getting user obj
        const user = req.user;
        //console.log(user)
        
        // getting tweet obj
        const tweet = await tweetSchema.findOne({_id:tid});

        //console.log(user._id);
        //console.log(tweet.user);
        //console.log(user._id === tweet.user);

        if(user._id.toString() === tweet.user.toString()){
            return res.status(400).json({err:"true",message:"You can not repost your own tweet"});
        }

        // Check if tweet id  is already in the reposted list
        const indexToRemoveReposted = user.reposted.indexOf(tweet._id);

        // check if user id is alredy in the tweet repost  list
        const indexToRemoveReposts = tweet.reposts.indexOf(user._id);
        //console.log(tweet.likes.length);

        

        // if it is alredy it will be rmoved from both
        if (indexToRemoveReposted != -1) {
            
            // If already liked, remove the user's ID from the likes array
            user.reposted.splice(indexToRemoveReposted, 1);
            //user.tweets.splice(indexToRemoveTweet, 1);
            tweet.reposts.splice(indexToRemoveReposts,1);
            
            const updateuser = await user.save();
            const updatetweet = await tweet.save();
            return res.status(200).json(
                {
                err:"false",
                message:"Tweet Repost Removed ",
                userreposted : updateuser.reposted,
                tweetreposts: updatetweet.reposts,
                userid:updateuser._id,
                tweetid:updatetweet._id
                });
        
        // else we will try to add at both locations
        } else {
            
            // If not liked, add the user's ID to the likes array
            user.reposted.push(tweet._id);
            tweet.reposts.push(user._id);
            //user.tweets.push(tweet._id);
            const updateuser = await user.save();
            const updatetweet = await tweet.save();
            //console.log(updatedTweet);
            return res.status(200)
            .json(
                {err:"false",
                message:"Tweet Reposted ",
                userreposted : updateuser.reposted,
                tweetreposts: updatetweet.reposts,
                userid:updateuser._id,
                tweetid:updatetweet._id
                });
        }
        
    }catch(err){
        //console.log(err);
        if(err.name==="CastError"){
            return res.status(400).json({err:"true" ,message:"Invalid Tweet Id ",errobj: err})
        }
        res.status(400).json({err:"true" ,message:"Internal Server Error",errobj: err})
    }
})


// book_mark a tweet 
router.post("/book-mark/:tweetId",auth , async(req,res)=>{
    try{
        // geting tweet id
        var tid = req.params.tweetId;
        
        
        //checking wether user id is empty or not
        if(validator.isEmpty(tid)){
            return res.status(400).json({err:"true",message:"tweet id can not be blank" ,});
        }

        //user exist or not checking
        const tweetExist = await tweetSchema.exists({ _id:tid });
        //console.log(userExist)

        // if tweet does't exist err will be thrown
        if(!tweetExist){
            return res.status(400).json({err:"true",message:"tweet can not be found" ,});
        }

        //getting user obj
        const user = req.user;
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
            return res.status(200)
            .json(
                {
                err:"false",
                message:"Tweet BookMarked Removed ",
                userbookmarked : updateuser.bookmarked,
                tweetbookmarks: updatetweet.bookmarks
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
                {
                err:"false",
                message:"Tweet BookMarked ",
                userbookmarked : updateuser.bookmarked,
                tweetbookmarks: updatetweet.bookmarks
                });
        }

    }catch(err){
        console.log(err);
        if(err.name==="CastError"){
            return res.status(400).json({err:"true" ,message:"Invalid Tweet id",errobj: err});
        }
        res.status(400).json({err:"true" ,message:"Internal Server Error",errobj: err})    
    }
})

// get book marked tweets
router.get('/book-marked-tweets/:page', auth, async (req, res) => {
    try {
      //console.log("here");
      // page
      const page = parseInt(req.params.page) || 1; // Default to page 1
      const limit = 25;
  
      // getting user
      const user = req.user;
  
      // if no user found will throw err
      if (!user) {
        return res.status(404).json({err:"true",message:"No user found" });
      }
  
      // geting pagination information
      const totalTweets = user.bookmarked.length;
      const totalPages = Math.ceil(totalTweets / limit);
      
      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;

      //pagination ifo object
      const paginationInfo = {
        totalTweets,
        totalPages,
        currentPage: page,
        tweetsPerPage: limit,
        };

      //if total page is less than demanded it will through err
      if(totalPages<page){
        
        if(totalPages==0){
            return res.status(200).json({err:"true",message:"No any bookmark tweet fo user found" ,paginationInfo:paginationInfo}) 
        }
        return res.status(401).json({err:"true" ,message:"Page no: " + page  + "  Is Invalid",paginationInfo:paginationInfo})
      }
      
      // fetching bookmarked tweet with some modification
      const userBookmarkedTweets = await tweetSchema
        .find({
            _id: { $in: user.bookmarked },
               // Bookmarked tweets
        },{_id: 1, user: 1})
        .sort({ createdAt: -1 })
        .populate({
            path: 'user',
            select: '_id user' // Projection to include only _id and user fields
        })
        .skip(startIndex)
        .limit(endIndex);

        

        //console.log(userTweets[0].user._id);
        
        res.status(200).
        json({
            tweets: userBookmarkedTweets, 
            pagination: paginationInfo ,
            err:"false" ,
            message:"book marked tweets retrived"
        });
    

    } catch (err) {
        res.status(400).json({err:"true" ,message:"Internal Server Error",errobj: err});
    }
  });




//specific tweet with view count inc
router.get("/tweet/:tweetid",async (req,res)=>{
    
    try{

        var tid = req.params.tweetid;
        
        //console.log(tid);
        if(validator.isEmpty(tid)){
            return res.status(400).json({message:"empty tweet id o"});
        }

        const tweet = await tweetSchema.findById(tid);
        

        //console.log(tweet);
        
        res.status(200).json({tweet:tweet});
          
    }catch(err){
        
        console.log(err)
        
        if(err.name==="CastError"){
            return res.status(400).json({err:"true" ,message:"Invalid user Id",errobj: err})
        }
        
        res.status(400).json({err:"true" ,message:"Internal Server Error",errobj: err});
    }
})



// Function to fetch all tweets up to parent
const fetchTweetWithParent = async (tweetId) => {
    // tweet array
    let tweets = [];

    //current tweet 
    let currentTweet = await tweetSchema.findById(tweetId);
  
    // loop up to current tweet exist and has comment
    while (currentTweet && currentTweet.isComment) {
    
    tweets.push(currentTweet);
  
      // check condition
      if (currentTweet.parent) {
        currentTweet = await tweetSchema.findById(currentTweet.parent);
      } else {
        currentTweet = null;
      }
    }
  
    // Add the last tweet (main parent) to the result
    if (currentTweet) {
      // add parent tweet
      tweets.push(currentTweet);
    }
  
    return tweets.reverse();
  };
  




// Specific tweet with view count incremented and all related comented twwets
router.get("/tweet-v2/:tweetid", async (req, res) => {
    try {
        const tid = req.params.tweetid;

        // check for tweet id is null or not
        if (validator.isEmpty(tid)) {
            return res.status(400).json({err:true, message: "empty tweet id o" });
        }

        // get tweet obj by given tweet id
        const tweet = await tweetSchema.findById(tid);

        //if tweet with specific id not exist it will thror err res
        if (!tweet) {
            return res.status(400).json({err:true, message: "invalid tweet id " });
        }

        // update view count for a tweet fetched
        await tweetSchema.updateOne(
            { _id: tid },
            { $inc: { views: 1 } }
        );

        // get all commented tweets asociated with given tweet / id
        const comments = await tweetSchema.find({ _id: { $in: tweet.comments } });
            

        // If the tweet is a comment or a sub tweet , fetch all tweets up to the parent
        if (tweet.isComment) {
            //calling fetch method
            const allTweets = await fetchTweetWithParent(tid);
            res.status(200).json({isComment:true ,err: "fasle", message: "Got all tweet with parent", tweet: allTweets,comments:comments });
        
        } else {
            // if this tweet is not a commet
            res.status(200).json({isComment:false ,err: "fasle", message: "Tweet is fetched with id", tweet: tweet, comments: comments });
        }
    } catch (err) {

        // err logic
        console.log(err);

        if (err.name === "CastError") {
            return res.status(400).json({ err: "true", message: "Invalid tweet Id", errobj: err });
        }

        res.status(400).json({ err: "true", message: "Internal Server Error", errobj: err });
    }
});


// Specific tweet with view count incremented and all related comented twwets v3
router.get("/tweet-v3/:tweetid", async (req, res) => {
    try {
        const tid = req.params.tweetid;

        // check for tweet id is null or not
        if (validator.isEmpty(tid)) {
            return res.status(400).json({err:true, message: "empty tweet id o" });
        }

        // get tweet obj by given tweet id
        const tweet = await tweetSchema.findById(tid);

        //if tweet with specific id not exist it will thror err res
        if (!tweet) {
            return res.status(400).json({err:true, message: "invalid tweet id " });
        }

        // update view count for a tweet fetched
        await tweetSchema.updateOne(
            { _id: tid },
            { $inc: { views: 1 } }
        );

        // get all commented tweets asociated with given tweet / id
        const comments = await tweetSchema.find({ _id: { $in: tweet.comments } });
            

        
        //calling fetch method
        const allTweets = await fetchTweetWithParent(tid);
        res.status(200).json({isComment:false ,err: "fasle", message: "Tweet Fetched with/without parent", tweet: allTweets, comments: comments });
        
    } catch (err) {

        // err logic
        console.log(err);

        if (err.name === "CastError") {
            return res.status(400).json({ err: "true", message: "Invalid tweet Id", errobj: err });
        }

        res.status(400).json({ err: "true", message: "Internal Server Error", errobj: err });
    }
});



//comment on tweet
router.post('/comment/:tweetId',auth, async (req,res)=>{
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
            err:"false",
            message:"Commented",
            user : u,
            parentTweet: pt,
            comment:savedTweet
        });

    }catch(err){
        console.log(err);
        
        if(err.name==="CastError"){
            return res.status(400).json({err:"true" ,message:"Invalid user Id",errobj: err})
        }

        res.status(400).json({err:"true" ,message:"Internal Server Error",errobj: err})
    }
})

//comment on tweet v2
router.post('/comment-v2/:tweetId',auth,upload.single('timage'), async (req,res)=>{
    try{
        //get tweet id
        const tid =  req.params.tweetId;
        
        // get user id of commenter from token
        const userId = req.user._id;
        
        // get text of comment
        const text = req.body.text;

        // check if tweet id is empty or not
        if(validator.isEmpty(tid)){
            return res.status(400).json({err:"true",message:"empty tweet id: "});
        }

        // check wether tesxt message is not empty
        if(validator.isEmpty(text)){
            return res.status(400).json({err:"true",message:"empty tweet id: "});
        }

        // check weather given tweet(on wich user is commenting) is exist
        
        const isTweet = await tweetSchema.exists({_id:tid});

        if(!isTweet){
            return res.status(400).json({err:"true",message:"No Tweet Found: "});
        }


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

        //(comment as a tweet) Create a new tweet using the Tweet model
        const newTweet = new tweetSchema({
            text:text,
            user:req.user._id,
            hashtags:uniqueHashtags,
            country:req.user.country,
            timage:pimageData,
            isComment:true,
            parent:tid,
        });

        
        // save a tweet /comment
        const savedTweet = await newTweet.save();
        

        // Update the user's comented array with the new tweet / comment
        const u = await userSchema.findByIdAndUpdate({_id:userId._id}, { $push: { commented: savedTweet._id } },{ new: true });


        // add tweet as comment to a specific tweet 
        const pt = await tweetSchema.findOneAndUpdate({_id:tid},{$push:{comments:savedTweet._id}},{ new: true });
        
        //console.log(opl)

        res.status(200).json({
            err:"false",
            message:"Commented",
            userid : u.id,
            usercommented : u.commented,
            parentweetid: pt._id,
            parentweetcomments: pt.comments,
            commentid:savedTweet._id
        });

        
    }catch(err){
        console.log(err);
        
        if(err.name==="CastError"){
            return res.status(400).json({err:"true" ,message:"Invalid user Id",errobj: err})
        }
        
        res.status(400).json({err:"true" ,message:"Internal Server Error",errobj: err})
    }
})


// tweet by user id in sorted manner with pagination
router.get('/comments8/:userId/:page', async (req, res) => {
    
    try {

      const userId = req.params.userId;
      const page = parseInt(req.params.page) || 1; // Default to page 1
      const limit = 25;
  
      const user = await userSchema.findById(userId);
  
      if (!user) {
        return res.status(404).json({err:"true", message: 'User not found' });
      }
  
      const totalTweets = user.tweets.length;
      const totalPages = Math.ceil(totalTweets / limit);
      
      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;

      //console.log(totalPages)
      const paginationInfo = {
        totalTweets,
        totalPages,
        currentPage: page,
        tweetsPerPage: limit,
        };

          
      if(totalPages<page){
        
        if(totalPages==0){
            return res.status(200).json({err:"true",message:"No any comment for user found" ,paginationInfo:paginationInfo}) 
        }
        return res.status(401).json({err:"true",message:"Page no: " + page  + "  Is Invalid" ,paginationInfo:paginationInfo})
      }
      

      const userTweets = await tweetSchema
        .find({
            $or: [
                { _id: { $in: user.commented } },  // commented tweets
            ]
        })
        .sort({ createdAt: -1 })  //  Sort tweets by creation time in descending order
        .populate({ path: 'user', select: '-password -tokens -tweets -followers -following -pimage -country -forgetPass -dob -joined -liked -reposted -bookmarked -bio -commented' })
        .skip(startIndex)
        .limit(endIndex);

        //const paginatedTweets = userTweets.slice(startIndex, endIndex);
        //console.log(userTweets[0].user._id);
        res.status(200).
        json({err:"false" ,message:"comments are fetched ", tweets: userTweets, pagination: paginationInfo });
    
    } catch (err) {
        
        console.log(err);
        
        if(err.name==="CastError"){
            return res.status(400).json({err:"true" ,message:"Invalid user Id",errobj: err})
        }

        res.status(400).json({err:"true" ,message:"Internal Server Error",errobj: err})
    }
  });


  //
  router.get('/comments/:userId/:page', async (req, res) => {
    try {
        const userId = req.params.userId;
        const page = parseInt(req.params.page) || 1; // Default to page 1
        const limit = 25;

        const user = await userSchema.findById(userId);

        if (!user) {
            return res.status(404).json({ err: true, message: 'User not found' });
        }

        const totalTweets = user.commented.length;
        const totalPages = Math.ceil(totalTweets / limit);

        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;

        const paginationInfo = {
            totalTweets,
            totalPages,
            currentPage: page,
            tweetsPerPage: limit,
        };

        if (page > totalPages) {
            if (totalPages === 0) {
                return res.status(200).json({ err: true, message: "No comments found for this user", paginationInfo });
            }
            return res.status(401).json({ err: true, message: `Page no: ${page} is invalid`, paginationInfo });
        }

        const userTweets = await tweetSchema
            .find({ _id: { $in: user.commented } },{_id: 1, user: 1}) // Find tweets where user has commented
            .sort({ createdAt: -1 })
            .populate({
                path: 'user',
                select: '_id user' // Projection to include only _id and user fields
            })
            .skip(startIndex)
            .limit(endIndex);
            
        res.status(200).json({ err: false, message: "Comments fetched successfully", tweets: userTweets, pagination: paginationInfo });

    } catch (err) {
        console.log(err);
        if (err.name === "CastError") {
            return res.status(400).json({ err: true, message: "Invalid user Id", errobj: err });
        }
        res.status(500).json({ err: true, message: "Internal Server Error", errobj: err });
    }
});



// tweet by user id in sorted manner with pagination
router.get('/tweets/:userId/:page', async (req, res) => {
    
    try {

      const userId = req.params.userId;
      const page = parseInt(req.params.page) || 1; // Default to page 1
      const limit = 25;
  
      const user = await userSchema.findById(userId);
  
      if (!user) {
        return res.status(404).json({err:"true", message: 'User not found' });
      }
  
      const totalTweets = (user.tweets?.length || 0) - (user.deleted?.length || 0);
      const totalPages = Math.ceil(totalTweets / limit);
      
      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;

      //console.log(totalPages)
      const paginationInfo = {
        totalTweets,
        totalPages,
        currentPage: page,
        tweetsPerPage: limit,
        };

          
      if(totalPages<page){
        
        if(totalPages==0){
            return res.status(200).json({err:"true",message:"No any tweet for user found" ,paginationInfo:paginationInfo}) 
        }
        return res.status(401).json({err:"true",message:"Page no: " + page  + "  Is Invalid" ,paginationInfo:paginationInfo})
      }
      

      /*
      const userTweetsp = await tweetSchema
        .find({
            $or: [
                {_id: { $nin: user.deleted }},
                { _id: { $in: user.tweets } },  // Original tweets
                { _id: { $in: user.reposted } } , // Reposted tweets
                
            ]
        })
        .sort({ createdAt: -1 })  //  Sort tweets by creation time in descending order
        .populate({ path: 'user', select: '-password -tokens -tweets -followers -following -pimage -country -forgetPass -dob -joined -liked -reposted -bookmarked -bio -commented' })
        .skip(startIndex)
        .limit(endIndex);
        */
    
        const userTweets = await tweetSchema
        .find({
            $and: [
                {
                    _id: { 
                        $in: user.tweets.concat(user.reposted)
                    }  // Tweets and reposts
                },
                {
                    _id: { 
                        $nin: user.deleted
                    }  // Exclude deleted tweets
                }
            ]
        },{_id:1,user:1})
        .sort({ createdAt: -1 })
        .populate({
            path: 'user',
            select: '_id user' // Projection to include only _id and user fields
        })
        .skip(startIndex)
        .limit(endIndex);
        
    
        //const paginatedTweets = userTweets.slice(startIndex, endIndex);

        //console.log(userTweets[0].user._id);

        res.status(200).
        json({err:"false" ,message:"Tweets Are Fetched ", tweets: userTweets, pagination: paginationInfo });
    
    } catch (err) {
        
        console.log(err);
        
        if(err.name==="CastError"){
            return res.status(400).json({err:"true" ,message:"Invalid user Id",errobj: err})
        }

        res.status(400).json({err:"true" ,message:"Internal Server Error",errobj: err})
    }
  });


  
// delete a tweet
router.post("/delete-tweet/:tweetId", auth, async (req, res) => {
    try {
        const tweetId = req.params.tweetId;
        var user = req.user;

        // Ensure that the tweet belongs to the authenticated user
        var tweetObj = await tweetSchema.findOne({ _id: tweetId, user: user._id });

        if (!tweetObj) {
            return res.status(404).json({err:"true", message: "Tweet not found or does not belong to the user" });
        }

        const indexToDeleted = user.deleted.indexOf(tweetId);

        //console.log(indexToDeleted);
        if(indexToDeleted !=-1){
            return res.status(404).json({err:"true", message: "Tweet Is Alredy Deleted" , deleted:user.deleted});
        }


        // remove text format
        tweetObj.text = "This Tweet/Comment Is Deleted By User";
        
        // tweet saved as deleted
        const twobj = await tweetObj.save();

        // add in deleted list
        user.deleted.push(tweetId);

        // save a user 
        const sv = await user.save();

        res.status(200).json({ err:"false",message: "Tweet deleted successfully" });

    } catch (err) {
        
        //console.log(err);
        if(err.name==="CastError"){
            return res.status(400).json({err:"true" ,message:"Invalid tweet Id",errobj: err})
        }
        res.status(400).json({err:"true" ,message:"Internal Server Error",errobj: err});

    }
});





// get top 10 trending hashtags in the last 10 hours with country specified
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
router.get('/trending-hashtags', auth, async (req, res) => {
    try {

      user = req.user;  
      const trendingHashtags = await getTrendingHashtags(user.country);
      res.status(200).json({err:"fasle", message: "fetched hashtags", trendingHashtags: trendingHashtags });
    } catch (err) {
      console.error(err);
      res.status(400).json({err:"true", message: 'Internal Server Error',errobj:err });
    }
  });

  
  // get hashtags
  router.get("/get-tweets-v2/:hashtag/:pageNumber", auth, async (req, res) => {
    try {
        const hashtag = `#${req.params.hashtag}`;
        const pageNumber = parseInt(req.params.pageNumber);
        const tweetsPerPage = 10; // Number of tweets per page

        const tenHoursAgo = new Date(Date.now() - 10 * 60 * 60 * 1000);

        // Count total tweets with the specified hashtag created in the last 10 hours
        const totalTweets = await tweetSchema.countDocuments({
            hashtags: hashtag,
            //createdAt: { $gte: tenHoursAgo },
            country: req.user.country
        });

        // Calculate total pages
        const totalPages = Math.ceil(totalTweets / tweetsPerPage);

        /*
        // Find tweets for the specified page
        const tweets = await tweetSchema.find({
            hashtags: hashtag,
            createdAt: { $gte: tenHoursAgo },
            country: req.user.country
        })
        .sort({ createdAt: -1 }) // Sort by creation date in descending order
        .skip((pageNumber - 1) * tweetsPerPage) // Skip tweets on previous pages
        .limit(tweetsPerPage) // Limit to tweetsPerPage tweets per page
        .exec();
        */

        // Find tweets for the specified page
        const tweets = await tweetSchema.find({
            hashtags: hashtag,
            //createdAt: { $gte: tenHoursAgo },
            country: req.user.country
        }, {_id: 1, user: 1})
        .sort({ createdAt: -1 }) // Sort by creation date in descending order
        .skip((pageNumber - 1) * tweetsPerPage) // Skip tweets on previous pages
        .limit(tweetsPerPage) // Limit to tweetsPerPage tweets per page
        .exec();

        const paginationInfo = {
            totalTweets,
            totalPages,
            currentPage: pageNumber,
            tweetsPerPage,
        };

        res.json({ tweets, paginationInfo });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});






// get tweets by hash tags
router.get("/get-tweets/:hashtag/:pageNumber", auth, async (req, res) => {
    try {
        var hashtag = req.params.hashtag;
        const pageNumber = parseInt(req.params.pageNumber);

        const tenHoursAgo = new Date(Date.now() - 10 * 60 * 60 * 1000);
       
        hashtag = "#"+hashtag; // Encode the hashtag

        //console.log(hashtag);
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

        res.json({ tweets:tweets });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


//

// Get all comments for a tweet
router.get('/tweet-comments/:tweetid/:page', async (req, res) => {
    try {
        const tweetid = req.params.tweetid;
        const page = parseInt(req.params.page) || 1;
        const limit = 25;

        const tweet = await tweetSchema.findById(tweetid);

        if (!tweet) {
            return res.status(404).json({ err: true, message: "Tweet not found" });
        }

        const totalComments = tweet.comments.length;
        const totalPages = Math.ceil(totalComments / limit);

        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;

        if (totalPages < page) {
            if (totalPages === 0) {
                return res.status(401).json({ err: true, message: "No comments found for this tweet", paginationInfo: { totalComments, totalPages } });
            }
            return res.status(401).json({ err: true, message: "Invalid page number", paginationInfo: { totalComments, totalPages } });
        }

        const tweetComments = await tweetSchema
            .find({
                _id: { $in: tweet.comments }
            })
            .sort({ createdAt: -1 })
            .populate({
                path: 'user',
                select: '-password -tokens -tweets -followers -following -pimage -country -forgetPass -dob -joined -liked -reposted -bookmarked -bio -commented'
            })
            .skip(startIndex)
            .limit(endIndex);

        res.status(200).json({
            err: false,
            message: "Comments retrieved successfully",
            comments: tweetComments,
            pagination: {
                totalComments,
                totalPages,
                currentPage: page,
                commentsPerPage: limit
            }
        });
    } catch (error) {
        console.log(error);
        if (error.name === "CastError") {
            return res.status(400).json({ err: true, message: "Invalid tweet ID", errobj: error });
        }
        res.status(500).json({ err: true, message: "Internal Server Error", errobj: error });
    }
});



// get tweets by search term
router.get("/get-tweets-v2/search/:searchTerm/:pageNumber", auth, async (req, res) => {
    try {
        const searchTerm = req.params.searchTerm; // Get the search term from the URL
        const pageNumber = parseInt(req.params.pageNumber);
        const tweetsPerPage = 10; // Number of tweets per page

        // Count total tweets containing the search term
        const totalTweets = await tweetSchema.countDocuments({
            text: { $regex: searchTerm, $options: "i" }, // Case-insensitive search for the term in tweet text
        });

        if(totalTweets<=0){
            return res.status(400).json({ err: true, message: "No Record Found" });
        }

        // Calculate total pages
        const totalPages = Math.ceil(totalTweets / tweetsPerPage);

        // Find tweets containing the search term for the specified page
        const tweets = await tweetSchema.find({
            text: { $regex: searchTerm, $options: "i" }, // Case-insensitive search for the term in tweet text
            country: req.user.country
        }, {_id: 1, user: 1})
        .sort({ createdAt: -1 }) // Sort by creation date in descending order
        .skip((pageNumber - 1) * tweetsPerPage) // Skip tweets on previous pages
        .limit(tweetsPerPage) // Limit to tweetsPerPage tweets per page
        .exec();

        const paginationInfo = {
            totalTweets,
            totalPages,
            currentPage: pageNumber,
            tweetsPerPage,
        };

        res.json({ tweets, paginationInfo });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});





// Export the router
module.exports = router;


