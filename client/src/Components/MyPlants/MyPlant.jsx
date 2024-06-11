import React, { useState, useEffect } from 'react';
import {jwtDecode} from 'jwt-decode';
import { Link, NavLink, useNavigate, useParams } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import toolsAR from "../../assets/tools-ar.png";
import { supabase } from '../../lib/helper/supabaseClient';
import logo from "../../assets/logo-kotgreener.svg";
import './MyPlants.css';
import Header from '../Header/Header';

function MyPlant() {
  const { id } = useParams();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [plant, setMyPlant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isInMyPlants, setIsInMyPlants] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [plantImageUrl, setPlantImageUrl] = useState(null)
  const [events, setEvents] = useState([]);

  // const [downloadImageUrl, setDownloadImageUrl] = useState(null);

  useEffect(() => {
    let ignore = false

    const fetchSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        if (session) {
          fetchMyPlant(session.user.id);
          // checkIfFavorite(session.user.id);
          // fetchTasks(session.user.id);
        }
      } catch (error) {
        console.error('Error fetching session:', error);
      }
    };
    const fetchMyPlant = async (userId) => {
      const { data, error } = await supabase
        .from('user_plants')
        .select('*, plants(name, sunlight, water_frequency, image_url, height, description, verticutting, repotting)')
        .eq('id', id)
        .eq('profile_id', userId)
        .single();
  
      if (error) {
        console.error('Error fetching my plants:', error);
      } else {
        setMyPlant(data);
        setImageUrl(data.image_url)
      }
      setLoading(false);
    };
    
    // Function to fetch watering events for the specific userPlantId
    const fetchEvents = async () => {
      const { data, error } = await supabase
        .from('watering_events')
        .select('*')
        .eq('user_plant_id', id);
        
      if (error) {
        console.error('Error fetching events:', error);
      } else {
        setEvents(data.map(event => ({
          ...event,
          start_event: new Date(event.start_event),
          end_event: new Date(event.end_event),
        })));
      }
    };

    // console.log(imageUrl)
    fetchSession();
    fetchEvents();
    if (imageUrl) {
      downloadImage(imageUrl);
    }
    return () => {
      ignore = true
    }
  }, [id,imageUrl]);

  async function downloadImage(path) {
    try {
      const { data, error } = await supabase.storage.from('user_plants_images').download(path)
      if (error) {
        throw error
      }
      const url = URL.createObjectURL(data)
      setPlantImageUrl(url)
    } catch (error) {
      console.log('Error downloading image: ', error.message)
    }
  }

  const handleDeleteEvent = async (eventId) => {
    try {
      const { error } = await supabase
        .from('watering_events')
        .delete()
        .eq('id', eventId);
  
      if (error) {
        console.error('Error deleting event:', error);
      } else {
        setEvents(events.filter(event => event.id !== eventId));
      }
    } catch (error) {
      console.error('Unexpected error:', error);
    }
  };

  const handleEditPlant = () => {
    navigate(`/my-plants/edit/${id}`);
  };

  const handleDeletePlant = async () => {
    if (window.confirm('Weet je zeker dat je deze plant wilt verwijderen?')) {
      try {
        const { error } = await supabase
          .from('user_plants')
          .delete()
          .eq('id', id);

        if (error) {
          console.error('Error deleting plant:', error);
        } else {
          // Verwijder bijbehorende events
          const { error: eventsError } = await supabase
            .from('watering_events')
            .delete()
            .eq('user_plant_id', id);

          if (eventsError) {
            console.error('Error deleting watering events:', eventsError);
          }

          navigate('/my-plants');
        }
      } catch (error) {
        console.error('Unexpected error:', error);
      }
    }
  };

  if (loading) {
    return <div>Loading...</div>;
}

