import React, { useEffect, useRef, useState } from 'react';
import './Home.css';
import Navbar from '../Navbar/Navbar';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import image from "../../assets/hero-kotgreener.jpg";
import toolsPlants from "../../assets/tools-plants.png";
import toolsAR from "../../assets/tools-ar.png";
import logo from "../../assets/logo-kotgreener.svg";
import blogimage from "../../assets/kotgreener-blog.png";
import myplantsImage from "../../assets/kotgreener-myplants.png";
import { supabase } from '../../lib/helper/supabaseClient';
import { format } from 'date-fns';
import { parseISO, isSameDay } from 'date-fns';
import Header from '../Header/Header';
import Loading from '../Loading/Loading';
import UserStats from './UserStats';
import PlantCard from '../Search/PlantCard';
import Video from './Video';

function Home() {
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [avatar_url, setAvatarUrl] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [todayTasks, setTodayTasks] = useState([]);
  const [todayTasksCount, setTodayTasksCount] = useState(0);
  const [popularPlants, setPopularPlants] = useState([]);
  const [tipOfTheWeek, setTipOfTheWeek] = useState('');
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
        }
      } catch (error) {
        console.error('Error fetching session:', error);
      }
    };

    const fetchEvents = async (userId) => {
      const { data, error } = await supabase
        .from('watering_events')
        .select('*, user_plants(*)')
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
          .limit(5);

        if (error) {
          console.error('Error fetching popular plants:', error);
        } else {
          setPopularPlants(data);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching popular plants:', error);
      }
    };
    const fetchTipOfTheWeek = async () => {
      try {
        // setLoading(true)

        const { data, error } = await supabase
          .from('tips')
          .select('*')
          .single()

          console.log(data)
        if (error) {
          console.error('Error fetching tip of the week:', error);
        } else {
          setTipOfTheWeek(data.tip);
        }
      } catch (error) {
        console.error('Error fetching tip of the week:', error);
      }
    };
    let ignore = false
    async function getProfile(session) {
      // setLoading(true)
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
          setAvatarUrl(data.avatar_url)
        }
      }
      setLoading(false);
    };
    fetchSession();
    fetchPopularPlants();
    fetchTipOfTheWeek();
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

  if (loading) {
    return <Loading/>
  }

  return (
    <>
    <div className="home">
      <Header/>
      <main>
        {session ? (
          <>
          <UserStats/>
          <section className="home-intro">
            <h2>Hallo <span>{username ? username : session.user.user_metadata.username}</span>, welkom!</h2>
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
                <div className="tasks-items-card">
                  <div className={`tasks-item ${task.type} task-${task.done}`} key={task.id} onClick={() => toggleTaskDone(task.id, task.done)}>
                    <p>{task.type}</p>
                    <img src={task.user_plants.image_url} alt={task.user_plants.image_url} className="task-item-image" />
                  </div>
                  <p>{task.title}</p>
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
            <p>{tipOfTheWeek}</p>
          </section>
        </>
         ) : (
          <>
          <div className="hero-home">
            <img className="logo" src={logo} alt='Logo' />
            <h2>Maak <b>Groen</b> jouw kotgeno(o)t!</h2>
            <button className="login-button" onClick={() => navigate('/login')}>Start hier →</button>
          </div>
          <div className="intro-what">
              <h2>Wat is KotGreener?</h2>
              <p>KotGreenr helpt studenten bij het vinden van duurzame en milieuvriendelijke koten in hun stad. Onze missie is om groen wonen toegankelijker te maken voor iedereen, terwijl we bijdragen aan een betere planeet.</p>
              <p>Met KotGreenr krijg je toegang tot een breed scala aan groene koten, samen met handige tips om je energieverbruik te verminderen en je ecologische voetafdruk te verkleinen. Begin vandaag nog met jouw groene reis!</p>
          </div>
          <div>
            <Video/>
          </div>
          </>
        )}
        <img className="hero-image" src={image} alt="image" />
        <section className="tools">
          <h2>Tools</h2>
          <div className="tools-items">
            <div className="tools-item">
              <div className="item-image">
                <img src={blogimage} alt='Informatief Blog' />
              </div>
                <h3>Informatief Blog</h3>
            </div>
            <div className="tools-item">
              <div className="item-image">
                <img src={myplantsImage} alt='Jouw Groen beheren' />
              </div>
                <h3>Jouw Groen beheren</h3>
            </div>
            <div className="tools-item">
              <div className="item-image">
                <img src={toolsPlants} alt='Student Market' />
              </div>
                <h3>Student Market</h3>
            </div>
            <div className="tools-item">
              <div className="item-image">
                <img src={toolsAR} alt='Virtueel plaatsen planten' />
              </div>
                <h3>Virtueel plaatsen planten</h3>
            </div>
          </div>
        </section>

        {/* Sectie met meest populaire planten */}
        <section className="popular-plants">
          <h2>Meest populaire planten</h2>
          <div className="plant-list">
            {popularPlants.map((plant) => (
              <>
              <PlantCard
              key={plant.id} 
              plant={plant}
            />
            </>
            ))}
          </div>
        </section>
      </main>
    </div>
    <Navbar />
    </>
  );
}

export default Home;
