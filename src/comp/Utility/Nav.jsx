import React, { useState } from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import { Link } from 'react-router-dom';
import Cookies from 'js-cookie';



const MainLayout = (props) => {
  const [isOpen, setIsOpen] = useState(false);

  const openNav = () => {
    setIsOpen(true);
  };

  const closeNav = () => {
    setIsOpen(false);
  };

  function DropdownMenu(props) {
    const { items ,name} = props; // Assuming props contains an array of objects with 'endpoint' and 'name' properties
    
    return (
      <div className="mb-3">
        <Dropdown>
          <Dropdown.Toggle id="dropdown-basic" className="bg-16 bw">
            {name}
          </Dropdown.Toggle>
  
          <Dropdown.Menu>
            {items.map((item, index) => (
              <Dropdown.Item key={index} as={Link} to={item.endpoint} className="bg-16 fs" onClick={closeNav}>
                {item.name}
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
  
        </Dropdown>
      </div>
    );
  }
  
  var link1 = [
    {
      endpoint:"/all-records",
      name:"Your Records"
    },
    {
      endpoint:"/all-records/all-tweets",
      name:"Your Tweets"
    },
    {
      endpoint:"/all-records/like-tweets",
      name:"Liked Tweets"
    },
    {
      endpoint:"/all-records/bookmark-tweets",
      name:"Book Marks"
    },
    {
      endpoint:"/all-records/replies",
      name:"Replies"
    },
    {
      endpoint:"/my-details",
      name:"My Details"
    },

  ]

  var link2 = [
    {
      endpoint:"/trending",
      name:"Home"
    },
    {
      endpoint:"/trending/trends",
      name:"Trending"
    },
    {
      endpoint:"/trending/feed",
      name:"Feed"
    },
    
  ]

  var link3 = [
    {
      endpoint:"/scearchByName",
      name:"User Scearch (Name)"
    },
    {
      endpoint:"/scearchByUserName",
      name:"User Scearch (User Name)"
    },
    {
      endpoint:"/scearchTweet",
      name:"Tweet Scearch (Text)"
    },
  ]


  const logout = () => {
    // Get all cookies
    const cookies = document.cookie.split(";");
  
    // Iterate over each cookie and delete it
    cookies.forEach(cookie => {
      const cookieName = cookie.split("=")[0].trim();
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    });

    closeNav();
    document.location.href="/login"
  }
  
  function goBack() {
    window.history.back();
  }


         
            
  return (
    
    <div className="container-fluid nav-own">
      <div className="row ">
        <div className="col-md-6 offset-md-3 col-sm-10 offset-sm-1 col-xs-10 offset-xs-1  border-main">
          <div>
            <style>
              {`
                #mySidenav{
                  z-index:99999;
                }
                
                .sidenav {
                  height: 100%;
                  width: 0;
                  position: fixed;
                  z-index: 1;
                  top: 0;
                  left: 0;
                  background-color:  #f3f3f3 !important;;
                  overflow-x: hidden;
                  transition: 0.5s;
                  padding-top: 60px;
                  text-align: center;
                }

                .sidenav a {
                  padding: 8px 8px 8px 32px;
                  text-decoration: none;
                  font-size: 25px;
                  color: #818181;
                  display: block;
                  transition: 0.3s;
                }

                .sidenav a:hover {
                  color: #f1f1f1;
                }

                .sidenav .closebtn {
                  position: absolute;
                  top: 0;
                  right: 25px;
                  font-size: 36px;
                  margin-left: 50px;
                }

                .closebtn{
                  cursor: pointer;

                }

                @media screen and (max-height: 450px) {
                  .sidenav {
                    padding-top: 15px;
                  }
                  .sidenav a {
                    font-size: 18px;
                  }
                }
              `}
            </style>
            
            <div
              id="mySidenav"
              className="sidenav"
              style={{ width: isOpen ? '100%' : '0' }}
            >
            
              <i class="fa-solid fa-xmark bg-icon closebtn" onClick={closeNav}></i>
              
            {props.islogined &&
              <>
              <DropdownMenu className={""} items={link2} name={"Tweets"}/>
  
              <DropdownMenu className={""} items={link3} name={"Scearch"}/>

              <DropdownMenu className={""} items={link1} name={"Mange Account"}/>
              
              <Dropdown.Toggle id="dropdown-basic" className="bg-16 bw" onClick={logout}>
                LOGOUT
              </Dropdown.Toggle>
              </>
            }

          {!props.islogined &&
            <>

              <Dropdown.Toggle id="dropdown-basic" className="bg-16 bw" onClick={()=>{document.location.href="/login"}}>
                Login
              </Dropdown.Toggle>

              <br></br>
              <br></br>
              
              <Dropdown.Toggle id="dropdown-basic" className="bg-16 bw" onClick={()=>{document.location.href="/register"}}>
                Register
              </Dropdown.Toggle>
              

            </>
          }


            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-6 offset-md-3 col-sm-10 offset-sm-1 col-xs-10 offset-xs-1">
{/*         
        <div className='display'>
          <span
            style={{ fontSize: '30px', cursor: 'pointer' }}
            onClick={openNav}
          >
            &#9776; open
          </span>

          <span
            style={{ fontSize: '30px', cursor: 'pointer' }}
            onClick={()=>{window.location.href='/tweet'}}
          >
            &#9776; open
          </span>

          <span
            style={{ fontSize: '30px', cursor: 'pointer' }}
            onClick={()=>{window.location.href='/tweet'}}
          >
            &#9776; open
          </span>
        </div>
           */}

        <div class="d-flex justify-content-between">
          <div class="p-2 bd-highlight">
            <i class="fa-solid fa-arrow-left bg-icon" onClick={goBack} ></i>  &nbsp;
            <i class="fa-solid fa-bars bg-icon" onClick={openNav}></i>
          </div>
          <div class="p-2 bd-highlight ">
            <i class="fa-solid  bg-icon"> HNH</i>
          </div>
          
          <div class="p-2 bd-highlight">
            <i class="fa-brands fa-twitter bg-icon" onClick={()=>{window.location.href='/tweet'}}></i>
          </div>
        </div>


            
           
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
