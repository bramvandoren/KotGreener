import React, { useEffect, useState } from 'react';
import { format, isSameDay, parseISO, addDays } from 'date-fns';
import { supabase } from '../../lib/helper/supabaseClient';

const MyPlantsTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [todayTasks, setTodayTasks] = useState([]);
  const [nextTask, setNextTask] = useState(null);
  const [todayTasksCount, setTodayTasksCount] = useState(0);
  const [events, setEvents] = useState([]);
  const [session, setSession] = useState(null);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        if (session) {
          fetchTasks(session);
          // fetchMyPlant(session.user.id);
        }
      } catch (error) {
        console.error('Error fetching session:', error);
      }
    };
    const fetchTasks = async (session) => {
      const { data, error } = await supabase
        .from('watering_events')
        .select('*, user_plants(*)')
        .eq('profile_id', session.user.id)
        .order('start_event', { ascending: true });

      if (error) {
        console.error('Error fetching tasks:', error);
      } else {
        setTasks(data);
        filterTasks(data);
        countTodayTasks(data);
      }
    };
    fetchSession();
  }, []);

  const filterTasks = (tasks) => {
    const today = new Date();
    const todayTasks = tasks.filter(task =>
      isSameDay(parseISO(task.start_event), today)
    );
    setTodayTasks(todayTasks);

    const futureTasks = tasks.filter(task =>
      parseISO(task.start_event) > today && !task.done
    );

    if (futureTasks.length > 0) {
      const nextTask = futureTasks[0];
      setNextTask(nextTask);
    }
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

  return (
    <div className="tasks">
      {/* <h3>Mijn taken</h3> */}
      <div className="tasks-section">
        <div className="today-tasks">
          <div className="today-todo-count">
            <h4>Vandaag</h4>
            {todayTasksCount > 0 && (
              <span className="task-count">
                {todayTasksCount}
              </span>
            )}
          </div>
          <div className="tasks-items">
            {todayTasks.length > 0 ? (
              todayTasks.map(task => (
                
                <div className={`tasks-item ${task.type} task-${task.done}`} key={task.id} onClick={() => toggleTaskDone(task.id, task.done)}>
                  <div className={`small-circle ${task.type}`}>
                    {task.type === 'watering' &&
                      <svg width="16" height="21" viewBox="0 0 16 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8 20.1875C6.20979 20.1875 4.4929 19.4763 3.22703 18.2105C1.96116 16.9446 1.25 15.2277 1.25 13.4375C1.25 12.3523 1.66384 11.007 2.35049 9.54786C3.03018 8.10352 3.94367 6.61668 4.86855 5.2679C5.79178 3.92152 6.71656 2.72687 7.41121 1.86819C7.63406 1.59273 7.8329 1.35224 8 1.15287C8.1671 1.35224 8.36594 1.59273 8.58879 1.86819C9.28345 2.72687 10.2082 3.92152 11.1315 5.2679C12.0563 6.61668 12.9698 8.10352 13.6495 9.54786C14.3362 11.007 14.75 12.3523 14.75 13.4375C14.75 15.2277 14.0388 16.9446 12.773 18.2105C11.5071 19.4763 9.79021 20.1875 8 20.1875Z" stroke="black" strokeWidth="2"/>
                    </svg>
                    }
                    {task.type === 'repotting' && 
                      <svg width="19" height="12" viewBox="0 0 19 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0 0V2.08333H2.08333V9.375C2.08333 10.5208 3.02083 11.4583 4.16667 11.4583H14.5833C15.7292 11.4583 16.6667 10.5208 16.6667 9.375V2.08333H18.75V0H0ZM4.16667 2.08333H14.5833V9.375H4.16667V2.08333Z" fill="black"/>
                      </svg>                  
                    }
                  </div>
                  {task.done ? (
                    <svg className="done" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" 
                      viewBox="0 0 17.837 17.837" xmlSpace="preserve">
                      <g>
                        <path d="M16.145,2.571c-0.272-0.273-0.718-0.273-0.99,0L6.92,10.804l-4.241-4.27
                          c-0.272-0.274-0.715-0.274-0.989,0L0.204,8.019c-0.272,0.271-0.272,0.717,0,0.99l6.217,6.258c0.272,0.271,0.715,0.271,0.99,0
                          L17.63,5.047c0.276-0.273,0.276-0.72,0-0.994L16.145,2.571z"/>
                      </g>
                    </svg>                    
                  ) : (
                  <>
                    <p>{task.title}</p>
                    <p>{task.type}</p>
                    <img src={task.user_plants.image_url} alt={task.user_plants.image_url} className="task-item-image" />
                  </>
                  )}
                  <p>{task.title}</p>
                </div>
              ))
              ) : (
                <p>Geen taken vandaag</p>
            )}
          </div>
        </div>
        {nextTask ? (
        <div className="next-task">
          <div className="next-task-title">
            <h4>Eerstvolgende taak</h4>
            <p>{format(parseISO(nextTask.start_event), 'dd-MM-yyyy')}</p>
          </div>
          <div className="tasks-items">
              <div className={`tasks-item ${nextTask.type}`} key={nextTask.id}>
                <div className={`small-circle ${nextTask.type}`}>
                {nextTask.type === 'watering' &&
                      <svg width="16" height="21" viewBox="0 0 16 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8 20.1875C6.20979 20.1875 4.4929 19.4763 3.22703 18.2105C1.96116 16.9446 1.25 15.2277 1.25 13.4375C1.25 12.3523 1.66384 11.007 2.35049 9.54786C3.03018 8.10352 3.94367 6.61668 4.86855 5.2679C5.79178 3.92152 6.71656 2.72687 7.41121 1.86819C7.63406 1.59273 7.8329 1.35224 8 1.15287C8.1671 1.35224 8.36594 1.59273 8.58879 1.86819C9.28345 2.72687 10.2082 3.92152 11.1315 5.2679C12.0563 6.61668 12.9698 8.10352 13.6495 9.54786C14.3362 11.007 14.75 12.3523 14.75 13.4375C14.75 15.2277 14.0388 16.9446 12.773 18.2105C11.5071 19.4763 9.79021 20.1875 8 20.1875Z" stroke="black" strokeWidth="2"/>
                    </svg>
                    }
                    {nextTask.type === 'repotting' && 
                      <svg width="19" height="12" viewBox="0 0 19 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0 0V2.08333H2.08333V9.375C2.08333 10.5208 3.02083 11.4583 4.16667 11.4583H14.5833C15.7292 11.4583 16.6667 10.5208 16.6667 9.375V2.08333H18.75V0H0ZM4.16667 2.08333H14.5833V9.375H4.16667V2.08333Z" fill="black"/>
                      </svg>                  
                    }
                </div>
                <p>{nextTask.title}</p>
                <p>{nextTask.type}</p>
                <img src={nextTask.user_plants.image_url} alt={nextTask.user_plants.image_url} className="task-item-image" />
              </div>
          </div>
        </div>
        ) : (
          <p>Geen volgende taken</p>
        )}
      </div>
    </div>
  );
};

export default MyPlantsTasks;
