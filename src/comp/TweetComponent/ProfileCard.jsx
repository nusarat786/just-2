import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { getCookie } from '../Utility/Code';

const ProfileCard = (props) => {
  const [user, setUser] = useState({});
  const [ff, setFF] = useState("");
  const [followers, setFollowers] = useState(0);

  
  const getflag = (id,arry)=>{ 
    return arry && arry?.includes(id) ? true : false;
    }

  const fetchUser = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_URL}/userRoutes/user-detail/${props.id}`, 
        {
        withCredentials: true
      });
      const data = response.data;
      setUser(data?.userObj);
      setFF(getflag(getCookie('id'),data?.userObj?.followers))

      //setFollowers(data?.userObj)
    } catch (error) {
      console.log(error);
      if (error?.response?.data?.message){
        alert(error?.response?.data?.message);
      }
    }
  };

  useEffect(() => {
    fetchUser();
    
  }, [ff]);

  function abbreviateNumber(number) {
    if (number < 1000) {
      return number;
    } else if (number < 1000000) {
      return (number / 1000).toFixed(2) + 'K';
    } else {
      return (number / 1000000).toFixed(2) + 'M';
    }
  }

  function formatDate(timestamp) {
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      
    };
    return new Date(timestamp).toLocaleString(undefined, options);
  }

  const follow = async ()=>{
    try {
        var response = await axios.post(
            process.env.REACT_APP_URL + "/userRoutes/follow/" + props.id,
            null, // No data to send in the request body
            {
                withCredentials: true // Include cookies in the request
            }
        );

        var data = response?.data;
        //console.log(data?.tweetlikes?.includes(data?.userid));
        setFF(!ff);
        
        //console.log(f2)
        //console.log(data?.message);
        //console.log(data)
        
        //window.location.reload();
    } catch (error) {
        var m = error.response.data;
        //alert(m.message);
        console.log(error);
    }


  }
  
  return (
    

    <div className="container-fluid  f-3">
        {console.log(ff)}
      <div className="row ">
        <div className="col-md-6 offset-md-3">
          <div className="card" style={{ borderRadius: '15px' }}>
            <div className="card-body ">
              <div className="text-center">
                {user?.pimage && (
                    <img
                        src={`data:image/jpeg;base64,${user?.pimage}`}
                        className="img-fluid"
                        alt="Profile Image"
                        className="mr-3 rounded-circle"
                        style={{ width: '140px', height: '140px' }}
                        onClick={()=>{document.location.href="/user-profile/"+user._id}}
                    />
                )}
                <h5 className="mb-1">{user?.name}</h5>
                <p className="mb-2 pb-1" style={{ color: '#2b2a2a' }}>@{user?.username}</p>
              </div>

              <p className="small text-muted mb-0">Bio</p>
              <p className="mb-1">{user.bio}</p>

             

              <div className="d-flex justify-content-between mb-3">
                <div>
                  {/* Date of Birth */}
                  <p className="small text-muted mb-0">DOB</p>
                  <p className="mb-1">{formatDate(user?.dob)}</p>
                </div>
                <div>
                  {/* Joined On */}
                  <p className="small text-muted mb-0">Joined On</p>
                  <p className="mb-1">{formatDate(user?.joined)}</p>
                </div>

                <div>
                    <p className="small text-muted mb-0">Location</p>
                    <p className="mb-1">{user?.country}</p>
                </div>
              </div>

              

              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  {/* Articles */}
                  <p className="small text-muted mb-1">Articles</p>
                  <p className="mb-0">{abbreviateNumber(user?.followers ? user?.tweets?.length + user?.commented?.length : 0)}</p>
                </div>
                <div>
                  {/* Followers */}
                  <p className="small text-muted mb-1">Followers</p>
                  <p className="mb-0">{abbreviateNumber(user?.followers ? user?.followers?.length : 0)}</p>
                </div>
                <div>
                  {/* Following */}
                  <p className="small text-muted mb-1">Following</p>
                  <p className="mb-0">{abbreviateNumber(user?.followers ? user?.following?.length : 0)}</p>
                </div>
              </div>

              <div className="d-flex justify-content-center mt-3 ">
              
              {! (getCookie("id") === props.id) &&
                <button type="button" className="btn  flex-grow-1 bg-4" onClick={follow}>{ff ? "Unfollow" : "Follow"}</button>
              }  
                &nbsp;
              {(getCookie("id") === props.id) &&
                <button type="button" className="btn  flex-grow-1 bg-4" onClick={()=>{document.location.href='/update'}}>{"UPDATE  "}</button>
              }
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
