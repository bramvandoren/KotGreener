import format from "date-fns/format";
import getDay from "date-fns/getDay";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import React, { useEffect, useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { supabase } from '../../lib/helper/supabaseClient';
import nl from 'date-fns/locale/nl';

const locales = {};
const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek: () => startOfWeek(new Date(), { locale: nl }),
    getDay,
    locales,
});

function MyPlantsCalendar() {
    const [events, setEvents] = useState([]);
    const [session, setSession] = useState(null);
    
    useEffect(() => {
        const fetchSession = async () => {
            try {
              const { data: { session } } = await supabase.auth.getSession();
              setSession(session);
              if (!session) {
                navigate('/login');
              } else {
                fetchEvents(session);
              }
            } catch (error) {
              console.error('Error fetching session:', error);
            }
          };
        const fetchEvents = async (session) => {
            const { data, error } = await supabase
            .from('watering_events')
            .select('*')
            .eq('profile_id', session.user.id);

            if (error) {
            console.error('Error fetching events:', error);
            } else {
            setEvents(data.map(event => ({
                ...event,
                start: new Date(event.start_event),
                end: new Date(event.end_event),
                myPlantId: event.user_plant_id,
                type: event.type,
                id: event.id,
                title: event.title
            })));
            }
        };
        fetchSession();
    }, []);

    const deleteEvent = async (eventId) => {
        try {
            const { error } = await supabase
            .from('watering_events')
            .delete()
            .eq('id', eventId);

            if (error) {
            console.error('Error deleting event:', error);
            } else {
            // Verwijder het event uit de lokale state
            setEvents(events.filter(event => event.id !== eventId));
            }
        } catch (error) {
            console.error('Error deleting event:', error);
        }
    };

    const handleEventSelect = (event) => {
      const confirmDelete = window.confirm(`Wil je het event "${event.title}" verwijderen?`);
      if (confirmDelete) {
        deleteEvent(event.id);
      }
    };
    
    // Methode om kleur van evenementen te bepalen
    const eventPropGetter = (event) => {
      let backgroundColor = '#3174ad'; // Default kleur (blauw)
      if (event.type === 'watering') {
          backgroundColor = '#007BFF'; // Watering in blauw
      } else if (event.type === 'repotting') {
          backgroundColor = '#28A745'; // Repotting in groen
      }
      return { style: { backgroundColor } };
  };

    return (
        <div className="calendar">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor= {events.start_event}
            endAccessor={events.end_event}
            onSelectEvent={handleEventSelect}
            eventPropGetter={eventPropGetter}
          />
          <div className="calendar-legende">
            <h4>Legende</h4>
            <div className="legende-items">
              <div className="legende-item">
                <span className="water">oo</span>
                <p>Water geven</p>
              </div>
              <div className="legende-item">
                <span className="verzorgen">oo</span>
                <p>Verzorgen</p>
              </div>
              <div className="legende-item">
                <span className="verpot">oo</span>
                <p>Verpotten</p>
              </div>
            </div>
          </div>
        </div>
    );
}

export default MyPlantsCalendar;