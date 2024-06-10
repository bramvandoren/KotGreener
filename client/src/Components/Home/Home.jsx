import React, { useEffect, useRef, useState } from 'react';
import {jwtDecode} from 'jwt-decode';
import './Home.css';
import Navbar from '../Navbar/Navbar';
import { NavLink, useNavigate } from 'react-router-dom';
import Profile from '../Profile/Profile';
import image from "../../assets/room.jpg";
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
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [plants, setPlants] = useState([]);
  const [todos, setTodos] = useState([]);
  const [showProfile, setShowProfile] = useState(false);
  const navigate = useNavigate();
  const [website, setWebsite] = useState(null)
  const [avatar_url, setAvatarUrl] = useState(null)
  const [session, setSession] = useState(null)
  const [tasks, setTasks] = useState([]);
  const [todayTasks, setTodayTasks] = useState([]);
  const [todayTasksCount, setTodayTasksCount] = useState(0);

  const tasksScrollRef = useRef(null);
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
    return () => {
      ignore = true
    }
  }, [])
  

  {console.log(todayTasks)}
  
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
    const todayTasks = tasks.filter(task => format(new Date(task.start_event), 'yyyy-MM-dd') === today);
    setTodayTasksCount(todayTasks.length);
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
          {/* <header className="header-desktop">
            <img className="logo" src={logo} alt='Logo' />
            <div className='nav-desktop'>
              <NavLink to="/" className="nav-item">
                <p>Home</p>
              </NavLink>
              <NavLink to="/blog" className="nav-item">
                <p>Ontdek</p>
              </NavLink>
              <NavLink to="/my-plants" className="nav-item">
                <p>Mijn Planten</p>
              </NavLink>
              <NavLink to="/winkel" className="nav-item">
                <p>Winkel</p>
              </NavLink>
              <NavLink to="/search" className="nav-item">
                <p>Zoeken</p>
              </NavLink>
            </div>
            {session ?(
              <button className="profile-button" onClick={toggleProfile}>
                <svg width="25" height="25" viewBox="0 0 25 25" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12.5 2.5C11.1739 2.5 9.90215 3.02678 8.96447 3.96447C8.02678 4.90215 7.5 6.17392 7.5 7.5C7.5 8.82608 8.02678 10.0979 8.96447 11.0355C9.90215 11.9732 11.1739 12.5 12.5 12.5C13.8261 12.5 15.0979 11.9732 16.0355 11.0355C16.9732 10.0979 17.5 8.82608 17.5 7.5C17.5 6.17392 16.9732 4.90215 16.0355 3.96447C15.0979 3.02678 13.8261 2.5 12.5 2.5ZM8.75 7.5C8.75 6.50544 9.14509 5.55161 9.84835 4.84835C10.5516 4.14509 11.5054 3.75 12.5 3.75C13.4946 3.75 14.4484 4.14509 15.1517 4.84835C15.8549 5.55161 16.25 6.50544 16.25 7.5C16.25 8.49456 15.8549 9.44839 15.1517 10.1517C14.4484 10.8549 13.4946 11.25 12.5 11.25C11.5054 11.25 10.5516 10.8549 9.84835 10.1517C9.14509 9.44839 8.75 8.49456 8.75 7.5ZM6.26125 13.75C5.932 13.7485 5.6057 13.8121 5.30109 13.9371C4.99647 14.062 4.71955 14.2459 4.48621 14.4782C4.25287 14.7105 4.06771 14.9866 3.94137 15.2907C3.81503 15.5947 3.75 15.9207 3.75 16.25C3.75 18.3638 4.79125 19.9575 6.41875 20.9963C8.02125 22.0175 10.1813 22.5 12.5 22.5C14.8188 22.5 16.9788 22.0175 18.5812 20.9963C20.2087 19.9588 21.25 18.3625 21.25 16.25C21.25 15.587 20.9866 14.9511 20.5178 14.4822C20.0489 14.0134 19.413 13.75 18.75 13.75H6.26125ZM5 16.25C5 15.5588 5.56 15 6.26125 15H18.75C19.0815 15 19.3995 15.1317 19.6339 15.3661C19.8683 15.6005 20 15.9185 20 16.25C20 17.8862 19.2225 19.105 17.9087 19.9412C16.5712 20.795 14.6687 21.25 12.5 21.25C10.3313 21.25 8.42875 20.795 7.09125 19.9412C5.77875 19.1038 5 17.8875 5 16.25Z" fill="black"/>
                </svg>
              </button>
            ) : (
              <button className="" onClick={toggleProfile}>
                Inloggen
              </button>
            )}
          </header> */}
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
              {/* <button class="previous" onClick={scrollPrevious}>Go 2 Left</button> */}
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
              <div className="tasks-items" ref={elementRef}>
              <>
              {todayTasks.length > 0 ? (
                
                todayTasks.map(task => (
                  <>
                  <div className="tasks-item" key={task.id}>
                    <p>{task.title}</p>
                    <p>{task.type}</p>
                    {/* <p>{format(parseISO(task.start_event), 'dd-MM-yyyy')}</p> */}
                  </div>
                  </>
                ))
                
                ) : (
                <p>Geen taken</p>
              )}
              </>

            </div>
            {/* <button class="next" onClick={scrollNext}>Go 2 Right</button> */}
          </div>
          </section>
          <section className="tip-of-the-week">
            <h2>Tip van de week</h2>
            <p>Zorg ervoor dat je plantpotten drainagegaten hebben om overtollig water af te voeren en wortelrot te voorkomen.</p>
          </section>
        </>
         ) : (
          <div className="hero-home">
            {/* <h1><span>Kot</span>Greener</h1> */}
            <img className="logo" src={logo} alt='Logo' />
            <h2>Maak <b>Groen</b> jouw kotgeno(o)t!</h2>
            {/* <svg width="47" height="44" viewBox="0 0 47 44" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18.5203 2.85944L6.02035 10.0372C2.91488 11.8205 1 15.1282 1 18.7092V35.6543C1 39.7803 4.34475 43.125 8.4707 43.125H12.2749C14.2999 43.125 15.9414 41.4835 15.9414 39.4585V36.6709C15.9414 36.1855 15.5479 35.792 15.0625 35.792C14.5771 35.792 14.1836 35.3985 14.1836 34.9131V34.5698C14.1836 33.8949 14.7308 33.3477 15.4058 33.3477H31.77C32.445 33.3477 32.9922 33.8949 32.9922 34.5698V34.9131C32.9922 35.3985 32.5987 35.792 32.1133 35.792C31.6279 35.792 31.2344 36.1855 31.2344 36.6709V39.4585C31.2344 41.4835 32.8759 43.125 34.9009 43.125H38.6172C42.6946 43.125 46 39.8196 46 35.7422V18.7092C46 15.1282 44.0851 11.8205 40.9797 10.0372L28.4797 2.85944C25.396 1.08873 21.604 1.08873 18.5203 2.85944Z" fill="#F0F5E6" stroke="#004339"/>
            <path d="M25.3951 21.1342C24.4576 17.8169 25.1138 11.0425 35.2388 10.4838C36.0592 13.8594 35.2388 20.7152 25.3951 21.1342Z" fill="#9CC190"/>
            <path d="M21.5279 27.4195C21.9966 24.2186 20.7193 17.8169 11.8599 17.8169C11.0396 21.2506 11.8247 27.9782 21.5279 27.4195Z" fill="#9CC190"/>
            <path d="M21.5279 15.5471C22.0552 11.997 20.8599 4.96665 11.8599 5.246C10.9224 8.33051 11.5435 14.7091 21.5279 15.5471Z" fill="#9CC190"/>
            <path d="M41.254 33.8796C41.7813 30.3295 40.586 23.2991 31.586 23.5784C30.6485 26.663 31.2696 33.0415 41.254 33.8796Z" fill="#9CC190"/>
            <path d="M25.3951 33.8796V21.1342M25.3951 21.1342C24.4576 17.8169 25.1138 11.0425 35.2388 10.4838C36.0592 13.8594 35.2388 20.7152 25.3951 21.1342ZM21.5279 33.8796V27.4195M21.5279 27.4195C21.9966 24.2186 20.7193 17.8169 11.8599 17.8169C11.0396 21.2506 11.8247 27.9782 21.5279 27.4195ZM21.5279 15.5471C22.0552 11.997 20.8599 4.96665 11.8599 5.246C10.9224 8.33051 11.5435 14.7091 21.5279 15.5471ZM41.254 33.8796C41.7813 30.3295 40.586 23.2991 31.586 23.5784C30.6485 26.663 31.2696 33.0415 41.254 33.8796Z" stroke="#004339"/>
            </svg> */}
            
            <button className="login-button" onClick={() => navigate('/login')}>Start hier →</button>
            {/* <div className="hero">
              <img className="hero-image" src={image} alt="image" />
            </div> */}
          </div>
        )}
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
