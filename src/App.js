// App.js - Main component for Task & Habit Tracker App

// Mock Calendar component since we're not using npm
class Calendar extends React.Component {
  render() {
    const { value, onChange, tileClassName } = this.props;
    const currentDate = value || new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    // Get first day of month
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    // Get days in month
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    // Month names for header
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    
    // Create calendar grid
    let days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const isSelected = currentDate.getDate() === day;
      
      // Check if there are tasks for this day
      const hasTask = this.props.tasks.some(task => {
        if (!task.date) return false;
        const taskDate = new Date(task.date);
        return taskDate.getDate() === day && 
               taskDate.getMonth() === currentMonth && 
               taskDate.getFullYear() === currentYear;
      });
      
      // Check if there are habits for this day
      const hasHabit = this.props.habits.some(habit => 
        habit.completedDates.some(completedDate => {
          const habitDate = new Date(completedDate);
          return habitDate.getDate() === day && 
                 habitDate.getMonth() === currentMonth && 
                 habitDate.getFullYear() === currentYear;
        })
      );
      
      // Check if there are daily logs for this day
      const hasLog = this.props.dailyLogs && this.props.dailyLogs.some(log => {
        if (!log.date) return false;
        const logDate = new Date(log.date);
        return logDate.getDate() === day && 
               logDate.getMonth() === currentMonth && 
               logDate.getFullYear() === currentYear;
      });
      
      days.push(
        <div 
          key={day}
          className={`calendar-day ${isSelected ? 'selected' : ''} ${hasTask ? 'has-task' : ''} ${hasHabit ? 'has-habit' : ''} ${hasLog ? 'has-log' : ''}`}
          onClick={() => onChange(date)}
        >
          {day}
        </div>
      );
    }
    
    return (
      <div className="custom-calendar">
        <div className="calendar-header">
          <button onClick={() => onChange(new Date(currentYear, currentMonth - 1, 1))}>Prev</button>
          <h3>{monthNames[currentMonth]} {currentYear}</h3>
          <button onClick={() => onChange(new Date(currentYear, currentMonth + 1, 1))}>Next</button>
        </div>
        <div className="calendar-weekdays">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>
        <div className="calendar-grid">
          {days}
        </div>
      </div>
    );
  }
}

