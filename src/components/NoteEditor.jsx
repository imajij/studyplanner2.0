import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import storage from '../utils/localStorage';

// Very simple Markdown renderer - in a real app you would use a library like marked
const renderMarkdown = (text) => {
  if (!text) return '';
  
  return text
    // Headers
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Code blocks
    .replace(/```([^`]+)```/g, '<pre><code>$1</code></pre>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // Blockquotes
    .replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>')
    // Unordered lists
    .replace(/^- (.*$)/gm, '<ul><li>$1</li></ul>')
    .replace(/<\/ul>\s*<ul>/g, '')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    // Line breaks
    .replace(/\n/g, '<br />')
    // Paragraphs
    .replace(/<br \/><br \/>/g, '</p><p>')
    .replace(/^(.+)(?:<br \/>|$)/gm, '<p>$1</p>');
};

function NoteEditor({ noteId }) {
  const [note, setNote] = useState(null);
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState(null);
  const [lastSaved, setLastSaved] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [viewMode, setViewMode] = useState('edit'); // edit, preview, split
  const [renderHtml, setRenderHtml] = useState('');
  const editorRef = useRef(null);
  const navigate = useNavigate();
  
  // Load note data
  useEffect(() => {
    const noteData = storage.notes.getById(noteId);
    if (noteData) {
      setNote(noteData);
      setContent(noteData.content || '');
      setTitle(noteData.title || '');
      
      // Get subject data
      const subjectData = storage.subjects.getById(noteData.subjectId);
      setSubject(subjectData);
    } else {
      // Note not found, redirect to notes list
      navigate('/notes');
    }
  }, [noteId, navigate]);
  
  // Update preview when content changes
  useEffect(() => {
    setRenderHtml(renderMarkdown(content));
  }, [content]);
  
  // Auto-save after typing stops
  useEffect(() => {
    if (!note) return;
    
    const timer = setTimeout(() => {
      saveNote();
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [content, title]);
  
  const saveNote = async () => {
    if (!note) return;
    
    setIsSaving(true);
    
    try {
      storage.notes.update(noteId, {
        title,
        content,
        updatedAt: new Date().toISOString()
      });
      setLastSaved(new Date());
    } catch (error) {
      console.error('Error saving note:', error);
    } finally {
      setTimeout(() => setIsSaving(false), 500);
    }
  };
  
  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  };
  
  const handleContentChange = (e) => {
    setContent(e.target.value);
  };
  
  // Insert template or markdown elements
  const insertMarkdown = (template) => {
    if (!editorRef.current) return;
    
    const textarea = editorRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    let insertion = template;
    
    // Replace selected text in the template
    if (selectedText) {
      insertion = template.replace('$1', selectedText);
    }
    
    const newContent = 
      content.substring(0, start) +
      insertion +
      content.substring(end);
    
    setContent(newContent);
    
    // Set cursor position after insertion
    setTimeout(() => {
      textarea.focus();
      // Calculate where to put the cursor
      const cursorPosition = template.includes('$1')
        ? start + template.indexOf('$1') + selectedText.length
        : start + insertion.length;
        
      textarea.setSelectionRange(cursorPosition, cursorPosition);
    }, 0);
  };
  
  const insertTemplate = (type) => {
    switch(type) {
      case 'heading1':
        insertMarkdown('# $1');
        break;
      case 'heading2':
        insertMarkdown('## $1');
        break;
      case 'heading3':
        insertMarkdown('### $1');
        break;
      case 'bold':
        insertMarkdown('**$1**');
        break;
      case 'italic':
        insertMarkdown('*$1*');
        break;
      case 'code':
        insertMarkdown('`$1`');
        break;
      case 'codeblock':
        insertMarkdown('```\n$1\n```');
        break;
      case 'quote':
        insertMarkdown('> $1');
        break;
      case 'list':
        insertMarkdown('- $1');
        break;
      case 'link':
        insertMarkdown('[$1](url)');
        break;
      case 'check':
        insertMarkdown('- [ ] $1');
        break;
      default:
        break;
    }
  };
  
  // Handle back to notes list
  const handleBack = async () => {
    await saveNote();
    navigate('/notes');
  };
  
  if (!note) {
    return <div className="loading">Loading note...</div>;
  }
  
  const formatSaveTime = () => {
    if (!lastSaved) return 'Not saved yet';
    
    const now = new Date();
    const diff = Math.floor((now - lastSaved) / 1000); // seconds
    
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    
    return lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="note-editor">
      <div className="note-editor-header">
        <button className="btn-secondary" onClick={handleBack}>
          &larr; Back
        </button>
        <div className="note-info">
          {subject && (
            <span 
              className="subject-tag" 
              style={{ backgroundColor: subject.color }}
            >
              {subject.name}
            </span>
          )}
          <span className="save-status">
            {isSaving ? 'Saving...' : formatSaveTime()}
          </span>
        </div>
        <div className="view-controls">
          <button 
            className={`btn-view ${viewMode === 'edit' ? 'active' : ''}`} 
            onClick={() => setViewMode('edit')}
          >
            Edit
          </button>
          <button 
            className={`btn-view ${viewMode === 'preview' ? 'active' : ''}`} 
            onClick={() => setViewMode('preview')}
          >
            Preview
          </button>
          <button 
            className={`btn-view ${viewMode === 'split' ? 'active' : ''}`} 
            onClick={() => setViewMode('split')}
          >
            Split
          </button>
        </div>
      </div>
      
      <input
        type="text"
        className="note-title-input"
        value={title}
        onChange={handleTitleChange}
        placeholder="Note title"
      />
      
      {viewMode !== 'preview' && (
        <div className="markdown-toolbar">
          <button onClick={() => insertTemplate('heading1')}>H1</button>
          <button onClick={() => insertTemplate('heading2')}>H2</button>
          <button onClick={() => insertTemplate('heading3')}>H3</button>
          <button onClick={() => insertTemplate('bold')}>B</button>
          <button onClick={() => insertTemplate('italic')}>I</button>
          <button onClick={() => insertTemplate('code')}>Code</button>
          <button onClick={() => insertTemplate('codeblock')}>Block</button>
          <button onClick={() => insertTemplate('quote')}>Quote</button>
          <button onClick={() => insertTemplate('list')}>List</button>
          <button onClick={() => insertTemplate('link')}>Link</button>
          <button onClick={() => insertTemplate('check')}>Check</button>
        </div>
      )}
      
      <div className={`editor-container ${viewMode === 'split' ? 'split-view' : ''}`}>
        {viewMode !== 'preview' && (
          <textarea
            ref={editorRef}
            value={content}
            onChange={handleContentChange}
            placeholder="Write your note in Markdown..."
            className="markdown-editor"
          />
        )}
        
        {viewMode !== 'edit' && (
          <div 
            className="markdown-preview"
            dangerouslySetInnerHTML={{ __html: renderHtml }}
          />
        )}
      </div>
    </div>
  );
}

export default NoteEditor;
