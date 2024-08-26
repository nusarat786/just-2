import React, { useEffect, useState } from 'react';
import axios from 'axios';
import TweetCard from './tweetcard';
const TweetData2 = {
    tweets: [
        {
            "parent": null,
            "_id": "65b0cd4ab789d42d893fd18f",
            "text": "This is #tweetRoutes2",
            "user": "65b0c9ef841b1bc4d63c0fb9",
            "likes": [
                "65b0c9ef841b1bc4d63c0fb9"
            ],
            "bookmarks": [
                "65b0c9ef841b1bc4d63c0fb9"
            ],
            "reposts": [
                "65b0c9ef841b1bc4d63c0fb9"
            ],
            "views": 14,
            "comments": [
                "65b1669e1a39c10b8bf227a5",
                "65b1693e80258d6da31990c2",
                "65b16a2080258d6da31990da",
                "65b16b3980258d6da31990f2",
                "65b20b198508598c8efea61b",
                "65b20d215f5d9239e1fc0f9c",
                "65b2187abb689f60f5f6308c"
            ],
            "hashtags": [
                "#tweetRoutes2"
            ],
            "country": "India",
            "timage": null,
            "createdAt": "2024-01-24T08:41:46.785Z",
            "__v": 65,
            "isComment": false
        },
        {
            "_id": "65b20d215f5d9239e1fc0f9c",
            "text": "This is tweet #hello",
            "user": "65b0c9ef841b1bc4d63c0fb9",
            "likes": [],
            "bookmarks": [],
            "reposts": [],
            "views": 0,
            "comments": [
                "65b22a26a76f07d50e93acd3",
                "65b235aa94c0c930ac540784",
                "65b2362958a6708d615f89f3",
                "65b2365e064e7d484329fbfe",
                "65b23756734f847d0ef9368d",
                "65b239832b4ee99a58715fca",
                "65b239ab44f6418f117ea1fd",
                "65b239ef076ac3c5ee4158c2",
                "65b239faf4234f279a799b1a"
            ],
            "hashtags": [
                "#hello"
            ],
            "country": "India",
            "timage": null,
            "isComment": true,
            "parent": "65b0cd4ab789d42d893fd18f",
            "createdAt": "2024-01-25T07:26:25.110Z",
            "__v": 0
        },
        // Other tweets data...
    ],
    comments: [
        // Comments data...
    ]
};

const TweetCard2 = ({ tweet }) => {


  return (
    <div className="card mb-3">
      <div className="card-body">
        <h5 className="card-title">{tweet.text}</h5>
        <p className="card-text">Views: {tweet.views}</p>
        <p className="card-text">Likes: {tweet.likes.length}</p>
        <p className="card-text">Comments: {tweet.comments.length}</p>
        <p className="card-text">Reposts: {tweet.reposts.length}</p>
        <p className="card-text">Country: {tweet.country}</p>
        <p className="card-text">Hashtags: {tweet.hashtags.join(', ')}</p>
        <p className="card-text">Created At: {new Date(tweet.createdAt).toLocaleString()}</p>
        {tweet.isComment ? <p className="card-text">This is a comment</p> : null}
      </div>
    </div>
  );
};

const TweetCardList = () => {

    const[TweetData,settweetData] = useState({});


    const fetch = async () => {
        
        
        try {
            var response = await axios.get(
                process.env.REACT_APP_URL+ "/tweetRoutes/tweet-v3/65b22a26a76f07d50e93acd3",
                //`${process.env.REACT_APP_URL}/userRoutes/login`, 
            
            {               // Include cookies in the request
                withCredentials: true 
            });

            var data= response.data;
            settweetData(data)
            
        } catch (error) {
            var m = error.response.data;
            alert(m.message);
            console.log(error);
        }
  
    }

    useEffect(()=>{
        fetch();
        console.log(TweetData);
    },[])

  return (
    <>
    <div> {console.log(TweetData)} </div>

    <div>
    {TweetData.tweet?.map(tweet => (
      <TweetCard key={tweet._id} tweet={tweet} />
    ))}
  </div>
  </>
  );
};

export { TweetCardList };
