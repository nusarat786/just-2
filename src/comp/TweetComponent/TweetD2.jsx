import React, { useEffect, useState } from 'react';
import axios from 'axios';
import TweetCard2 from './tweetcard2';


const TweetCardList2 = () => {

    const[TweetData,settweetData] = useState({});


    const fetch = async () => {
        
        
        try {
            var response = await axios.get(
                process.env.REACT_APP_URL+"/tweetRoutes/tweet-v3/65b22a26a76f07d50e93acd3",
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
      <TweetCard2 key={tweet._id} tweet={tweet}  tid={tweet._id} uid={tweet.user} />
    ))}
  </div>
  </>
  );
};

export { TweetCardList2 };
