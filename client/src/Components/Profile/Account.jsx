import { useState, useEffect } from 'react'
import { supabase } from '../../lib/helper/supabaseClient';
import Avatar from './Avatar';
import { Link, NavLink, useLocation } from 'react-router-dom';
import logo from "../../assets/logo-kotgreener.svg";
import './Profile.css';
import Navbar from '../Navbar/Navbar';

export default function Account() {
    const { state } = useLocation();
  const { session } = state;

  const [loading, setLoading] = useState(true)
  const [username, setUsername] = useState(null)
  const [website, setWebsite] = useState(null)
  const [avatar_url, setAvatarUrl] = useState(null)

  useEffect(() => {
    let ignore = false
    async function getProfile() {
      setLoading(true)
      const { user } = session

      const { data, error } = await supabase
        .from('profiles')
        .select(`username, website, avatar_url`)
        .eq('id', user.id)
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

    getProfile()

    return () => {
      ignore = true
    }
  }, [session])

  async function updateProfile(event, avatarUrl) {
    event.preventDefault()

    setLoading(true)
    const { user } = session

    const updates = {
      id: user.id,
      username,
      website,
      avatar_url: avatarUrl,
      updated_at: new Date(),
    }

    const { error } = await supabase.from('profiles').upsert(updates);

    const file = event.target.files[0]
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random()}.${fileExt}`
    const filePath = `${fileName}`
    const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file)

    if (uploadError) {
      throw uploadError
    }

    if (error) {
      alert(error.message)
    } else {
      setAvatarUrl(avatarUrl)
    }
    setLoading(false)
  }

  // async function uploadAvatar(event) {
  //   try {
  //     setUploading(true)

  //     if (!event.target.files || event.target.files.length === 0) {
  //       throw new Error('You must select an image to upload.')
  //     }

  //     const file = event.target.files[0]
  //     const fileExt = file.name.split('.').pop()
  //     const fileName = `${Math.random()}.${fileExt}`
  //     const filePath = `${fileName}`

  //     const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file)

  //     if (uploadError) {
  //       throw uploadError
  //     }

  //     onUpload(event, filePath)
  //   } catch (error) {
  //     alert(error.message)
  //   } finally {
  //     setUploading(false)
  //   }
  // }

  return (
    <>
    <div className="account">
        <header className="header">
          {/* <h1>Blog</h1> */}
          <img className="logo" src={logo} alt='Logo' />
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
            <NavLink to="/search" className="nav-item">
              <p>Zoeken</p>
            </NavLink>
          </div>
        </header>
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
          <div>
            <h3>Gegevens</h3>
            <div>
                <label htmlFor="email">Email</label>
                <input id="email" type="text" value={session.user.email} disabled />
            </div>
            <div>
                <label htmlFor="username">Gebruikersnaam</label>
                <input
                id="username"
                type="text"
                // required
                value={username || ''}
                onChange={(e) => setUsername(e.target.value)}
                />
            </div>
            <div>
                <label htmlFor="website">Website</label>
                <input
                id="website"
                type="url"
                value={website || ''}
                onChange={(e) => setWebsite(e.target.value)}
                />
            </div>

            <div>
                <button className="button block primary" type="submit" disabled={loading}>
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