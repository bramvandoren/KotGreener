import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/helper/supabaseClient';
import Header from '../Header/Header';
import Avatar from '../Profile/Avatar';
import ChangePlantImage from './ChangePlantImage';

const EditPlant = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [nickname, setNickname] = useState(null);
  const [sunlight, setSunlight] = useState(null);
  const [water_frequency, setWaterFrequency] = useState(null);
  const [height, setHeight] = useState('');
  const [repottingFrequency, setRepottingFrequency] = useState('');
  const [avatar_url, setAvatarUrl] = useState(null);
  const [session, setSession] = useState(null);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        if (!session) {
          navigate('/login');
        }
      } catch (error) {
        console.error('Error fetching session:', error);
      }
    };
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
        setHeight(data.height);
        setWaterFrequency(data.water_frequency);
        setRepottingFrequency(data.repotting);
      }
      setLoading(false)
    };
    fetchSession();
    fetchPlantDetails();
  }, [id]);

  async function updateProfile(event, avatarUrl) {
    event.preventDefault()

    setLoading(true)
    const { user } = session

    const updates = {
      id: user.id,
      image_url: avatarUrl,
    }

    const { error } = await supabase.from('user_plants').upsert(updates);

    const file = event.target.files[0]
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random()}.${fileExt}`
    const filePath = `${fileName}`
    const { error: uploadError } = await supabase.storage.from('user_plants_images').upload(filePath, file)

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

  const handleUpdatePlant = async () => {
    // const { nickname, sunlight, water_frequency } = plant;
    try {
      const { error } = await supabase
        .from('user_plants')
        .update({
          nickname,
          sunlight,
          water_frequency,
          height,
          repotting:repottingFrequency
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
        <div>
            {/* <ChangePlantImage
              url={avatar_url}
              size={150}
              onUpload={(event, url) => {
                  updateProfile(event, url)
              }}
            /> */}
          </div>
        <div className="editPlant-form-items">
          <label>
              Bijnaam
          </label>
              <input
              type="text"
              name="nickname"
              value={nickname || ''}
              onChange={(e) => setNickname(e.target.value)}
              />
          <label>
            Hoogte (in cm)
          </label>
          <input
            type="number"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            required
            min={1}
          />
          <label>
            Zonlicht
          </label>
          <input
          type="text"
          name="sunlight"
          value={sunlight || ''}
          onChange={(e) => setSunlight(e.target.value)}
          disabled
          />
          <label>
            Water
          </label>
          <input
          type="text"
          name="water_frequency"
          value={water_frequency || ''}
          onChange={(e) => setWaterFrequency(e.target.value)}
          disabled
          />
          <label>
            Verpotten frequentie
          </label>
          <input
          type="text"
          name="repotting_frequency"
          value={repottingFrequency || ''}
          onChange={(e) => setRepottingFrequency(e.target.value)}
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
