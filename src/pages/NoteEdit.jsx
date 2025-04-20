import { useParams } from 'react-router-dom';
import NoteEditor from '../components/NoteEditor';

function NoteEdit() {
  const { noteId } = useParams();
  
  return (
    <div className="note-edit-page">
      <NoteEditor noteId={noteId} />
    </div>
  );
}

export default NoteEdit;
