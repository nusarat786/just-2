import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, Redirect, Link } from 'react-router-dom';
import Login from "./comp/AuthComponents/Login";
import Home from './comp/TweetComponent/Home';
import Tweet from './comp/TweetComponent/Tweet';
import Register from './comp/AuthComponents/Register';
import { isLogined } from './comp/Utility/Code';
import TweetByUserId from './comp/TweetComponent/TweetByUserId';
import { TweetCardList } from './comp/TweetComponent/TweetD';

import TweetCard from './comp/TweetComponent/tweetcard';
import { TweetCardList2 } from './comp/TweetComponent/TweetD2';
import TwitterMenuSlider from './comp/TweetComponent/TwitterMenuSlider'
import ProfileCard from './comp/TweetComponent/ProfileCard';
import TweetSingle from './comp/TweetComponent/TweetSingle';
import { TweetCardList4 } from './comp/TweetComponent/TweetD4';
import { Comments } from './comp/TweetComponent/Comments';
import { Comments2 } from './comp/TweetComponent/Comments 2';
import HomeGet from './comp/TweetComponent/HomeGet';
import GetHastagsTweet from './comp/TweetComponent/GetHastagsTweet';
import MainLayout from './comp/Utility/Nav';
import { getCookie } from './comp/Utility/Code';
import './nav.css'
import './index.css'
import ForgetPassword from './comp/AuthComponents/ForgetPassword';
import ScaerchUser from './comp/TweetComponent/ScaerchUser';
import ProfileCard3 from './comp/TweetComponent/ProfileCard3'; 
import TwitterMenuSliderUser from './comp/TweetComponent/TwitterMenuSliderUser';
import Update from './comp/AuthComponents/Update';

function App() {
  const [islogined, setIsLogined] = useState(isLogined());

  useEffect(() => {
    setIsLogined(isLogined());
  }, []);

  

  return (
    <>
    
    <Router>

      <div className='m-10 '>
        <MainLayout islogined={islogined}/>
      </div>
      <br></br>
      <br></br>
      <br></br>
      <Routes>
        {console.log(islogined)}

          <Route path='/login' element={<Login islogined={islogined}/>} />
          <Route path='/register' element={<Register islogined={islogined} />} />
          <Route path='/forget-password' element={<ForgetPassword  islogined={islogined}/>} />
          

          {islogined ? (
                      <>
            
                      <Route path='/tweet' element={<Tweet islogined={islogined}/>} />
                      <Route path='/update' element={<Update id={getCookie("id")} islogined={islogined}/>}/>
                      
                      
                      <Route path='/mytweet' element={<TweetByUserId islogined={islogined}/>} />
                      <Route path='/gettweet' element={<TweetCardList   islogined={islogined}/>} />
                      <Route path='/tweet-card' element={<TweetCard  islogined={islogined}/>} />
                      <Route path='/gettweet2' element={<TweetCardList2  islogined={islogined}/>} />
                      <Route path='/profile' element={<ProfileCard  islogined={islogined}/>} />
                      <Route path='/single-tweet/:tid' element={<TweetCardList4  islogined={islogined}/>} />
                      <Route path='/getComments/:tid' element={<Comments  islogined={islogined}/>} />
                      <Route path='/getComments2/:tid' element={<Comments2  islogined={islogined}/>} />
                      
                    
                      {/*  slider */}
                      <Route path='/all-records' element={<TwitterMenuSlider  islogined={islogined}/>} />
                      <Route path='/all-records/all-tweets' element={<TwitterMenuSlider  islogined={islogined} comp={"component1"}/>} />
                      <Route path='/all-records/like-tweets' element={<TwitterMenuSlider  islogined={islogined} comp={"component2"}/>} />
                      <Route path='/all-records/bookmark-tweets' element={<TwitterMenuSlider  islogined={islogined} comp={"component3"}/>} />
                      <Route path='/all-records/replies' element={<TwitterMenuSlider  islogined={islogined} comp={"component4"}/>} />
                      <Route path='/my-details' element={<ProfileCard  islogined={islogined} id={getCookie('id')}/>} />
                      
                      
                      {/* Trndings */}
                      <Route path='/trending/' element={<HomeGet  islogined={islogined} />} />
                      <Route path='/trending/trends' element={<HomeGet  islogined={islogined} comp ={'component2'}/>} />
                      <Route path='/trending/feed' element={<HomeGet  islogined={islogined}  comp ={'component1'}/>} />
                      <Route path='/hashTagScearch/:hashtag' element={<GetHastagsTweet  islogined={islogined}/>} />
                      
          
          
                      <Route path='/forget-password' element={<ForgetPassword  islogined={islogined}/>} />
          
                      <Route path='/scearchByName' element={<ScaerchUser  islogined={islogined}  comp ={'component1'}/>} />
                      <Route path='/scearchByUserName' element={<ScaerchUser  islogined={islogined}  comp ={'component2'}/>} />
                      <Route path='/scearchTweet' element={<ScaerchUser  islogined={islogined}  comp ={'component3'}/>} />
                      
                      
                      <Route path='/user-profile/:id' element={<TwitterMenuSliderUser  islogined={islogined} />} />
                      <Route path='*' element={<HomeGet islogined={islogined}/>} />
                      
                    </>
          ) : (
              // Your else content here, for example, a redirect to login page
              <Route path='*' element={<Login islogined={islogined}/>} />
          )}

          
          
      </Routes>
      
    </Router>

  
    </>
  );
}

export default App;
