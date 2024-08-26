import React from "react";
import { useState ,useEffect } from "react";
import { Navigate } from "react-router-dom"
import axios from "axios";
import validator from 'validator';
import Alert1 from "../Utility/Alert";
import { Link } from "react-router-dom";
import Cookies from 'js-cookie';
import { Spinner, Modal } from 'react-bootstrap';
import LoadingSpinner from "../Utility/Loading";





var ForgetPassword =(props)=>{


    // login form data
    const [loginformData, setFormData] = useState({ email: '', password: '',cpassword:'',status:"PENDING",OTP:"" });
    const [loggedIn, setLoggedIn] = useState(false);
    const [list2 ,setList] = useState([]);
    const [flag ,setFlag] = useState(false);
    const [showLoading, setShowLoading] = useState(false);
    const [otpSent,setOtpSent] = useState(false)

    useEffect(()=>{
        if(props.islogined){
            window.location.href = "/home"
            return
        }

        setTimeout(() => {
            setShowLoading(false);
          }, 3000);
    },[props])

    
    // handle change in input filed
    const handleChange = (e) => {
        const { name, value } = e.target;
        console.log(name + " " + value)
        setFormData({ ...loginformData, [name]: value });
    };

    console.log(process.env.REACT_URL);

    const handleLoginSendOtp = async (e) => {
        
        

        e.preventDefault();

        list2.length = 0;
        var list = [];

        
        if(!loginformData.email || !validator.isEmail(loginformData.email)){
            list.push(loginformData.email + " is not a valid eamil/blank");
        }

        if(list.length >0){
            setFormData({ ...loginformData, status: "PROCESSED" });
            setFlag(true)
            setList(list)
            return;
        }

        
        setShowLoading(true);
        setOtpSent(false);

        try {

            

            var response = await axios.post(
                `${process.env.REACT_APP_URL}/userRoutes/forget-password`, 
            {
                email: loginformData.email
            },
            {               // Include cookies in the request
                withCredentials: true 
            });

            var data= response.data;
            
            setLoggedIn(true);
            setShowLoading(false);
            setOtpSent(true)
            setFormData({ ...loginformData, status: "PROCESSED" });
            //alert("Success:  " + data.message);
            //window.location.href = "/home"   
            console.log(response); // Assuming your backend returns a message upon successful login

        } catch (error) {
            var m = error?.response?.data;
            setOtpSent(error?.data?.err)
            setShowLoading(false);
            setFormData({ ...loginformData, status: "PROCESSED" });
            alert(m?.message);
            console.log(e);
        }
        
        
        //setFormData({ ...loginformData, status: "PROCESSED" });
    }

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        
        setFormData({ ...loginformData, status: "PROCESSING" });
        
        list2.length = 0;
        var list = [];

        
        
        if(!loginformData.OTP){
            list.push("OTP CAN NOT BE BLANK");
        }

        if(!loginformData.password || !loginformData.cpassword){
            list.push("Password / Confirm Password Can Not Be Blank");
        }

        if(loginformData.password && !validator.equals(loginformData.password,loginformData.cpassword)){
            list.push("password and confirm password does not match ");
        }

        if(loginformData.password && !validator.isStrongPassword(loginformData.password) ){
            list.push(loginformData.password + " should be alphanumeric with >=8 char ");
        }

        if(list.length >0){
            setFormData({ ...loginformData, status: "PROCESSED" });
            setFlag(true)
            setList(list)
            return;
        }

        
        setShowLoading(true);
        

        try {

            //email=&otp=257445&password=Aa%23123456987&cpassword=Aa%23123456987
   
            var response = await axios.post(
                `${process.env.REACT_APP_URL}/userRoutes/verify-otp`, 
            {
                email: loginformData.email,
                otp:loginformData.OTP,
                password:loginformData.password,
                cpassword:loginformData.cpassword
            },
            {               // Include cookies in the request
                withCredentials: true 
            });

            console.log(loginformData.OTP)

            var data= response.data;
            
            setShowLoading(false);
            setOtpSent(true)
            setFormData({ ...loginformData, status: "PROCESSED" });
            alert("Success:  " + data?.message);
            window.location.href = "/login"   
            console.log(response); // Assuming your backend returns a message upon successful login

        } catch (error) {
            var m = error?.response?.data;
            setOtpSent(error?.data?.err)
            setShowLoading(false);
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

    {showLoading &&
        <LoadingSpinner  showLoading={showLoading}/>
    }
    
    {flag && <Alert1 list={list2} flag={flag} setFlag={setFlag} /> }
    <div className="container">
        <div className="row">
            <div className="b-shado col-md-6 offset-md-3 col-10 offset-1 col-sm-10 offset-sm-1">
                <form className="custom-form" onSubmit={handleLoginSendOtp}>
                    
                    <div class="mb-4">
                        <label class="form-label" for="form2Example1">Email address</label>
                        <input className="input" type="text" id="form2Example1" class="form-control" name="email" value={loginformData.email} onChange={handleChange} />                    
                    </div>

                    
                    <button type="submit" class="btn btn-primary btn-block mb-4">Send OTP</button>

                    <div class="text-center">           
                        <Link to={"/register"} className="font-1" onClick={handleLoginSendOtp}>Resend OTP? </Link>                       
                    </div>

                </form>
                
                {otpSent && 

                <form className="custom-form mt-3" onSubmit={handleVerifyOtp}>
                    <h4 className='bg-1 text-center'>OTP SENT  </h4>
                    <div class="mb-4">
                        <label class="form-label" for="form2Example1">OTP</label>
                        <input className="input" type="number" id="form2Example1" class="form-control" name="OTP" value={loginformData.OTP} onChange={handleChange} />                    
                    </div>

                                                                    
                    <div class="mb-4">
                            <label class="form-label" for="form2Example1">Password</label>
                            <input 
                                className="input" 
                                type="password" 
                                id="password" 
                                class="form-control" 
                                name="password" 
                                value={loginformData.password} 
                                
                                onChange={handleChange} 
                            />                    
                        </div>

                        <div class="mb-4">
                            <label class="form-label" for="form2Example1">Confirm Password</label>
                            <input 
                                className="input" 
                                type="text" 
                                id="confirmPassword" 
                                class="form-control" 
                                name="cpassword" 
                                value={loginformData.cpassword} 
                                
                                onChange={handleChange} 
                            />                    
                        </div>



                    <button type="submit" class="btn btn-primary btn-block mb-4">Verify OTP</button>

                </form>
                }
            </div>
        </div>
    </div>
    
    </>
    )

}


export default ForgetPassword;