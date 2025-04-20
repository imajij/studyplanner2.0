import { useState, useEffect } from 'react';
import storage from '../utils/localStorage';

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [subjects, setSubjects] = useState({});
  const [activeFilter, setActiveFilter] = useState('all'); // all, todo, in-progress, done
  const [activeSubjectId, setActiveSubjectId] = useState('all');
  const [editingTask, setEditingTask] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);

  // Load tasks and subjects
  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    // Get all tasks
    const allTasks = storage.tasks.getAll();
    setTasks(allTasks);

    // Create a lookup object for subjects
    const subjectsData = storage.subjects.getAll();
    const subjectsMap = {};
    subjectsData.forEach(subject => {
      subjectsMap[subject.id] = subject;
    });
    setSubjects(subjectsMap);
  };

  // Filter tasks by status and subject
  const filteredTasks = tasks.filter(task => {
    const matchesStatus = activeFilter === 'all' || task.status === activeFilter;
    const matchesSubject = activeSubjectId === 'all' || task.subjectId === activeSubjectId;
    return matchesStatus && matchesSubject;
  });

  // Group tasks by due date
  const groupedTasks = filteredTasks.reduce((groups, task) => {
    let group;

    if (!task.dueDate) {
      group = 'No Due Date';
    } else {
      const dueDate = new Date(task.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);

      if (dueDate < today) {
        group = 'Overdue';
      } else if (dueDate.getTime() === today.getTime()) {
        group = 'Today';
      } else if (dueDate.getTime() === tomorrow.getTime()) {
        group = 'Tomorrow';
      } else if (dueDate < nextWeek) {
        group = 'This Week';
      } else {
        group = 'Later';
      }
    }

    if (!groups[group]) {
      groups[group] = [];
    }
    groups[group].push(task);
    return groups;
  }, {});

  // Order of display for due date groups
  const groupOrder = ['Overdue', 'Today', 'Tomorrow', 'This Week', 'Later', 'No Due Date'];
  
  // Update task status
  const handleStatusChange = (taskId, newStatus) => {
    storage.tasks.updateStatus(taskId, newStatus);
    loadData();
  };

  // Edit task handler
  const handleEdit = (task) => {
    setEditingTask({
      ...task
    });
  };

  // Create new task
  const handleNewTask = () => {
    // Check if we have any subjects first
    if (Object.keys(subjects).length === 0) {
      alert('Please create a subject first before adding tasks.');
      return;
    }

    setEditingTask({
      title: '',
      description: '',
      dueDate: '',
      status: 'todo',
      subjectId: Object.keys(subjects)[0]
    });
  };

  // Save task changes
  const handleSave = () => {
    if (editingTask.id) {
      // Update existing task
      storage.tasks.update(editingTask.id, {
        title: editingTask.title,
        description: editingTask.description,
        dueDate: editingTask.dueDate,
        status: editingTask.status,
        subjectId: editingTask.subjectId
      });
    } else {
      // Create new task
      storage.tasks.add({
        title: editingTask.title,
        description: editingTask.description,
        dueDate: editingTask.dueDate,
        status: editingTask.status,
        subjectId: editingTask.subjectId
      });
    }
    
    setEditingTask(null);
    loadData();
  };

  // Delete task handler
  const handleDelete = (task) => {
    setTaskToDelete(task);
    setIsDeleteModalOpen(true);
  };

  // Confirm task deletion
  const confirmDelete = () => {
    if (taskToDelete) {
      storage.tasks.delete(taskToDelete.id);
      setIsDeleteModalOpen(false);
      setTaskToDelete(null);
      loadData();
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="tasks-page">
      <div className="page-header">
        <h1>Tasks</h1>
        <div className="header-actions">
          <button 
            className="btn-primary"
            onClick={handleNewTask}
          >
            <span className="icon">+</span> New Task
          </button>
        </div>
      </div>

      <div className="filters-section">
        <div className="status-filter">
          <button 
            className={activeFilter === 'all' ? 'active' : ''}
            onClick={() => setActiveFilter('all')}
          >
            All
          </button>
          <button 
            className={activeFilter === 'todo' ? 'active' : ''}
            onClick={() => setActiveFilter('todo')}
          >
            To Do
          </button>
          <button 
            className={activeFilter === 'in-progress' ? 'active' : ''}
            onClick={() => setActiveFilter('in-progress')}
          >
            In Progress
          </button>
          <button 
            className={activeFilter === 'done' ? 'active' : ''}
            onClick={() => setActiveFilter('done')}
          >
            Done
          </button>
        </div>

        <div className="subject-filter">
          <button 
            className={activeSubjectId === 'all' ? 'active' : ''}
            onClick={() => setActiveSubjectId('all')}
          >
            All Subjects
          </button>
          {Object.values(subjects).map(subject => (
            <button 
              key={subject.id}
              className={activeSubjectId === subject.id ? 'active' : ''}
              onClick={() => setActiveSubjectId(subject.id)}
              style={{ 
                borderColor: subject.color,
                backgroundColor: activeSubjectId === subject.id ? subject.color : 'transparent',
                color: activeSubjectId === subject.id ? '#fff' : subject.color
              }}
            >
              {subject.name}
            </button>
          ))}
        </div>
      </div>

      {filteredTasks.length === 0 ? (
        <div className="empty-state">
          <p>
            {activeFilter !== 'all' || activeSubjectId !== 'all'
              ? 'No tasks match your current filters.'
              : 'You have no tasks yet. Create your first task to get started!'}
          </p>
        </div>
      ) : (
        groupOrder.map(group => {
          if (!groupedTasks[group] || groupedTasks[group].length === 0) return null;
          
          return (
            <div key={group} className="task-group">
              <h2 className="task-group-title">
                {group}
                <span className="task-count">({groupedTasks[group].length})</span>
              </h2>
              
              <div className="tasks-list">
                {groupedTasks[group].map(task => (
                  <div 
                    key={task.id} 
                    className={`task-item status-${task.status}`}
                  >
                    <div className="task-checkbox">
                      <select 
                        value={task.status}
                        onChange={(e) => handleStatusChange(task.id, e.target.value)}
                        className={`status-select status-${task.status}`}
                      >
                        <option value="todo">To Do</option>
                        <option value="in-progress">In Progress</option>
                        <option value="done">Done</option>
                      </select>
                    </div>
                    
                    <div className="task-content">
                      <h3 className="task-title">{task.title}</h3>
                      {task.description && (
                        <p className="task-description">{task.description}</p>
                      )}
                      
                      <div className="task-meta">
                        {subjects[task.subjectId] && (
                          <span 
                            className="subject-tag" 
                            style={{ backgroundColor: subjects[task.subjectId].color }}
                          >
                            {subjects[task.subjectId].name}
                          </span>
                        )}
                        
                        {task.dueDate && (
                          <span className="due-date">
                            Due: {formatDate(task.dueDate)}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="task-actions">
                      <button 
                        className="btn-icon" 
                        onClick={() => handleEdit(task)}
                        aria-label="Edit"
                      >
                        ✏️
                      </button>
                      <button 
                        className="btn-icon delete" 
                        onClick={() => handleDelete(task)}
                        aria-label="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })
      )}
      
      {/* Edit Task Modal */}
      {editingTask && (
        <div className="modal-backdrop">
          <div className="modal">
            <div className="modal-header">
              <h2>{editingTask.id ? 'Edit Task' : 'Create Task'}</h2>
              <button 
                className="close-button" 
                onClick={() => setEditingTask(null)}
              >
                &times;
              </button>
            </div>
            
            <div className="form-group">
              <label htmlFor="task-title">Title</label>
              <input
                id="task-title"
                type="text"
                value={editingTask.title}
                onChange={(e) => setEditingTask({...editingTask, title: e.target.value})}
                placeholder="Task title"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="task-description">Description (optional)</label>
              <textarea
                id="task-description"
                value={editingTask.description || ''}
                onChange={(e) => setEditingTask({...editingTask, description: e.target.value})}
                placeholder="Task description"
                rows={3}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="task-due-date">Due Date (optional)</label>
              <input
                id="task-due-date"
                type="date"
                value={editingTask.dueDate || ''}
                onChange={(e) => setEditingTask({...editingTask, dueDate: e.target.value})}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="task-status">Status</label>
              <select
                id="task-status"
                value={editingTask.status}
                onChange={(e) => setEditingTask({...editingTask, status: e.target.value})}
              >
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="task-subject">Subject</label>
              <select
                id="task-subject"
                value={editingTask.subjectId}
                onChange={(e) => setEditingTask({...editingTask, subjectId: e.target.value})}
              >
                {Object.values(subjects).map(subject => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-actions">
              <button 
                type="button"
                className="btn-secondary"
                onClick={() => setEditingTask(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={handleSave}
                disabled={!editingTask.title.trim()}
              >
                {editingTask.id ? 'Save Changes' : 'Create Task'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="modal-backdrop">
          <div className="modal">
            <div className="modal-header">
              <h2>Delete Task</h2>
              <button 
                className="close-button" 
                onClick={() => setIsDeleteModalOpen(false)}
              >
                &times;
              </button>
            </div>
            
            <div className="modal-content">
              <p>Are you sure you want to delete "{taskToDelete?.title}"?</p>
            </div>
            
            <div className="form-actions">
              <button 
                type="button"
                className="btn-secondary"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-danger"
                onClick={confirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Tasks;
