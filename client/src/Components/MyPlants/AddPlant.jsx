import React, { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import logo from "../../assets/logo-kotgreener.svg";
import { supabase } from '../../lib/helper/supabaseClient';
import Select from 'react-select';
import { addDays, format } from 'date-fns';
import Header from '../Header/Header';
import Navbar from '../Navbar/Navbar';
import { toast, ToastContainer } from 'react-toastify';

function AddPlant() {
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [sunlight, setSunlight] = useState('');
  const [waterFrequency, setWaterFrequency] = useState('');
  const [height, setHeight] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [downloadImageUrl, setDownloadImageUrl] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [existingPlants, setExistingPlants] = useState([]);
  const [selectedPlant, setSelectedPlant] = useState('');
  const [isManualEntry, setIsManualEntry] = useState(false);
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [repottingFrequency, setRepottingFrequency] = useState('');


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
      const plantId = selectedPlant.value;

      let uploadedImageUrl = imageUrl;
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const { data, error: uploadError } = await supabase.storage
          .from('userPlants_images')
          .upload(fileName, selectedFile);

        if (uploadError) {
          console.error('Error uploading image:', uploadError);
        } else {
          uploadedImageUrl = fileName;
        }
      }

      const { data, error } = await supabase
        .from('user_plants')
        .insert({
          profile_id: userId,
          plant_id: isManualEntry ? null : plantId,
          nickname,
          height,
          sunlight,
          water_frequency: waterFrequency,
          // verticutting: verticuttingFrequency,
          repotting: repottingFrequency,
          image_url: uploadedImageUrl
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

  const handlePlantChange = (selectedOption) => {
    setSelectedPlant(selectedOption);

    if (selectedOption.value === "manual") {
      setIsManualEntry(true);
      setHeight('');
      setSunlight('');
      setWaterFrequency('');
      // setVerticuttingFrequency('');
      setRepottingFrequency('');
      setImageUrl('');
      setPreviewUrl(''); // Reset de preview
    } else {
      setIsManualEntry(false);
      const selected = existingPlants.find(plant => plant.id === selectedOption.value);
      if (selected) {
        // setHeight(selected.height);
        setSunlight(selected.sunlight);
        setWaterFrequency(selected.water_frequency);
        // setVerticuttingFrequency(selected.verticutting);
        setRepottingFrequency(selected.repotting);
        setImageUrl(selected.image_url);
        setPreviewUrl(selected.image_url); // Zet de preview
      }
    }
  };

  const options = existingPlants.map((plant) => ({
    value: plant.id,
    label: plant.name,
  }));

  options.push({ value: 'manual', label: 'Nieuwe plant toevoegen' });

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setPreviewUrl(previewUrl); // Set preview URL
      setSelectedFile(file); // Set the selected file
      setImageUrl(''); // Reset de image URL
    }
  };

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
      'driejaarlijks': 1460,
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
          <Select
              options={options}
              value={selectedPlant}
              onChange={handlePlantChange}
              placeholder="Type plant"
              isClearable
              required
            />
            <label>
              Bijnaam
              <span className="info-icon" onClick={() => toast.info('Bijnaam: een unieke naam voor uw plant')}>
                ?
              </span>
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              required
            />
            <label>
              Hoogte (in cm)
              <span className="info-icon" onClick={() => toast.info('Hoogte: de hoogte van uw plant in centimeters')}>
                ?
              </span>
            </label>
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              // disabled={!isManualEntry && selectedPlant !== ""}
              required
              min={1}
            />
            <label>
              Zonlicht
              <span className="info-icon" onClick={() => toast.info('Zonlicht: hoeveel zonlicht uw plant nodig heeft')}>
                ?
              </span>
            </label>
            <select
              value={sunlight}
              onChange={(e) => setSunlight(e.target.value)}
              disabled={!isManualEntry && selectedPlant !== ""}
              required
            >
              <option disabled defaultValue value="">Hoeveelheid zonlicht</option>
              <option value="zonnig">Zonnig</option>
              <option value="schaduw">Schaduw</option>
              <option value="halfschaduw">Halfschaduw</option>
            </select>
            <label>
              Waterfrequentie
              <span className="info-icon" 
              onClick={() => 
              toast.info('Water frequentie: het aantal keer water geven van de plant')}>
                ?
              </span>
            </label>
            <select
              value={waterFrequency}
              onChange={(e) => setWaterFrequency(e.target.value)}
              disabled={!isManualEntry && selectedPlant !== ""}
              required
            >
              <option disabled defaultValue value="">Frequentie water geven</option>
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
              <span className="info-icon" 
              onClick={() => 
              toast.info('Verpotten: na hoeveel tijd de plant in andere pot zetten')}>
                ?
              </span>
            </label>
            <select
              value={repottingFrequency}
              onChange={(e) => setRepottingFrequency(e.target.value)}
              disabled={!isManualEntry && selectedPlant !== ""}
              required
            >
              <option disabled defaultValue value="">Wanneer verpotten</option>
              <option value="jaarlijks">Jaarlijks</option>
              <option value="tweejaarlijks">Tweejaarlijks</option>
              <option value="driejaarlijks">Driejaarlijks</option>
            </select>
            {/* <label>
              Afbeelding URL:
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                disabled={!isManualEntry && selectedPlant !== ""}
              />
            </label> */}
            <div className="addPlant-form-image">
              <div className="form-image-upload">
                <label className="button primary block" htmlFor="single">
                    {uploading ? 'Uploading ...' : 'Afbeelding kiezen'}
                </label>
                <input
                  type="file"
                  id="single"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={uploading}
                  required
                />
              </div>
              {previewUrl ? (
              <img
                src={previewUrl}
                alt="Preview"
                className="plant-image-preview"
                style={{ height: '100px', width: '100px', objectFit: 'cover' }} // Pas de grootte en stijl van de preview aan
                />
              ) : (
                <div className="avatar no-image" />
              )}
              </div>
            <button type="submit">Plant toevoegen</button>
          </div>
        </form>
      </div>
      <ToastContainer position="top-center" autoClose={5000} hideProgressBar={false} />
    </div>
    <Navbar/>
  </>
  );
}

export default AddPlant;
