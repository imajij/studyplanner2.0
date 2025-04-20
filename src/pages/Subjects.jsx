import { useState, useEffect } from 'react';
import storage from '../utils/localStorage';

function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const [editingSubject, setEditingSubject] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [subjectToDelete, setSubjectToDelete] = useState(null);
  const [stats, setStats] = useState({});

  // Load subjects data
  useEffect(() => {
    loadSubjects();
  }, []);

  // Load subjects and calculate stats
  const loadSubjects = () => {
    const allSubjects = storage.subjects.getAll();
    setSubjects(allSubjects);

    // Calculate stats for each subject
    const tasks = storage.tasks.getAll();
    const notes = storage.notes.getAll();
    
    const subjectStats = {};
    allSubjects.forEach(subject => {
      const subjectTasks = tasks.filter(task => task.subjectId === subject.id);
      const completedTasks = subjectTasks.filter(task => task.status === 'done');
      const subjectNotes = notes.filter(note => note.subjectId === subject.id);
      
      subjectStats[subject.id] = {
        totalTasks: subjectTasks.length,
        completedTasks: completedTasks.length,
        completionRate: subjectTasks.length ? 
          Math.round((completedTasks.length / subjectTasks.length) * 100) : 0,
        notes: subjectNotes.length
      };
    });
    
    setStats(subjectStats);
  };

  // Edit subject handler
  const handleEdit = (subject) => {
    setEditingSubject({
      ...subject
    });
  };

  // Save edited subject
  const handleSave = () => {
    if (editingSubject.id) {
      // Update existing subject
      storage.subjects.update(editingSubject.id, {
        name: editingSubject.name,
        description: editingSubject.description,
        color: editingSubject.color
      });
    }
    
    setEditingSubject(null);
    loadSubjects();
  };

  // Handle delete subject
  const handleDelete = (subject) => {
    setSubjectToDelete(subject);
    setIsDeleteModalOpen(true);
  };

  // Confirm deletion
  const confirmDelete = () => {
    if (!subjectToDelete) return;
    
    // Check if subject has tasks or notes
    const tasks = storage.tasks.getAll().filter(task => task.subjectId === subjectToDelete.id);
    const notes = storage.notes.getAll().filter(note => note.subjectId === subjectToDelete.id);
    
    if (tasks.length > 0 || notes.length > 0) {
      // Delete associated tasks and notes
      tasks.forEach(task => storage.tasks.delete(task.id));
      notes.forEach(note => storage.notes.delete(note.id));
    }
    
    // Delete subject
    storage.subjects.delete(subjectToDelete.id);
    setIsDeleteModalOpen(false);
    setSubjectToDelete(null);
    loadSubjects();
  };

  // Color options for subjects
  const colorOptions = [
    '#4f46e5', // Indigo
    '#0284c7', // Sky
    '#0891b2', // Cyan
    '#059669', // Emerald
    '#65a30d', // Lime
    '#d97706', // Amber
    '#dc2626', // Red
    '#c026d3', // Fuchsia
    '#7c3aed', // Violet
    '#2563eb', // Blue
  ];

  return (
    <div className="subjects-page">
      <div className="page-header">
        <h1>Subjects</h1>
        <div className="header-actions">
          <button 
            className="btn-primary"
            onClick={() => setEditingSubject({ name: '', description: '', color: colorOptions[0] })}
          >
            <span className="icon">+</span> New Subject
          </button>
        </div>
      </div>

      {subjects.length === 0 ? (
        <div className="empty-state">
          <p>You haven't created any subjects yet. Create your first subject to get started!</p>
        </div>
      ) : (
        <div className="subjects-grid">
          {subjects.map(subject => (
            <div className="subject-card" key={subject.id}>
              <div className="subject-header" style={{ backgroundColor: subject.color }}>
                <h2>{subject.name}</h2>
              </div>
              <div className="subject-content">
                <p className="subject-description">{subject.description}</p>
                
                <div className="subject-stats">
                  <div className="stat">
                    <div className="stat-label">Tasks</div>
                    <div className="stat-value">
                      {stats[subject.id]?.totalTasks || 0}
                    </div>
                  </div>
                  
                  <div className="stat">
                    <div className="stat-label">Completion</div>
                    <div className="stat-value">
                      {stats[subject.id]?.completionRate || 0}%
                    </div>
                  </div>
                  
                  <div className="stat">
                    <div className="stat-label">Notes</div>
                    <div className="stat-value">
                      {stats[subject.id]?.notes || 0}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="subject-actions">
                <button 
                  className="btn-secondary"
                  onClick={() => handleEdit(subject)}
                >
                  Edit
                </button>
                <button 
                  className="btn-danger"
                  onClick={() => handleDelete(subject)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Subject Modal */}
      {editingSubject && (
        <div className="modal-backdrop">
          <div className="modal">
            <div className="modal-header">
              <h2>{editingSubject.id ? 'Edit Subject' : 'Create Subject'}</h2>
              <button 
                className="close-button" 
                onClick={() => setEditingSubject(null)}
              >
                &times;
              </button>
            </div>
            
            <div className="form-group">
              <label htmlFor="subject-name">Name</label>
              <input
                id="subject-name"
                type="text"
                value={editingSubject.name}
                onChange={(e) => setEditingSubject({...editingSubject, name: e.target.value})}
                placeholder="Subject name"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="subject-description">Description (optional)</label>
              <textarea
                id="subject-description"
                value={editingSubject.description}
                onChange={(e) => setEditingSubject({...editingSubject, description: e.target.value})}
                placeholder="Subject description"
                rows={3}
              />
            </div>
            
            <div className="form-group">
              <label>Color</label>
              <div className="color-picker">
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`color-option ${editingSubject.color === color ? 'selected' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setEditingSubject({...editingSubject, color: color})}
                    aria-label={`Select color ${color}`}
                  />
                ))}
              </div>
            </div>
            
            <div className="form-actions">
              <button 
                type="button"
                className="btn-secondary"
                onClick={() => setEditingSubject(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={handleSave}
                disabled={!editingSubject.name.trim()}
              >
                {editingSubject.id ? 'Save Changes' : 'Create Subject'}
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
              <h2>Delete Subject</h2>
              <button 
                className="close-button" 
                onClick={() => setIsDeleteModalOpen(false)}
              >
                &times;
              </button>
            </div>
            
            <div className="modal-content">
              <p>
                Are you sure you want to delete "{subjectToDelete?.name}"? 
                This will also delete all associated tasks and notes.
              </p>
              
              {stats[subjectToDelete?.id]?.totalTasks > 0 || stats[subjectToDelete?.id]?.notes > 0 ? (
                <div className="warning-message">
                  <p>
                    This subject has {stats[subjectToDelete?.id]?.totalTasks} tasks and 
                    {' '}{stats[subjectToDelete?.id]?.notes} notes that will be deleted.
                  </p>
                </div>
              ) : null}
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

export default Subjects;
