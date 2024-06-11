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
        .select('*')
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

  const handleEventSelect = (event) => {
    const confirmDelete = window.confirm(`De taak ${event.type} van ${event.title} voltooid vandaag?`);
    if (confirmDelete) {
      deleteEvent(event.id);
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
                  <div className={`small-circle ${task.type}`}></div>
                  {task.done ? (
                    <p>Done</p>
                  ) : (
                  <>
                    <p>{task.title}</p>
                    <p>{task.type}</p>
                  </>
                  )}
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
                <div className={`small-circle ${nextTask.type}`}></div>
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
