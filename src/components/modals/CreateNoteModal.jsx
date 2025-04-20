import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import storage from '../../utils/localStorage';

function CreateNoteModal({ onClose }) {
  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Load subjects for dropdown
    const allSubjects = storage.subjects.getAll();
    setSubjects(allSubjects);
    if (allSubjects.length > 0) {
      setSubjectId(allSubjects[0].id);
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    
    if (!subjectId) {
      setError('Please select a subject');
      return;
    }

    const newNote = {
      title,
      subjectId,
      content: '',
    };

    const createdNote = storage.notes.add(newNote);
    onClose();
    // Navigate to the edit page for this note
    navigate(`/notes/${createdNote.id}/edit`);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="modal-header">
          <h2>Create New Note</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          {error && <div className="error">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Note title"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="subject">Subject</label>
            {subjects.length > 0 ? (
              <select
                id="subject"
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
              >
                {subjects.map(subject => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-notice">Please create a subject first</p>
            )}
          </div>
          
          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-primary"
              disabled={subjects.length === 0}
            >
              Create & Edit Note
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateNoteModal;
