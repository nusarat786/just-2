import React, { useEffect, useState } from 'react';

import { TweetCardList3 } from './TweetD3';
import { getCookie } from '../Utility/Code';
import { type } from '@testing-library/user-event/dist/type';
import ProfileCard from './ProfileCard';
import GetHashtag from './GetHashtag';
import { Feed } from './Feed';
import { useParams } from 'react-router-dom';

const HomeGet = (props) => {
  const [selectedComponent, setSelectedComponent] = useState(props?.comp ? props.comp : 'component1');



  const { type  } = useParams();

  

 

  const handleButtonClick = (componentName) => {
    setSelectedComponent(componentName);
  };


  useEffect(()=>{
  

    if(!props?.comp){
      setSelectedComponent("component1");
      return;
    }
    setSelectedComponent(props?.comp)
  },[props])

  return (
    <div className="container-fluid">
      <style>
        {`
          .btn-menu {
            background-color: transparent !important;
            color: black !important;
            border: none !important;
            margin-right: 10px !important; /* Add spacing between buttons */
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;
            letter-spacing: 2px;
          }

          .btn-menu.active {
            border-color: rgb(29, 155, 240) !important; /* Add thick border when button is active */
            border-bottom: 2px rgb(29, 155, 240) solid  !important;
          }

          

          /* Hide the scrollbar */
          .carousel-inner {
            overflow-x: auto;
            scrollbar-width: none; /* Firefox */
            -ms-overflow-style: none; /* IE and Edge */
          }

          /* Hide scrollbar for Webkit */
          .carousel-inner::-webkit-scrollbar {
            display: none;
          }

          
        `}
      </style>
      
      

      <div className="row bg-white sm mb-10">
         <div className='button-box bg-white col-md-6 offset-md-3  mt-2 '>
            <div className="btn-group d-flex flex-row overflow-x-auto ">
              <button
                className={`btn btn-primary btn-menu ${selectedComponent === 'component1' ? 'active' : ''}`}
                onClick={() => handleButtonClick('component1')}
              >
                Following
              </button>
              <button
                className={`btn btn-primary btn-menu ${selectedComponent === 'component2' ? 'active' : ''}`}
                onClick={() => handleButtonClick('component2')}
              >
                Trending
              </button>
              
              
          </div>
        </div> 

        <div className="row mt-3">
        <div className="col">
          {selectedComponent === 'component1' && (
            <div className="component">
              <Feed/>
            </div>
          )}
          {selectedComponent === 'component2' && (
            <div className=''>
              <div className="col-md-6 offset-md-3 " >
                <div className='ml1'>
                  <GetHashtag/>
                </div>
              </div>
            </div>
          )}
          {selectedComponent === 'component3' && (
            <div className="component">
              <TweetCardList3 type="bm" id={getCookie('id')}/>
            </div>
          )}
          {selectedComponent === 'component4' && (
            <div className="component">
              <TweetCardList3 type="rp" id={getCookie('id')}/>
            </div>
          )}
          
        </div>
      </div>
    </div>



 


    </div>
  );
};

export default HomeGet;




