import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/helper/supabaseClient';
import Header from '../Header/Header';

const EditPlant = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true)
  // const [plant, setPlant] = useState({
  //   nickname: '',
  //   sunlight: '',
  //   water_frequency: '',
  // });
  const [nickname, setNickname] = useState(null);
  const [sunlight, setSunlight] = useState(null);
  const [water_frequency, setWaterFrequency] = useState(null);


  useEffect(() => {
    const fetchPlantDetails = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('user_plants')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching plant details:', error);
      } else {
        setNickname(data.nickname);
        setSunlight(data.sunlight);
        setWaterFrequency(data.water_frequency);
      }
      setLoading(false)
    };

    fetchPlantDetails();
  }, [id]);

  const handleUpdatePlant = async () => {
    // const { nickname, sunlight, water_frequency } = plant;
    try {
      const { error } = await supabase
        .from('user_plants')
        .update({
          nickname,
          sunlight,
          water_frequency,
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
      <Header/>
      <div className="breadcrumb">
        <Link to={'/my-plants'}>Mijn planten</Link>
        <span> / </span>
        <Link to={`/my-plants/${id}`}>{nickname}</Link>
        <span> / </span>
        <Link>Bewerken</Link>
      </div>
      <div className="editPlant-form">
        <h2>Bewerk Plant</h2>
        <div className="editPlant-form-items">
          <label>
              Nickname:
          </label>
              <input
              type="text"
              name="nickname"
              value={nickname || ''}
              onChange={(e) => setNickname(e.target.value)}
              />
          <label>
            Sunlight:
          </label>
          <input
          type="text"
          name="sunlight"
          value={sunlight || ''}
          onChange={(e) => setSunlight(e.target.value)}
          disabled
          />
          <label>
            Water Frequency:
          </label>
          <input
          type="text"
          name="water_frequency"
          value={water_frequency || ''}
          onChange={(e) => setWaterFrequency(e.target.value)}
          disabled
          />
          <button onClick={handleUpdatePlant} className="button block primary" type="submit" disabled={loading || (!nickname)}>
            {loading ? 'Loading ...' : 'Update Plant'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditPlant;
