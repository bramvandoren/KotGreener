import React, { useEffect, useState } from 'react';
import Navbar from '../Navbar/Navbar';
import './Market.css';
import { NavLink, useNavigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';
import Header from '../Header/Header';

function Market() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isPlusButtonOpen, setIsPlusButtonOpen] = useState(false);
  const [isSocialButtonOpen, setIsSocialButtonOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('Kopen');

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken = jwtDecode(token);
      const expirationTime = decodedToken.exp * 1000;
      if (Date.now() >= expirationTime) {
        localStorage.removeItem('token');
        // navigate('login');
      } else {
        setIsLoggedIn(true);
      }
    } else {
      // navigate('login');
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    // navigate('/login'); 
  };

  const togglePlusButton = () => {
    setIsPlusButtonOpen(!isPlusButtonOpen);
    setIsSocialButtonOpen(!isSocialButtonOpen);
  };

  const handleToggle = (section) => {
    setActiveSection(section);
  };

  return (
    <>
      <div className="market">
        <Header/>
        <main className="main">
          <section className="toggle">
            <div 
              className={`toggle-item ${activeSection === 'Kopen' ? 'active' : ''}`} 
              onClick={() => handleToggle('Kopen')}
            >
              Kopen
            </div>
            <div 
              className={`toggle-item ${activeSection === 'Verkopen' ? 'active' : ''}`} 
              onClick={() => handleToggle('Verkopen')}
            >
              Verkopen
            </div>
          </section>
          {activeSection === 'Kopen' ? (
            <>
            <section className='market-buy'>
              <section className="favorites">
                <h2>Mijn favorieten</h2>
                <div className="plant-card">
                  {/* <img src="path/to/cactus.jpg" alt="Plant 2" className="plant-image" /> */}
                  <div className="plant-info">
                    <h3>Plant 2</h3>
                    <p>€ 10,00</p>
                  </div>
                  <div className="favorite-icon">LIKE</div>
                </div>
              </section>
              <section>
                <h2>Onlangs toegevoegd</h2>
              </section>
            </section>
            </>
          ) : (
            <section className="recently-added">
              <h2>Planten verkopen</h2>
              {/* Content for Verkopen section */}
              {/* <button className="add-button">+</button> */}
            </section>
          )}
            <button className={`plus-button ${isPlusButtonOpen ? 'open' : ''}`} onClick={togglePlusButton}></button>
            <button className={`add-button sell-button ${isSocialButtonOpen ? 'active' : ''}`}></button>
            <div className={`add-text buy ${isSocialButtonOpen ? 'active' : ''}`}>Kopen</div>
            <button className={`add-button buy-button ${isSocialButtonOpen ? 'active' : ''}`}></button>
            <div className={`add-text sell ${isSocialButtonOpen ? 'active' : ''}`}>Verkopen</div>
        </main>
      </div>
      <Navbar/>
    </>
  );
}

export default Market;
