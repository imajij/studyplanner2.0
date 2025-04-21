# StudyPlanner - Personal Study Management App

StudyPlanner is a comprehensive web application designed to help students organize their study materials, track tasks, and manage notes—all with an offline-first approach. Built with modern React and leveraging browser local storage, this app requires no login or backend while providing a seamless study planning experience.

## 📋 Features

### 📊 Dashboard

- Overview of current study status with key statistics
- Progress tracking with completion rate visualization
- Quick access to upcoming tasks and recent notes
- At-a-glance view of active subjects

### ✅ Task Management

- Create, edit, and delete tasks with due dates
- Group tasks by due date (Overdue, Today, Tomorrow, etc.)
- Track task status (To-Do, In Progress, Done)
- Filter tasks by subject or status

### 📝 Notes System

- Full-featured Markdown editor with preview mode
- Split-screen editing for simultaneous writing and preview
- Formatting toolbar with common Markdown elements
- Auto-save functionality for worry-free note-taking
- Organize notes by subject

### 📚 Subject Organization

- Create subjects with custom colors
- View statistics for each subject
- Track completion rates per subject
- Manage all study content in one organized system

## 💻 Technologies Used

- **React 19** - Latest version for building the user interface
- **React Router 7** - Client-side routing with latest features
- **Vite** - Next-generation frontend build tool
- **LocalStorage API** - For persistent data storage without a backend
- **CSS3** - Custom styling with responsive design
- **ES6+** - Modern JavaScript features
- **Markdown Parsing** - Custom implementation for note rendering

## 🏗️ Architecture

The application follows a component-based architecture with:

- **Layout Component** - Provides the app structure with navigation and modals
- **Page Components** - Dashboard, Tasks, Notes, and Subjects views
- **Feature Components** - Specialized components like NoteEditor
- **Modal Components** - For creating and editing tasks, notes, and subjects
- **localStorage Utility** - Data management layer for persistent storage

## 🚀 Getting Started

### Prerequisites

- Node.js 18.0 or later
- npm or yarn package manager

### Installation

1. Clone the repository:
