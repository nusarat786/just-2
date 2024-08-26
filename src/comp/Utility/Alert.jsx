import React from "react";
import { useState } from "react";

const Alert1 = (props) =>{
    
    console.log(props.list)

    return(
        <>
        <div>
      {props.flag && (
        <div className="modal fade show" tabIndex="-1" role="dialog" style={{ display: 'block' }}>
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Invalid Inputs</h5>
                
              </div>
              <div className="modal-body">
                   
                    {props.list.map(item => ( 
                        <li style={{ listStyleType: "none" }} className="bg-danger text-white mb-2 " key={item}> &nbsp;&nbsp; {item}</li>
                    ))}
                    
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => props.setFlag(false) } type="button" className="btn btn-primary">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="modal-backdrop fade show"></div>
    </div>
            
            
        
    </>
    );
}


export default Alert1;