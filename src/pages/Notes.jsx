import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import storage from '../utils/localStorage';

function Notes() {
  const [notes, setNotes] = useState([]);
  const [subjects, setSubjects] = useState({});
  const [activeSubjectId, setActiveSubjectId] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  
  useEffect(() => {
    // Load notes and subjects
    const loadData = () => {
      const allNotes = storage.notes.getAll();
      // Sort by most recently updated
      const sortedNotes = [...allNotes].sort((a, b) => {
        const aDate = a.updatedAt || a.createdAt;
        const bDate = b.updatedAt || b.createdAt;
        return new Date(bDate) - new Date(aDate);
      });
      setNotes(sortedNotes);
      
      // Create a lookup object for subjects
      const subjectsData = storage.subjects.getAll();
      const subjectsMap = {};
      subjectsData.forEach(subject => {
        subjectsMap[subject.id] = subject;
      });
      setSubjects(subjectsMap);
    };
    
    loadData();
  }, []);
  
  // Filter notes by selected subject and search term
  const filteredNotes = notes.filter(note => {
    const matchesSubject = activeSubjectId === 'all' || note.subjectId === activeSubjectId;
    
    if (!searchTerm.trim()) return matchesSubject;
    
    // Search in title and content
    const search = searchTerm.toLowerCase();
    const matchesSearch = 
      note.title.toLowerCase().includes(search) || 
      (note.content && note.content.toLowerCase().includes(search));
      
    return matchesSubject && matchesSearch;
  });
    
  // Group notes by date
  const groupedNotes = filteredNotes.reduce((groups, note) => {
    // Use updated date if available, otherwise creation date
    const dateString = note.updatedAt || note.createdAt;
    const date = new Date(dateString);
    
    // Group by today, yesterday, this week, this month, older
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    
    let group = 'Older';
    
    if (date.toDateString() === now.toDateString()) {
      group = 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      group = 'Yesterday';
    } else if (now.getTime() - date.getTime() < 7 * 24 * 60 * 60 * 1000) {
      group = 'This Week';
    } else if (now.getMonth() === date.getMonth() && now.getFullYear() === date.getFullYear()) {
      group = 'This Month';
    }
    
    if (!groups[group]) {
      groups[group] = [];
    }
    groups[group].push(note);
    return groups;
  }, {});
  
  // Sort groups in chronological order
  const sortedGroups = ['Today', 'Yesterday', 'This Week', 'This Month', 'Older'].filter(
    group => groupedNotes[group] && groupedNotes[group].length > 0
  );
  
  // Handle creating a new note
  const handleCreateNote = () => {
    // Check if we have any subjects
    const allSubjects = storage.subjects.getAll();
    if (allSubjects.length === 0) {
      // Show modal or alert that we need a subject first
      alert('You need to create a subject before creating notes.');
      return;
    }
    
    // Create a new note with the first subject
    const newNote = {
      title: 'Untitled Note',
      content: '',
      subjectId: allSubjects[0].id
    };
    
    const createdNote = storage.notes.add(newNote);
    navigate(`/notes/${createdNote.id}/edit`);
  };

  return (
    <div className="notes-page">
      <div className="page-header">
        <h1>Notes</h1>
        <div className="header-actions">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <button className="btn-primary" onClick={handleCreateNote}>
            <span className="icon">+</span> New Note
          </button>
        </div>
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
      
      {filteredNotes.length > 0 ? (
        sortedGroups.map(group => (
          <div key={group} className="notes-date-group">
            <h2 className="date-header">{group}</h2>
            <div className="notes-grid">
              {groupedNotes[group].map(note => (
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
              ))}
            </div>
          </div>
        ))
      ) : (
        <div className="empty-state">
          {searchTerm ? (
            <p>No notes match your search. Try different keywords.</p>
          ) : (
            <p>You don't have any notes yet. Create your first note!</p>
          )}
        </div>
      )}
    </div>
  );
}

export default Notes;