// Task Component
function TaskList({ tasks, selectedDate, onTaskToggle, onTaskDelete }) {
  const filteredTasks = tasks.filter(task => {
    if (!selectedDate || !task.date) return true;
    const taskDate = new Date(task.date);
    const selected = new Date(selectedDate);
    return taskDate.getDate() === selected.getDate() && 
           taskDate.getMonth() === selected.getMonth() && 
           taskDate.getFullYear() === selected.getFullYear();
  });
  
  // Group tasks by category
  const groupedTasks = {};
  filteredTasks.forEach(task => {
    const category = task.category || 'Uncategorized';
    if (!groupedTasks[category]) {
      groupedTasks[category] = [];
    }
    groupedTasks[category].push(task);
  });
  
  // Priority colors
  const priorityColors = {
    'Low': '#6c757d',
    'Medium': '#007bff',
    'High': '#dc3545'
  };

  return (
    <div className="task-list">
      <h3>Tasks {selectedDate ? `for ${selectedDate.toDateString()}` : ''}</h3>
      {filteredTasks.length === 0 ? (
        <p className="no-tasks-message">No tasks for this date</p>
      ) : (
        Object.keys(groupedTasks).map(category => (
          <div key={category} className="task-category">
            <h4 className="category-header">{category}</h4>
            <ul>
              {groupedTasks[category].map(task => (
                <li 
                  key={task.id} 
                  className={`task-item ${task.completed ? 'completed' : ''}`}
                >
                  <div className="task-checkbox-container">
                    <input
                      type="checkbox"
                      className="task-checkbox"
                      checked={task.completed}
                      onChange={() => onTaskToggle(task.id)}
                    />
                  </div>
                  <div className="task-content">
                    <div className="task-header">
                      <span className="task-title">{task.title}</span>
                      {task.priority && (
                        <span 
                          className="task-priority" 
                          style={{backgroundColor: priorityColors[task.priority] || '#6c757d'}}
                        >
                          {task.priority}
                        </span>
                      )}
                    </div>
                    {task.description && (
                      <p className="task-description">{task.description}</p>
                    )}
                  </div>
                  <button 
                    className="task-delete" 
                    onClick={() => onTaskDelete(task.id)}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
    </div>
  );
}

// Habit Component
function HabitTracker({ habits, selectedDate, onHabitToggle, onHabitDelete }) {
  const today = selectedDate || new Date();
  
  // Get date string for comparison
  const getDateString = (date) => {
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  };
  
  // Check if habit is completed for a specific date
  const isHabitCompletedOn = (habit, date) => {
    const dateString = getDateString(date);
    return habit.completedDates.some(d => getDateString(new Date(d)) === dateString);
  };
  
  return (
    <div className="habit-tracker">
      <h3>Habits</h3>
      {habits.length === 0 ? (
        <p>No habits added yet</p>
      ) : (
        habits.map(habit => (
          <div key={habit.id} className="habit-item">
            <div className="habit-header">
              <span>{habit.title}</span>
              <button 
                className="habit-delete" 
                onClick={() => onHabitDelete(habit.id)}
              >
                ×
              </button>
            </div>
            <div className="habit-status">
              <input
                type="checkbox"
                checked={isHabitCompletedOn(habit, today)}
                onChange={() => onHabitToggle(habit.id, today)}
              />
              <span>Completed today</span>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// Main App Component
class App extends React.Component {
  constructor(props) {
    super(props);
    
    // Load data from localStorage if available
    const savedTasks = localStorage.getItem('tasks');
    const savedHabits = localStorage.getItem('habits');
    const savedDailyLogs = localStorage.getItem('dailyLogs');
    
    // Load settings from localStorage if available
    const savedSettings = localStorage.getItem('settings');
    
    this.state = {
      currentPage: 'main', // 'main', 'dailyLog', 'profile', or 'settings'
      selectedDate: new Date(),
      newTaskTitle: '',
      newTaskDescription: '',
      newTaskCategory: 'Personal',
      newTaskPriority: 'Medium',
      newHabitTitle: '',
      showTaskForm: false,
      showHabitForm: false,
      showLogForm: false,
      isEditingLog: false,
      editingLogId: null,
      newMedicationName: '',
      medications: localStorage.getItem('medications') ? 
        JSON.parse(localStorage.getItem('medications')) : [],
      settings: savedSettings ? JSON.parse(savedSettings) : {
        darkMode: false
      },
      userProfile: localStorage.getItem('userProfile') ? 
        JSON.parse(localStorage.getItem('userProfile')) : {
        name: '',
        age: '',
        gender: '',
        height: '',
        weight: '',
        healthGoals: ''
      },
      taskCategories: ['Personal', 'Work', 'Health', 'Education', 'Social', 'Other'],
      taskPriorities: ['Low', 'Medium', 'High'],
      moodOptions: ['Great', 'Good', 'Neutral', 'Bad', 'Terrible'],
      tasks: savedTasks ? JSON.parse(savedTasks).map(task => ({
        ...task,
        date: task.date ? new Date(task.date) : null
      })) : [],
      habits: savedHabits ? JSON.parse(savedHabits).map(habit => ({
        ...habit,
        completedDates: habit.completedDates.map(date => new Date(date))
      })) : [],
      dailyLogs: savedDailyLogs ? JSON.parse(savedDailyLogs).map(log => ({
        ...log,
        date: log.date ? new Date(log.date) : null
      })) : [],
      newLogData: {
        wakeupTime: '',
        firstInteraction: '',
        mood: 'Neutral',
        meals: '',
        physicalActivity: '',
        medications: [],
        bedTime: ''
      }
    };
  }
  
  // Save data to localStorage when state updates
  componentDidUpdate() {
    localStorage.setItem('tasks', JSON.stringify(this.state.tasks));
    localStorage.setItem('habits', JSON.stringify(this.state.habits));
    localStorage.setItem('dailyLogs', JSON.stringify(this.state.dailyLogs));
    localStorage.setItem('settings', JSON.stringify(this.state.settings));
    localStorage.setItem('medications', JSON.stringify(this.state.medications));
    localStorage.setItem('userProfile', JSON.stringify(this.state.userProfile));
    
    // Apply dark mode class to body element
    if (this.state.settings.darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }
  
  // Calendar date change handler
  handleDateChange = (date) => {
    this.setState({ selectedDate: date });
  }
  
  // Task input change handlers
  handleTaskInputChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  }
  
  // Toggle task form visibility
  toggleTaskForm = () => {
    this.setState(prevState => ({ 
      showTaskForm: !prevState.showTaskForm,
      newTaskTitle: '',
      newTaskDescription: ''
    }));
  }
  
  // Habit input change handler
  handleHabitInputChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  }
  
  // Toggle habit form visibility
  toggleHabitForm = () => {
    this.setState(prevState => ({ 
      showHabitForm: !prevState.showHabitForm,
      newHabitTitle: ''
    }));
  }
  
  // Toggle log form visibility
  toggleLogForm = () => {
    this.setState(prevState => ({ 
      showLogForm: !prevState.showLogForm,
      isEditingLog: false,
      editingLogId: null,
      newLogData: {
        wakeupTime: '',
        firstInteraction: '',
        mood: 'Neutral',
        meals: '',
        physicalActivity: '',
        medications: [],
        bedTime: ''
      }
    }));
  }
  
  // Start editing a log entry
  editDailyLog = (logId) => {
    const logToEdit = this.state.dailyLogs.find(log => log.id === logId);
    if (logToEdit) {
      this.setState({
        showLogForm: true,
        isEditingLog: true,
        editingLogId: logId,
        newLogData: {
          wakeupTime: logToEdit.wakeupTime,
          firstInteraction: logToEdit.firstInteraction,
          mood: logToEdit.mood,
          meals: logToEdit.meals,
          physicalActivity: logToEdit.physicalActivity,
          medications: logToEdit.medications,
          bedTime: logToEdit.bedTime
        }
      });
    }
  }
  
  // Log input change handler
  handleLogInputChange = (e) => {
    const { name, value } = e.target;
    this.setState(prevState => ({
      newLogData: {
        ...prevState.newLogData,
        [name]: value
      }
    }));
  }
  
  // Handle medication selection change in daily log
  handleMedicationSelectionChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    this.setState(prevState => ({
      newLogData: {
        ...prevState.newLogData,
        medications: selectedOptions
      }
    }));
  }
  
  // Add new medication
  addMedication = () => {
    if (this.state.newMedicationName.trim() === '') return;
    
    // Check for duplicates
    if (this.state.medications.includes(this.state.newMedicationName.trim())) {
      alert('This medication already exists!');
      return;
    }
    
    this.setState(prevState => ({
      medications: [...prevState.medications, this.state.newMedicationName.trim()],
      newMedicationName: ''
    }));
  }
  
  // Remove medication
  removeMedication = (medicationToRemove) => {
    this.setState(prevState => ({
      medications: prevState.medications.filter(med => med !== medicationToRemove)
    }));
    
    // Also remove this medication from any daily logs that have it
    this.setState(prevState => ({
      dailyLogs: prevState.dailyLogs.map(log => ({
        ...log,
        medications: Array.isArray(log.medications) ? 
          log.medications.filter(med => med !== medicationToRemove) : 
          log.medications
      }))
    }));
  }
  
  // Handle medication input change
  handleMedicationInputChange = (e) => {
    this.setState({ newMedicationName: e.target.value });
  }
  
  // Add or update daily log
  addDailyLog = () => {
    const { newLogData, isEditingLog, editingLogId } = this.state;
    
    // Basic validation
    if (!newLogData.wakeupTime || !newLogData.bedTime) {
      alert('Please fill in at least wake-up time and bedtime');
      return;
    }
    
    if (isEditingLog) {
      // Update existing log
      this.setState(prevState => ({
        dailyLogs: prevState.dailyLogs.map(log => 
          log.id === editingLogId ? {
            ...log,
            wakeupTime: newLogData.wakeupTime,
            firstInteraction: newLogData.firstInteraction,
            mood: newLogData.mood,
            meals: newLogData.meals,
            physicalActivity: newLogData.physicalActivity,
            medications: newLogData.medications,
            bedTime: newLogData.bedTime
          } : log
        ),
        showLogForm: false,
        isEditingLog: false,
        editingLogId: null
      }));
    } else {
      // Add new log
      const newLog = {
        id: Date.now(),
        date: this.state.selectedDate,
        wakeupTime: newLogData.wakeupTime,
        firstInteraction: newLogData.firstInteraction,
        mood: newLogData.mood,
        meals: newLogData.meals,
        physicalActivity: newLogData.physicalActivity,
        medications: newLogData.medications,
        bedTime: newLogData.bedTime
      };
      
      this.setState(prevState => ({
        dailyLogs: [...prevState.dailyLogs, newLog],
        showLogForm: false
      }));
    }
  }
  
  // Add new task
  addTask = () => {
    if (this.state.newTaskTitle.trim() === '') return;
    
    const newTask = {
      id: Date.now(),
      title: this.state.newTaskTitle,
      description: this.state.newTaskDescription || '',
      category: this.state.newTaskCategory || 'Personal',
      priority: this.state.newTaskPriority || 'Medium',
      completed: false,
      date: this.state.selectedDate
    };
    
    this.setState({
      tasks: [...this.state.tasks, newTask],
      newTaskTitle: '',
      newTaskDescription: '',
      showTaskForm: false
    });
  }
  
  // Add new habit
  addHabit = () => {
    if (this.state.newHabitTitle.trim() === '') return;
    
    const newHabit = {
      id: Date.now(),
      title: this.state.newHabitTitle,
      completedDates: []
    };
    
    this.setState({
      habits: [...this.state.habits, newHabit],
      newHabitTitle: ''
    });
  }
  
  // Toggle task completion
  toggleTask = (taskId) => {
    this.setState({
      tasks: this.state.tasks.map(task => 
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    });
  }
  
  // Toggle habit completion for a specific date
  toggleHabit = (habitId, date) => {
    const dateString = date.toISOString();
    
    this.setState({
      habits: this.state.habits.map(habit => {
        if (habit.id !== habitId) return habit;
        
        // Check if date already exists in completed dates
        const exists = habit.completedDates.some(
          d => d.toISOString() === dateString
        );
        
        // If exists, remove it; otherwise, add it
        const completedDates = exists 
          ? habit.completedDates.filter(d => d.toISOString() !== dateString)
          : [...habit.completedDates, date];
        
        return { ...habit, completedDates };
      })
    });
  }
  
  // Delete task
  deleteTask = (taskId) => {
    this.setState({
      tasks: this.state.tasks.filter(task => task.id !== taskId)
    });
  }
  
  // Delete habit
  deleteHabit = (habitId) => {
    this.setState({
      habits: this.state.habits.filter(habit => habit.id !== habitId)
    });
  }
  
  // Check if there is a daily log for the selected date
  getDailyLogForSelectedDate = () => {
    const { selectedDate, dailyLogs } = this.state;
    return dailyLogs.find(log => {
      const logDate = new Date(log.date);
      return logDate.getDate() === selectedDate.getDate() && 
             logDate.getMonth() === selectedDate.getMonth() && 
             logDate.getFullYear() === selectedDate.getFullYear();
    });
  }
  
  // Delete daily log
  deleteDailyLog = (logId) => {
    this.setState({
      dailyLogs: this.state.dailyLogs.filter(log => log.id !== logId),
      showLogForm: false,
      isEditingLog: false,
      editingLogId: null
    });
  }
  
  // Get logs for the past week
  getLastWeekLogs = () => {
    const { selectedDate, dailyLogs } = this.state;
    const currentDate = new Date(selectedDate);
    const oneWeekAgo = new Date(currentDate);
    oneWeekAgo.setDate(currentDate.getDate() - 6); // Get 7 days (including current day)
    
    // Filter logs within the past week
    return dailyLogs.filter(log => {
      const logDate = new Date(log.date);
      return logDate >= oneWeekAgo && logDate <= currentDate;
    }).sort((a, b) => new Date(a.date) - new Date(b.date)); // Sort by date
  }
  
  // Render weekly summary component
  renderWeeklySummary = () => {
    const weekLogs = this.getLastWeekLogs();
    const daysWithLogs = weekLogs.length;
    
    // Count occurrences of each mood
    const moodCounts = {};
    this.state.moodOptions.forEach(mood => moodCounts[mood] = 0);
    
    // Calculate average wake up and bed times
    let totalWakeupMinutes = 0;
    let totalBedMinutes = 0;
    let wakeupCount = 0;
    let bedCount = 0;
    
    // Process logs
    weekLogs.forEach(log => {
      // Count moods
      if (log.mood) {
        moodCounts[log.mood] = (moodCounts[log.mood] || 0) + 1;
      }
      
      // Process wake up time
      if (log.wakeupTime) {
        const [hours, minutes] = log.wakeupTime.split(':').map(Number);
        totalWakeupMinutes += (hours * 60 + minutes);
        wakeupCount++;
      }
      
      // Process bedtime
      if (log.bedTime) {
        const [hours, minutes] = log.bedTime.split(':').map(Number);
        totalBedMinutes += (hours * 60 + minutes);
        bedCount++;
      }
    });
    
    // Calculate averages
    const avgWakeupMinutes = wakeupCount > 0 ? Math.floor(totalWakeupMinutes / wakeupCount) : null;
    const avgBedMinutes = bedCount > 0 ? Math.floor(totalBedMinutes / bedCount) : null;
    
    // Format times for display
    const formatTime = (totalMinutes) => {
      if (totalMinutes === null) return 'N/A';
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    };
    
    // Find most common mood
    let mostCommonMood = 'N/A';
    let maxMoodCount = 0;
    Object.keys(moodCounts).forEach(mood => {
      if (moodCounts[mood] > maxMoodCount) {
        maxMoodCount = moodCounts[mood];
        mostCommonMood = mood;
      }
    });

    // Get dates for the past week (for display)
    const pastWeekDates = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(this.state.selectedDate);
      date.setDate(this.state.selectedDate.getDate() - i);
      pastWeekDates.push(date);
    }
    
    return (
      <div className="weekly-summary">
        <h3>Past Week Summary</h3>
        
        <div className="summary-stats">
          <div className="summary-stat">
            <span className="stat-label">Days Logged:</span>
            <span className="stat-value">{daysWithLogs} / 7</span>
          </div>
          <div className="summary-stat">
            <span className="stat-label">Avg. Wake Up:</span>
            <span className="stat-value">{formatTime(avgWakeupMinutes)}</span>
          </div>
          <div className="summary-stat">
            <span className="stat-label">Avg. Bedtime:</span>
            <span className="stat-value">{formatTime(avgBedMinutes)}</span>
          </div>
          <div className="summary-stat">
            <span className="stat-label">Most Common Mood:</span>
            <span className="stat-value">
              {mostCommonMood !== 'N/A' && 
                <span className={`mood-indicator mood-${mostCommonMood.toLowerCase()}`}></span>
              }
              {mostCommonMood}
            </span>
          </div>
        </div>
        
        <div className="weekly-mood-chart">
          <h4>Week at a Glance</h4>
          <div className="day-logs-grid">
            {pastWeekDates.map((date, index) => {
              // Find log for this date if it exists
              const dayLog = weekLogs.find(log => {
                const logDate = new Date(log.date);
                return logDate.getDate() === date.getDate() && 
                       logDate.getMonth() === date.getMonth() && 
                       logDate.getFullYear() === date.getFullYear();
              });
              
              const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
              const dayNumber = date.getDate();
              
              return (
                <div 
                  key={index} 
                  className={`day-log-item ${dayLog ? 'has-log' : 'no-log'}`}
                  onClick={() => this.handleDateChange(date)}
                >
                  <div className="day-log-date">
                    <div className="day-name">{dayName}</div>
                    <div className="day-number">{dayNumber}</div>
                  </div>
                  {dayLog ? (
                    <div className="day-log-mood">
                      <span className={`mood-indicator mood-${dayLog.mood.toLowerCase()}`}></span>
                    </div>
                  ) : (
                    <div className="day-log-mood empty">
                      <span className="no-data">No data</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  renderMainPage() {
    return (
      <div className="content-wrapper">
        <div className="calendar-container">
          <h2>Calendar</h2>
          <Calendar 
            value={this.state.selectedDate} 
            onChange={this.handleDateChange}
            tasks={this.state.tasks}
            habits={this.state.habits}
            dailyLogs={this.state.dailyLogs}
          />
        </div>
        
        <div className="tasks-container">
          <h2>Tasks</h2>
          {!this.state.showTaskForm ? (
            <button onClick={this.toggleTaskForm} className="add-new-btn">+ Add New Task</button>
          ) : (
            <div className="task-form-expanded">
              <div className="form-group">
                <input
                  type="text"
                  name="newTaskTitle"
                  placeholder="Task title"
                  value={this.state.newTaskTitle}
                  onChange={this.handleTaskInputChange}
                />
              </div>
              <div className="form-group">
                <textarea
                  name="newTaskDescription"
                  placeholder="Task description (optional)"
                  value={this.state.newTaskDescription}
                  onChange={this.handleTaskInputChange}
                ></textarea>
              </div>
              <div className="form-row">
                <div className="form-group half">
                  <select 
                    name="newTaskCategory"
                    value={this.state.newTaskCategory}
                    onChange={this.handleTaskInputChange}
                  >
                    <option value="" disabled>Select Category</option>
                    {this.state.taskCategories.map((category, index) => (
                      <option key={index} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group half">
                  <select 
                    name="newTaskPriority"
                    value={this.state.newTaskPriority}
                    onChange={this.handleTaskInputChange}
                  >
                    <option value="" disabled>Select Priority</option>
                    {this.state.taskPriorities.map((priority, index) => (
                      <option key={index} value={priority}>{priority}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-actions">
                <button onClick={this.toggleTaskForm} className="cancel-btn">Cancel</button>
                <button onClick={this.addTask} className="submit-btn">Add Task</button>
              </div>
            </div>
          )}
          <TaskList
            tasks={this.state.tasks}
            selectedDate={this.state.selectedDate}
            onTaskToggle={this.toggleTask}
            onTaskDelete={this.deleteTask}
          />
        </div>
        
        <div className="habits-container">
          <h2>Habits</h2>
          {!this.state.showHabitForm ? (
            <button onClick={this.toggleHabitForm} className="add-new-btn">+ Add New Habit</button>
          ) : (
            <div className="habit-form-expanded">
              <div className="form-group">
                <input
                  type="text"
                  name="newHabitTitle"
                  placeholder="Habit name"
                  value={this.state.newHabitTitle}
                  onChange={this.handleHabitInputChange}
                />
              </div>
              <div className="form-actions">
                <button onClick={this.toggleHabitForm} className="cancel-btn">Cancel</button>
                <button onClick={this.addHabit} className="submit-btn">Add Habit</button>
              </div>
            </div>
          )}
          <HabitTracker
            habits={this.state.habits}
            selectedDate={this.state.selectedDate}
            onHabitToggle={this.toggleHabit}
            onHabitDelete={this.deleteHabit}
          />
        </div>
      </div>
    );
  }
  
  renderDailyLogPage() {
    const selectedLog = this.getDailyLogForSelectedDate();
    
    return (
      <div className="content-wrapper">
        <div className="calendar-container">
          <h2>Calendar</h2>
          <Calendar 
            value={this.state.selectedDate} 
            onChange={this.handleDateChange}
            tasks={this.state.tasks}
            habits={this.state.habits}
            dailyLogs={this.state.dailyLogs}
          />
          {this.renderWeeklySummary()}
        </div>
        
        <div className="daily-log-container">
          <h2>Daily Log for {this.state.selectedDate.toDateString()}</h2>
          
          {selectedLog && !this.state.showLogForm ? (
            <div className="log-details">
              <div className="log-item">
                <span className="log-label">Wake Up Time:</span>
                <span className="log-value">{selectedLog.wakeupTime}</span>
              </div>
              <div className="log-item">
                <span className="log-label">First Interaction:</span>
                <span className="log-value">{selectedLog.firstInteraction}</span>
              </div>
              <div className="log-item">
                <span className="log-label">Mood:</span>
                <span className="log-value mood-value">
                  <span className={`mood-indicator mood-${selectedLog.mood.toLowerCase()}`}></span>
                  {selectedLog.mood}
                </span>
              </div>
              <div className="log-item">
                <span className="log-label">Meals:</span>
                <span className="log-value">{selectedLog.meals}</span>
              </div>
              <div className="log-item">
                <span className="log-label">Physical Activity:</span>
                <span className="log-value">{selectedLog.physicalActivity}</span>
              </div>
              <div className="log-item">
                <span className="log-label">Medications:</span>
                <span className="log-value">
                  {Array.isArray(selectedLog.medications) && selectedLog.medications.length > 0 ? 
                    selectedLog.medications.join(', ') : 
                    'None'}
                </span>
              </div>
              <div className="log-item">
                <span className="log-label">Bedtime:</span>
                <span className="log-value">{selectedLog.bedTime}</span>
              </div>
              <div className="log-actions">
                <button 
                  className="edit-log-btn" 
                  onClick={() => this.editDailyLog(selectedLog.id)}
                >
                  Edit Log
                </button>
                <button 
                  className="delete-log-btn" 
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this log?')) {
                      this.deleteDailyLog(selectedLog.id);
                    }
                  }}
                >
                  Delete Log
                </button>
              </div>
            </div>
          ) : !this.state.showLogForm ? (
            <div className="no-log-message">
              <p>No log entry for this date.</p>
              <button onClick={this.toggleLogForm} className="add-new-btn">+ Create Log Entry</button>
            </div>
          ) : null}
          
          {this.state.showLogForm && (
            <div className="log-form-expanded">
              <div className="form-row">
                <div className="form-group half">
                  <label>Wake Up Time</label>
                  <input
                    type="time"
                    name="wakeupTime"
                    value={this.state.newLogData.wakeupTime}
                    onChange={this.handleLogInputChange}
                  />
                </div>
                <div className="form-group half">
                  <label>Bedtime</label>
                  <input
                    type="time"
                    name="bedTime"
                    value={this.state.newLogData.bedTime}
                    onChange={this.handleLogInputChange}
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>First Interaction</label>
                <input
                  type="text"
                  name="firstInteraction"
                  placeholder="What was your first interaction today?"
                  value={this.state.newLogData.firstInteraction}
                  onChange={this.handleLogInputChange}
                />
              </div>
              
              <div className="form-group">
                <label>Mood</label>
                <select
                  name="mood"
                  value={this.state.newLogData.mood}
                  onChange={this.handleLogInputChange}
                >
                  {this.state.moodOptions.map((mood, index) => (
                    <option key={index} value={mood}>{mood}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>Meals</label>
                <textarea
                  name="meals"
                  placeholder="What meals did you eat today?"
                  value={this.state.newLogData.meals}
                  onChange={this.handleLogInputChange}
                ></textarea>
              </div>

              <div className="form-group">
                <label>Physical Activity</label>
                <textarea
                  name="physicalActivity"
                  placeholder="What physical activities did you do today?"
                  value={this.state.newLogData.physicalActivity}
                  onChange={this.handleLogInputChange}
                ></textarea>
              </div>

              <div className="form-group">
                <label>Medications</label>
                <select
                  name="medications"
                  multiple
                  className="medication-select"
                  value={this.state.newLogData.medications}
                  onChange={this.handleMedicationSelectionChange}
                >
                  {this.state.medications.map((med, index) => (
                    <option key={index} value={med}>{med}</option>
                  ))}
                </select>
                <small className="form-helper-text">Hold Ctrl (Cmd on Mac) to select multiple medications</small>
              </div>
              
              <div className="form-actions">
                <button onClick={this.toggleLogForm} className="cancel-btn">Cancel</button>
                <button onClick={this.addDailyLog} className="submit-btn">
                  {this.state.isEditingLog ? 'Update Log' : 'Save Log'}
                </button>
              </div>
            </div>
          )}
        </div>
        
        {this.renderWeeklySummary()}
      </div>
    );
  }
  
  // Toggle dark mode setting
  toggleDarkMode = () => {
    this.setState(prevState => ({
      settings: {
        ...prevState.settings,
        darkMode: !prevState.settings.darkMode
      }
    }));
  }
  
  // Render settings page
  renderSettingsPage() {
    return (
      <div className="content-wrapper">
        <div className="settings-container">
          <h2>Settings</h2>
          
          <div className="settings-section">
            <h3>Display</h3>
            <div className="setting-item">
              <div className="setting-label">
                <span>Dark Mode</span>
                <p className="setting-description">Enable dark color scheme for the app</p>
              </div>
              <div className="setting-control">
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={this.state.settings.darkMode} 
                    onChange={this.toggleDarkMode}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
          </div>
          
          <div className="settings-section">
            <h3>Medications</h3>
            <p className="setting-description">Manage medications to select from in daily logs</p>
            
            <div className="medications-list">
              {this.state.medications.length === 0 ? (
                <p className="empty-list-message">No medications added yet.</p>
              ) : (
                <ul className="medication-items">
                  {this.state.medications.map((medication, index) => (
                    <li key={index} className="medication-item">
                      <span>{medication}</span>
                      <button 
                        className="remove-med-btn" 
                        onClick={() => this.removeMedication(medication)}
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            
            <div className="medication-form">
              <input
                type="text"
                placeholder="Enter medication name"
                value={this.state.newMedicationName}
                onChange={this.handleMedicationInputChange}
                className="med-input"
              />
              <button 
                onClick={this.addMedication}
                className="add-med-btn"
              >
                Add Medication
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Handle user profile input changes
  handleProfileInputChange = (e) => {
    const { name, value } = e.target;
    this.setState(prevState => ({
      userProfile: {
        ...prevState.userProfile,
        [name]: value
      }
    }));
  }

  // Render user profile page
  renderProfilePage() {
    const { userProfile } = this.state;
    
    return (
      <div className="content-wrapper">
        <div className="profile-container">
          <h2>User Profile</h2>
          
          <form className="profile-form">
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={userProfile.name}
                onChange={this.handleProfileInputChange}
                placeholder="Enter your full name"
              />
            </div>
            
            <div className="form-row">
              <div className="form-group half">
                <label htmlFor="age">Age</label>
                <input
                  type="number"
                  id="age"
                  name="age"
                  min="1"
                  max="120"
                  value={userProfile.age}
                  onChange={this.handleProfileInputChange}
                  placeholder="Years"
                />
              </div>
              
              <div className="form-group half">
                <label htmlFor="gender">Gender</label>
                <select
                  id="gender"
                  name="gender"
                  value={userProfile.gender}
                  onChange={this.handleProfileInputChange}
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Non-binary">Non-binary</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group half">
                <label htmlFor="height">Height</label>
                <input
                  type="text"
                  id="height"
                  name="height"
                  value={userProfile.height}
                  onChange={this.handleProfileInputChange}
                  placeholder="cm or ft/in"
                />
              </div>
              
              <div className="form-group half">
                <label htmlFor="weight">Weight</label>
                <input
                  type="text"
                  id="weight"
                  name="weight"
                  value={userProfile.weight}
                  onChange={this.handleProfileInputChange}
                  placeholder="kg or lbs"
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="healthGoals">Health Goals</label>
              <textarea
                id="healthGoals"
                name="healthGoals"
                value={userProfile.healthGoals}
                onChange={this.handleProfileInputChange}
                placeholder="Describe your health and wellness goals"
                rows="4"
              ></textarea>
            </div>
            
            <div className="form-notification">
              <p>Your profile information is saved automatically.</p>
            </div>
          </form>
        </div>
      </div>
    );
  }

  render() {
    return (
      <div className="app-container">
        <header>
          <h1>Task & Habit Tracker</h1>
          <nav className="main-nav">
            <div className="dropdown">
              <button className="dropdown-toggle">Menu <span className="dropdown-arrow">▼</span></button>
              <div className="dropdown-menu">
                <a href="#" onClick={(e) => { e.preventDefault(); this.setState({ currentPage: 'main' }); }}>Dashboard</a>
                <a href="#" onClick={(e) => { e.preventDefault(); this.setState({ currentPage: 'dailyLog' }); }}>Daily Log</a>
                <a href="#" onClick={(e) => { e.preventDefault(); this.setState({ currentPage: 'profile' }); }}>User Profile</a>
                <a href="#" onClick={(e) => { e.preventDefault(); this.setState({ currentPage: 'settings' }); }}>Settings</a>
              </div>
            </div>
          </nav>
        </header>
        
        {this.state.currentPage === 'main' ? this.renderMainPage() : 
         this.state.currentPage === 'dailyLog' ? this.renderDailyLogPage() : 
         this.state.currentPage === 'profile' ? this.renderProfilePage() : 
         this.renderSettingsPage()}
      </div>
    );
  }
}

// Render the App
ReactDOM.render(<App />, document.getElementById('root'));
