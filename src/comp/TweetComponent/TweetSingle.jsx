import React from "react";
import { useEffect ,useState } from "react";
import { Redirect } from "react-router-dom"; // Assuming you are using React Router
import { useParams } from 'react-router-dom';
import axios from "axios";


import TweetCard2 from './tweetcard2';


function TweetSingle(){

    const { tid } = useParams();

    const[TweetData,settweetData] = useState({});


    const fetch = async () => {
        
        
        try {
            var response = await axios.get(
                process.env.REACT_APP_URL+"/tweetRoutes/tweet-v3/"+tid,
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
    




    return(
        
        <>
        <div className="">
            {console.log(TweetData)}
            {TweetData.tweet?.map(tweet => (
                <TweetCard2 key={tweet._id} tweet={tweet}  tid={tweet._id} uid={tweet.user} />
            ))}
        </div>
        </>
    
    )
}

export default TweetSingle