from flask import Flask, request, jsonify, session
from flask_cors import CORS
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash
import sqlite3
import os
import json
from datetime import datetime

# Create the application
app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', 'development-key-change-in-production')
CORS(app, supports_credentials=True)

# Initialize login manager
login_manager = LoginManager()
login_manager.init_app(app)

# Database setup
DB_PATH = os.path.join(os.path.dirname(__file__), 'habit_tracker.db')

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Create Users table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')
    
    # Create UserProfile table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS user_profiles (
        user_id INTEGER PRIMARY KEY,
        name TEXT,
        age INTEGER,
        gender TEXT,
        height TEXT,
        weight TEXT,
        health_goals TEXT,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )
    ''')
    
    # Create Tasks table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        due_date TEXT,
        priority TEXT,
        status TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )
    ''')
    
    # Create Habits table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS habits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        frequency TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )
    ''')
    
    # Create DailyLogs table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS daily_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        date TEXT NOT NULL,
        wake_time TEXT,
        sleep_time TEXT,
        mood TEXT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id),
        UNIQUE (user_id, date)
    )
    ''')
    
    # Create HabitCompletions table to track habit streaks
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS habit_completions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        habit_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        date TEXT NOT NULL,
        completed BOOLEAN NOT NULL DEFAULT 0,
        FOREIGN KEY (habit_id) REFERENCES habits (id),
        FOREIGN KEY (user_id) REFERENCES users (id),
        UNIQUE (habit_id, date)
    )
    ''')

    conn.commit()
    conn.close()
    
# Initialize database
init_db()

# User class for flask-login
class User:
    def __init__(self, id, username, email):
        self.id = id
        self.username = username
        self.email = email
        self.is_authenticated = True
        self.is_active = True
        self.is_anonymous = False
    
    def get_id(self):
        return str(self.id)

@login_manager.user_loader
def load_user(user_id):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    user_data = cursor.fetchone()
    conn.close()
    
    if user_data:
        return User(user_data['id'], user_data['username'], user_data['email'])
    return None

# Routes
@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    
    # Extract user data
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    
    if not username or not email or not password:
        return jsonify({"error": "All fields are required"}), 400
    
    # Hash the password
    hashed_password = generate_password_hash(password, method='sha256')
    
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Check if username or email already exists
        cursor.execute("SELECT * FROM users WHERE username = ? OR email = ?", (username, email))
        existing_user = cursor.fetchone()
        
        if existing_user:
            conn.close()
            return jsonify({"error": "Username or email already exists"}), 409
        
        # Insert new user
        cursor.execute(
            "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)",
            (username, email, hashed_password)
        )
        
        user_id = cursor.lastrowid
        conn.commit()
        
        # Initialize empty user profile
        cursor.execute(
            "INSERT INTO user_profiles (user_id) VALUES (?)",
            (user_id,)
        )
        conn.commit()
        conn.close()
        
        return jsonify({"message": "User registered successfully"}), 201
    
    except sqlite3.Error as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    
    username = data.get('username')
    password = data.get('password')
    
    if not username or not password:
        return jsonify({"error": "Username and password are required"}), 400
    
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM users WHERE username = ?", (username,))
        user_data = cursor.fetchone()
        conn.close()
        
        if not user_data or not check_password_hash(user_data['password_hash'], password):
            return jsonify({"error": "Invalid username or password"}), 401
        
        user = User(user_data['id'], user_data['username'], user_data['email'])
        login_user(user)
        
        return jsonify({
            "message": "Login successful",
            "user": {
                "id": user_data['id'],
                "username": user_data['username'],
                "email": user_data['email']
            }
        }), 200
    
    except sqlite3.Error as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/logout', methods=['POST'])
def logout():
    logout_user()
    return jsonify({"message": "Logout successful"}), 200

@app.route('/api/user/profile', methods=['GET', 'PUT'])
@login_required
def user_profile():
    user_id = current_user.id
    
    if request.method == 'GET':
        try:
            conn = sqlite3.connect(DB_PATH)
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            
            cursor.execute("SELECT * FROM user_profiles WHERE user_id = ?", (user_id,))
            profile = cursor.fetchone()
            conn.close()
            
            if not profile:
                return jsonify({"error": "Profile not found"}), 404
            
            return jsonify({
                "name": profile['name'],
                "age": profile['age'],
                "gender": profile['gender'],
                "height": profile['height'],
                "weight": profile['weight'],
                "health_goals": profile['health_goals']
            }), 200
            
        except sqlite3.Error as e:
            return jsonify({"error": str(e)}), 500
    
    elif request.method == 'PUT':
        data = request.get_json()
        
        try:
            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()
            
            cursor.execute(
                """
                UPDATE user_profiles
                SET name = ?, age = ?, gender = ?, height = ?, weight = ?, health_goals = ?
                WHERE user_id = ?
                """,
                (
                    data.get('name'),
                    data.get('age'),
                    data.get('gender'),
                    data.get('height'),
                    data.get('weight'),
                    data.get('health_goals'),
                    user_id
                )
            )
            
            conn.commit()
            conn.close()
            
            return jsonify({"message": "Profile updated successfully"}), 200
            
        except sqlite3.Error as e:
            return jsonify({"error": str(e)}), 500

@app.route('/api/tasks', methods=['GET', 'POST'])
@login_required
def tasks():
    user_id = current_user.id
    
    if request.method == 'GET':
        try:
            conn = sqlite3.connect(DB_PATH)
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            
            cursor.execute("SELECT * FROM tasks WHERE user_id = ? ORDER BY due_date", (user_id,))
            tasks_data = cursor.fetchall()
            conn.close()
            
            tasks_list = []
            for task in tasks_data:
                tasks_list.append({
                    "id": task['id'],
                    "title": task['title'],
                    "description": task['description'],
                    "due_date": task['due_date'],
                    "priority": task['priority'],
                    "status": task['status']
                })
            
            return jsonify(tasks_list), 200
            
        except sqlite3.Error as e:
            return jsonify({"error": str(e)}), 500
    
    elif request.method == 'POST':
        data = request.get_json()
        
        try:
            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()
            
            cursor.execute(
                """
                INSERT INTO tasks (user_id, title, description, due_date, priority, status)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (
                    user_id,
                    data.get('title'),
                    data.get('description'),
                    data.get('due_date'),
                    data.get('priority'),
                    data.get('status', 'pending')
                )
            )
            
            task_id = cursor.lastrowid
            conn.commit()
            conn.close()
            
            return jsonify({
                "id": task_id,
                "message": "Task created successfully"
            }), 201
            
        except sqlite3.Error as e:
            return jsonify({"error": str(e)}), 500

@app.route('/api/tasks/<int:task_id>', methods=['GET', 'PUT', 'DELETE'])
@login_required
def task(task_id):
    user_id = current_user.id
    
    if request.method == 'GET':
        try:
            conn = sqlite3.connect(DB_PATH)
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            
            cursor.execute("SELECT * FROM tasks WHERE id = ? AND user_id = ?", (task_id, user_id))
            task = cursor.fetchone()
            conn.close()
            
            if not task:
                return jsonify({"error": "Task not found"}), 404
            
            return jsonify({
                "id": task['id'],
                "title": task['title'],
                "description": task['description'],
                "due_date": task['due_date'],
                "priority": task['priority'],
                "status": task['status']
            }), 200
            
        except sqlite3.Error as e:
            return jsonify({"error": str(e)}), 500
    
    elif request.method == 'PUT':
        data = request.get_json()
        
        try:
            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()
            
            cursor.execute(
                """
                UPDATE tasks
                SET title = ?, description = ?, due_date = ?, priority = ?, status = ?
                WHERE id = ? AND user_id = ?
                """,
                (
                    data.get('title'),
                    data.get('description'),
                    data.get('due_date'),
                    data.get('priority'),
                    data.get('status'),
                    task_id,
                    user_id
                )
            )
            
            if cursor.rowcount == 0:
                conn.close()
                return jsonify({"error": "Task not found or you don't have permission"}), 404
            
            conn.commit()
            conn.close()
            
            return jsonify({"message": "Task updated successfully"}), 200
            
        except sqlite3.Error as e:
            return jsonify({"error": str(e)}), 500
    
    elif request.method == 'DELETE':
        try:
            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()
            
            cursor.execute("DELETE FROM tasks WHERE id = ? AND user_id = ?", (task_id, user_id))
            
            if cursor.rowcount == 0:
                conn.close()
                return jsonify({"error": "Task not found or you don't have permission"}), 404
            
            conn.commit()
            conn.close()
            
            return jsonify({"message": "Task deleted successfully"}), 200
            
        except sqlite3.Error as e:
            return jsonify({"error": str(e)}), 500

@app.route('/api/habits', methods=['GET', 'POST'])
@login_required
def habits():
    user_id = current_user.id
    
    if request.method == 'GET':
        try:
            conn = sqlite3.connect(DB_PATH)
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            
            cursor.execute("SELECT * FROM habits WHERE user_id = ?", (user_id,))
            habits_data = cursor.fetchall()
            
            habits_list = []
            for habit in habits_data:
                habit_id = habit['id']
                
                # Get recent completions
                cursor.execute(
                    "SELECT date, completed FROM habit_completions WHERE habit_id = ? ORDER BY date DESC LIMIT 30",
                    (habit_id,)
                )
                completions = cursor.fetchall()
                
                completions_dict = {}
                for completion in completions:
                    completions_dict[completion['date']] = bool(completion['completed'])
                
                habits_list.append({
                    "id": habit_id,
                    "title": habit['title'],
                    "description": habit['description'],
                    "frequency": habit['frequency'],
                    "completions": completions_dict
                })
            
            conn.close()
            return jsonify(habits_list), 200
            
        except sqlite3.Error as e:
            return jsonify({"error": str(e)}), 500
    
    elif request.method == 'POST':
        data = request.get_json()
        
        try:
            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()
            
            cursor.execute(
                """
                INSERT INTO habits (user_id, title, description, frequency)
                VALUES (?, ?, ?, ?)
                """,
                (
                    user_id,
                    data.get('title'),
                    data.get('description'),
                    data.get('frequency')
                )
            )
            
            habit_id = cursor.lastrowid
            conn.commit()
            conn.close()
            
            return jsonify({
                "id": habit_id,
                "message": "Habit created successfully"
            }), 201
            
        except sqlite3.Error as e:
            return jsonify({"error": str(e)}), 500

@app.route('/api/habits/<int:habit_id>/completion', methods=['POST'])
@login_required
def habit_completion(habit_id):
    user_id = current_user.id
    data = request.get_json()
    
    date = data.get('date')
    completed = data.get('completed', False)
    
    if not date:
        return jsonify({"error": "Date is required"}), 400
    
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # First check if the habit belongs to the user
        cursor.execute("SELECT * FROM habits WHERE id = ? AND user_id = ?", (habit_id, user_id))
        habit = cursor.fetchone()
        
        if not habit:
            conn.close()
            return jsonify({"error": "Habit not found or you don't have permission"}), 404
        
        # Then check if a completion record exists for this date
        cursor.execute(
            "SELECT * FROM habit_completions WHERE habit_id = ? AND date = ?",
            (habit_id, date)
        )
        existing = cursor.fetchone()
        
        if existing:
            # Update existing record
            cursor.execute(
                "UPDATE habit_completions SET completed = ? WHERE habit_id = ? AND date = ?",
                (1 if completed else 0, habit_id, date)
            )
        else:
            # Create new record
            cursor.execute(
                "INSERT INTO habit_completions (habit_id, user_id, date, completed) VALUES (?, ?, ?, ?)",
                (habit_id, user_id, date, 1 if completed else 0)
            )
        
        conn.commit()
        conn.close()
        
        return jsonify({"message": "Habit completion updated"}), 200
        
    except sqlite3.Error as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/logs', methods=['GET', 'POST'])
@login_required
def logs():
    user_id = current_user.id
    
    if request.method == 'GET':
        date_param = request.args.get('date')
        
        try:
            conn = sqlite3.connect(DB_PATH)
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            
            if date_param:
                # Get log for a specific date
                cursor.execute(
                    "SELECT * FROM daily_logs WHERE user_id = ? AND date = ?",
                    (user_id, date_param)
                )
                log = cursor.fetchone()
                
                if not log:
                    conn.close()
                    return jsonify({}), 200
                
                result = {
                    "id": log['id'],
                    "date": log['date'],
                    "wake_time": log['wake_time'],
                    "sleep_time": log['sleep_time'],
                    "mood": log['mood'],
                    "notes": log['notes']
                }
                conn.close()
                return jsonify(result), 200
            else:
                # Get all logs
                cursor.execute(
                    "SELECT * FROM daily_logs WHERE user_id = ? ORDER BY date DESC",
                    (user_id,)
                )
                logs_data = cursor.fetchall()
                
                logs_list = []
                for log in logs_data:
                    logs_list.append({
                        "id": log['id'],
                        "date": log['date'],
                        "wake_time": log['wake_time'],
                        "sleep_time": log['sleep_time'],
                        "mood": log['mood'],
                        "notes": log['notes']
                    })
                
                conn.close()
                return jsonify(logs_list), 200
            
        except sqlite3.Error as e:
            return jsonify({"error": str(e)}), 500
    
    elif request.method == 'POST':
        data = request.get_json()
        
        try:
            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()
            
            # Check if log already exists for this date
            cursor.execute(
                "SELECT id FROM daily_logs WHERE user_id = ? AND date = ?",
                (user_id, data.get('date'))
            )
            existing = cursor.fetchone()
            
            if existing:
                # Update existing log
                cursor.execute(
                    """
                    UPDATE daily_logs
                    SET wake_time = ?, sleep_time = ?, mood = ?, notes = ?
                    WHERE user_id = ? AND date = ?
                    """,
                    (
                        data.get('wake_time'),
                        data.get('sleep_time'),
                        data.get('mood'),
                        data.get('notes'),
                        user_id,
                        data.get('date')
                    )
                )
            else:
                # Create new log
                cursor.execute(
                    """
                    INSERT INTO daily_logs (user_id, date, wake_time, sleep_time, mood, notes)
                    VALUES (?, ?, ?, ?, ?, ?)
                    """,
                    (
                        user_id,
                        data.get('date'),
                        data.get('wake_time'),
                        data.get('sleep_time'),
                        data.get('mood'),
                        data.get('notes')
                    )
                )
            
            conn.commit()
            conn.close()
            
            return jsonify({"message": "Log saved successfully"}), 200
            
        except sqlite3.Error as e:
            return jsonify({"error": str(e)}), 500

@app.route('/api/sync', methods=['POST'])
@login_required
def sync_data():
    """
    Handle data synchronization between devices
    Clients send their local data and server merges it with the database
    """
    user_id = current_user.id
    data = request.get_json()
    
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        # Process tasks
        if 'tasks' in data:
            for task in data['tasks']:
                if 'id' in task and task['id'] > 0:
                    # Update existing task if it belongs to this user
                    cursor.execute(
                        "SELECT id FROM tasks WHERE id = ? AND user_id = ?", 
                        (task['id'], user_id)
                    )
                    if cursor.fetchone():
                        cursor.execute(
                            """
                            UPDATE tasks
                            SET title = ?, description = ?, due_date = ?, priority = ?, status = ?
                            WHERE id = ? AND user_id = ?
                            """,
                            (
                                task.get('title'),
                                task.get('description'),
                                task.get('due_date'),
                                task.get('priority'),
                                task.get('status'),
                                task['id'],
                                user_id
                            )
                        )
                else:
                    # New task
                    cursor.execute(
                        """
                        INSERT INTO tasks (user_id, title, description, due_date, priority, status)
                        VALUES (?, ?, ?, ?, ?, ?)
                        """,
                        (
                            user_id,
                            task.get('title'),
                            task.get('description'),
                            task.get('due_date'),
                            task.get('priority'),
                            task.get('status', 'pending')
                        )
                    )
        
        # Process habits
        if 'habits' in data:
            for habit in data['habits']:
                if 'id' in habit and habit['id'] > 0:
                    # Update existing habit if it belongs to this user
                    cursor.execute(
                        "SELECT id FROM habits WHERE id = ? AND user_id = ?", 
                        (habit['id'], user_id)
                    )
                    if cursor.fetchone():
                        cursor.execute(
                            """
                            UPDATE habits
                            SET title = ?, description = ?, frequency = ?
                            WHERE id = ? AND user_id = ?
                            """,
                            (
                                habit.get('title'),
                                habit.get('description'),
                                habit.get('frequency'),
                                habit['id'],
                                user_id
                            )
                        )
                        
                        # Process habit completions
                        if 'completions' in habit:
                            for date, completed in habit['completions'].items():
                                cursor.execute(
                                    """
                                    INSERT OR REPLACE INTO habit_completions 
                                    (habit_id, user_id, date, completed) 
                                    VALUES (?, ?, ?, ?)
                                    """,
                                    (
                                        habit['id'],
                                        user_id,
                                        date,
                                        1 if completed else 0
                                    )
                                )
                else:
                    # New habit
                    cursor.execute(
                        """
                        INSERT INTO habits (user_id, title, description, frequency)
                        VALUES (?, ?, ?, ?)
                        """,
                        (
                            user_id,
                            habit.get('title'),
                            habit.get('description'),
                            habit.get('frequency')
                        )
                    )
                    
                    habit_id = cursor.lastrowid
                    
                    # Process habit completions for new habit
                    if 'completions' in habit:
                        for date, completed in habit['completions'].items():
                            cursor.execute(
                                """
                                INSERT INTO habit_completions 
                                (habit_id, user_id, date, completed) 
                                VALUES (?, ?, ?, ?)
                                """,
                                (
                                    habit_id,
                                    user_id,
                                    date,
                                    1 if completed else 0
                                )
                            )
        
        # Process logs
        if 'logs' in data:
            for log in data['logs']:
                cursor.execute(
                    """
                    INSERT OR REPLACE INTO daily_logs 
                    (user_id, date, wake_time, sleep_time, mood, notes)
                    VALUES (?, ?, ?, ?, ?, ?)
                    """,
                    (
                        user_id,
                        log.get('date'),
                        log.get('wake_time'),
                        log.get('sleep_time'),
                        log.get('mood'),
                        log.get('notes')
                    )
                )
                
        # Process user profile
        if 'userProfile' in data:
            profile = data['userProfile']
            cursor.execute(
                """
                UPDATE user_profiles
                SET name = ?, age = ?, gender = ?, height = ?, weight = ?, health_goals = ?
                WHERE user_id = ?
                """,
                (
                    profile.get('name'),
                    profile.get('age'),
                    profile.get('gender'),
                    profile.get('height'),
                    profile.get('weight'),
                    profile.get('health_goals'),
                    user_id
                )
            )
        
        conn.commit()
        
        # Get all data for this user
        response_data = {
            "tasks": [],
            "habits": [],
            "logs": [],
            "userProfile": {}
        }
        
        # Get tasks
        cursor.execute("SELECT * FROM tasks WHERE user_id = ?", (user_id,))
        tasks = cursor.fetchall()
        for task in tasks:
            response_data["tasks"].append({
                "id": task['id'],
                "title": task['title'],
                "description": task['description'],
                "due_date": task['due_date'],
                "priority": task['priority'],
                "status": task['status']
            })
        
        # Get habits and completions
        cursor.execute("SELECT * FROM habits WHERE user_id = ?", (user_id,))
        habits = cursor.fetchall()
        
        for habit in habits:
            habit_id = habit['id']
            
            # Get completions
            cursor.execute(
                "SELECT date, completed FROM habit_completions WHERE habit_id = ?",
                (habit_id,)
            )
            completions = cursor.fetchall()
            
            completions_dict = {}
            for completion in completions:
                completions_dict[completion['date']] = bool(completion['completed'])
            
            response_data["habits"].append({
                "id": habit_id,
                "title": habit['title'],
                "description": habit['description'],
                "frequency": habit['frequency'],
                "completions": completions_dict
            })
        
        # Get logs
        cursor.execute("SELECT * FROM daily_logs WHERE user_id = ?", (user_id,))
        logs = cursor.fetchall()
        
        for log in logs:
            response_data["logs"].append({
                "date": log['date'],
                "wake_time": log['wake_time'],
                "sleep_time": log['sleep_time'],
                "mood": log['mood'],
                "notes": log['notes']
            })
        
        # Get user profile
        cursor.execute("SELECT * FROM user_profiles WHERE user_id = ?", (user_id,))
        profile = cursor.fetchone()
        
        if profile:
            response_data["userProfile"] = {
                "name": profile['name'],
                "age": profile['age'],
                "gender": profile['gender'],
                "height": profile['height'],
                "weight": profile['weight'],
                "health_goals": profile['health_goals']
            }
        
        conn.close()
        
        return jsonify({
            "message": "Sync successful",
            "data": response_data
        }), 200
        
    except sqlite3.Error as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
