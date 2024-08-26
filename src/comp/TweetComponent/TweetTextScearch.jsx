import React, { useEffect, useState } from 'react';
import axios from 'axios';
import TweetCard3 from './TweetCard3';
import { useParams } from 'react-router-dom';
import LoadingSpinner from '../Utility/Loading';
import TweetCard5 from './TweetCard5';
const TweetTextScearch = (props) => {

    const[TweetData,settweetData] = useState([]);
    const[id,setId] = useState(props.id);
    const[type,setType] = useState("");
    const[nodata,setNoData] = useState("");

    const[showLoading,setshowLoading] = useState(false)
    const[paginationData,setPaginationData] = useState({});
    const[flag,setFlag] = useState(false);

    const [scearchtext , setScearchText] = useState("")


    const handlePge = async (pageNumber) => {
        handleScearc2(pageNumber);
    };

    
    const fetch = async (pageNumber) => {
        
        setshowLoading(true)
        
        try {
            var response = await axios.get(
                type+pageNumber,
                //`${process.env.REACT_APP_URL}/userRoutes/login`,             
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
            return m?.message ? alert(m?.message) : null;
        
        }finally{
            setshowLoading(false);
        }
    }

   

    const handleChange = (e) => {
        setScearchText(e.target.value);
    };

    const  handleScearc = async (e,pageNumber) => {
    
        e.preventDefault();
        setshowLoading(true)

        setNoData("");
        setFlag(false);
        
        if(!scearchtext){
            return alert('Name Can Not Be Blank')
        }


        var type = `${process.env.REACT_APP_URL}/tweetRoutes/get-tweets-v2/search/${scearchtext}/${pageNumber}`
        
        try {
            var response = await axios.get(
                type,
                //`${process.env.REACT_APP_URL}/userRoutes/user-details-v2/${scearchtext}/${pageNumber}`,
                //`${process.env.REACT_APP_URL}/userRoutes/login`,             
            {               // Include cookies in the request
                withCredentials: true 
            });

            var data= response.data;
            
            console.log(data?.paginationInfo)
            settweetData(data?.tweets)
            setNoData(data?.tweets?.length)
            setPaginationData(data?.paginationInfo)
            setFlag(true);
        } catch (error) {
            
            var m = error?.response?.data;
            
            console.log(error);
            return m?.message ? alert(m?.message) : null;
        }finally{
            setshowLoading(false)
        }
    }


    const  handleScearc2 = async (pageNumber) => {
        
        setshowLoading(true)

        var type = process.env.REACT_APP_URL+`/tweetRoutes/get-tweets-v2/search/${scearchtext}/${pageNumber}`
        
        
        
        try {
            var response = await axios.get(
                type,
                //`${process.env.REACT_APP_URL}/userRoutes/user-details-v2/${scearchtext}/${pageNumber}`,
                
                //`${process.env.REACT_APP_URL}/userRoutes/login`,             
            {               // Include cookies in the request
                withCredentials: true 
            });

            var data= response.data;
            console.log(data?.usersObj)
            settweetData([...TweetData,...data?.tweets])
            setNoData(data?.usersObj?.length)
            setPaginationData(data?.paginationInfo)
            setFlag(true)
        } catch (error) {
            var m = error?.response?.data;
            
            console.log(error);
            return m?.message ? alert(m?.message) : null;
        }finally{
            setshowLoading(false)
        }
    }

    
    

    

  return (
    <>

    <div>

    
    {showLoading &&
        <LoadingSpinner  showLoading={showLoading}/>
    }


    <div className="col-md-6 offset-md-3 mb-2 ">
        <div class="input-group ml6">
            <input onChange={handleChange} value={scearchtext} type="search" class="form-control rounded sch " placeholder="Search" aria-label="Search" aria-describedby="search-addon" />
            &nbsp;
            <button type="button" class="btn  sch" data-mdb-ripple-init onClick={(e)=>{handleScearc(e,1)}}   >search</button>
        </div>
    </div>


    { flag &&
        TweetData && TweetData?.map(tweet => (<TweetCard5 key={tweet?._id}  tid={tweet?._id} uid={tweet?.user} /> ))
    }
    
    
    {
    nodata
    &&
    <div className="row-2 m-3  ">
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
        <div className="row mt-5">
            <div className="col-md-6 offset-md-3">
                <h1 className='text-center'>No Tweet Found </h1>
            </div>
        </div>
    }


  </div>
  </>
  );
};



export { TweetTextScearch };
