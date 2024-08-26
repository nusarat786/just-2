import React, { useState } from "react";
import { handleChange, handleEror } from "../Utility/Code";
import countryList from "../Utility/country";
import axios from "axios";
import {navigate} from '../Utility/Code'
import validator from 'validator';
import Alert1 from "../Utility/Alert";
import { Navigate } from "react-router-dom"
import { useEffect } from "react";
import { Link } from "react-router-dom";

const Update = (props)=>{

    useEffect(()=>{
        if(!props.islogined){
            window.location.href = "/home"
            return
        }
    },[props])



    const [regFormData, setRegFormData] = useState({ 
        username: '',
        email: '',
        password: '',
        name: '',
        dob: '',
        bio: '',
        country: '',
        pimage: null,
        status:"PENDING" 
    });



    const [flag, setFlag] = useState(false);
    const [list2,setList] = useState([]);


    const fetchUser = async () => {

        console.log(props?.id);
        try {
          const response = await axios.get(
            `${process.env.REACT_APP_URL}/userRoutes/user-detail/${props.id}`, 
            {
            withCredentials: true
          });
          const data = response.data;
          setRegFormData(data?.userObj);
          console.log(data?.userObj);
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
        
      }, []);
    
    
    
        

    // Function to convert state object to simple object
    const convertStateToObject = (stateObject) => {
        const simpleObject = {};
        Object.keys(stateObject).forEach((key) => {
        simpleObject[key] = stateObject[key];
        });
        return simpleObject;
    };
    
    // Convert data state object to simple object
    //const simpleDataObject = convertStateToObject(data);
        

    var handleRegisterSubmit = async (e) =>{
        list2.length = 0;
        var list = [];
        e.preventDefault();

        
        for (let key in regFormData) {
            if(!regFormData[key]){
                list.push(key+ " can not be empty ");
            }
        }

        if(regFormData.name && !validator.matches(regFormData.name,/^[a-zA-Z\s]*$/)){
            list.push(regFormData.name + " name can not contains numberes");
        }

        console.log(list)
        
        if(list.length >0){
            setFlag(true);
            setList(list);
            return null;
        }

        
        
        var response;
        try{

        
            setRegFormData({...regFormData,status:"PROCESSING"})

            var obj = convertStateToObject(regFormData);
            console.log(obj.pimage)
            var formDataToSend = new FormData();
            
            for (let key in regFormData) {
              formDataToSend.append(key, regFormData[key]);
            }


             response = await axios.post(
            `${process.env.REACT_APP_URL}/userRoutes/edit-user`, 

            
                obj,
            {               // Include cookies in the request
                withCredentials: true,
                headers: {
                    'Content-Type': 'multipart/form-data'
                  }
            }
            );
  

            console.log(response);

            var data = response.data;

            console.log(data)

            if(data.err===true){
                setRegFormData({...regFormData,status:"PROCESSED"})
                alert("Error: " + data.message )
            }else{
                setRegFormData({...regFormData,status:"PROCESSED"})
                alert("Success:  " + data.message);
                window.location.href = "/all-records"; // Redirect to the login page
            }

        }catch(e){
            var m = e.response.data;
            setRegFormData({...regFormData,status:"PROCESSED"});
            alert(m.message);
            console.log(e)
        }

    }

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setRegFormData({ ...regFormData, pimage: file });
    };

   
    

    return (
        <>

       
        {flag && <Alert1 list={list2} flag={flag} setFlag={setFlag} /> }
        <div className="container">
            <div className="row">
                <div className="b-shado col-md-6 offset-md-3 col-10 offset-1 col-sm-10 offset-sm-1">
                    <form className="custom-form "  method="post"  onSubmit={handleRegisterSubmit}>
                        <div className="mb-4" >
                                <label class="form-label" for="name">Name</label>
                                <input 
                                    type="text" 
                                    id="form2Example1" 
                                    className="form-control" 
                                    name="name" 
                                    value={regFormData.name} 
                                    onChange={(e) => handleChange(e, regFormData, setRegFormData)}    
                                />    
                       
                        </div>

                        
                                                
                        <div class="mb-4">
                            <label class="form-label" for="form2Example1">Country</label>
                            <select
                                className="form-select" 
                                id="country" 
                                class="form-control" 
                                name="country" 
                                value={regFormData.country} 
                                
                                onChange={(e) => handleChange(e, regFormData, setRegFormData)} 
                            >
                                
                                {
                                countryList.map((country, index) => (
                                    <option key={index} value={country} selected={country === "India"}>{country}</option>
                                ))
                                }


                            </select>                    
                        </div>
                        

                               
                        <div class="mb-4">
                            <label class="form-label" for="bio">Bio</label>
                            <textarea 
                                className="input" 
                                type="text" 
                                id="bio" 
                                class="form-control" 
                                name="bio" 
                                value={regFormData.bio}                
                                onChange={(e) => handleChange(e, regFormData, setRegFormData)}
                                cols={5} 
                            />                    
                        </div>

                       
                         
        
                        <button type="submit" class="btn btn-primary btn-block mb-4">UPDATE</button>
    
                    </form>
                </div>
            </div>
        </div>
        
        </>
    )


}

export default Update;