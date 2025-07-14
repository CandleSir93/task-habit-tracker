# Task & Habit Tracker

A modern web application for tracking tasks, habits, and daily activities with a clean, responsive interface.

## Overview

Task & Habit Tracker is a lightweight, browser-based application built with React (via CDN) that helps users organize their daily lives through:

- **Task Management**: Create, categorize, prioritize and track completion of tasks
- **Habit Tracking**: Monitor recurring activities and build consistency
- **Daily Logging**: Record daily wellness metrics including:
  - Wake up and bedtime
  - First interactions
  - Mood tracking
  - Meal logging
  - Physical activity
  - Medication tracking
- **Calendar Integration**: Visual representation of tasks, habits, and logs
- **Settings**: User preferences including dark mode and medication management

## Current State

### Implemented Features

- **Basic Structure**: Core application layout with navigation dropdown menu
- **UI Framework**: Modern, responsive design with light/dark mode support
- **Daily Logs**:
  - Create, edit, and delete daily log entries
  - Fields for wake-up time, first interaction, mood, meals, physical activity, medications, and bedtime
  - Calendar marking for days with log entries
- **Settings Page**:
  - Dark mode toggle with persistent preference
  - Medication management system
    - Add/remove medications from a central list
    - Select medications from a multi-select dropdown in daily logs

### Technical Implementation

- React.js via CDN (no Node.js/npm required)
- Pure CSS for styling with CSS variables for theming
- Browser localStorage for data persistence
- Python simple HTTP server for local development

## Todo List

### Core Functionality
- [ ] **Install Node.js and npm** for more robust development environment
- [ ] **Finalize Calendar Integration**
  - [ ] Select and integrate a proper calendar component
  - [ ] Display tasks on the calendar by date
- [ ] **Complete Task Management**
  - [ ] Implement full to-do list functionality (add/delete/check off tasks)
  - [ ] Connect tasks to calendar
- [ ] **Implement Habit Tracker**
  - [ ] Create habit definition and tracking system
  - [ ] Add customizable fields for habit metrics
  - [ ] Connect habit tracker to calendar for pattern visualization

### Enhancements
- [ ] **Data Export/Import**
  - [ ] Add ability to export data as JSON/CSV
  - [ ] Allow importing data from backup
- [ ] **Statistics and Analytics**
  - [ ] Basic charts for mood, sleep patterns, medication adherence
  - [ ] Weekly/monthly summary views
- [ ] **Notifications/Reminders**
  - [ ] Optional browser notifications for tasks/habits
- [ ] **Mobile Optimization**
  - [ ] Further responsive design improvements
  - [ ] Touch-friendly interface adjustments

### Technical Improvements
- [ ] **Code Organization**
  - [ ] Split monolithic App.js into components
  - [ ] Implement proper state management (Context API or Redux)
- [ ] **Testing**
  - [ ] Add unit and integration tests
- [ ] **Performance Optimization**
  - [ ] Memoize expensive computations
  - [ ] Optimize renders

## Getting Started

1. Clone this repository
2. Navigate to the project directory
3. Run a local server:
   ```
   python serve.py
   ```
   or any HTTP server of your choice
4. Open `http://localhost:8000` in your browser

## Usage Notes

- Data is stored locally in your browser (localStorage)
- No accounts or server connectivity required
- For best experience, use a modern browser (Chrome, Firefox, Edge)

## Dependencies

- React (via CDN)
- Babel standalone (via CDN)
