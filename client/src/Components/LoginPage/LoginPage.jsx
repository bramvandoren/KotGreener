import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import { supabase } from '../../lib/helper/supabaseClient';
import './Login.css';
import logo from "../../assets/logo-kotgreener.svg";
import Header from '../Header/Header';

function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.error_description || error.message)
    } else {
      console.log(data);
      alert('Check your email for the login link!')
      navigate('/')
      
    }
    setLoading(false)
  };

  const handleGoogleSignIn = async () => {
    try {
      const { user, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
      });
      console.log(user);
  
      if (error) {
        throw error;
      }
  
      // Handle successful login with Google
    } catch (error) {
      console.error('Error logging in with Google', error);
      alert('Error logging in with Google');
    }
  };
  

  return (
    <>
    <div className="login">
      <Header/>
      <div className="login-form">
        <h1>Inloggen</h1>
        <div className="login-register">
          <p>Nog geen account?</p>
          <Link to="/register">
            Account aanmaken
          </Link>
        </div>
        <form onSubmit={handleLogin}>
          <div className="login-field">
            <label htmlFor="email">E-mail</label>
            <div className="login-input">
              <svg className="email-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path className="email-icon-path" d="M3 7C3 6.46957 3.21071 5.96086 3.58579 5.58579C3.96086 5.21071 4.46957 5 5 5H19C19.5304 5 20.0391 5.21071 20.4142 5.58579C20.7893 5.96086 21 6.46957 21 7V17C21 17.5304 20.7893 18.0391 20.4142 18.4142C20.0391 18.7893 19.5304 19 19 19H5C4.46957 19 3.96086 18.7893 3.58579 18.4142C3.21071 18.0391 3 17.5304 3 17V7Z" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M3 7L12 13L21 7" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input-with-icon"
              />
            </div>
          </div>
          <div className="login-field">
            <label htmlFor="password">Wachtwoord</label>
            <div className="login-input">
              <svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 17C11.4696 17 10.9609 16.7893 10.5858 16.4142C10.2107 16.0391 10 15.5304 10 15C10 13.89 10.89 13 12 13C12.5304 13 13.0391 13.2107 13.4142 13.5858C13.7893 13.9609 14 14.4696 14 15C14 15.5304 13.7893 16.0391 13.4142 16.4142C13.0391 16.7893 12.5304 17 12 17ZM18 20V10H6V20H18ZM18 8C18.5304 8 19.0391 8.21071 19.4142 8.58579C19.7893 8.96086 20 9.46957 20 10V20C20 20.5304 19.7893 21.0391 19.4142 21.4142C19.0391 21.7893 18.5304 22 18 22H6C5.46957 22 4.96086 21.7893 4.58579 21.4142C4.21071 21.0391 4 20.5304 4 20V10C4 8.89 4.89 8 6 8H7V6C7 4.67392 7.52678 3.40215 8.46447 2.46447C9.40215 1.52678 10.6739 1 12 1C12.6566 1 13.3068 1.12933 13.9134 1.3806C14.52 1.63188 15.0712 2.00017 15.5355 2.46447C15.9998 2.92876 16.3681 3.47995 16.6194 4.08658C16.8707 4.69321 17 5.34339 17 6V8H18ZM12 3C11.2044 3 10.4413 3.31607 9.87868 3.87868C9.31607 4.44129 9 5.20435 9 6V8H15V6C15 5.20435 14.6839 4.44129 14.1213 3.87868C13.5587 3.31607 12.7956 3 12 3Z" fill="black"/>
              </svg>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input-with-icon"
              />
            </div>
          </div>
          {/* <button type="submit">Inloggen</button> */}
          <button disabled={loading}>
            {loading ? <span>Loading</span> : <span>Inloggen</span>}
          </button>
        </form>
        <p>of</p>
        <button type="button" onClick={handleGoogleSignIn}>
          Inloggen met Google
        </button>
      </div>
    </div>
    <Navbar />
    </>
  );
}

export default LoginPage;
