import format from "date-fns/format";
import getDay from "date-fns/getDay";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import React, { useEffect, useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { supabase } from '../../lib/helper/supabaseClient';
import nl from 'date-fns/locale/nl';

const locales = {locale: nl};
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
          toast.error('Fout bij het verwijderen van het event.');
          } else {
          // Verwijder het event uit de lokale state
          setEvents(events.filter(event => event.id !== eventId));
          toast.success('Event succesvol verwijderd.');
          }
      } catch (error) {
          console.error('Error deleting event:', error);
          toast.error('Er is een onverwachte fout opgetreden.');
      }
    };

    const handleEventSelect = (event) => {
      showToastWithButtons(event.id);
    };
    
    // Methode om kleur van evenementen te bepalen
    const eventPropGetter = (event) => {
      let backgroundColor = '#3174ad';
      if (event.type === 'watering') {
          backgroundColor = '#007BFF';
      } else if (event.type === 'repotting') {
          backgroundColor = '#a5592a';
      }
      return { style: { backgroundColor } };
    };

    // CustomToast met knoppen voor bevestiging en annulering
    const CustomToast = ({ eventId, closeToast }) => (
      <div>
        <p>Weet je zeker dat je dit evenement wilt verwijderen?</p>
        <button className="button--cancel" onClick={closeToast}>Annuleren</button>
        <button className="button--confirm-delete" onClick={() => handleConfirm(eventId, closeToast)}>Bevestigen</button>
      </div>
    );

    const handleConfirm = (eventId, closeToast) => {
      deleteEvent(eventId); // Verwijder het event
      closeToast(); // Sluit de toast
    };

    const showToastWithButtons = (eventId) => {
      toast(<CustomToast eventId={eventId} />, {
        position: "top-right",
        autoClose: false,
        closeOnClick: false,
      });
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