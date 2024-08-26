import React from "react";
import { useEffect } from "react";
import { Redirect } from "react-router-dom"; // Assuming you are using React Router


var TweetByUserId = (props)=>{


    useEffect(()=>{
        if(!props.islogined){
            window.location.href = "/login"
            return
        }
    },[props])



    
    return(
        <>
            <h1> Home </h1>
        </>
    );
}





export default TweetByUserId;

