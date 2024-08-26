import React, { useState } from 'react';

import { TweetCardList3 } from './TweetD3';
import { getCookie } from '../Utility/Code';
import { type } from '@testing-library/user-event/dist/type';
import ProfileCard from './ProfileCard';
import { useEffect } from 'react';
import ProfileCard2 from './ProfileCard2';
import { UserList } from './UserList';
import { TweetTextScearch } from './TweetTextScearch';

const ScaerchUser = (props) => {

  const [selectedComponent, setSelectedComponent] = useState(props?.comp ? props.comp : 'component1');

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

      
      const scrollTimeout = setTimeout(() => {
            window.scrollTo(0, 500); // Scrolls to 400 pixels from the top
      }, 1200);

      // handle change in input filed
      useEffect(()=>{

   
      if(!props?.comp){
        setSelectedComponent("component1");
        return;
      }

      switch(props?.comp) {
        case "component2":
          setSelectedComponent("component2");
          return () => clearTimeout(scrollTimeout);
          
        case "component3":
          setSelectedComponent("component3")
          return () => clearTimeout(scrollTimeout);
        case "component4":
          setSelectedComponent("component4")
          return () => clearTimeout(scrollTimeout);
        default:
          setSelectedComponent("component1")
          return () => clearTimeout(scrollTimeout);
          // code block
      }

  },[props])
  
  const handleButtonClick = (componentName) => {
    setSelectedComponent(componentName);
  };

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
                Scearch (N)
              </button>
              <button
                className={`btn btn-primary btn-menu ${selectedComponent === 'component2' ? 'active' : ''}`}
                onClick={() => handleButtonClick('component2')}
              >
                Scearch (UN)
              </button>
              <button
                className={`btn btn-primary btn-menu ${selectedComponent === 'component3' ? 'active' : ''}`}
                onClick={() => handleButtonClick('component3')}
              >
                Scearch Tweet
              </button>
            </div>
        </div> 

        <div className="row mt-3">
        <div className="col" id='bbb'>
          {selectedComponent === 'component1' && (
            <div className="component">
                <UserList type="SN" id={getCookie('id')} islogined={props?.islogined}/>
            </div>
          )}
          {selectedComponent === 'component2' && (
            <div className="component">
                <UserList type="SUN" id={getCookie('id')} islogined={props?.islogined}/>
            </div>
          )}
          {selectedComponent === 'component3' && (
            <div className="component">
              <TweetTextScearch type="bm" id={getCookie('id')} islogined={props?.islogined}/>
            </div>
          )}
          
          
        </div>
      </div>
        

      </div>



    </div>
  );
};

export default ScaerchUser;