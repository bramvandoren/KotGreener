import React, { useEffect, useRef, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import logo from "../../assets/logo-kotgreener.svg";
import { supabase } from '../../lib/helper/supabaseClient';
import './Header.css';

const Header = () => {
  const [session, setSession] = useState(null);
  const [showHeader, setShowHeader] = useState(true);
  const prevScrollY = useRef(0);
  const [avatar_url, setAvatarUrl] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        if (session) {
          getProfile(session);
        }
      } catch (error) {
        console.error('Error fetching session:', error);
      }
      async function getProfile(session) {
        setLoading(true)
        const { data, error } = await supabase
          .from('profiles')
          .select(`username, website, avatar_url`)
          .eq('id', session.user.id)
          .single()
          if (error) {
            console.warn(error);
          } else if (data) {
            setAvatarUrl(data.avatar_url);
            setUsername(data.username);
          }
        }
    };
    fetchSession();
    if (avatar_url) downloadImage(avatar_url);
  }, [avatar_url]);

  // Scroll event listener to show/hide header
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > prevScrollY.current && currentScrollY > 100) {
        setShowHeader(false);
      } else {
        setShowHeader(true);
      }

      prevScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  async function downloadImage(path) {
    try {
      const { data, error } = await supabase.storage.from('avatars').download(path)
      if (error) {
        throw error
      }
      const url = URL.createObjectURL(data)
      setImageUrl(url)
    } catch (error) {
      console.log('Error downloading image: ', error.message)
    }
  }

  const truncateName = (name, wordLimit) => {
    const letters = name.split('');
    if (letters.length > wordLimit) {
      return letters.slice(0, wordLimit).join('').toUpperCase();
    }
    return name;
  };

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
        <NavLink to="/markt" className="nav-item">
          <p>Markt</p>
        </NavLink>
        <NavLink to="/plants" className="nav-item">
          <p>Zoeken</p>
        </NavLink>
      </div>
      {session ? (
        <>
        {imageUrl ? (
          <div className="profile-avatar-overlay" onClick={() => navigate('/profile')}>
            <div className="avatar-username-btn" onClick={() => navigate('/profile')}>
              <img
                src={imageUrl}
                alt="Avatar"
                className="profile-avatar"
              />
              <span className="profile-username">
                {username ? username : session.user.user_metadata.username}
              </span>
            </div>
          </div>
          ) : (
            <div className="profile-avatar-overlay" onClick={() => navigate('/profile')}>
              <div className="profile-avatar avatar-empty">
                {truncateName((session ? session.user.email : ""),1)}
              </div>
              <span className="profile-username">{username ? username : session.user.user_metadata.username}</span>
            </div>
          )}
        </>
      ) : (
        <div className="header-login">
          <button className="header-login-btn" onClick={() => navigate('/login')}>
          Inloggen
        </button>
        </div>
      )}
    </header>
  );
};

export default Header;
