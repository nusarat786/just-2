import React, { useEffect, useState } from 'react';
import axios from 'axios';
import TweetCard2 from './tweetcard2';
import { useParams } from 'react-router-dom';


const TweetCardList3 = (props) => {

    const[TweetData,settweetData] = useState([]);
    const[id,setId] = useState(props.id);
    const[type,setType] = useState("");
    const[nodata,setNoData] = useState("");

    const handlePge = async (pageNumber) => {
        fetch(pageNumber)
    };
    const fetch = async (pageNumber) => {
        
        
        try {
            var response = await axios.get(
                type,
                //`${process.env.REACT_APP_URL}/userRoutes/login`,             
            {               // Include cookies in the request
                withCredentials: true 
            });

            var data= response.data;
            console.log(data)
            settweetData(data?.tweets)
            setNoData(data?.tweets?.length)

            
        } catch (error) {
            var m = error?.response?.data;
            
            console.log(error);
            return m?.message ? alert(m?.message) : null;
        }
  
    }

    useEffect(() => {
        switch (props.type) {
            case 'l':
                setType(`${process.env.REACT_APP_URL}/tweetRoutes/liked-tweets/${props.id}/1`);
                break;
            
            case 'rp':
                    setType(`${process.env.REACT_APP_URL}/tweetRoutes/comments/${props.id}/1`);
                    break;
            case 't':
                    setType(`${process.env.REACT_APP_URL}/tweetRoutes/tweets/${props.id}/1`);
                    break;
            case 'bm':
                    setType(`${process.env.REACT_APP_URL}/tweetRoutes/book-marked-tweets/1`);
                    break;     
            default:
                    setType(""); // Or set a default URL
                    break;
        }

        fetch(1);
        console.log(TweetData);
    }, [props.type, props.id,type]);

    
    

    

  return (
    <>
    <div> {console.log(TweetData)} </div>

    <div>
    
    {TweetData && TweetData?.map(tweet => (<TweetCard2 key={tweet?._id} tweet={tweet}  tid={tweet?._id} uid={tweet?.user} /> ))}
    
    {
    !nodata
        &&
        <div className="row">
            <div className="col-md-6 offset-md-3">
                <h1 className='text-center'>No Data Found </h1>
            </div>
        </div>
    }
  </div>
  </>
  );
};

export { TweetCardList3 };
