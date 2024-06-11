import React, { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import logo from "../../assets/logo-kotgreener.svg";
import { supabase } from '../../lib/helper/supabaseClient';
import { addDays, format } from 'date-fns';
import Header from '../Header/Header';
import Navbar from '../Navbar/Navbar';

function AddPlant() {
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [sunlight, setSunlight] = useState('');
  const [waterFrequency, setWaterFrequency] = useState('');
  const [height, setHeight] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [downloadImageUrl, setDownloadImageUrl] = useState('');

  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [existingPlants, setExistingPlants] = useState([]);
  const [selectedPlant, setSelectedPlant] = useState('');
  const [isManualEntry, setIsManualEntry] = useState(false);
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(true)
  // const [verticuttingFrequency, setVerticuttingFrequency] = useState('');
  const [repottingFrequency, setRepottingFrequency] = useState('');


  useEffect(() => {

    const fetchSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        if (session) {
          // getPlant(session.user.id);
        } else {
          navigate('/login');
        }
      } catch (error) {
        console.error('Error fetching session:', error);
      }
    };
    const fetchPlants = async () => {
      const { data, error } = await supabase
        .from('plants')
        .select('*');

      if (error) {
        console.error('Error fetching plants:', error);
      } else {
        setExistingPlants(data);
      }
    };
    
    fetchSession();
    fetchPlants();
    // if (imageUrl) downloadImage(imageUrl)
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedPlant || !sunlight || !waterFrequency) {
      alert("Please fill all required fields.");
      return;
    }

    if (height <= 0) {
      alert("Een plant moet groter zijn dan 0.");
      return;
    }

    try {
      const userId = session.user.id;

      const { data, error } = await supabase
        .from('user_plants')
        .insert({
          profile_id: userId,
          plant_id: isManualEntry ? null : selectedPlant,
          nickname,
          height,
          sunlight,
          water_frequency: waterFrequency,
          // verticutting: verticuttingFrequency,
          repotting: repottingFrequency,
          image_url: imageUrl
        })
        .select('*')
        .single();

      if (error) {
        console.error('Error adding plant:', error);
      } else {
        // setImageUrl(imageUrl)
        const startDate = new Date();
        const wateringEvents = generateWateringEvents(data, startDate);
        const repottingEvents = generateRepottingEvents(data, startDate);
        const allEvents = [...wateringEvents, ...repottingEvents];
        await supabase
          .from('watering_events')
          .insert(allEvents.map(event => ({ ...event, profile_id: userId, user_plant_id: data.id })));

        navigate('/my-plants');
      }
    } catch (error) {
      console.error('Error adding plant:', error);
    }
  };

  const handlePlantChange = (e) => {
    const plantId = e.target.value;
    setSelectedPlant(plantId);

    if (plantId === "manual") {
      setIsManualEntry(true);
      setHeight('');
      setSunlight('');
      setWaterFrequency('');
      // setVerticuttingFrequency('');
      setRepottingFrequency('');
      setImageUrl('');
    } else {
      setIsManualEntry(false);
      const selected = existingPlants.find(plant => plant.id === plantId);
      if (selected) {
        setHeight(selected.height);
        setSunlight(selected.sunlight);
        setWaterFrequency(selected.water_frequency);
        // setVerticuttingFrequency(selected.verticutting);
        setRepottingFrequency(selected.repotting);
        setImageUrl(selected.image_url);
      }
    }
  };

  async function downloadImage(path) {
    try {
      const { data, error } = await supabase.storage.from('user_plants_images').download(path)
      if (error) {
        throw error
      }
      const url = URL.createObjectURL(data)
      setDownloadImageUrl(url)
    } catch (error) {
      console.log('Error downloading image: ', error.message)
    }
  }

  async function uploadImage(event) {
    try {
      setUploading(true)

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.')
      }

      const file = event.target.files[0]
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `${fileName}`

      // const { error: uploadError } = await supabase.storage.from('user_plants_images').upload(filePath, file)

      // if (uploadError) {
      //   throw uploadError
      // }

      // onUpload(event, filePath)

      // setLoading(true)
      setImageUrl(filePath)      
    } catch (error) {
      alert(error.message)
    } finally {
      setUploading(false)
    }
  }

  const generateWateringEvents = (plant, startDate) => {
    const events = [];
    let currentDate = new Date(startDate);
    const frequencyMap = {
      'dagelijks': 1,
      'wekelijks': 7,
      'tweewekelijks': 14,
      'maandelijks': 30
    };
    const interval = frequencyMap[plant.water_frequency];
  
    // events genereren voor de komende 3 maand
    for (let i = 0; i < 90 / interval; i++) {
      events.push({
        title: `${plant.nickname ? plant.nickname : plant.plants.name }`,
        start_event: format(currentDate, 'yyyy-MM-dd'),
        end_event: format(currentDate, 'yyyy-MM-dd'),
        type: 'watering',
      });
      currentDate = addDays(currentDate, interval);
    }
    return events;
  };

  const generateRepottingEvents = (plant, startDate) => {
    const events = [];
    let currentDate = new Date(startDate);
    const frequencyMap = {
      'jaarlijks': 360,
      'tweejaarlijks': 730,
      // 'driejaarlijks': 1460,
    };
    const interval = frequencyMap[plant.repotting];

    // events genereren voor de komende 2 jaar
    for (let i = 0; i < 730 / interval; i++) {
      events.push({
        title: `${plant.nickname ? plant.nickname : plant.plants.name }`,
        start_event: format(currentDate, 'yyyy-MM-dd'),
        end_event: format(currentDate, 'yyyy-MM-dd'),
        type: 'repotting',
      });
      currentDate = addDays(currentDate, interval);
    }
    return events;
  };
  

  return (
    <>
    <div className="addPlant">
      <Header/>
      <div className="my-plants-intro">
        <div className="breadcrumb">
          <Link to={'/my-plants'}>Mijn planten</Link>
          <span> / </span>
          <Link>Plant toevoegen</Link>
      </div>
        <div className="my-plants-intro-header">
          <h2>Plant toevoegen</h2>
        </div>
        <p className="my-plants-intro-text">
          Voeg hier uw eigen plant toe.
          Selecteer een plant en personaliseer deze.
          Vervolgens wordt er een schema voor uw plant te verzorgen gegenereerd.
        </p>
      </div>
      <div className="addPlant-form">
        {/* <h3>Voeg hier jouw plant toe</h3> */}
        <form onSubmit={handleSubmit}>
          <div className="form-left">
            <label>
              Selecteer plant
            </label>
            <select
              value={selectedPlant}
              onChange={handlePlantChange}
              required
            >
              <option disabled selected value="">Type plant</option>
              {existingPlants.map((plant) => (
                <option key={plant.id} value={plant.id}>
                  {plant.name}
                </option>
              ))}
              <option value="manual">Nieuwe plant toevoegen</option>
            </select>
            <label>
              Bijnaam
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              required
            />
            <label>
              Hoogte (in cm)
            </label>
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              disabled={!isManualEntry && selectedPlant !== ""}
              required
              min={1}
            />
            <label>
              Zonlicht
            </label>
            <select
              value={sunlight}
              onChange={(e) => setSunlight(e.target.value)}
              disabled={!isManualEntry && selectedPlant !== ""}
              required
            >
              <option disabled selected value="">Hoeveelheid zonlicht</option>
              <option value="zonnig">Zonnig</option>
              <option value="schaduw">Schaduw</option>
              <option value="halfschaduw">Halfschaduw</option>
            </select>
            <label>
              Waterfrequentie
            </label>
            <select
              value={waterFrequency}
              onChange={(e) => setWaterFrequency(e.target.value)}
              disabled={!isManualEntry && selectedPlant !== ""}
              required
            >
              <option disabled selected value="">Frequentie water geven</option>
              <option value="dagelijks">Dagelijks</option>
              <option value="wekelijks">Wekelijks</option>
              <option value="tweewekelijks">Tweewekelijks</option>
              <option value="maandelijks">Maandelijks</option>
            </select>
            {/* <label>
              Verticutting frequentie
              <select
                  value={verticuttingFrequency}
                  onChange={(e) => setVerticuttingFrequency(e.target.value)}
                  disabled={!isManualEntry && selectedPlant !== ""}
                  required
                >
                <option value="">--Selecteer voeding frequentie--</option>
                <option value="weekly">Wekelijks</option>
                <option value="biweekly">Tweewekelijks</option>
                <option value="monthly">Maandelijks</option>
              </select>
            </label> */}
          </div>
          <div className="form-right">
            <label>
              Verpotten frequentie
            </label>
            <select
              value={repottingFrequency}
              onChange={(e) => setRepottingFrequency(e.target.value)}
              disabled={!isManualEntry && selectedPlant !== ""}
              required
            >
              <option disabled selected value="">Wanneer verpotten</option>
              <option value="jaarlijks">Jaarlijks</option>
              <option value="tweejaarlijks">Tweejaarlijks</option>
              <option value="driejaarlijks">Driejaarlijks</option>
            </select>
            <label>
              Afbeelding URL:
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                disabled={!isManualEntry && selectedPlant !== ""}
              />
            </label>
            <label className="button primary block" htmlFor="single">
                {uploading ? 'Uploading ...' : 'Afbeelding kiezen'}
            </label>
            <input
              type="file"
              id="single"
              accept="image/*"
              onChange={uploadImage}
              disabled={uploading}
            />
            {/* {console.log(downloadImageUrl)} */}
            {downloadImageUrl ? (
              <img
                src={downloadImageUrl}
                alt="Image"
                className="my plant image"
                style={{ height: '50px', width: '50px' }}
              />
            ) : (
              <div className="avatar no-image" style={{ height: '50px', width: '50px' }} />
            )}
            <button type="submit">Plant toevoegen</button>
          </div>
        </form>
      </div>
    </div>
    <Navbar/>
  </>
  );
}

export default AddPlant;
