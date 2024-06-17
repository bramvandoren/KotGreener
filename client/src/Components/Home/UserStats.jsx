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
    const [todayTasks, setTodayTasks] = useState([]);
    const [todayTasksCount, setTodayTasksCount] = useState(0);
    const [userPlantCount, setUserPlantCount] = useState(0);
    const [upcomingEventsCount, setUpcomingEventsCount] = useState(0);
    const [marketTransactionsCount, setMarketTransactionsCount] = useState(0);
    const [completedEventsCount, setCompletedEventsCount] = useState(0);

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
            setTasks(data);
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
            
        // const fetchMarketTransactionsCount = async (userId) => {
        //     try {
        //     const { data: purchases, error: purchasesError, count: purchasesCount } = await supabase
        //         .from('market_transactions')
        //         .select('*', { count: 'exact' })
        //         .eq('buyer_id', userId);
        
        //     if (purchasesError) {
        //         console.error('Error fetching user purchases count:', purchasesError);
        //     }
        
        //     const { data: sales, error: salesError, count: salesCount } = await supabase
        //         .from('market_transactions')
        //         .select('*', { count: 'exact' })
        //         .eq('seller_id', userId);
        
        //     if (salesError) {
        //         console.error('Error fetching user sales count:', salesError);
        //     }
        
        //     const totalTransactionsCount = (purchasesCount || 0) + (salesCount || 0);
        //     animateCounter(setMarketTransactionsCount, totalTransactionsCount);
        //     } catch (error) {
        //     console.error('Unexpected error fetching market transactions count:', error);
        //     }
        // };
        
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
            <span>{completedEventsCount}</span>
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
