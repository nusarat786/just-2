import React, { useEffect, useState } from 'react';
import axios from 'axios';
import TweetCard3 from './TweetCard3';
import TweetCard5 from './TweetCard5';
import { useParams } from 'react-router-dom';
import "./index.css"
import Reply from './Reply';

const GetHastagsTweet = (props) => {


    const[nodata,setNoData] = useState("");
    const[paginationData,setPaginationData] = useState({})
    const { hashtag  } = useParams();
    const[TweetData,settweetData] = useState([]);
    var count = 0;

    
    const handlePge = async (pageNumber) => {
          fetch(pageNumber)
      };
    

    const fetch = async (page) => {
        
        try {
            var response = await axios.get(
                `${process.env.REACT_APP_URL}/tweetRoutes/get-tweets-v2/${hashtag}/${page}`, 
            {               // Include cookies in the request
                withCredentials: true 
            });

            var data= response.data;
            settweetData([...TweetData, ...data?.tweets]);

            setPaginationData(data?.paginationInfo);
            console.log(data?.paginationInfo);

            if(data?.tweets?.length){
                setNoData(true);
                // Call the function to scroll to the desired element after the component mounts
                //scrollToElement(data?.tweet?.length,0);
            }else{
                setNoData(false);
            }

        } catch (error) {

            var m = error?.response?.data;
            //alert(m?.message);
            console.log(error);
        }

    }

    
    
    
    useEffect(()=>{
        
        fetch(1);
        //document.location.reload();
       // console.log(TweetData);
    },[])
    
    
    return (
        <>
        {console.log(TweetData)}
        <div> {console.log(nodata)} </div>
        <div>
        
        <div className='container-fluid'>
            <div className="col-md-6 offset-md-5 col-sm-10 offset-sm-1 col-xs-10 offset-xs-1">
                <h4 className='bg-1'>Trending Tweets With Hash Tag : {hashtag}</h4>
            </div>
        </div>

        {TweetData && TweetData?.map(tweet => (
            
        <div id={++count +"tweet"}>
            <TweetCard5 key={tweet?._id}  tid={tweet?._id} uid={tweet?.user}   />  
        </div>
        
        ))}

        { 

        nodata
        &&
        <div className="row-2 m-3 mt-0">
            <nav aria-label="Page navigation example">
            <ul className="pagination justify-content-center">
            <li className={"page-item" + (paginationData.currentPage === paginationData.totalPages ? " disabled" : "")}>
                <button className="page-link  b-primary-2" onClick={() => handlePge(paginationData.currentPage + 1)} aria-label="Next" disabled={paginationData.currentPage === paginationData.totalPages}>
                <span aria-hidden="true">Load More &raquo; </span>
                </button>
            </li>
            </ul>
        </nav>
        </div>

        }

    </div>

        {
            !nodata
            &&
                <div className="row-2">
                    <div className="col-md-6 offset-md-3" >
                        <h1 className='text-center'>No Tweet Found </h1>
                    </div>
                </div>
            }
            
            </>
            );
        };

export default  GetHastagsTweet ;
