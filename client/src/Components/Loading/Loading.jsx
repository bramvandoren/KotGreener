import React from 'react';
import logo from "../../assets/logo-kotgreener.svg";
import './Loading.css';

const Loading = () => {
  return (
    <div className="loading-container">
        <img className="loading-logo" src={logo} alt='Logo' />
    </div>
  );
};

export default Loading;
