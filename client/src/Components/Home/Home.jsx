import React, { useEffect, useRef, useState } from 'react';
import {jwtDecode} from 'jwt-decode';
import './Home.css';
import Navbar from '../Navbar/Navbar';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import Profile from '../Profile/Profile';
import image from "../../assets/hero-kotgreener.jpg";
import toolsBlog from "../../assets/tools-blog.png";
import toolsOwnPlants from "../../assets/tools-ownPlants.png";
import toolsPlants from "../../assets/tools-plants.png";
import toolsAR from "../../assets/tools-ar.png";
import logo from "../../assets/logo-kotgreener.svg";
import { supabase } from '../../lib/helper/supabaseClient';
import { format } from 'date-fns';
import { parseISO, isSameDay } from 'date-fns';
import Header from '../Header/Header';

function Home() {
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [plants, setPlants] = useState([]);
  const [showProfile, setShowProfile] = useState(false);
  const navigate = useNavigate();
  const [website, setWebsite] = useState(null)
  const [avatar_url, setAvatarUrl] = useState(null)
  const [session, setSession] = useState(null)
  const [tasks, setTasks] = useState([]);
  const [todayTasks, setTodayTasks] = useState([]);
  const [todayTasksCount, setTodayTasksCount] = useState(0);
  const [popularPlants, setPopularPlants] = useState([]);
  const elementRef = useRef(null);
  const [arrowDisable, setArrowDisable] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        if (session) {
          getProfile(session);
          fetchEvents(session.user.id)
        } else {
          // navigate('/login');
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
        filterTasks(data);
      }
    };
    const fetchPopularPlants = async () => {
      try {
        const { data, error } = await supabase
          .from('plants')
          .select('*')
          .order('visits', { ascending: false })
          .limit(5); // Haal bijvoorbeeld de top 5 meest populaire planten op

        if (error) {
          console.error('Error fetching popular plants:', error);
        } else {
          setPopularPlants(data);
        }
      } catch (error) {
        console.error('Error fetching popular plants:', error);
      }
    };
    let ignore = false
    async function getProfile(session) {
      setLoading(true)
      const { data, error } = await supabase
        .from('profiles')
        .select(`username, website, avatar_url`)
        .eq('id', session.user.id)
        .single()

      if (!ignore) {
        if (error) {
          console.warn(error)
        } else if (data) {
          setUsername(data.username)
          setWebsite(data.website)
          setAvatarUrl(data.avatar_url)
        }
      }
      setLoading(false)
    }

    fetchSession();
    fetchPopularPlants();
    return () => {
      ignore = true
    }
  }, [])
  
  const filterTasks = (tasks) => {
    const today = new Date();
    const todayTasks = tasks.filter(task =>
      isSameDay(parseISO(task.start_event), today)
    );
    setTodayTasks(todayTasks);
  };

  const toggleProfile = () => {
    setShowProfile(!showProfile);
  };
  
  // Bepaal het aantal taken voor vandaag
  const countTodayTasks = (tasks) => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const todayTasks = tasks.filter(task => format(new Date(task.start_event), 'yyyy-MM-dd') === today && !task.done);
    setTodayTasksCount(todayTasks.length);
  };

  const toggleTaskDone = async (taskId, currentStatus) => {
    try {
      const { error } = await supabase
        .from('watering_events')
        .update({ done: !currentStatus })
        .eq('id', taskId);

      if (error) {
        console.error('Error updating task status:', error);
      } else {
        // Update the task list to reflect the changes
        setTasks(prevTasks =>
          prevTasks.map(task =>
            task.id === taskId ? { ...task, done: !currentStatus } : task
          )
        );
        // Re-filter tasks to reflect the changes
        filterTasks(tasks.map(task =>
          task.id === taskId ? { ...task, done: !currentStatus } : task
        ));
        countTodayTasks(tasks);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
    }
  };

  const handleHorizantalScroll = (element, step) => {
    let scrollAmount = 0;
      element.scrollLeft += step;
      scrollAmount += Math.abs(step);
      if (element.scrollLeft === 0) {
        setArrowDisable(true);
      } else {
        setArrowDisable(false);
      }
  }

  return (
    <>
    <div className="home">
      <Header/>
      <main>
        {session ? (
          <>
          <section className="home-intro">
            <p>Hallo <b>{username ? username : session.user.user_metadata.username}</b>, welkom terug!</p>
          </section>
          <section className="today-todo">
            <div className="today-todo-count">
              <h2>Vandaag te doen</h2>
              {todayTasksCount > 0 && (
                <span className="task-count">
                  {todayTasksCount}
                </span>
              )}
            </div>
            <div className="task-items-scroll">
              {todayTasksCount > 5 && (
                <div className="scroll-buttons">
                  <button
                    className="scroll-left"
                    onClick={() => {
                      handleHorizantalScroll(elementRef.current, -300);
                    }}
                    disabled={arrowDisable}
                  >
                    &larr;
                  </button>
                  <button
                  className="scroll-right"
                    onClick={() => {
                      handleHorizantalScroll(elementRef.current, 300);
                    }}
                  >
                    &rarr;
                  </button>
                </div>
              )}
              <div className="tasks-items" ref={elementRef}>
              <>
              {todayTasks.length > 0 ? (
                todayTasks.map(task => (
                <>
                  <div className={`tasks-item ${task.type} task-${task.done}`} key={task.id} onClick={() => toggleTaskDone(task.id, task.done)}>
                    <p>{task.title}</p>
                    <p>{task.type}</p>
                  </div>
                </>
                ))
                ) : (
                <div>
                  <p>Geen taken</p>
                  <button onClick={() => navigate('/my-plants')}>Bekijk kalender</button>
                </div>
              )}
              </>
            </div>
          </div>
          </section>
          <section className="tip-of-the-week">
            <h2>Tip van de week</h2>
            <p>Zorg ervoor dat je plantpotten drainagegaten hebben om overtollig water af te voeren en wortelrot te voorkomen.</p>
          </section>
        </>
         ) : (
          <>
          <div className="hero-home">
            {/* <h1><span>Kot</span>Greener</h1> */}
            <img className="logo" src={logo} alt='Logo' />
            <h2>Maak <b>Groen</b> jouw kotgeno(o)t!</h2>
            <button className="login-button" onClick={() => navigate('/login')}>Start hier →</button>
          </div>
          </>
        )}
        <img className="hero-image" src={image} alt="image" />
        <section className="tools">
          <h2>Tools</h2>
          <div className="tools-items">
            <div className="tools-item">
              <div className="item-image">
                <img src={toolsBlog} alt='Informatief Blog' />
              </div>
              <div>
                <h3>Informatief Blog</h3>
                <p></p>
              </div>
            </div>
            <div className="tools-item">
              <div className="item-image">
                <img src={toolsOwnPlants} alt='Jouw Groen beheren' />
              </div>
              <div>
                <h3>Jouw Groen beheren</h3>
                <p></p>
              </div>
            </div>
            <div className="tools-item">
              <div className="item-image">
                <img src={toolsPlants} alt='Student Market' />
              </div>
              <div>
                <h3>Student Market</h3>
                <p></p>
              </div>
            </div>
            <div className="tools-item">
              <div className="item-image">
                <img src={toolsAR} alt='Virtueel plaatsen planten' />
              </div>
              <div>
                <h3>Virtueel plaatsen planten</h3>
                <p></p>
              </div>
            </div>
          </div>
        </section>

        {/* Sectie met meest populaire planten */}
        <section className="popular-plants">
          <h2>Meest populaire planten</h2>
          <div className="plant-list">
            {popularPlants.map((plant) => (
              <div className="plant-item" key={plant.id}>
                <img src={plant.image_url} alt={plant.name} />
                <h3>{plant.name}</h3>
                <Link to ={`/plants/${plant.id}`}>Bekijk</Link>
              </div>
            ))}
          </div>
        </section>

        <section className="recent-messages">
          <h3>Recente berichten</h3>
        </section>
      </main>
      {showProfile && (
        <div className="profile-popup">
          <Profile session={session} onClose={toggleProfile} />
        </div>
      )}
    </div>
    <Navbar />
    </>
  );
}

export default Home;
