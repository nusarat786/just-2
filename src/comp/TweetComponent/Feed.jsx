import React, { useEffect, useState } from 'react';
import axios from 'axios';
import TweetCard3 from './TweetCard3';
import { useParams } from 'react-router-dom';


const Feed = (props) => {

    const[TweetData,settweetData] = useState([]);
    const[id,setId] = useState(props.id);
    const[type,setType] = useState("");
    const[nodata,setNoData] = useState("");

    const[paginationData,setPaginationData] = useState({});
    const handlePge = async (pageNumber) => {
        fetch(pageNumber)
    };
    const fetch = async (pageNumber) => {
        
        
        try {
            var response = await axios.get(
                `${process.env.REACT_APP_URL}/userRoutes/feed/`+pageNumber,             
            {               // Include cookies in the request
                withCredentials: true 
            });

            var data= response.data;
            //console.log(data)
            settweetData([...TweetData,...data?.tweets])
            setNoData(data?.tweets?.length)
            setPaginationData(data.pagination)
            
        } catch (error) {
            var m = error?.response?.data;
            
            console.log(error);
            //return m?.message ? alert(m?.message) : null;
        }
  
    }

    useEffect(() => {
        fetch(1);
        //console.log(TweetData);
    }, []);

    
    

    

  return (
    <>
    

    <div>
    
    {TweetData && TweetData?.map(tweet => (<TweetCard3 key={tweet?._id}  tid={tweet?._id} uid={tweet?.user?._id} /> ))}
    

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

export { Feed };
