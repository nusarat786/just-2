import React, { useEffect, useState } from 'react';
import axios from 'axios';
import TweetCard3 from './TweetCard3';
import { useParams } from 'react-router-dom';
import ProfileCard2 from './ProfileCard2';
import LoadingSpinner from '../Utility/Loading';

const UserList = (props) => {

    const[UserData,setUserData] = useState([]);
    const[id,setId] = useState(props.id);
    const[nodata,setNoData] = useState("");
    const[TweetData,settweetData] = useState([]);
    const[showLoading,setshowLoading] = useState(false)


    const [scearchtext , setScearchText] = useState("")
    const[flag,setFlag] = useState(false);

    const[paginationData,setPaginationData] = useState({});
    const handlePge = async (pageNumber) => {
        handleScearc2(pageNumber);
    };

   
    
    

    const  handleScearcp = async (e,pageNumber) => {
        
        
        setNoData("");
        setFlag(false);

        if(!scearchtext){
            return alert('Name Can Not Be Blank')
        }

        console.log(scearchtext)
        e.preventDefault();
        try {
            var response = await axios.get(
                `${process.env.REACT_APP_URL}/userRoutes/user-details-v2/${scearchtext}/${pageNumber}`,
                //`${process.env.REACT_APP_URL}/userRoutes/login`,             
            {               // Include cookies in the request
                withCredentials: true 
            });

            var data= response.data;
            console.log(data)
            console.log(data?.usersObj?.length)
            console.log(data?.paginationInfo)
            console.log(data?.usersObj[0]?._id);
            setUserData(data?.usersObj)
            setNoData(data?.usersObj?.length)
            setPaginationData(data?.paginationInfo)
            setFlag(true);
        } catch (error) {
            
            var m = error?.response?.data;
            
            console.log(error);
            return m?.message ? alert(m?.message) : null;
        }
    }

    const  handleScearc2 = async (pageNumber) => {
        
        setshowLoading(true)

        var type = '' ;
        
        switch (props.type) {
            case 'SN':
                type=(`${process.env.REACT_APP_URL}/userRoutes/user-details-v2/${scearchtext}/${pageNumber}`);
                break;

            case 'SUN':
                type=(`${process.env.REACT_APP_URL}/userRoutes/user-details-v2/${'@'+scearchtext}/${pageNumber}`);
                break;    
            default:
                type=(`${process.env.REACT_APP_URL}/userRoutes/user-details-v2/${scearchtext}/${pageNumber}`);
                break;
            }
        
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
            setUserData([...UserData,...data?.usersObj])
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


    const  handleScearc = async (e,pageNumber) => {
    
        e.preventDefault();
        setshowLoading(true)

        setNoData("");
        setFlag(false);
        
        if(!scearchtext){
            return alert('Name Can Not Be Blank')
        }


        var type = ''
        
        switch (props.type) {
            case 'SN':
                type=(`${process.env.REACT_APP_URL}/userRoutes/user-details-v2/${scearchtext}/${pageNumber}`);
                break;

            case 'SUN':
                type=(`${process.env.REACT_APP_URL}/userRoutes/user-details-v2/${'@'+scearchtext}/${pageNumber}`);
                break;    
            default:
                type=(`${process.env.REACT_APP_URL}/userRoutes/user-details-v2/${scearchtext}/${pageNumber}`);
                break;
            }

        
        try {
            var response = await axios.get(
                type,
                //`${process.env.REACT_APP_URL}/userRoutes/user-details-v2/${scearchtext}/${pageNumber}`,
                //`${process.env.REACT_APP_URL}/userRoutes/login`,             
            {               // Include cookies in the request
                withCredentials: true 
            });

            var data= response.data;
            console.log(data)
            console.log(data?.usersObj?.length)
            console.log(data?.paginationInfo)
            console.log(data?.usersObj[0]?._id);
            setUserData(data?.usersObj)
            setNoData(data?.usersObj?.length)
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
        
    
    
    const handleChange = (e) => {
        setScearchText(e.target.value);
    };

    

  return (
    <>
    
    {showLoading &&
        <LoadingSpinner  showLoading={showLoading}/>
    }

    <div>


    <div className="col-md-6 offset-md-3 mb-2">
        <div class="input-group ml6">
            <input onChange={handleChange} value={scearchtext} type="search" class="form-control rounded sch " placeholder="Search" aria-label="Search" aria-describedby="search-addon" />
            &nbsp;
            <button type="button" class="btn  sch" data-mdb-ripple-init onClick={(e)=>{handleScearc(e,1)}}  >search</button>
        </div>
    </div>

    

    { flag &&
    UserData && UserData?.map(tweet => {
        console.log(tweet)
        return <ProfileCard2 key={tweet?._id}  tid={tweet?._id} uid={tweet?._id} />} )
    }

    {console.log(UserData[0]?._id)}

    
    {
    nodata
    &&
    <div className="row-2 m-3 ">
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
            <div className="col-md-6 offset-md-3 mt-5">
                <h1 className='text-center'>No User Found </h1>
            </div>
        </div>
    }
  </div>
  </>
  );
};

export { UserList };
