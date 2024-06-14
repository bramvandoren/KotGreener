import React, { useEffect, useState } from 'react';
import './Profile.css';
import { Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { supabase } from '../../lib/helper/supabaseClient';
import Avatar from './Avatar';
import Home from '../Home/Home';
import Account from './Account';
import Header from '../Header/Header';
import Navbar from '../Navbar/Navbar';

const Profile = ( {onClose} ) => {
  const [loading, setLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [website, setWebsite] = useState(null)

  const [avatar_url, setAvatarUrl] = useState(null);
  const [imageUrl, setImageUrl] = useState(null)

  const [notifications, setNotifications] = useState([
    { id: 1, message: 'Plant 2 moet water krijgen!', read: false }
  ]);
  const [favorites, setFavorites] = useState([]);
  const [showProfile, setShowProfile] = useState(true);
  const [session, setSession] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        if (session) {
          getProfile(session);
          fetchFavorites(session);
        } else {
          navigate('/login');
        }
      } catch (error) {
        console.error('Error fetching session:', error);
      }
    };
    let ignore = false
    async function getProfile(session) {
      setLoading(true)
      const { data, error } = await supabase
        .from('profiles')
        .select(`username, website, avatar_url`)
        .eq('id', session.user.id)
        .single()

      if (!ignore) {
        if (error) {
          console.warn(error)
        } else if (data) {
          setUsername(data.username)
          setWebsite(data.website)
          setAvatarUrl(data.avatar_url)
        }
      }
      setLoading(false)
    }
    fetchSession();
    if (avatar_url) downloadImage(avatar_url);
    return () => {
      ignore = true
    }
  }, [avatar_url]);

  const fetchFavorites = async (session) => {
    try {
      const { data: favoritePlants, error } = await supabase
        .from('favorites')
        .select('*, plants(name, sunlight, water_frequency, image_url, height)')
        .eq('profile_id', session.user.id);

      if (error) {
        throw new Error('Failed to fetch favorites');
      }

      setFavorites(favoritePlants);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  };

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

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    navigate('/login');
  };

  const truncateName = (name, wordLimit) => {
    const letters = name.split('');
    if (letters.length > wordLimit) {
      return letters.slice(0, wordLimit).join('').toUpperCase();
    }
    return name;
  };

  return (
    <>
    <div className="profile">
      <Header/>
      <div className="breadcrumb">
        <Link to={'/profile'}>Profiel</Link>
      </div>
      <div className="profile-info">
        <div className="profile-info--left">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt="Avatar"
              className="avatar-image"
            />
          ) : (
            <div className="profile-avatar">{truncateName((session ? session.user.email : ""),1)}</div>
          )}
          {session ? (
            <div className="profile-details">
              <h2>{username ? username : session.user.user_metadata.username}</h2>
              <p>{session.user.email}</p>
            </div>
          ) : (<></>)
          }
        </div>
        <button className="account-button" onClick={() => navigate('/profile/edit', { state: { session } })}>
          Account bewerken
        </button>
      </div>
      <section className="favorites">
        <h3>Mijn Favoriete Planten</h3>
        <div className="favorites-plants">
          {favorites.length > 0 ? (
            favorites.map(favorite => (
              <Link key={favorite.plant_id} to={`/plants/${favorite.plant_id}`} className="favorites-plants-item">
                {favorite.plants.name}
              </Link>
            ))
          ) : (
            <p>Geen favoriete planten</p>
          )}
        </div>
      </section>
      <section className="places">
        <h3>Plaatsen</h3>
        <div className="place-item">
          <h4>Mijn kot</h4>
          <p># planten</p>
        </div>
        <div className="create-participate">
          <button className="create-btn">Maken +</button>
          <button className="participate-btn">Deelnemen</button>
        </div>
      </section>
      <section className="notifications">
        <h3>Meldingen</h3>
        <p>meldingen weergeven</p>
      </section>
      <div className="settings">
        <button className="settings-btn">Instellingen</button>
        <button className="logout-button" type="button" onClick={handleLogout}>
          Log out
        </button>
      </div>
    </div>
    <Navbar/>
    </>
  );
};

export default Profile;
