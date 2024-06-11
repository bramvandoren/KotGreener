import React, { useEffect, useRef, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import logo from "../../assets/logo-kotgreener.svg";
import { supabase } from '../../lib/helper/supabaseClient';
import './Header.css';

const Header = () => {
  const [session, setSession] = useState(null);
  const [showHeader, setShowHeader] = useState(true);  // State to track header visibility
  const prevScrollY = useRef(0);  // Ref to store previous scroll position
  const navigate = useNavigate();

  // Fetch session on component mount
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
      } catch (error) {
        console.error('Error fetching session:', error);
      }
    };
    fetchSession();
  }, []);

  // Scroll event listener to show/hide header
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > prevScrollY.current && currentScrollY > 100) {
        // User is scrolling down and has scrolled more than 100px
        setShowHeader(false);
      } else {
        // User is scrolling up or at the top of the page
        setShowHeader(true);
      }

      prevScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll);

    // Clean up the event listener on component unmount
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`header-desktop ${showHeader ? '' : 'hidden'}`}>
      <img className="logo" src={logo} alt='Logo' onClick={() => navigate('/')} />
      <div className='nav-desktop'>
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
          <p>Winkel</p>
        </NavLink>
        <NavLink to="/plants" className="nav-item">
          <p>Zoeken</p>
        </NavLink>
      </div>
      {session ? (
        <button className="profile-button" onClick={() => navigate('/profile')}>
          <svg width="25" height="25" viewBox="0 0 25 25" xmlns="http://www.w3.org/2000/svg">
            <path d="M12.5 2.5C11.1739 2.5 9.90215 3.02678 8.96447 3.96447C8.02678 4.90215 7.5 6.17392 7.5 7.5C7.5 8.82608 8.02678 10.0979 8.96447 11.0355C9.90215 11.9732 11.1739 12.5 12.5 12.5C13.8261 12.5 15.0979 11.9732 16.0355 11.0355C16.9732 10.0979 17.5 8.82608 17.5 7.5C17.5 6.17392 16.9732 4.90215 16.0355 3.96447C15.0979 3.02678 13.8261 2.5 12.5 2.5ZM8.75 7.5C8.75 6.50544 9.14509 5.55161 9.84835 4.84835C10.5516 4.14509 11.5054 3.75 12.5 3.75C13.4946 3.75 14.4484 4.14509 15.1517 4.84835C15.8549 5.55161 16.25 6.50544 16.25 7.5C16.25 8.49456 15.8549 9.44839 15.1517 10.1517C14.4484 10.8549 13.4946 11.25 12.5 11.25C11.5054 11.25 10.5516 10.8549 9.84835 10.1517C9.14509 9.44839 8.75 8.49456 8.75 7.5ZM6.26125 13.75C5.932 13.7485 5.6057 13.8121 5.30109 13.9371C4.99647 14.062 4.71955 14.2459 4.48621 14.4782C4.25287 14.7105 4.06771 14.9866 3.94137 15.2907C3.81503 15.5947 3.75 15.9207 3.75 16.25C3.75 18.3638 4.79125 19.9575 6.41875 20.9963C8.02125 22.0175 10.1813 22.5 12.5 22.5C14.8188 22.5 16.9788 22.0175 18.5812 20.9963C20.2087 19.9588 21.25 18.3625 21.25 16.25C21.25 15.587 20.9866 14.9511 20.5178 14.4822C20.0489 14.0134 19.413 13.75 18.75 13.75H6.26125ZM5 16.25C5 15.5588 5.56 15 6.26125 15H18.75C19.0815 15 19.3995 15.1317 19.6339 15.3661C19.8683 15.6005 20 15.9185 20 16.25C20 17.8862 19.2225 19.105 17.9087 19.9412C16.5712 20.795 14.6687 21.25 12.5 21.25C10.3313 21.25 8.42875 20.795 7.09125 19.9412C5.77875 19.1038 5 17.8875 5 16.25Z" fill="black"/>
          </svg>
        </button>
      ) : (
        <button onClick={() => navigate('/login')}>
          Inloggen
        </button>
      )}
    </header>
  );
};

export default Header;
