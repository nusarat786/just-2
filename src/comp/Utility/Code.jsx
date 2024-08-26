import { Navigate } from "react-router-dom"
import { useEffect } from "react";

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


    // handle change in input filed
    const handleChange = (e,formData,setFormData) => {
        const { name, value } = e.target;
        console.log(name + " " + value)
        setFormData({ ...formData, [name]: value });
    };


    var respons = (data,setFlag)=>{
        
        

        console.log(); // Assuming your backend returns a message upon successful login

    }

    
    function navigate(endpoint) {
        return <Navigate to={endpoint} />;
    }

    const isLogined= ()=>{
        var flag = false;

        if(getCookie("id")){
            flag= true;
        }

        return flag;
    }

    const getCookie = (name) => {
        const cookieValue = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
        return cookieValue ? cookieValue.pop() : null;
      };

    
    export {handleEror,handleChange,navigate ,isLogined,getCookie};

    