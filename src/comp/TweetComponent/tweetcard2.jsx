import React, { useEffect, useState } from 'react';
import { NavLink,Link, redirect } from 'react-router-dom';
import axios from 'axios';
import {getCookie} from '../Utility/Code';

const TweetCard2 = (props) => {


    
        const getflag = (id,arry)=>{
            
            return arry && arry?.includes(id) ? true : false;
        }
        const[user,setUser]   = useState({}); 
        const[tweet,setTweet] = useState({});

        const[userId,setId] = useState("");
        const[f1,setF1] = useState("");
        const[f2,setF2] = useState("");
        const[f3,setF3] = useState("");
        
        const[Like,setLike]=useState(props?.tweet?.likes ? props?.tweet?.likes.length : 0);
        const[Bookmarks,setBookmarks]=useState(props?.tweet?.bookmarks ? props?.tweet?.bookmarks.length : 0);
        const[Retweet,setRetweet]=useState(props?.tweet?.reposts ? props?.tweet?.reposts.length : 0);

        const fetch1 =async ()=>{

            try {
                var response = await axios.get(
                    process.env.REACT_APP_URL+"/userRoutes/user-detail/" + props?.uid ,
                    //`${process.env.REACT_APP_URL}/userRoutes/login`, 
                {               // Include cookies in the request
                    withCredentials: true 
                });
    
                var data= response.data;
                setUser(data);
                console.log(data?.userObj)
                console.log(props?.tweet?._id + " ------------------ " + data?.userObj?.liked)
                setF1(getflag(props?.tweet?._id,data?.userObj?.liked))
                setF2(getflag(props?.tweet?._id,data?.userObj?.bookmarked))
                setF3(getflag(props?.tweet?._id,data?.userObj?.reposted))

                
                
                
            } catch (error) {
                var m = error.response.data;
                alert(m.message);
                console.log(error);
            }


        }





        useEffect(() => {
            const fetchData = async () => {
                try {

                    //console.log(`${process.env.REACT_APP_URL}/userRoutes/user-detail/${tweet?.user}`);
                    const { tweet } = props;
                    
                    const response = await axios.get(`${process.env.REACT_APP_URL}/userRoutes/user-detail/${getCookie('id')}`, {
                        withCredentials: true 
                    });

                    const { userObj } = response.data;
                    setUser(userObj);
                    console.log(userObj);
                    console.log(`${tweet?._id} ------------------ ${userObj?.liked}`);
                    const likedFlag = getflag(props.tid, userObj?.liked);
                    const bookmarkedFlag = getflag(props.tid, userObj?.bookmarked);
                    const repostedFlag = getflag(props.tid, userObj?.reposted);

                    setF1(likedFlag);
                    setF2(bookmarkedFlag);
                    setF3(repostedFlag);

                    var response2 = await axios.get(
                        `${process.env.REACT_APP_URL}/tweetRoutes/tweet/${props?.tid}`,
                        //`${process.env.REACT_APP_URL}/userRoutes/login`, 
                    {               // Include cookies in the request
                        withCredentials: true 
                    });
        
                    var data2= response2?.data;
                    
                    setTweet(data2.tweet);



                } catch (error) {
                    const errorMessage = error.response?.data?.message || "An error occurred";
                    alert(errorMessage);
                    console.error("Fetch Error:", error);
                }
            };
        
            fetchData();
        }, []); // Empty dependency array to ensure this effect runs only once after mounting
        


        


        const retweet = async () => {
            try {
                var response = await axios.post(
                    process.env.REACT_APP_URL + "/tweetRoutes/repost-v2/" + props?.tweet?._id,
                    null, // No data to send in the request body
                    {
                        withCredentials: true // Include cookies in the request
                    }
                );
        
                var data = response?.data;
                console.log(data)
                //console.log(data?.tweetlikes?.includes(data?.userid));
                setF3(getflag(props?.tid,data?.userreposted));
                setRetweet(data?.tweetreposts?.length);
                //console.log(f2)
                //console.log(data?.message);
                //console.log(data)
                
                //window.location.reload();
            } catch (error) {
                var m = error?.response?.data;
                alert(m?.message);
                console.log(error);
            }
        };



        const bookmark = async () => {

            
            try {
                var response = await axios.post(
                    process.env.REACT_APP_URL + "/tweetRoutes/book-mark/" + props?.tweet?._id,
                    null, // No data to send in the request body
                    {
                        withCredentials: true // Include cookies in the request
                    }
                );
        
                var data = response?.data;
                console.log(data)
                //console.log(data?.tweetlikes?.includes(data?.userid));
                setF2(getflag(props?.tid,data?.userbookmarked));
                setBookmarks(data?.tweetbookmarks?.length);
                //console.log(f2)
                //console.log(data?.message);
                //console.log(data)
                
                //window.location.reload();
            } catch (error) {
                var m = error?.response?.data;
                alert(m?.message);
                console.log(error);
            }
        };


        const like = async () => {
            try {
                var response = await axios.post(
                    process.env.REACT_APP_URL + "/tweetRoutes/like/" + props?.tweet?._id,
                    null, // No data to send in the request body
                    {
                        withCredentials: true // Include cookies in the request
                    }
                );
        
                var data = response?.data;
                //console.log(data?.tweetlikes?.includes(data?.userid));
                setF1(getflag(props?.tid,data?.userliked));
                setLike(data?.tweetlikes?.length);
                //console.log(f2)
                //console.log(data?.message);
                //console.log(data)
                
                //window.location.reload();
            } catch (error) {
                var m = error.response.data;
                alert(m.message);
                console.log(error);
            }
        };

        
        
        const comment = () => {
            
        };

        function abbreviateNumber(number) {
            if (number < 1000) {
            return number;
            } else if (number < 1000000) {
            // Convert to thousands (K)
            return (number / 1000).toFixed(2) + 'K';
            } else {
            // Convert to millions
            return (number / 1000000).toFixed(2) + 'M';
            }
        }

        function timestampToLocalTime(timestamp) {
            // Create a new Date object with the timestamp (in milliseconds)
            const date = new Date(timestamp * 1000); // Convert seconds to milliseconds
        
            console.log(date);
            // Get the local date and time components
            const localDate = date.toLocaleDateString();
            const localTime = date.toLocaleTimeString();
        
            // Return the local date and time
            return `${localDate} ${localTime}`;
        }

        function formatDate(timestamp) {
            const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
            };
            return new Date(timestamp).toLocaleString(undefined, options);
        }


        const formatHashtags = (text) => {

            
            // Regular expression to match hashtags (#word)
            const hashtagRegex = /#(\w+)/g;

            // Replace hashtags with clickable links
            return text.split(hashtagRegex).map((part, index) => {
            if (part.match(hashtagRegex)) {
                // If part is a hashtag, create an anchor tag
                const hashtag = part.substring(1); // Remove '#' symbol
                const url = `/search?q=${hashtag}`;
                return (
                <a href={url} key={index} style={{ backgroundColor: 'blue', color: 'white', textDecoration: 'none', padding: '0.2rem' }}>
                    {part}
                </a>
                );
            } else {
                // If part is not a hashtag, return it as plain text
                return part;
            }
            });
        };

        const getHashtags = (text) => {
            
            // Regular expression to match hashtags (#word)
            const hashtagRegex = /#(\w+)/g;
        
            // Find all hashtags in the text
            const hashtags = text.match(hashtagRegex);
        
            // Create a Set to store unique hashtags
            const uniqueHashtags = new Set();
        
            // Add hashtags to the Set
            hashtags && hashtags.forEach(hashtag => uniqueHashtags.add(hashtag.substring(1)));
        
            // Convert the Set back to an array
            return [...uniqueHashtags];
        };

        const gettweet = () => {
            // Assuming you're using React Router for navigation
            window.location.href = "/single-tweet/" +props.tid;
            return ;
          }

        
        
        
        
  return (
    
    <div className="container" >
        {console.log(f1 + "  " + f2 + "  " + f3)}
        
      <div className="row ">
        <div className="col-md-6 offset-md-3 col-sm-10 offset-sm-1 col-xs-10 offset-xs-1">
          <div className="tweet-card d-flex align-items-start">
            <img src="https://via.placeholder.com/50" className="mr-3 rounded-circle" alt="Twitter Profile Picture" />
            
            <div className="media-body m-l"  >
              <span className="user-info">
                <h5 className="m-0">{user?.name}</h5>
                <p>@{user?.username}</p>
              </span>
              <p onClick={gettweet} className='cl  '>{tweet?.text}</p>
              
              
              <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                    {getHashtags(props?.tweet?.text)?.map((hashtag, index) => (
                    <Link to={`/search?q=${hashtag}`} key={index} style={{ color: 'rgba(29, 161, 242, 1)', textDecoration: 'none', padding: '0.2rem', marginRight: '0.5rem' }}>
                        #{hashtag}
                    </Link>
                    ))}
              </div>

              <p className="text-muted"> {formatDate(tweet?.createdAt)}</p>

              
 
              {tweet?.timage &&
                <img src="https://via.placeholder.com/300" className="img-fluid" alt="Tweet Image" />
              }

              

              <div className="actions ">
                <button type="button" className="btn btn-link bg-1 " onClick={retweet}>
                  <i className={"p-1 bg-1 fas fa-retweet "  + (f3 ? "bg-2" : "bg-1")}></i> {abbreviateNumber(Retweet)}
                </button>
                <button type="button" className="btn btn-link bg-1 " onClick={like}>
                  <i className={"p-1 fas fa-heart " + (f1 ? "bg-2" : "bg-1")}
                            > </i> {abbreviateNumber(Like)}
                </button>
                <button type="button" className="btn btn-link bg-1 " onClick={comment}>
                  <i className= {"p-1 fas fa-comment"} ></i> {abbreviateNumber(tweet?.comments ? props?.tweet?.comments.length : 0)} 
                </button>
              </div>
              <div className="additional-actions  ">
                
                <button type="button" className={"btn btn-link bg-1"} onClick={comment}>
                  <i className={"p-1 fas fa-eye"}
                        ></i> {abbreviateNumber(tweet?.views ? props?.tweet?.views : 0)}
                </button>

                <button type="button" className={"btn btn-link bg-1"} onClick={bookmark}>
                  <i className={"p-1 fas fa-bookmark " + (f2 ? "bg-2" : "bg-1")}
                        ></i> {abbreviateNumber(Bookmarks)}
                </button>

                <button type="button" className="btn btn-link bg-1" onClick={comment} >
                  <i className="p-1  fas fa-share"></i> 
                </button>

              </div>
            </div>
          </div>
        </div>
      </div>
      <div id={props?.id}> </div>
    </div>
  );
};

export default TweetCard2;



