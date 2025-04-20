import { useState } from 'react';
import storage from '../../utils/localStorage';

const COLORS = [
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

function CreateSubjectModal({ onClose }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Subject name is required');
      return;
    }
    
    const newSubject = {
      name,
      description,
      color
    };

    storage.subjects.add(newSubject);
    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="modal-header">
          <h2>Create New Subject</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          {error && <div className="error">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Subject name"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Description (optional)</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Subject description"
              rows={3}
            />
          </div>
          
          <div className="form-group">
            <label>Color</label>
            <div className="color-picker">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`color-option ${color === c ? 'selected' : ''}`}
                  style={{ backgroundColor: c }}
                  onClick={() => setColor(c)}
                  aria-label={`Select color ${c}`}
                />
              ))}
            </div>
          </div>
          
          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Create Subject
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateSubjectModal;
