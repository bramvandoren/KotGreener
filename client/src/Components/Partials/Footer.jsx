import React, { useEffect, useRef, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import logo from "../../assets/logo-kotgreener.svg";
import { supabase } from '../../lib/helper/supabaseClient';
import './Footer.css';

const Footer = () => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();


  return (
    <footer className="footer">
        <div className="footer-container">
            <img className="logo" src={logo} alt='Logo' onClick={() => navigate('/')} />
            <div className='nav-footer'>
                <NavLink to="/" className="nav-item">
                <p>Home</p>
                </NavLink>
                <NavLink to="/blog" className="nav-item">
                <p>Ontdek</p>
                </NavLink>
                <NavLink to="/my-plants" className="nav-item">
                <p>Mijn Planten</p>
                </NavLink>
                <NavLink to="/winkel" className="nav-item">
                <p>Markt</p>
                </NavLink>
                <NavLink to="/plants" className="nav-item">
                <p>Zoeken</p>
                </NavLink>
            </div>
            <div>
                <h3>Contact</h3>
                <p>info@kotgreener.com</p>
            </div>
        </div>
        <div className="footer-bottom">
            <p>&copy; {new Date().getFullYear()} KotGreener. Alle rechten voorbehouden.</p>
        </div>
    </footer>
  );
};

export default Footer;
