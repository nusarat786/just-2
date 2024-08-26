import React from "react";
import { useState ,useEffect } from "react";
import { Navigate } from "react-router-dom"
import axios from "axios";
import validator from 'validator';
import Alert1 from "../Utility/Alert";
import { Link } from "react-router-dom";
import Cookies from 'js-cookie';


var Login =(props)=>{


    // login form data
    const [loginformData, setFormData] = useState({ email: '', password: '',status:"PENDING" });
    const [loggedIn, setLoggedIn] = useState(false);
    const [list2 ,setList] = useState([]);
    const [flag ,setFlag] = useState(false);


    useEffect(()=>{
        if(props.islogined){
            window.location.href = "/home"
            return
        }
    },[props])

    
    // handle change in input filed
    const handleChange = (e) => {
        const { name, value } = e.target;
        console.log(name + " " + value)
        setFormData({ ...loginformData, [name]: value });
    };

    console.log(process.env.REACT_URL);

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setFormData({ ...loginformData, status: "PROCESSING" });
        list2.length = 0;
        var list = [];


        if(!loginformData.password){
            list.push("password  can not be blank ");
        }

        if(!loginformData.email || !validator.isEmail(loginformData.email)){
            list.push(loginformData.email + " is not a valid eamil/blank");
        }

        if(list.length >0){
            setFormData({ ...loginformData, status: "PROCESSED" });
            setFlag(true)
            setList(list)
            return;
        }

         
        
        try {
            var response = await axios.post(
                `${process.env.REACT_APP_URL}/userRoutes/login`, 
            {
                email: loginformData.email,
                password: loginformData.password
            },
            {               // Include cookies in the request
                withCredentials: true 
            });

            console.log(response)
            var data= response.data;
            var id  = data.id;

            // Calculate expiry time (10 hours from now)
            const expiryTime = new Date(Date.now() + 3600000); // 10 hours in milliseconds

            // Set cookie string
            const cookieString = `id=${id};expires=${expiryTime.toUTCString()};path=/`;

            // Set the cookie
            document.cookie = cookieString;
             
            setLoggedIn(true);
            setFormData({ ...loginformData, status: "PROCESSED" });
            alert("Success:  " + data.message);
            window.location.href = "/home"
                
            console.log(response); // Assuming your backend returns a message upon successful login

        } catch (error) {
            var m = error?.response?.data;
            setFormData({ ...loginformData, status: "PROCESSED" });
            alert(m?.message);
            console.log(e);
        }

        setFormData({ ...loginformData, status: "PROCESSED" });
        
    }

    

    

    var h = ()=>{
        console.log("Hello ");
    }

    const handleEror = (error) =>{
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error('Request failed with status code:', error.response.status);
            console.error('Response data:', error.response.data);
            console.error('Response headers:', error.response.headers);

            // Handle specific error messages here
            if (error.response.status === 401) {
                console.error('Unauthorized - Incorrect email or password');
                // Handle unauthorized error, e.g., show error message to the user
            } else {
                console.error('An unexpected error occurred');
                // Handle other errors
            }
        } else if (error.request) {
            // The request was made but no response was received
            console.error('No response received:', error.request);
            // Handle network errors
        } else {
            // Something happened in setting up the request that triggered an error
            console.error('Error:', error.message);
            // Handle other errors
        }
    }


    return (
    <>
    {flag && <Alert1 list={list2} flag={flag} setFlag={setFlag} /> }
    <div className="container">
        <div className="row">
            <div className="b-shado col-md-6 offset-md-3 col-10 offset-1 col-sm-10 offset-sm-1">
                <form className="custom-form" onSubmit={handleLoginSubmit}>
                    
                    <div class="mb-4">
                        <label class="form-label" for="form2Example1">Email address</label>
                        <input className="input" type="text" id="form2Example1" class="form-control" name="email" value={loginformData.email} onChange={handleChange} />                    
                    </div>

                    <div class=" mb-4">
                        <label class="form-label" for="form2Example2">Password</label>                
                        <input type="password" id="form2Example2" class="form-control" name="password" value={loginformData.password} onChange={handleChange}  />
                    </div>

                    <div class="row mb-4">
                        <div class="col">                
                            <Link to="/forget-password" className="font-1">Forgot password?</Link>
                        </div>
                    </div>

                    <button type="submit" class="btn btn-primary btn-block mb-4">Sign in</button>

                    <div class="text-center">           
                        <p>Not a Member? <Link to={"/register"} className="font-1">Register</Link></p>                        
                    </div>
                    
                </form>
            </div>
        </div>
    </div>
    
    </>
    )

}


export default Login;