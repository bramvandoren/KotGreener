import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/helper/supabaseClient';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../Header/Header';
import Navbar from '../Navbar/Navbar';

const MarketDrafts = () => {
  const [userPlants, setUserPlants] = useState([]);
  const [price, setPrice] = useState('');
  const [session, setSession] = useState(false);
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [errorMessages, setErrorMessages] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        if (session) {
          fetchUserPlants(session.user.id);
        } else {
          navigate('/login');
        }
      } catch (error) {
        console.error('Error fetching session:', error);
      }
    };
    fetchSession();
  }, [navigate]);

  const fetchUserPlants = async (userId) => {
    const { data, error } = await supabase
      .from('user_plants')
      .select('*')
      .eq('profile_id', userId)
      .eq('is_on_market', false)
      .eq('is_draft', false);

    if (!error) {
      setUserPlants(data);
    } else {
      console.error('Error fetching user plants:', error);
    }
  };

  const validateInputs = () => {
    const errors = {};
    if (!selectedPlant) {
      errors.plant = 'Selecteer een plant.';
    }

    if (!price) {
      errors.price = 'Voer een prijs in.';
    } else if (isNaN(price) || price <= 0) {
      errors.price = 'Voer een geldige prijs in.';
    }

    return errors;
  };


  const addToDrafts = async () => {
    
    const errors = validateInputs();
    setErrorMessages(errors);

    if (selectedPlant && price) {
      // Controleer of de plant niet op de markt staat of al in een draft zit
      const { data: plantData, error: fetchError } = await supabase
        .from('user_plants')
        .select('is_on_market, is_draft')
        .eq('id', selectedPlant)
        .single();
        
      if (fetchError) {
        console.error('Error fetching plant data:', fetchError);
        return;
      }

      if (plantData.is_on_market || plantData.is_draft) {
        setErrorMessages({
          plant: 'Deze plant staat al op de markt of zit al in een draft.',
        });
        return;
      }

      // Update de is_draft vlag in user_plants
      const { error: updateError } = await supabase
        .from('user_plants')
        .update({ is_draft: true })
        .eq('id', selectedPlant);

      if (updateError) {
        console.error('Error updating is_draft flag:', updateError);
        return;
      }

      // Voeg de plant toe aan market_drafts
      const { error: insertError } = await supabase
        .from('market_drafts')
        .insert([{ 
          user_plant_id: selectedPlant,
          profile_id: session.user.id,
          price 
        }]);

      if (!insertError) {
        fetchUserPlants(session.user.id); // Update de lijst van planten na toevoeging
        setPrice(''); // Reset het prijsveld
        setSelectedPlant(''); // Reset de geselecteerde plant
        setErrorMessages({}); // Clear error messages
        setSelectedPlant(null); // Reset de geselecteerde plant
        navigate('/markt');
      } else {
        console.error('Error inserting into market_drafts:', insertError);
      }
    } else {
      console.error('Error inserting into market_drafts:', insertError);
    }
  };

  return (
    <>
      <div className="market-add-draft">
        <Header />
        <div className="breadcrumb">
          <Link to={'/markt'}>Studenten Markt</Link>
          <span> / </span>
          <Link>Verkopen</Link>
          <span> / </span>
          <Link>Plant toevoegen</Link>
        </div>
        <div className="addDraft-form">
          <h2>Plaats plant op de markt</h2>
          <div className="select-plant">
            <label>Kies een plant</label>
            <select value={selectedPlant} onChange={(e) => setSelectedPlant(e.target.value)}>
              <option value="">Kies een plant</option>
              {userPlants.map((plant) => (
                <option key={plant.id} value={plant.id}>
                  {plant.nickname}
                </option>
              ))}
            </select>
            {errorMessages.plant && <div className="error-message">{errorMessages.plant}</div>}
          </div>
          <div className="input-price">
            <label>Prijs</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Voer de prijs in"
              min={0}
            />
            {errorMessages.price && <div className="error-message">{errorMessages.price}</div>}
          </div>
          <button onClick={addToDrafts}>Voeg toe aan Drafts</button>
        </div>
      </div>
      <Navbar />
    </>
  );
};

export default MarketDrafts;
