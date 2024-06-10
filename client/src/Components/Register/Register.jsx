import React, { useState } from 'react';
import './Register.css';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/helper/supabaseClient';
import Navbar from '../Navbar/Navbar';
import logo from "../../assets/logo-kotgreener.svg";

export const Register = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [input, setInput] = useState({
    email: "",
    username: "",
    password: "",
  });

  const navigate = useNavigate();

  const handleSubmitEvent = async (e) => {
    e.preventDefault();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
          },
        },
      });

      if (error) {
        alert(error.error_description || error.message)
      } else {
        alert('Check your email for the login link!');
        navigate('/login');
      }
  };

  const handleInput = (e) => {
    const { name, value } = e.target;
    setInput((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Add validation logic here
    if (name === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setErrorMessage('Please enter a valid email address.');
    } else {
      setErrorMessage('');
    }
  };

  return (
    <div>
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
      <div className="register-form">
          <h1>Account aanmaken</h1>
          <div className="register-login">
          <p>Heb je al een account?</p>
          <Link to="/login">
            <button className="btn--ternair">Inloggen</button>
          </Link>
        </div>
        <form onSubmit={handleSubmitEvent}>
          <div className="login-field">
            <label htmlFor="username">Gebruikersnaam</label>
            <div className="login-input">
              <svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12.5 2.5C11.1739 2.5 9.90215 3.02678 8.96447 3.96447C8.02678 4.90215 7.5 6.17392 7.5 7.5C7.5 8.82608 8.02678 10.0979 8.96447 11.0355C9.90215 11.9732 11.1739 12.5 12.5 12.5C13.8261 12.5 15.0979 11.9732 16.0355 11.0355C16.9732 10.0979 17.5 8.82608 17.5 7.5C17.5 6.17392 16.9732 4.90215 16.0355 3.96447C15.0979 3.02678 13.8261 2.5 12.5 2.5ZM8.75 7.5C8.75 6.50544 9.14509 5.55161 9.84835 4.84835C10.5516 4.14509 11.5054 3.75 12.5 3.75C13.4946 3.75 14.4484 4.14509 15.1517 4.84835C15.8549 5.55161 16.25 6.50544 16.25 7.5C16.25 8.49456 15.8549 9.44839 15.1517 10.1517C14.4484 10.8549 13.4946 11.25 12.5 11.25C11.5054 11.25 10.5516 10.8549 9.84835 10.1517C9.14509 9.44839 8.75 8.49456 8.75 7.5ZM6.26125 13.75C5.932 13.7485 5.6057 13.8121 5.30109 13.9371C4.99647 14.062 4.71955 14.2459 4.48621 14.4782C4.25287 14.7105 4.06771 14.9866 3.94137 15.2907C3.81503 15.5947 3.75 15.9207 3.75 16.25C3.75 18.3638 4.79125 19.9575 6.41875 20.9963C8.02125 22.0175 10.1813 22.5 12.5 22.5C14.8188 22.5 16.9788 22.0175 18.5812 20.9963C20.2087 19.9588 21.25 18.3625 21.25 16.25C21.25 15.587 20.9866 14.9511 20.5178 14.4822C20.0489 14.0134 19.413 13.75 18.75 13.75H6.26125ZM5 16.25C5 15.5588 5.56 15 6.26125 15H18.75C19.0815 15 19.3995 15.1317 19.6339 15.3661C19.8683 15.6005 20 15.9185 20 16.25C20 17.8862 19.2225 19.105 17.9087 19.9412C16.5712 20.795 14.6687 21.25 12.5 21.25C10.3313 21.25 8.42875 20.795 7.09125 19.9412C5.77875 19.1038 5 17.8875 5 16.25Z" fill="black"/>
              </svg>

              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="input-with-icon"
              />
            </div>
          </div>
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
                placeholder="bv. jan@hotmail.com"
                id="email"
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
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input-with-icon"
              />
            </div>
          </div>
          {errorMessage && <div className="error">{errorMessage}</div>}
          <button type="submit" className="">Registreer</button>
        </form>
      </div>
    <Navbar />
    </div>
  );
};

export default Register;
