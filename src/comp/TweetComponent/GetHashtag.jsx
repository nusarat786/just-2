import React, { useEffect, useState } from 'react';
import axios from 'axios';
import TweetCard3 from './TweetCard3';
import { useParams } from 'react-router-dom';
import "./index.css"
import Reply from './Reply';

const GetHashtag = (props) => {

    const[id,setId] = useState(props.id);
    const[type,setType] = useState("");
    const[nodata,setNoData] = useState("");
    const [dataLoaded, setDataLoaded] = useState(false);
    //const[page,setPage] = useState(1)
    const[paginationData,setPaginationData] = useState({})
    

    const { tid  } = useParams();
    const[hashtagData,setHashTag] = useState([]);
    var count = 0;


 
    const fetch = async (page) => {
        
        
        try {
            var response = await axios.get(

                `${process.env.REACT_APP_URL}/tweetRoutes/trending-hashtags`, 
                
            
            {               // Include cookies in the request
                withCredentials: true 
            });

            var data= response.data;
            setHashTag(data?.trendingHashtags);
            setNoData(data?.trendingHashtags?.length)
            setDataLoaded(true);
 
        } catch (error) {
            var m = error.response.data;
            alert(m.message);
            console.log(error);

        }
  
    }

    
    
  
    useEffect(()=>{
        
        fetch(1);
        //document.location.reload();
       // console.log(TweetData);
    },[])

    useEffect(()=>{
        //scrollToElement("1tweet",25)
    },[])
    
    function getTweets(hashtag){
        document.location.href = `/hashTagScearch/${hashtag}`;
    }

    

  return (
    <>
    
    <div>
    
    {
    hashtagData && hashtagData?.map(h => (
    <div id={++count +"hash"} className={"bg-15 mb-2 cp"} onClick={()=>{getTweets(h?.hashtag?.substring(1))}}  >
        <p className='ml1'> {h?.hashtag} </p>
    </div>
    ))
    }

  
</div>

    {
    !nodata
    &&
        <div className="row-2" >
            <div className="col-md-6 offset-md-3" >
                <h1 className='text-center'>No Hash Tag Found </h1>
            </div>
        </div>
    }
    
  </>
  );
};

export default GetHashtag ;
