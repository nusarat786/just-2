import React, { useEffect, useState } from 'react';
import axios from 'axios';
import TweetCard3 from './TweetCard3';
import { useParams } from 'react-router-dom';
import "./index.css"
import Reply from './Reply';

const Comments2 = (props) => {

    const[id,setId] = useState(props.id);
    const[type,setType] = useState("");
    const[nodata,setNoData] = useState("");
    const [dataLoaded, setDataLoaded] = useState(false);
    //const[page,setPage] = useState(1)
    const[paginationData,setPaginationData] = useState({})
    

    const { tid  } = useParams();
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

      const handlePge = async (pageNumber) => {
          fetch(pageNumber)
      };
    

    const fetch = async (page) => {
        
        
        try {
            var response = await axios.get(

                //`${process.env.REACT_APP_URL}/userRoutes/login`, 
                process.env.REACT_APP_URL+"/tweetRoutes/tweet-comments/"+props?.tid+"/"+page,
            
            {               // Include cookies in the request
                withCredentials: true 
            });

            var data= response.data;
            settweetData([...TweetData, ...data?.comments]);

            setPaginationData(data?.pagination);
            console.log(data?.pagination);

            if(data?.comments?.length){
                setNoData(true);
                // Call the function to scroll to the desired element after the component mounts
                //scrollToElement(data?.tweet?.length,0);
            }else{
                setNoData(false);
            }

            setDataLoaded(true);

            
        } catch (error) {
            var m = error.response.data;
            //alert(m.message);
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
    
    

    

  return (
    <>
    <div> {console.log(nodata)} </div>
    <div>
    
    {TweetData && TweetData?.map(tweet => (

    <div id={++count +"tweet"}>
        <TweetCard3 key={tweet?._id}  tid={tweet?._id} uid={tweet?.user?._id}   /> 
        
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
                <h1 className='text-center'>No Comment Found </h1>
            </div>
        </div>
    }
    
  </>
  );
};

export { Comments2 };
