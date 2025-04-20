import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import storage from '../utils/localStorage';

function Dashboard() {
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    subjects: 0,
    notes: 0
  });
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [recentNotes, setRecentNotes] = useState([]);
  const [subjects, setSubjects] = useState({});
  
  useEffect(() => {
    // Load data from localStorage
    const loadData = () => {
      // Get tasks
      const allTasks = storage.tasks.getAll();
      const completed = allTasks.filter(task => task.status === 'done').length;
      const pending = allTasks.filter(task => task.status !== 'done').length;
      
      // Get upcoming tasks (due in next 7 days or no due date)
      const today = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(today.getDate() + 7);
      
      const upcoming = allTasks
        .filter(task => {
          if (task.status === 'done') return false;
          
          if (!task.dueDate) return true;
          
          const dueDate = new Date(task.dueDate);
          return dueDate <= nextWeek;
        })
        .sort((a, b) => {
          // Sort by due date, tasks with no due date at the end
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate) - new Date(b.dueDate);
        })
        .slice(0, 5); // Limit to 5 tasks
      
      // Get notes
      const allNotes = storage.notes.getAll();
      
      // Sort notes by last updated and limit to 3
      const recent = [...allNotes]
        .sort((a, b) => {
          const aDate = a.updatedAt || a.createdAt;
          const bDate = b.updatedAt || b.createdAt;
          return new Date(bDate) - new Date(aDate);
        })
        .slice(0, 3);
      
      // Get subjects
      const allSubjects = storage.subjects.getAll();
      const subjectMap = {};
      allSubjects.forEach(subject => {
        subjectMap[subject.id] = subject;
      });
      
      // Set states
      setStats({
        totalTasks: allTasks.length,
        completedTasks: completed,
        pendingTasks: pending,
        subjects: allSubjects.length,
        notes: allNotes.length
      });
      
      setUpcomingTasks(upcoming);
      setRecentNotes(recent);
      setSubjects(subjectMap);
    };
    
    loadData();
  }, []);
  
  // Calculate completion percentage
  const completionRate = stats.totalTasks > 0 
    ? Math.round((stats.completedTasks / stats.totalTasks) * 100) 
    : 0;
  
  // Format date in a friendly way
  const formatDate = (dateString) => {
    if (!dateString) return 'No due date';
    
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      // For dates within a week, show day name
      const diff = Math.floor((date - today) / (1000 * 60 * 60 * 24));
      if (diff >= 0 && diff < 7) {
        return date.toLocaleDateString(undefined, { weekday: 'long' });
      }
      
      // Otherwise show date
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="dashboard">
      <section className="welcome-section">
        <h1>Welcome to your Study Dashboard</h1>
        <p>Track your progress and manage your study plans effectively.</p>
      </section>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-title">Pending Tasks</div>
          <div className="stat-value">{stats.pendingTasks}</div>
          {stats.pendingTasks > 5 ? (
            <div className="stat-badge badge-warning">High workload</div>
          ) : (
            <div className="stat-badge badge-good">Manageable</div>
          )}
        </div>
        
        <div className="stat-card">
          <div className="stat-title">Completion Rate</div>
          <div className="stat-value">{completionRate}%</div>
          {completionRate >= 70 ? (
            <div className="stat-badge badge-good">Great progress!</div>
          ) : (
            <div className="stat-badge badge-warning">Keep going!</div>
          )}
        </div>
        
        <div className="stat-card">
          <div className="stat-title">Active Subjects</div>
          <div className="stat-value">{stats.subjects}</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-title">Study Notes</div>
          <div className="stat-value">{stats.notes}</div>
        </div>
      </div>
      
      <div className="progress-section">
        <h2>Overall Progress</h2>
        <div className="progress-container">
          <div className="progress-bar" style={{ width: `${completionRate}%` }}></div>
        </div>
        <div className="progress-stats">
          <span>{stats.completedTasks} completed</span>
          <span>{stats.pendingTasks} remaining</span>
        </div>
      </div>
      
      <div className="dashboard-section">
        <div className="section-header">
          <h2 className="section-title">Upcoming Tasks</h2>
          <Link to="/tasks" className="btn-secondary">View All</Link>
        </div>
        
        <div className="task-list">
          {upcomingTasks.length > 0 ? (
            upcomingTasks.map(task => (
              <div className="task-item" key={task.id}>
                <input 
                  type="checkbox" 
                  className="task-checkbox" 
                  checked={task.status === 'done'} 
                  readOnly 
                />
                <div className="task-info">
                  <h3 className="task-title">{task.title}</h3>
                  <div className="task-subject">
                    {subjects[task.subjectId]?.name || 'Unknown Subject'}
                  </div>
                </div>
                <div className="task-date">
                  {formatDate(task.dueDate)}
                </div>
              </div>
            ))
          ) : (
            <p>No upcoming tasks. Time to add some!</p>
          )}
        </div>
      </div>
      
      <div className="dashboard-section">
        <div className="section-header">
          <h2 className="section-title">Recent Notes</h2>
          <Link to="/notes" className="btn-secondary">View All</Link>
        </div>
        
        <div className="notes-grid">
          {recentNotes.length > 0 ? (
            recentNotes.map(note => (
              <Link 
                to={`/notes/${note.id}/edit`} 
                key={note.id}
                className="note-card"
              >
                <h3>{note.title}</h3>
                <p className="note-excerpt">
                  {note.content ? (
                    note.content.substring(0, 100) + (note.content.length > 100 ? '...' : '')
                  ) : (
                    <em>Empty note</em>
                  )}
                </p>
                {subjects[note.subjectId] && (
                  <div 
                    className="subject-indicator"
                    style={{ backgroundColor: subjects[note.subjectId].color }}
                  >
                    {subjects[note.subjectId].name}
                  </div>
                )}
              </Link>
            ))
          ) : (
            <p>No notes yet. Create your first note!</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
