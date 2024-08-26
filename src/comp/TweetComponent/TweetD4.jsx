import React, { useEffect, useState } from 'react';
import axios from 'axios';
import TweetCard2 from './tweetcard2';
import { useParams } from 'react-router-dom';
import "./index.css"
import Reply from './Reply';
import { Comments2 } from './Comments 2';
import TweetCard3 from './TweetCard3';
import TweetCard5 from './TweetCard5';
const TweetCardList4 = (props) => {

    const[id,setId] = useState(props.id);
    const[type,setType] = useState("");
    const[nodata,setNoData] = useState("");
    const [dataLoaded, setDataLoaded] = useState(false);

    

    const { tid } = useParams();
    const[TweetData,settweetData] = useState([]);
    var count = 0;


    // Function to scroll smoothly to the element with the specified ID
    const scrollToElement = (elementId, additionalPixels) => {
        const element = document.getElementById(elementId);
        if (element) {
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest',
            // Adjust scroll position by adding additional pixels
            // Change the value of additionalPixels as needed
            offset: additionalPixels,
          });
        }
      };

    const fetch = async () => {
        
        
        try {
            var response = await axios.get(
                process.env.REACT_APP_URL+"/tweetRoutes/tweet-v3/"+tid,
                //`${process.env.REACT_APP_URL}/userRoutes/login`, 
            
            {               // Include cookies in the request
                withCredentials: true 
            });

            var data= response.data;
            settweetData(data?.tweet)

            if(data?.tweet?.length){
                setNoData(true);
                // Call the function to scroll to the desired element after the component mounts
                //scrollToElement(data?.tweet?.length,0);
            }else{
                setNoData(false);
            }

            setDataLoaded(true);
            
        } catch (error) {
            var m = error.response.data;
            alert(m.message);
            console.log(error);

        }
  
    }

    
    useEffect(() => {
        const scrollTimeout = setTimeout(() => {
            window.scrollTo(0, document.body.scrollHeight-1000); // Scrolls to 400 pixels from the top
        }, 1200);

        return () => clearTimeout(scrollTimeout);
    }, []);
      

    useEffect(()=>{
        fetch();
       // console.log(TweetData);
    },[])

    useEffect(() => {
        // Scroll to the desired element once all data is loaded
        if (dataLoaded) {
          //
        }
      }, [dataLoaded ,TweetData]);

    
    

    

  return (
    <>
    <div> {console.log(nodata)} </div>
    <div>
    
    {TweetData && TweetData?.map(tweet => (

    <div>
        <TweetCard5 key={tweet?._id} tweet={tweet}  tid={tweet?._id} uid={tweet?.user}   /> 
        <div className="d-flex justify-content-center align-items-center" style={{height: "5rem"}}>
            <div className="vr text-center bg-9" id={++count}  ></div>  
        </div>
    </div>
    ))}

    {
    
    nodata
    &&
    <div className="row-2 m-3 mt-0">
        <Reply tid={tid}/> 
    </div>
    
    }

    <div className="row-2">
        <div className="col-md-6 offset-md-3" >
            <p className='bg-1 text-center mb-2'>Comments</p>
        </div>
    </div>
    
    <Comments2 tid={tid}/>



   

    
    

    </div>

    {
    !nodata
    &&
        <div className="row-2">
            <div className="col-md-6 offset-md-3" >
                <h1 className='text-center'>No Data Found </h1>
            </div>
        </div>
    }
    
  </>
  );
};

export { TweetCardList4 };
