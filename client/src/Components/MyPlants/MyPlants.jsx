import React, { useState, useEffect } from 'react';
import {jwtDecode} from 'jwt-decode';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import AddPlantForm from './AddPlant';
import { supabase } from '../../lib/helper/supabaseClient';
import './MyPlants.css';
import Calendar from './MyPlantsCalendar';
import MyPlantsCalendar from './MyPlantsCalendar';
import MyPlantsTasks from './MyPlantsTasks';
import logo from "../../assets/logo-kotgreener.svg";
import { format } from 'date-fns';
import Header from '../Header/Header';


function MyPlants() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [plants, setPlants] = useState([]);
  const [myPlants, setMyPlants] = useState([]);
  const [session, setSession] = useState(null);
  const [isPlusButtonOpen, setIsPlusButtonOpen] = useState(false);
  const [isSocialButtonOpen, setIsSocialButtonOpen] = useState(false);
  const [showAddPlantForm, setShowAddPlantForm] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [imageUrl, setImageUrl] = useState([]);
  const [imageLoaded, setImageLoaded] = useState([]);
  const [isCalendarVisible, setIsCalendarVisible] = useState(false);
  const [isTasksVisible, setIsTasksVisible] = useState(false);
  const [todayTasksCount, setTodayTasksCount] = useState(0);
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        if (session) {
          fetchMyPlants(session.user.id);
          fetchEvents(session.user.id);
          // fetchTasks(session.user.id);
        } else {
          navigate('/login');
        }
      } catch (error) {
        console.error('Error fetching session:', error);
      }
    };
    
    const fetchEvents = async (userId) => {
      const { data, error } = await supabase
        .from('watering_events')
        .select('*')
        .eq('profile_id', userId);
      
      if (error) {
        console.error('Error fetching events:', error);
      } else {
        setTasks(data);
        countTodayTasks(data);

      }
    };
    let ignore = false
    const fetchMyPlants = async (userId) => {
      setLoading(true)
      const { data, error } = await supabase
        .from('user_plants')
        .select('*, plants(name, sunlight, water_frequency, image_url, height)')
        .eq('profile_id', userId);
      if (!ignore) {
        if (error) {
          console.error('Error fetching my plants:', error);
        } else {
          setMyPlants(data);
          setImageUrl(data.image_url)
          console.log(data)
        } 
      }
      setLoading(false)
    };
    fetchSession();
    if (imageUrl)downloadImage(imageUrl);
    return () => {
      ignore = true
    }
  }, [imageUrl]);

  async function downloadImage(path) {
    try {
      const { data, error } = await supabase.storage.from('user_plants_images').download(path)
      if (error) {
        throw error
      }
      const url = URL.createObjectURL(data)
      setImageLoaded(url)
    } catch (error) {
      console.log('Error downloading image: ', error.message)
    }
  }

  // const fetchTasks = async (userId) => {
  //   const { data, error } = await supabase
  //     .from('tasks')
  //     .select('*')
  //     .eq('profile_id', userId);

  //   if (error) {
  //     console.error('Error fetching tasks:', error);
  //   } else {
  //     setTasks(data);
  //     countTodayTasks(data);
  //   }
  // };

  // Bepaal het aantal taken voor vandaag
  const countTodayTasks = (tasks) => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const todayTasks = tasks.filter(task => format(new Date(task.start_event), 'yyyy-MM-dd') === today);
    setTodayTasksCount(todayTasks.length);
  };

  // const addPlant = async (plant) => {
  //   try {
  //     const userId = jwtDecode(token).userId;
  //     const { data, error } = await supabase
  //       .from('user_plants')
  //       .insert({
  //         profile_id: userId,
  //         plant_id: plant.plant_id,
  //         nickname: plant.nickname,
  //       })
  //       .select('*, plants(name, sunlight, water_frequency, image_url, height)')
  //       .single();

  //     if (error) {
  //       console.error('Error adding plant:', error);
  //     } else {
  //       setMyPlants([...myPlants, data]);
  //       setShowAddPlantForm(false);
  //     }
  //   } catch (error) {
  //     console.error('Error adding plant:', error);
  //   }
  // };

  // const handleFavorite = async (plantId) => {
  //   if (!session) return;
  //   const userId = session.user.id;
    
  //   try {
  //     if (isFavorite) {
  //       await supabase
  //         .from('favorites')
  //         .delete()
  //         .eq('profile_id', userId)
  //         .eq('plant_id', plantId);
  //     } else {
  //       await supabase
  //         .from('favorites')
  //         .insert({ profile_id: userId, plant_id: plantId });
  //     }
  //     setIsFavorite(!isFavorite);
  //   } catch (error) {
  //     console.error('Error updating favorite:', error);
  //   }
  // };

  // const togglePlusButton = () => {
  //   setIsPlusButtonOpen(!isPlusButtonOpen);
  //   setIsSocialButtonOpen(!isSocialButtonOpen);
  // };
  const toggleCalendarVisibility = () => {
    setIsCalendarVisible(!isCalendarVisible);
  };

  const toggleTasksVisibility = () => {
    setIsTasksVisible(!isTasksVisible);
  };

  return (
    <>
      <div className="my-plants-page">
        <Header/>
        <main>
          <div className="my-plants-intro">
            <Link className="breadcrumb">Mijn Planten</Link>
            <div className="my-plants-intro-header">
              <h2>Mijn planten</h2>
              <Link to={`/my-plants/add`} className="">Plant toevoegen +</Link>
            </div>
            <p className="my-plants-intro-text">Hier kan u uw eigen planten toevoegen, beheren en aanpassen. Bij het toevoegen van uw plant
              ontvangt u een persoonlijk schema met bijhorende taken.
            </p>
            <button onClick={toggleTasksVisibility}>
              {isTasksVisible ? 'Verberg Taken' : 'Toon Taken'}
              {todayTasksCount > 0 && (
                <span className="task-count">
                  {todayTasksCount}
                </span>
              )}
            </button>
            <button onClick={toggleCalendarVisibility}>
              {isCalendarVisible ? 'Verberg Kalender' : 'Toon Kalender'}
            </button>
          </div>
          {isCalendarVisible && <MyPlantsCalendar />}
          {isTasksVisible && <MyPlantsTasks />} 
          <section className="my-plants">
            <div>
              <p></p>
            </div>
            <div className="my-plants-items">
            {myPlants.length > 0 ? (
              myPlants.map(plant => (
                // <>
                <div key={plant.id} className="plant-card">
                  <div className="plant-image-overlay">
                  {imageLoaded ? (
                    <img
                      src={imageLoaded}
                      alt="Avatar"
                      // className="profile-avatar"
                      // style={{ height: '50px', width: '50px' }}
                    />
                  ) : (
                    <div className="profile-avatar">{plant.name}</div>
                  )}
                    {/* <img src={imageLoaded} alt={plant.name} className="plant-image" /> */}
                    {/* {imageLoaded && (
                    <img src={plant.image_url} alt={plant.name} className="plant-image" />
                  )}                  
                  </div> */}
                  </div>
                  <div className='plant-card-info'>
                    {/* {console.log(plant)} */}
                    <h2>{plant.nickname}</h2>
                    <h3>{plant.plants ? plant.plants.name : plant.name}</h3>
                    <div className='plant-card-info-dots'>
                      <p>{plant.plants ? plant.plants.sunlight : plant.sunlight}</p>
                      <p>{plant.plants ? plant.plants.water_frequency : plant.water_frequency}</p>
                      <p>{plant.plants ? plant.plants.height : plant.height} cm</p>
                    </div>
                  </div>
                  <Link to={`/my-plants/${plant.id}`} className="detail-link">Meer Info</Link>
                </div>
              // </>
              ))
            ) : (
              <p>Geen planten</p>
            )}
            </div>
          </section>
          {/*  */}
        </main>
      </div>
      <Navbar />
    </>
  );
}

export default MyPlants;
