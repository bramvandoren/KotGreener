// Marketplace.jsx

import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/helper/supabaseClient';
import './Market.css';
import Header from '../Header/Header';
import Navbar from '../Navbar/Navbar';
import MarketDrafts from './MarketDrafts';
import UserDrafts from './UserDrafts';
import { Link, useNavigate } from 'react-router-dom';

const Marketplace = () => {
  const [plantsForSale, setPlantsForSale] = useState([]);
  const [filteredPlants, setFilteredPlants] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [userPlants, setUserPlants] = useState([]);
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [sellingPrice, setSellingPrice] = useState('');
  const [session, setSession] = useState(false);
  const [favoritePlants, setFavoritePlants] = useState([]);
  const [activeSection, setActiveSection] = useState('Kopen');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        if (session) {
          // fetchUserPlants(session.user.id);
          fetchPlantsForSale(session.user.id)
        }
        //  else {
        //   navigate('/login');
        // }
      } catch (error) {
        console.error('Error fetching session:', error);
      }
    };
    fetchSession();
  }, []);

  const fetchPlantsForSale = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('plants_for_sale')
        .select('*, user_plants(*, plants(*)), profiles(*)')
        .neq('profile_id', userId);

      if (error) {
        console.error('Error fetching plants for sale:', error);
      } else {
        setPlantsForSale(data);
        setFilteredPlants(data);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
    }
  };  

  // const fetchUserPlants = async (userId) => {
  //   try {
  //     const { data, error } = await supabase
  //       .from('user_plants')
  //       .select('*, plants(*)')
  //       .eq('profile_id', userId);

  //     if (error) {
  //       console.error('Error fetching user plants:', error);
  //     } else {
  //       setUserPlants(data);
  //     }
  //   } catch (error) {
  //     console.error('Unexpected error:', error);
  //   }
  // };

  useEffect(() => {
    if (userPlants.length > 0 && plantsForSale.length > 0) {
      const favoritePlantIds = plantsForSale.map(plant => plant.plant_id);
      console.log(plantsForSale);
      const filteredFavorites = plantsForSale.filter(plant => 
        favoritePlantIds.includes(plant.user_plants.plant_id)
      );
      setFavoritePlants(filteredFavorites);
    }
  }, [userPlants, plantsForSale]);

  const handlePlantSelect = (plant) => {
    setSelectedPlant(plant);
  };

  const handleSellPlant = async () => {
    if (!selectedPlant || !sellingPrice) {
      alert('Selecteer een plant en voer een prijs in.');
      return;
    }
  
    if (isNaN(sellingPrice) || parseFloat(sellingPrice) <= 0) {
      alert('Voer een geldige prijs in.');
      return;
    }
  
    try {
      const { data, error } = await supabase
        .from('plants_for_sale')
        .insert([
          {
            user_plant_id: selectedPlant.id,
            selling_price: parseFloat(sellingPrice),
            profile_id: session.user.id
          }
        ]);
  
      if (error) {
        console.error('Error selling plant:', error);
      } else {
        fetchPlantsForSale();
        setSelectedPlant(null);
        setSellingPrice('');
      }
    } catch (error) {
      console.error('Unexpected error:', error);
    }
  };

  const handleBuyPlant = async (plantForSale) => {
    if (!session) {
      alert('Je moet ingelogd zijn om een plant te kopen.');
      return;
    }
  
    try {
      // Begin transaction
      const { data: purchaseData, error: purchaseError } = await supabase
        .from('purchases')
        .insert([
          {
            buyer_id: session.user.id,
            plant_for_sale_id: plantForSale.id,
            price: plantForSale.selling_price,
          }
        ]);
  
      if (purchaseError) {
        console.error('Error processing purchase:', purchaseError);
      } else {
        // Update plant status or remove from sale
        const { data: updateData, error: updateError } = await supabase
          .from('plants_for_sale')
          .update({ status: 'sold' })
          .eq('id', plantForSale.id);
  
        if (updateError) {
          console.error('Error updating plant status:', updateError);
        } else {
          fetchPlantsForSale();
        }
      }
    } catch (error) {
      console.error('Unexpected error:', error);
    }
  };

  const handleSearch = () => {
    let filtered = plantsForSale;

    if (searchTerm) {
      filtered = filtered.filter(plant =>
        plant.user_plants.nickname.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (minPrice) {
      filtered = filtered.filter(plant =>
        parseFloat(plant.selling_price) >= parseFloat(minPrice)
      );
    }

    if (maxPrice) {
      filtered = filtered.filter(plant =>
        parseFloat(plant.selling_price) <= parseFloat(maxPrice)
      );
    }

    setFilteredPlants(filtered);
  };

  const handleToggle = (section) => {
    setActiveSection(section);
  };

  return (
    <>
    <div className="marketplace">
      <Header/>
      <div className="marketplace-header">
      <div className="breadcrumb">
        <Link to={'/markt'}>Studenten Markt</Link>
      </div>
      <h2>Markt</h2>
      <p>Welkom op de studenten markt, verkooop en koop hier jouw planten tegen een voordelige prijs!</p>
      </div>
      <main className="main">
          <div className="toggle">
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
          </div>
            {activeSection === 'Kopen' ? (
              <>
              <div className="buy-section">
                <h2>Planten kopen</h2>
                <div className="filter-section">
                  <input
                    type="text"
                    placeholder="Zoek op plantnaam"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <input
                    type="number"
                    placeholder="Min prijs"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                  />
                  <input
                    type="number"
                    placeholder="Max prijs"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                  />
                  <button onClick={handleSearch}>Zoek</button>
                </div>
                <div className="section">
                  {filteredPlants.length > 0 ? (
                    <>
                    <p>{filteredPlants.length == 1 ? "1 plant te koop" : "planten te koop"}</p>
                    <div>
                      {filteredPlants.map(plant => (
                        <div className="plant-card-market" key={plant.id}>
                          <div className="plant-card-market-image-overlay">
                            <img src={plant.user_plants.image_url} />
                          </div>
                          <h3>{plant.user_plants.plants.name}</h3>
                          <i>{plant.user_plants.nickname}</i>
                          <p className="card-username">van {plant.profiles.username}</p>
                          <p className="plant-price">{plant.selling_price} euro</p>
                          <button>Koop</button>
                        </div>
                      ))}
                    </div>
                    </>
                  ) : (
                    <p>Geen planten beschikbaar om te kopen.</p>
                  )}
                </div>
                <div className="section">
                  <h3>Planten die jij ook hebt</h3>
                  {favoritePlants.length > 0 ? (
                    <div>
                      {favoritePlants.map(plant => (
                        <div className="plant-card-market" key={plant.id}>
                          <div className="plant-card-market-image-overlay">
                            <img src={plant.user_plants.image_url} alt={plant.user_plants.nickname} />
                          </div>
                          <h4>{plant.user_plants.nickname}</h4>
                          <h5>{plant.user_plants.plants.name}</h5>
                          <p>{plant.profiles.username}</p>
                          <p>{plant.selling_price} euro</p>
                          <button onClick={() => handleBuyPlant(plant)}>Koop</button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p>Geen favoriete planten beschikbaar om te kopen.</p>
                  )}
                </div>
              </div>
              </>
            ) : (
            <section className="sell-section">
              <div className="sell-section-header">
                <h2>Planten verkopen</h2>
                <button className="addPlant-button" onClick={() => navigate('/markt/add')}>Plant toevoegen +</button>
                <button className="plus-button" onClick={() => navigate('/markt/add')}>
                  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" 
                    viewBox="0 0 45.402 45.402"
                    xmlSpace="preserve">
                    <g>
                      <path d="M41.267,18.557H26.832V4.134C26.832,1.851,24.99,0,22.707,0c-2.283,0-4.124,1.851-4.124,4.135v14.432H4.141
                        c-2.283,0-4.139,1.851-4.138,4.135c-0.001,1.141,0.46,2.187,1.207,2.934c0.748,0.749,1.78,1.222,2.92,1.222h14.453V41.27
                        c0,1.142,0.453,2.176,1.201,2.922c0.748,0.748,1.777,1.211,2.919,1.211c2.282,0,4.129-1.851,4.129-4.133V26.857h14.435
                        c2.283,0,4.134-1.867,4.133-4.15C45.399,20.425,43.548,18.557,41.267,18.557z"/>
                    </g>
                  </svg>
                </button>
              </div>
              <UserDrafts />
              {/* <MarketDrafts/> */}
            </section>
          )}
        </main>
    </div>
    <Navbar/>
    </>
  );
};

export default Marketplace;
