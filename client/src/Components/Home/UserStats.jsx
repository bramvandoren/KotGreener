import React, { useEffect, useRef, useState } from 'react';
import './Home.css';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/helper/supabaseClient';
import { format } from 'date-fns';
import { parseISO, isSameDay } from 'date-fns';
import Loading from '../Loading/Loading';

function UserStats() {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [session, setSession] = useState(null)
    const [tasks, setTasks] = useState([]);
    const [events, setEvents] = useState([]);
    const [todayTasks, setTodayTasks] = useState([]);
    const [todayTasksCount, setTodayTasksCount] = useState(0);
    const [userPlantCount, setUserPlantCount] = useState(0);
    const [upcomingEventsCount, setUpcomingEventsCount] = useState(0);
    const [marketTransactionsCount, setMarketTransactionsCount] = useState(0);
    const [completedEventsCount, setCompletedEventsCount] = useState(0);
    const [uncompletedEventsCount, setUnCompletedEventsCount] = useState(0);


    useEffect(() => {
        const fetchSession = async () => {
            try {
            const { data: { session } } = await supabase.auth.getSession();
            setSession(session);
            if (session) {
                fetchEvents(session.user.id);
                fetchUserPlantCount(session.user.id);
                fetchUpcomingEventsCount(session.user.id);
                fetchMarketTransactionsCount(session.user.id);
                fetchCompletedEventsCount(session.user.id);

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
            // setTasks(data);
            setEvents(data);
            countTodayTasks(data);
            filterTasks(data);
            }
        };

        const fetchUserPlantCount = async (userId) => {
            try {
                const { data, error, count } = await supabase
                .from('user_plants')
                .select('*', { count: 'exact' })
                .eq('profile_id', userId);
            
                if (error) {
                console.error('Error fetching user plant count:', error);
                } else {
                    animateCounter(setUserPlantCount, count);
                }
            } catch (error) {
                console.error('Unexpected error fetching user plant count:', error);
            }
        };

        const fetchUpcomingEventsCount = async (userId) => {
            const nextMonth = new Date();
            nextMonth.setMonth(nextMonth.getMonth() + 1);
            
            try {
                const { data, error, count } = await supabase
                .from('watering_events')
                .select('*', { count: 'exact' })
                .eq('profile_id', userId)
                .gte('start_event', new Date().toISOString())
                .lt('start_event', nextMonth.toISOString());
            
                if (error) {
                console.error('Error fetching upcoming events count:', error);
                } else {
                    animateCounter(setUpcomingEventsCount, count);
                }
            } catch (error) {
                console.error('Unexpected error fetching upcoming events count:', error);
            }
        };

        const fetchMarketTransactionsCount = async (userId) => {
            try {
              const { count, error } = await supabase
                .from('plants_for_sale')
                .select('*', { count: 'exact' })
                .eq('profile_id', userId);
      
              if (error) {
                console.error('Error fetching market transactions count:', error);
              } else {
                animateCounter(setMarketTransactionsCount, count);
              }
            } catch (error) {
              console.error('Unexpected error fetching market transactions count:', error);
            }
          };
            
        
        const fetchCompletedEventsCount = async (userId) => {
            try {
                const { data, error, count } = await supabase
                .from('watering_events')
                .select('*', { count: 'exact' })
                .eq('profile_id', userId)
                .eq('done', true);
            
                if (error) {
                    console.error('Error fetching completed events count:', error);
                } else {
                    animateCounter(setCompletedEventsCount, count);
                }
            } catch (error) {
                console.error('Unexpected error fetching completed events count:', error);
            }
        };
        
    fetchSession();
    }, [])

    const calculateSuccessRate = () => {
        const today = new Date();
        
        // Filter evenementen die tot vandaag of vandaag eindigen
        const pastAndTodayEvents = events.filter(event => {
            const eventEndDate = new Date(event.end_event);
            return eventEndDate <= today;
        });
    
        // Filter afgeronde evenementen
        const completedEvents = pastAndTodayEvents.filter(event => event.done === true);
    
        if (pastAndTodayEvents.length === 0) {
            return 0; // Als er geen evenementen zijn, is het succespercentage 0
        }
        
        const totalEvents = pastAndTodayEvents.length;
        const completedCount = completedEvents.length;
    
        // Bereken het succespercentage
        const successRate = (completedCount / totalEvents) * 100;
        return successRate.toFixed(1); // Afronden op één decimalen
    };
    

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

    const animateCounter = (setStateFunction, finalCount) => {
        const animationDuration = 2000;
        const intervalDuration = 100;
        const frames = animationDuration / intervalDuration;
        const increment = finalCount / frames;
        let currentCount = 0;

        const interval = setInterval(() => {
            currentCount += increment;
            setStateFunction(Math.ceil(currentCount));

            if (currentCount >= finalCount) {
                clearInterval(interval);
                setStateFunction(finalCount);
            }
        }, intervalDuration);
    };

    if (loading) {
        return <Loading/>
    }



    
      const today = new Date();
      const todayEvents = events.filter(event => !event.done && isSameDay(event.end_event, today));
      const upcomingEvents = events.filter(event => !event.done && event.end_event >= today);
      const completedEvents = events.filter(event => event.done && isSameDay(event.end_event, today));
      const overdueFalseEvents = events.filter(event => !event.done && event.end_event < today);
      const overdueTrueEvents = events.filter(event => event.done && event.end_event < today);

    return (
    <>
    <div className="home-user-stats">
        <div className="stat-item">
            <h3>Jouw Planten</h3>
            <span>{userPlantCount}</span>
        </div>
        <div className="stat-item">
            <h3>Taken komende maand</h3>
            <span>{upcomingEventsCount}</span>
        </div>
        <div className="stat-item">
            <h3>Voltooide Taken</h3>
            {/* <span>{completedEventsCount}</span> */}
            <span>{calculateSuccessRate()}%</span>
        </div>
        <div className="stat-item">
            <h3>Actief op markt</h3>
            <span>{marketTransactionsCount}</span>
        </div>
    </div>
    </>
    );
}

export default UserStats;
