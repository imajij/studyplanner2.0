import { Link, Outlet, useLocation } from 'react-router-dom';
import { useState } from 'react';
import CreateTaskModal from './modals/CreateTaskModal';
import CreateNoteModal from './modals/CreateNoteModal';
import CreateSubjectModal from './modals/CreateSubjectModal';

function Layout() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  
  // Helper function to determine if a link is active
  const isActive = (path) => location.pathname === path;
  
  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="header-left">
          <button 
            className="menu-toggle"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
          <h1>StudyPlanner</h1>
        </div>
        <div className="header-right">
          <button className="btn-profile">
            <span className="avatar">JS</span>
          </button>
        </div>
      </header>

      <div className="content-wrapper">
        {/* Sidebar Navigation */}
        <nav className={`sidebar ${isMobileMenuOpen ? 'show' : ''}`}>
          <div className="nav-section">
            <h2>Main</h2>
            <ul>
              <li className={isActive('/') ? 'active' : ''}>
                <Link to="/">
                  <span className="icon">📊</span>
                  <span>Dashboard</span>
                </Link>
              </li>
              <li className={isActive('/tasks') ? 'active' : ''}>
                <Link to="/tasks">
                  <span className="icon">✓</span>
                  <span>Tasks</span>
                </Link>
              </li>
              <li className={location.pathname.includes('/notes') ? 'active' : ''}>
                <Link to="/notes">
                  <span className="icon">📝</span>
                  <span>Notes</span>
                </Link>
              </li>
              <li className={isActive('/subjects') ? 'active' : ''}>
                <Link to="/subjects">
                  <span className="icon">📚</span>
                  <span>Subjects</span>
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="nav-section">
            <h2>Create New</h2>
            <div className="action-buttons">
              <button className="btn-action" onClick={() => setIsTaskModalOpen(true)}>
                <span className="icon">+</span>
                <span>New Task</span>
              </button>
              <button className="btn-action" onClick={() => setIsNoteModalOpen(true)}>
                <span className="icon">+</span>
                <span>New Note</span>
              </button>
              <button className="btn-action" onClick={() => setIsSubjectModalOpen(true)}>
                <span className="icon">+</span>
                <span>New Subject</span>
              </button>
            </div>
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="main-content">
          <div className="content-container">
            <Outlet /> {/* Child routes will render here */}
          </div>
        </main>
      </div>

      {/* Modals */}
      {isTaskModalOpen && (
        <CreateTaskModal onClose={() => setIsTaskModalOpen(false)} />
      )}
      {isNoteModalOpen && (
        <CreateNoteModal onClose={() => setIsNoteModalOpen(false)} />
      )}
      {isSubjectModalOpen && (
        <CreateSubjectModal onClose={() => setIsSubjectModalOpen(false)} />
      )}
    </div>
  );
}

export default Layout;
