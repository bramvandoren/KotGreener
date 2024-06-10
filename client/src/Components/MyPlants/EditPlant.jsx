import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Assumption: using react-router for routing
import { supabase } from '../../lib/helper/supabaseClient';

const EditPlant = () => {
  const { id } = useParams(); // Get userPlantId from URL params
  const navigate = useNavigate();
  const [plantDetails, setPlantDetails] = useState({
    nickname: '',
    sunlight: '',
    water_frequency: '',
    // Add more fields as necessary
  });

  useEffect(() => {
    const fetchPlantDetails = async () => {
      const { data, error } = await supabase
        .from('user_plants')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching plant details:', error);
      } else {
        setPlantDetails(data);
      }
    };

    fetchPlantDetails();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPlantDetails({ ...plantDetails, [name]: value });
  };

  const handleUpdatePlant = async () => {
    const { nickname, sunlight, water_frequency } = plantDetails;

    try {
      const { error } = await supabase
        .from('user_plants')
        .update({
          nickname,
          sunlight,
          water_frequency,
          // Update more fields as necessary
        })
        .eq('id', id);

      if (error) {
        console.error('Error updating plant:', error);
      } else {
        navigate(`/my-plants/${id}`);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
    }
  };

  return (
    <div className="editPlant">
        <div className="button-back" onClick={() => window.history.back()}>
          <svg width="25" height="25" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6.5625 14.0625H25.3125C25.5611 14.0625 25.7996 14.1613 25.9754 14.3371C26.1512 14.5129 26.25 14.7514 26.25 15C26.25 15.2486 26.1512 15.4871 25.9754 15.6629C25.7996 15.8387 25.5611 15.9375 25.3125 15.9375H6.5625C6.31386 15.9375 6.0754 15.8387 5.89959 15.6629C5.72377 15.4871 5.625 15.2486 5.625 15C5.625 14.7514 5.72377 14.5129 5.89959 14.3371C6.0754 14.1613 6.31386 14.0625 6.5625 14.0625Z" fill="black"/>
            <path d="M6.95059 15L14.7262 22.7737C14.9023 22.9498 15.0012 23.1885 15.0012 23.4375C15.0012 23.6864 14.9023 23.9252 14.7262 24.1012C14.5502 24.2773 14.3114 24.3761 14.0625 24.3761C13.8135 24.3761 13.5748 24.2773 13.3987 24.1012L4.96122 15.6637C4.87391 15.5766 4.80464 15.4732 4.75738 15.3593C4.71012 15.2454 4.68579 15.1233 4.68579 15C4.68579 14.8766 4.71012 14.7545 4.75738 14.6407C4.80464 14.5268 4.87391 14.4233 4.96122 14.3362L13.3987 5.89871C13.5748 5.72268 13.8135 5.62378 14.0625 5.62378C14.3114 5.62378 14.5502 5.72268 14.7262 5.89871C14.9023 6.07475 15.0012 6.31351 15.0012 6.56246C15.0012 6.81142 14.9023 7.05018 14.7262 7.22621L6.95059 15Z" fill="black"/>
          </svg>
          <p>Terug</p>
        </div>
        <h1>Bewerk Plant</h1>
        <label>
            Nickname:
            <input
            type="text"
            name="nickname"
            value={plantDetails.nickname}
            onChange={handleInputChange}
            />
        </label>
        <label>
            Sunlight:
            <input
            type="text"
            name="sunlight"
            value={plantDetails.sunlight}
            onChange={handleInputChange}
            disabled
            />
        </label>
        <label>
            Water Frequency:
            <input
            type="text"
            name="water_frequency"
            value={plantDetails.water_frequency}
            onChange={handleInputChange}
            disabled
            />
        </label>
        {/* Add more fields as necessary */}
        <button onClick={handleUpdatePlant}>Update Plant</button>
    </div>
  );
};

export default EditPlant;
