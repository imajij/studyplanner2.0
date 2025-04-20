// Local storage keys
const KEYS = {
  SUBJECTS: 'studyplanner_subjects',
  TASKS: 'studyplanner_tasks',
  NOTES: 'studyplanner_notes',
  PLANS: 'studyplanner_plans'
};

// Get data from localStorage
const getData = (key) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(`Error getting data from localStorage: ${error}`);
    return null;
  }
};

// Save data to localStorage
const saveData = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error(`Error saving data to localStorage: ${error}`);
    return false;
  }
};

// Specific functions for each data type
const subjects = {
  getAll: () => getData(KEYS.SUBJECTS) || [],
  getById: (id) => {
    const subjects = getData(KEYS.SUBJECTS) || [];
    return subjects.find(subject => subject.id === id) || null;
  },
  save: (subjects) => saveData(KEYS.SUBJECTS, subjects),
  add: (subject) => {
    const subjects = getData(KEYS.SUBJECTS) || [];
    const newSubject = { 
      id: Date.now().toString(), 
      createdAt: new Date().toISOString(),
      ...subject 
    };
    subjects.push(newSubject);
    saveData(KEYS.SUBJECTS, subjects);
    return newSubject;
  },
  update: (id, updates) => {
    const subjects = getData(KEYS.SUBJECTS) || [];
    const index = subjects.findIndex(subject => subject.id === id);
    if (index !== -1) {
      subjects[index] = { ...subjects[index], ...updates };
      saveData(KEYS.SUBJECTS, subjects);
      return subjects[index];
    }
    return null;
  },
  delete: (id) => {
    const subjects = getData(KEYS.SUBJECTS) || [];
    const newSubjects = subjects.filter(subject => subject.id !== id);
    saveData(KEYS.SUBJECTS, newSubjects);
  }
};

const tasks = {
  getAll: () => getData(KEYS.TASKS) || [],
  getById: (id) => {
    const tasks = getData(KEYS.TASKS) || [];
    return tasks.find(task => task.id === id) || null;
  },
  getBySubject: (subjectId) => {
    const tasks = getData(KEYS.TASKS) || [];
    return tasks.filter(task => task.subjectId === subjectId);
  },
  save: (tasks) => saveData(KEYS.TASKS, tasks),
  add: (task) => {
    const tasks = getData(KEYS.TASKS) || [];
    const newTask = { 
      id: Date.now().toString(), 
      status: 'todo', 
      createdAt: new Date().toISOString(),
      ...task 
    };
    tasks.push(newTask);
    saveData(KEYS.TASKS, tasks);
    return newTask;
  },
  updateStatus: (id, status) => {
    const tasks = getData(KEYS.TASKS) || [];
    const index = tasks.findIndex(task => task.id === id);
    if (index !== -1) {
      tasks[index].status = status;
      saveData(KEYS.TASKS, tasks);
      return tasks[index];
    }
    return null;
  },
  update: (id, updates) => {
    const tasks = getData(KEYS.TASKS) || [];
    const index = tasks.findIndex(task => task.id === id);
    if (index !== -1) {
      tasks[index] = { ...tasks[index], ...updates };
      saveData(KEYS.TASKS, tasks);
      return tasks[index];
    }
    return null;
  },
  delete: (id) => {
    const tasks = getData(KEYS.TASKS) || [];
    const newTasks = tasks.filter(task => task.id !== id);
    saveData(KEYS.TASKS, newTasks);
  }
};

const notes = {
  getAll: () => getData(KEYS.NOTES) || [],
  getById: (id) => {
    const notes = getData(KEYS.NOTES) || [];
    return notes.find(note => note.id === id) || null;
  },
  getBySubject: (subjectId) => {
    const notes = getData(KEYS.NOTES) || [];
    return notes.filter(note => note.subjectId === subjectId);
  },
  save: (notes) => saveData(KEYS.NOTES, notes),
  add: (note) => {
    const notes = getData(KEYS.NOTES) || [];
    const newNote = { 
      id: Date.now().toString(), 
      createdAt: new Date().toISOString(),
      ...note 
    };
    notes.push(newNote);
    saveData(KEYS.NOTES, notes);
    return newNote;
  },
  update: (id, updates) => {
    const notes = getData(KEYS.NOTES) || [];
    const index = notes.findIndex(note => note.id === id);
    if (index !== -1) {
      notes[index] = { ...notes[index], ...updates };
      saveData(KEYS.NOTES, notes);
      return notes[index];
    }
    return null;
  },
  delete: (id) => {
    const notes = getData(KEYS.NOTES) || [];
    const newNotes = notes.filter(note => note.id !== id);
    saveData(KEYS.NOTES, newNotes);
  }
};

const plans = {
  getAll: () => getData(KEYS.PLANS) || [],
  save: (plans) => saveData(KEYS.PLANS, plans),
  add: (plan) => {
    const plans = getData(KEYS.PLANS) || [];
    const newPlan = { 
      id: Date.now().toString(), 
      createdAt: new Date().toISOString(),
      ...plan 
    };
    plans.push(newPlan);
    saveData(KEYS.PLANS, plans);
    return newPlan;
  },
  update: (id, updates) => {
    const plans = getData(KEYS.PLANS) || [];
    const index = plans.findIndex(plan => plan.id === id);
    if (index !== -1) {
      plans[index] = { ...plans[index], ...updates };
      saveData(KEYS.PLANS, plans);
      return plans[index];
    }
    return null;
  },
  delete: (id) => {
    const plans = getData(KEYS.PLANS) || [];
    const newPlans = plans.filter(plan => plan.id !== id);
    saveData(KEYS.PLANS, newPlans);
  }
};

export default {
  subjects,
  tasks,
  notes,
  plans
};
