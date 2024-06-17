import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/helper/supabaseClient';

const EditPlantMarket = () => {
  const { plantId } = useParams();
  const navigate = useNavigate();
  const [plant, setPlant] = useState(null);
  const [nickname, setNickname] = useState('');
  const [price, setPrice] = useState('');

  useEffect(() => {
    const fetchPlant = async () => {
      try {
        // Fetch plant details based on plantId
        const { data, error } = await supabase
          .from('user_plants')
          .select('*, market_drafts(*), plants_for_sale(*)')
          .eq('id', plantId)
          .single();

        if (error) {
          console.error('Error fetching plant details:', error);
        } else {
          setPlant(data);
          console.log(data)
          setNickname(data.nickname);
          setPrice(data.market_drafts.price || data.plants_for_sale[0].selling_price);
        }
      } catch (error) {
        console.error('Unexpected error fetching plant:', error);
      }
    };

    fetchPlant();
  }, [plantId]);

  const handleSave = async () => {
    try {
      // Update plant nickname
      const { error: updateNicknameError } = await supabase
        .from('user_plants')
        .update({ nickname })
        .eq('id', plantId);

      if (updateNicknameError) {
        console.error('Error updating nickname:', updateNicknameError);
        return;
      }

      // Update price in market_drafts or plants_for_sale
      if (plant.market_drafts) {
        const { error: updatePriceError } = await supabase
          .from('market_drafts')
          .update({ price })
          .eq('user_plant_id', plantId);

        if (updatePriceError) {
          console.error('Error updating price in market_drafts:', updatePriceError);
          return;
        }
      } else if (plant.plants_for_sale) {
        const { error: updatePriceError } = await supabase
          .from('plants_for_sale')
          .update({ selling_price: price })
          .eq('user_plant_id', plantId);

        if (updatePriceError) {
          console.error('Error updating price in plants_for_sale:', updatePriceError);
          return;
        }
      }

      // Navigate back to the user drafts page
      navigate('/markt');
    } catch (error) {
      console.error('Unexpected error saving plant:', error);
    }
  };

  if (!plant) return <div>Loading...</div>;

  return (
    <div className="edit-plant-page">
      <h1>Bewerk Plant</h1>
      <label>
        Naam:
        <input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
        />
      </label>
      <label>
        Prijs:
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
      </label>
      <button onClick={handleSave}>Opslaan</button>
      <button onClick={() => navigate('/markt')}>Annuleren</button>
    </div>
  );
};

export default EditPlantMarket;
