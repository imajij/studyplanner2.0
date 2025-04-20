import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import Notes from './pages/Notes';
import NoteEdit from './pages/NoteEdit';
import Subjects from './pages/Subjects';
import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="tasks" element={<Tasks />} />
        <Route path="notes" element={<Notes />} />
        <Route path="notes/:noteId/edit" element={<NoteEdit />} />
        <Route path="subjects" element={<Subjects />} />
      </Route>
    </Routes>
  );
}

export default App;
