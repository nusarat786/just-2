import React, { useState } from 'react';
import LoadingModal from "../Utility/Loading";

import { Spinner, Modal } from 'react-bootstrap';



const LoadingSpinner = ({ showLoading }) => {
  return (
    <Modal
      show={true}
      centered
      backdrop="static"
      keyboard={false}
    >
      <Modal.Body className="d-flex justify-content-center align-items-center">
        <Spinner animation="border" role="status">
          <span className="sr-only">Loading...</span>
        </Spinner>
        &nbsp; <span>Please Wait.. </span>
      </Modal.Body>
    </Modal>
  );
};


export default LoadingSpinner;


