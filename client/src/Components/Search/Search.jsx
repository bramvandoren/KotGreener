import React, { useEffect, useState } from 'react';
import {jwtDecode} from 'jwt-decode';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import Select from 'react-select';
import PlantCard from './PlantCard';
import Navbar from '../Navbar/Navbar';
import { supabase } from '../../lib/helper/supabaseClient';
import logo from "../../assets/logo-kotgreener.svg";
import './Search.css';
import Header from '../Header/Header';

function Search() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState(null);
  const [sunlight, setSunlight] = useState(null);
  const [size, setSize] = useState(null);
  const [care, setCare] = useState(null);
  const [results, setResults] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    setQuery(e.target.value);
  };
  
  const handleClearSearch = () => {
    setQuery('');
  };

  const sunlightOptions = [
    { value: 'zonnig', label: 'Zonnig' },
    { value: 'schaduw', label: 'Schaduw' },
    { value: 'halfschaduw', label: 'Halfschaduw' },
  ];

  const sizeOptions = [
    { value: 'klein', label: 'Klein (<=15cm)' },
    { value: 'middel', label: 'Middel (15cm tem 50 cm)' },
    { value: 'groot', label: 'Groot (>50cm)' },
  ];

  const careOptions = [
    { value: 'dagelijks', label: 'Dagelijks' },
    { value: 'wekelijks', label: 'Wekelijks' },
    { value: 'tweewekelijks', label: '2-wekelijks' },
    { value: 'maandelijks', label: 'Maandelijks' },
  ];

  const filterResults = (plants) => {
    let filteredResults = plants.filter((plant) =>
      plant.name.toLowerCase().includes(query.toLowerCase())
    );

    if (category) {
      filteredResults = filteredResults.filter((plant) =>
        plant.category.includes(category.value)
      );
    }

    if (sunlight) {
      filteredResults = filteredResults.filter((plant) => {
        if (sunlight.value === 'zonnig') return plant.sunlight === 'zonnig';
        if (sunlight.value === 'schaduw') return plant.sunlight === 'schaduw';
        if (sunlight.value === 'halfschaduw') return plant.sunlight == 'halfschaduw';
        return true;
    });
    }

    if (size) {
      filteredResults = filteredResults.filter((plant) => {
        if (size.value === 'klein') return plant.height <= 15;
        if (size.value === 'middel') return plant.height > 15 && plant.height <= 50;
        if (size.value === 'groot') return plant.height > 50;
        return true;
      });
    }

    if (care) {
      filteredResults = filteredResults.filter((plant) => {
        if (care.value === 'dagelijks') return plant.water_frequency === 'daily';
        if (care.value === 'wekelijks') return plant.water_frequency === 'weekly';
        if (care.value === 'tweewekelijks') return plant.water_frequency === 'biweekly';
        if (care.value === 'maandelijks') return plant.water_frequency === 'monthly';
        return true;
      });
    }

    setResults(filteredResults);
  };

  useEffect(() => {
    const fetchSessionAndUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        // Nu kunnen we fetchFavorites aanroepen nadat de sessie is ingesteld
        fetchFavorites(session);
      } catch (error) {
        console.error('Error fetching session or user:', error);
      }
    };
    const fetchPlants = async () => {
      try {
        const { data: plants, error } = await supabase
          .from('plants')
          .select('*');

        if (error) {
          throw new Error('Failed to fetch plants');
        }

        filterResults(plants);
      } catch (error) {
        console.error(error);
      }
    };
    fetchSessionAndUser();
    fetchPlants();
  }, [query, category, sunlight, size, care]);

  const fetchFavorites = async (session) => {
    try {
      const { data: favoritePlants, error } = await supabase
        .from('favorites')
        .select('plant_id')
        .eq('profile_id', session.user.id);

      if (error) {
        throw new Error('Failed to fetch favorites');
      }

      setFavorites(favoritePlants.map(fav => fav.plant_id));
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  };

  const handleFavorite = async (plantId) => {
    if (!session) return;
    const userId = session.user.id;

    try {
      const { error } = await supabase
        .from('favorites')
        .insert([{ profile_id: userId, plant_id: plantId }]);

      if (error) {
        throw new Error('Failed to add favorite');
      }

      setFavorites([...favorites, plantId]);
    } catch (error) {
      console.error('Error adding favorite:', error);
    }
  };

  const handleUnfavorite = async (plantId) => {
    if (!session) return;
    const userId = session.user.id;

    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('profile_id', userId)
        .eq('plant_id', plantId);

      if (error) {
        throw new Error('Failed to remove favorite');
      }

      setFavorites(favorites.filter((id) => id !== plantId));
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  const handleFilterRemove = (filterType) => {
    switch (filterType) {
      case 'category':
        setCategory(null);
        break;
      case 'sunlight':
        setSunlight(null);
        break;
      case 'size':
        setSize(null);
        break;
      case 'care':
        setCare(null);
        break;
      default:
        break;
    }
  };

  return (
    <>
      <div className="search-page">
        <Header/>
        <div className="search-intro">
          <Link className="breadcrumb">Planten zoeken</Link>
          <div className="search-intro-header">
            <h2>Planten zoeken</h2>
          </div>
          <p className="search-intro-text">Zoek nu jouw perfecte plant. Pas aan naar jouw persoonlijke keuze en ontdek.
          </p>
        </div>
        <div className="filter">
          <div className="search-input">
            <input
              type="text"
              placeholder="Zoek een plant"
              value={query}
              onChange={handleSearch}
              className="input-search-icon"
            />
            {query ? (
            <svg className="clear-icon" onClick={handleClearSearch} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16.875 7.125L7.125 16.875M7.125 7.125L16.875 16.875" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            ) : (<></>)}
            <svg className="search-icon" width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21.875 21.875L15.625 15.625M3.125 10.4167C3.125 11.3742 3.3136 12.3224 3.68005 13.2071C4.04649 14.0917 4.58359 14.8956 5.26068 15.5727C5.93777 16.2497 6.7416 16.7868 7.62627 17.1533C8.51093 17.5197 9.45911 17.7083 10.4167 17.7083C11.3742 17.7083 12.3224 17.5197 13.2071 17.1533C14.0917 16.7868 14.8956 16.2497 15.5727 15.5727C16.2497 14.8956 16.7868 14.0917 17.1533 13.2071C17.5197 12.3224 17.7083 11.3742 17.7083 10.4167C17.7083 9.45911 17.5197 8.51093 17.1533 7.62627C16.7868 6.7416 16.2497 5.93777 15.5727 5.26068C14.8956 4.58359 14.0917 4.04649 13.2071 3.68004C12.3224 3.3136 11.3742 3.125 10.4167 3.125C9.45911 3.125 8.51093 3.3136 7.62627 3.68004C6.7416 4.04649 5.93777 4.58359 5.26068 5.26068C4.58359 5.93777 4.04649 6.7416 3.68005 7.62627C3.3136 8.51093 3.125 9.45911 3.125 10.4167Z" stroke="black" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="dropdowns">
            <Select
              options={sunlightOptions}
              placeholder="Hoeveelheid Zonlicht"
              value={sunlight}
              onChange={setSunlight}
              className="dropdown"
            />
            <Select
              options={sizeOptions}
              placeholder="Grootte Plant"
              value={size}
              onChange={setSize}
              className="dropdown"
            />
            <Select
              options={careOptions}
              placeholder="Hoeveelheid Verzorging"
              value={care}
              onChange={setCare}
              className="dropdown"
            />
          </div>
        </div>
        <div className="selected-filters">
          {category && (
            <button className="filter-button" onClick={() => handleFilterRemove('category')}>
              {category.label} ✕
            </button>
          )}
          {sunlight && (
            <button className="filter-button" onClick={() => handleFilterRemove('sunlight')}>
              {sunlight.label} ✕
            </button>
          )}
          {size && (
            <button className="filter-button" onClick={() => handleFilterRemove('size')}>
              {size.label} ✕
            </button>
          )}
          {care && (
            <button className="filter-button" onClick={() => handleFilterRemove('care')}>
              {care.label} ✕
            </button>
          )}
        </div>
        <div className='filters-extra'>
        <div className="results-count">
          {results.length > 0 ? (
            <p>{results.length} plant{results.length > 1 ? 'en' : ''} gevonden</p>
          ) : (
            <p>0 planten gevonden</p>
          )}
        </div>
        <button>Meer Filters</button>
      </div>
      <div className="results">
        {results.length > 0 ? (
          results.map((plant) => (
            <PlantCard
              key={plant.id} 
              plant={plant}
              isFavorite={session && favorites.includes(plant.id)}
              onFavorite={handleFavorite}
              onUnfavorite={handleUnfavorite}
              session={session}
            />
          ))
        ) : (
          <p className="no-results">Er zijn geen resultaten voor uw zoekopdracht.</p>
        )}
      </div>
      </div>
      <Navbar />
    </>
  );
}

export default Search;
