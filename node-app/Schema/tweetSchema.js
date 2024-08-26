const mongoose = require('mongoose');
const userSchema = require('./userSchema'); // Import the user schema

const tweetSchema = new mongoose.Schema({
  text: { type: String, required: true,trim: true  },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User2' }, // Reference to the user who posted the tweet
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User2' }], // Reference to users who liked the tweet
  bookmarks:[{ type: mongoose.Schema.Types.ObjectId, ref: 'User2' }], // Reference to the user who posted the tweet
  reposts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User2' }], // Reference to the user who posted the tweet
  createdAt: { type: Date, default: Date.now },
  views:{type:Number,default: 0},
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tweet2' }, ],
  hashtags: [{type:String}],
  country:{type:String},
  timage : {type:String},
  isComment: {type:Boolean,default:false},
  parent:{type: mongoose.Schema.Types.ObjectId, ref: 'Tweet2' ,default:null}
  
});

const Tweet = mongoose.model('Tweet2', tweetSchema);

module.exports = Tweet;
