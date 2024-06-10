import React, { useEffect, useState } from 'react';
import { format, isSameDay, parseISO, addDays } from 'date-fns';
import { supabase } from '../../lib/helper/supabaseClient';

const MyPlantsTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [todayTasks, setTodayTasks] = useState([]);
  const [nextTask, setNextTask] = useState(null);
  const [todayTasksCount, setTodayTasksCount] = useState(0);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchTasks = async () => {
      const { data, error } = await supabase
        .from('watering_events')
        .select('*')
        .order('start_event', { ascending: true });

      if (error) {
        console.error('Error fetching tasks:', error);
      } else {
        setTasks(data);
        filterTasks(data);
        countTodayTasks(data);
      }
    };

    const filterTasks = (tasks) => {
      const today = new Date();
      const todayTasks = tasks.filter(task =>
        isSameDay(parseISO(task.start_event), today)
      );
      setTodayTasks(todayTasks);

      const futureTasks = tasks.filter(task =>
        parseISO(task.start_event) > today
      );

      if (futureTasks.length > 0) {
        const nextTask = futureTasks[0];
        setNextTask(nextTask);
      }
    };

    fetchTasks();
  }, []);

  // Bepaal het aantal taken voor vandaag
  const countTodayTasks = (tasks) => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const todayTasks = tasks.filter(task => format(new Date(task.start_event), 'yyyy-MM-dd') === today);
    setTodayTasksCount(todayTasks.length);
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

  const handleEventSelect = (event) => {
    const confirmDelete = window.confirm(`De taak ${event.type} van ${event.title} voltooid vandaag?`);
    if (confirmDelete) {
      deleteEvent(event.id);
    }
  };

  return (
    <div className="tasks">
      <h3>Mijn taken</h3>
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
            {/* {console.log(tasks)} */}
            {todayTasks.length > 0 ? (
              todayTasks.map(task => (
                <div className="tasks-item" key={task.id} onClick={() => handleEventSelect(task)}>
                  <p>{task.title}</p>
                  <p>{task.type}</p>
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
              <div className="tasks-item">
                <p>{nextTask.title}</p>
                <p>{nextTask.type}</p>
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
