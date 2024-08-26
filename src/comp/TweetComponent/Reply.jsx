import React from "react";
import { handleEror } from "../Utility/Code";
import axios from "axios";
import { useState } from "react";
import { useEffect } from "react";

const Reply = (props) =>{


    
    useEffect(()=>{
      if(!props.islogined){
          //window.location.href = "/login"
         // return
      }
    },[props]);

   
  const [text, setText] = useState('');
  const [image, setImage] = useState(null);

  const handleChange = (e) => {
    const newText = e.target.value;
    setText(newText);
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const formData = new FormData();
      formData.append('text', text);
      if (image) {
        formData.append('timage', image);
      }

      const response = await axios.post(`${process.env.REACT_APP_URL}/tweetRoutes/comment-v2/${props.tid}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          // Add any additional headers if needed, like authorization headers
        },
        withCredentials: true, // Include cookies in the request
    
      });

      console.log('Tweeted:', response.data);

      window.location.href = "/single-tweet/" +response?.data?.commentid;
      // Handle success, maybe show a success message or redirect the user
    } catch (error) {
      console.error('Error tweeting:', error);
      // Handle error, maybe show an error message to the user
    }
  };
  
  const renderTextWithBlueBackground = () => {
    const words = text.split(" ");
    return words.map((word, index) => {
      if (word.startsWith("#")) {
        return (
          <span key={index} style={{ backgroundColor: "lightblue", padding: "2px 4px", borderRadius: "4px", marginRight: "4px" }}>
            {word}
          </span>
        );
      } else {
        return <span key={index}>{word} </span>;
      }
    });
  };

    return(
        <>
        <div className="container">
            <div className="row">
                <div className="b-shado col-md-6 offset-md-3 col-10 offset-1 col-sm-10 offset-sm-1">
                    <form className="custom-form" onSubmit={handleSubmit}>
                        
                        <div class="mb-4">
                            <label className="form-label" for="form2Example1">Text</label>
                            <textarea
                                className="input"
                                type="text"
                                id="form2Example1"
                                rows="10"
                                className="form-control"
                                name="text"
                                value={text}
                                onChange={handleChange}
                                
                            />

                        </div>

                        <div class=" mb-4">
                            <label className="form-label" for="form2Example2"> Image</label>                
                            <input className="form-control"  type="file" accept="image/*" onChange={handleImageChange} />
                        </div>

                        <button type="submit" class="btn btn-primary btn-block mb-4">Reply</button>

                    </form>
                </div>
            </div>
        </div>
        </>
    )

}

export default Reply;