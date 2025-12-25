import React from 'react';
import { Spinner } from 'react-bootstrap';

const LoadingSpinner = ({ size = 'lg', message = 'Loading...' }) => {
  return (
    <div className="loading-spinner">
      <div className="text-center">
        <Spinner animation="border" variant="primary" size={size} />
        <div className="mt-3">
          <p className="text-muted">{message}</p>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;