if (!plant) {
    return <div>Plant niet gevonden.</div>;
}

  return (
    <>
      <div className="myPlant">
        <Header/>
        <div className="plant-image-background-overlay">
          <img src={plantImageUrl} alt={plant.name} className="plant-image-background" />
        </div>
        <section className="plant-details">
          <div>
            <Link to={'/my-plants'} className="breadcrumb">Mijn planten</Link>
            <span> / </span>
            <Link className="breadcrumb">{plant.nickname ? plant.nickname : plant.plants.name }</Link>
          </div>
          <div className="plant-details-header">
            <h2 className="plant-name">{plant.nickname ? plant.nickname : 'Mijn '+ plant.plants.name}</h2>
            <div>
              <button onClick={handleEditPlant}>Bewerk Plant</button>
              <button onClick={handleDeletePlant} style={{ backgroundColor: 'red', color: 'white' }}>Verwijder Plant</button>
            </div>
          </div>
          <h3 className="plant-name">{plant.plants ? plant.plants.name : plant.name}</h3>
          <p className="description">{plant.plants ? plant.plants.description : ""}</p>
          <div className="plant-info">
            <div className="plant-info-item">
              <div className="item-sunlight">
                <svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11.9375 4.125V1.78125C11.9375 1.57405 12.0198 1.37534 12.1663 1.22882C12.3128 1.08231 12.5115 1 12.7188 1C12.926 1 13.1247 1.08231 13.2712 1.22882C13.4177 1.37534 13.5 1.57405 13.5 1.78125V4.125C13.5 4.3322 13.4177 4.53091 13.2712 4.67743C13.1247 4.82394 12.926 4.90625 12.7188 4.90625C12.5115 4.90625 12.3128 4.82394 12.1663 4.67743C12.0198 4.53091 11.9375 4.3322 11.9375 4.125ZM18.9688 12.7188C18.9688 13.9549 18.6022 15.1633 17.9154 16.1911C17.2287 17.2189 16.2526 18.02 15.1105 18.493C13.9685 18.966 12.7118 19.0898 11.4994 18.8487C10.2871 18.6075 9.17341 18.0122 8.29933 17.1382C7.42525 16.2641 6.83 15.1504 6.58884 13.9381C6.34768 12.7257 6.47146 11.469 6.9445 10.327C7.41755 9.18494 8.21863 8.20882 9.24644 7.52206C10.2742 6.83531 11.4826 6.46875 12.7188 6.46875C14.3758 6.47056 15.9645 7.12962 17.1362 8.30133C18.3079 9.47304 18.9669 11.0617 18.9688 12.7188ZM17.4062 12.7188C17.4062 11.7916 17.1313 10.8854 16.6163 10.1145C16.1012 9.34366 15.3691 8.74285 14.5126 8.38806C13.656 8.03328 12.7136 7.94045 11.8043 8.12132C10.895 8.30219 10.0597 8.74863 9.40419 9.40419C8.74863 10.0597 8.30219 10.895 8.12132 11.8043C7.94045 12.7136 8.03328 13.656 8.38806 14.5126C8.74285 15.3691 9.34366 16.1012 10.1145 16.6163C10.8854 17.1313 11.7916 17.4062 12.7188 17.4062C13.9616 17.405 15.1531 16.9107 16.0319 16.0319C16.9107 15.1531 17.405 13.9616 17.4062 12.7188ZM5.91602 7.02148C6.06261 7.16808 6.26143 7.25043 6.46875 7.25043C6.67607 7.25043 6.87489 7.16808 7.02148 7.02148C7.16808 6.87489 7.25043 6.67607 7.25043 6.46875C7.25043 6.26143 7.16808 6.06261 7.02148 5.91602L5.45898 4.35352C5.31239 4.20692 5.11357 4.12457 4.90625 4.12457C4.69893 4.12457 4.50011 4.20692 4.35352 4.35352C4.20692 4.50011 4.12457 4.69893 4.12457 4.90625C4.12457 5.11357 4.20692 5.31239 4.35352 5.45898L5.91602 7.02148ZM5.91602 18.416L4.35352 19.9785C4.20692 20.1251 4.12457 20.3239 4.12457 20.5312C4.12457 20.7386 4.20692 20.9374 4.35352 21.084C4.50011 21.2306 4.69893 21.3129 4.90625 21.3129C5.11357 21.3129 5.31239 21.2306 5.45898 21.084L7.02148 19.5215C7.09407 19.4489 7.15165 19.3627 7.19093 19.2679C7.23022 19.173 7.25043 19.0714 7.25043 18.9688C7.25043 18.8661 7.23022 18.7645 7.19093 18.6696C7.15165 18.5748 7.09407 18.4886 7.02148 18.416C6.9489 18.3434 6.86273 18.2859 6.76789 18.2466C6.67305 18.2073 6.5714 18.1871 6.46875 18.1871C6.3661 18.1871 6.26445 18.2073 6.16961 18.2466C6.07477 18.2859 5.9886 18.3434 5.91602 18.416ZM18.9688 7.25C19.0714 7.25008 19.173 7.22994 19.2679 7.19073C19.3627 7.15152 19.4489 7.09401 19.5215 7.02148L21.084 5.45898C21.2306 5.31239 21.3129 5.11357 21.3129 4.90625C21.3129 4.69893 21.2306 4.50011 21.084 4.35352C20.9374 4.20692 20.7386 4.12457 20.5312 4.12457C20.3239 4.12457 20.1251 4.20692 19.9785 4.35352L18.416 5.91602C18.3066 6.02528 18.2321 6.16454 18.2019 6.31617C18.1717 6.4678 18.1872 6.62497 18.2464 6.76781C18.3056 6.91064 18.4058 7.03269 18.5344 7.11853C18.663 7.20437 18.8141 7.25012 18.9688 7.25ZM19.5215 18.416C19.3749 18.2694 19.1761 18.1871 18.9688 18.1871C18.7614 18.1871 18.5626 18.2694 18.416 18.416C18.2694 18.5626 18.1871 18.7614 18.1871 18.9688C18.1871 19.1761 18.2694 19.3749 18.416 19.5215L19.9785 21.084C20.0511 21.1566 20.1373 21.2141 20.2321 21.2534C20.327 21.2927 20.4286 21.3129 20.5312 21.3129C20.6339 21.3129 20.7355 21.2927 20.8304 21.2534C20.9252 21.2141 21.0114 21.1566 21.084 21.084C21.1566 21.0114 21.2141 20.9252 21.2534 20.8304C21.2927 20.7355 21.3129 20.6339 21.3129 20.5312C21.3129 20.4286 21.2927 20.327 21.2534 20.2321C21.2141 20.1373 21.1566 20.0511 21.084 19.9785L19.5215 18.416ZM4.90625 12.7188C4.90625 12.5115 4.82394 12.3128 4.67743 12.1663C4.53091 12.0198 4.3322 11.9375 4.125 11.9375H1.78125C1.57405 11.9375 1.37534 12.0198 1.22882 12.1663C1.08231 12.3128 1 12.5115 1 12.7188C1 12.926 1.08231 13.1247 1.22882 13.2712C1.37534 13.4177 1.57405 13.5 1.78125 13.5H4.125C4.3322 13.5 4.53091 13.4177 4.67743 13.2712C4.82394 13.1247 4.90625 12.926 4.90625 12.7188ZM12.7188 20.5312C12.5115 20.5312 12.3128 20.6136 12.1663 20.7601C12.0198 20.9066 11.9375 21.1053 11.9375 21.3125V23.6562C11.9375 23.8635 12.0198 24.0622 12.1663 24.2087C12.3128 24.3552 12.5115 24.4375 12.7188 24.4375C12.926 24.4375 13.1247 24.3552 13.2712 24.2087C13.4177 24.0622 13.5 23.8635 13.5 23.6562V21.3125C13.5 21.1053 13.4177 20.9066 13.2712 20.7601C13.1247 20.6136 12.926 20.5312 12.7188 20.5312ZM23.6562 11.9375H21.3125C21.1053 11.9375 20.9066 12.0198 20.7601 12.1663C20.6136 12.3128 20.5312 12.5115 20.5312 12.7188C20.5312 12.926 20.6136 13.1247 20.7601 13.2712C20.9066 13.4177 21.1053 13.5 21.3125 13.5H23.6562C23.8635 13.5 24.0622 13.4177 24.2087 13.2712C24.3552 13.1247 24.4375 12.926 24.4375 12.7188C24.4375 12.5115 24.3552 12.3128 24.2087 12.1663C24.0622 12.0198 23.8635 11.9375 23.6562 11.9375Z" fill="black"/>
                </svg>
                <h3>Zonlicht</h3>
              </div>
              <p>{plant.plants ? plant.plants.sunlight : plant.sunlight}</p>
            </div>
            <div className="plant-info-item">
              <div className="item-water">
                <svg width="16" height="21" viewBox="0 0 16 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 20.1875C6.20979 20.1875 4.4929 19.4763 3.22703 18.2105C1.96116 16.9446 1.25 15.2277 1.25 13.4375C1.25 12.3523 1.66384 11.007 2.35049 9.54786C3.03018 8.10352 3.94367 6.61668 4.86855 5.2679C5.79178 3.92152 6.71656 2.72687 7.41121 1.86819C7.63406 1.59273 7.8329 1.35224 8 1.15287C8.1671 1.35224 8.36594 1.59273 8.58879 1.86819C9.28345 2.72687 10.2082 3.92152 11.1315 5.2679C12.0563 6.61668 12.9698 8.10352 13.6495 9.54786C14.3362 11.007 14.75 12.3523 14.75 13.4375C14.75 15.2277 14.0388 16.9446 12.773 18.2105C11.5071 19.4763 9.79021 20.1875 8 20.1875Z" stroke="black" strokeWidth="2"/>
                </svg>
                <h3>Water</h3>            
              </div>
              <p>{plant.plants ? plant.plants.water_frequency : plant.water_frequency}</p>
            </div>
            <div className="plant-info-item">
              <div className="item-verticute">
                <svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4.16675 8.33341L8.33341 4.16675M14.5834 4.16675L4.16675 14.5834M4.16675 20.8334L20.8334 4.16675M20.8334 10.4167L10.4167 20.8334M20.8334 16.6667L16.6667 20.8334" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <h3>Verticuteren</h3>
              </div>
              <p>{plant.plants ? plant.plants.verticutting : plant.verticutting}</p>
            </div>
            <div className="plant-info-item">
              <div className="item-repot">
                <svg width="19" height="12" viewBox="0 0 19 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0 0V2.08333H2.08333V9.375C2.08333 10.5208 3.02083 11.4583 4.16667 11.4583H14.5833C15.7292 11.4583 16.6667 10.5208 16.6667 9.375V2.08333H18.75V0H0ZM4.16667 2.08333H14.5833V9.375H4.16667V2.08333Z" fill="black"/>
                </svg>
                <h3>Verpotten</h3>
              </div>
              <p>{plant.plants ? plant.plants.repotting : plant.repotting}</p>
            </div>
          </div>
          <h3>Taken</h3>
          {events.length > 0 ? (
            <div className="myPlant-tasks">
              {events.map(event => (
                <div className="myPlant-task" key={event.id}>
                  <h4>{event.title}</h4>
                  <p>{event.type}</p>
                  <p>{event.start_event.toLocaleDateString()}</p>
                  <button onClick={() => handleDeleteEvent(event.id)}>Delete</button>
                </div>
              ))}
            </div>
          ) : (
            <p>No watering events found for this plant.</p>
          )}
        </section>
      </div>
      <Navbar />
    </>
  );
}

export default MyPlant;
