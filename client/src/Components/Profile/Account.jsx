import { useState, useEffect } from 'react'
import { supabase } from '../../lib/helper/supabaseClient';
import Avatar from './Avatar';
import { Link, NavLink, useLocation } from 'react-router-dom';
import './Profile.css';
import Navbar from '../Navbar/Navbar';
import Header from '../Header/Header';

export default function Account() {
  const [loading, setLoading] = useState(true)
  const [username, setUsername] = useState(null)
  const [website, setWebsite] = useState(null)
  const [avatar_url, setAvatarUrl] = useState(null)
  const [session, setSession] = useState(null);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        if (session) {
          getProfile(session);
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
    // getProfile()
    return () => {
      ignore = true
    }
  }, [])

  async function updateProfile(event, avatarUrl) {
    event.preventDefault()

    setLoading(true)
    const { user } = session

    const updates = {
      id: user.id,
      username,
      avatar_url: avatarUrl,
      updated_at: new Date(),
    }

    if (avatarUrl) {
      // Add avatar_url to updates object only if it's provided
      updates.avatar_url = avatarUrl;

      // Handle the file upload
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;
      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);

      if (uploadError) {
          setLoading(false);
          throw uploadError;
      }
    }

    const { error } = await supabase.from('profiles').upsert(updates);

    if (error) {
      alert(error.message)
    } else {
      if (avatarUrl) {
        setAvatarUrl(avatarUrl);
      }
    }
    setLoading(false)
  }

  return (
    <>
    <div className="account">
        <Header/>
        <div className="button-back" onClick={() => window.history.back()}>
          <svg width="25" height="25" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6.5625 14.0625H25.3125C25.5611 14.0625 25.7996 14.1613 25.9754 14.3371C26.1512 14.5129 26.25 14.7514 26.25 15C26.25 15.2486 26.1512 15.4871 25.9754 15.6629C25.7996 15.8387 25.5611 15.9375 25.3125 15.9375H6.5625C6.31386 15.9375 6.0754 15.8387 5.89959 15.6629C5.72377 15.4871 5.625 15.2486 5.625 15C5.625 14.7514 5.72377 14.5129 5.89959 14.3371C6.0754 14.1613 6.31386 14.0625 6.5625 14.0625Z" fill="black"/>
            <path d="M6.95059 15L14.7262 22.7737C14.9023 22.9498 15.0012 23.1885 15.0012 23.4375C15.0012 23.6864 14.9023 23.9252 14.7262 24.1012C14.5502 24.2773 14.3114 24.3761 14.0625 24.3761C13.8135 24.3761 13.5748 24.2773 13.3987 24.1012L4.96122 15.6637C4.87391 15.5766 4.80464 15.4732 4.75738 15.3593C4.71012 15.2454 4.68579 15.1233 4.68579 15C4.68579 14.8766 4.71012 14.7545 4.75738 14.6407C4.80464 14.5268 4.87391 14.4233 4.96122 14.3362L13.3987 5.89871C13.5748 5.72268 13.8135 5.62378 14.0625 5.62378C14.3114 5.62378 14.5502 5.72268 14.7262 5.89871C14.9023 6.07475 15.0012 6.31351 15.0012 6.56246C15.0012 6.81142 14.9023 7.05018 14.7262 7.22621L6.95059 15Z" fill="black"/>
          </svg>
          <p>Terug</p>
        </div>
        <div className="breadcrumb">
          <Link to={'/profile'}>Profiel</Link>
          <span> / </span>
          <Link>Profiel bewerken</Link>
        </div>
        <form onSubmit={updateProfile} className="form-account">
          <div>
            <Avatar
              url={avatar_url}
              size={150}
              onUpload={(event, url) => {
                  updateProfile(event, url)
              }}
            />
          </div>
          <div className="editProfile-form">
            <h3>Gegevens</h3>
                <label htmlFor="email">Email</label>
                {session ? (
                  <input id="email" type="text" value={session.user.email} disabled />
                ) : (
                  <></>
                )}
                <label htmlFor="username">Gebruikersnaam</label>
                <input
                id="username"
                type="text"
                // required
                value={username || ''}
                onChange={(e) => setUsername(e.target.value)}
                />
            <div>
              <button className="button block primary" type="submit" disabled={loading || (!username && !website)}>
                {loading ? 'Loading ...' : 'Update'}
              </button>
            </div>
          </div>
        </form>
    </div>
    <Navbar/>
    </>
  )
}