from flask import Flask, request, jsonify, g
from flask_cors import CORS
from apscheduler.schedulers.background import BackgroundScheduler
import sqlite3
import json
from datetime import datetime
import traceback
import os

app = Flask(__name__)
CORS(app)

# Initialize scheduler
scheduler = BackgroundScheduler()
scheduler.start()

# Database configuration
DATABASE = 'queries.db'
db_path = os.path.join(os.path.dirname(__file__), DATABASE)

def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(db_path)
        db.row_factory = sqlite3.Row
    return db

@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

def init_db():
    with app.app_context():
        db = get_db()
        c = db.cursor()
        
        # Create saved_queries table if not exists
        c.execute('''CREATE TABLE IF NOT EXISTS saved_queries
                     (id INTEGER PRIMARY KEY AUTOINCREMENT,
                      name TEXT NOT NULL,
                      query TEXT NOT NULL,
                      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)''')
        
        # Create scheduled_queries table if not exists
        c.execute('''CREATE TABLE IF NOT EXISTS scheduled_queries
                     (id INTEGER PRIMARY KEY AUTOINCREMENT,
                      query TEXT NOT NULL,
                      schedule_time TIMESTAMP NOT NULL,
                      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)''')
        
        # Create customer table if not exists
        c.execute('''CREATE TABLE IF NOT EXISTS customer
                     (id INTEGER PRIMARY KEY,
                      name TEXT NOT NULL,
                      email TEXT NOT NULL)''')
        
        # Insert mock data into customer table
        c.execute('DELETE FROM customer')  # Clear existing data
        mock_data = [
            (1, 'John Pu', 'pu0917@gmail.com'),
            (2, 'Mary Jane', 'mj@gmail.com'),
            (3, 'San Ana', 'sa8391@gmail.com')
        ]
        c.executemany('INSERT INTO customer (id, name, email) VALUES (?, ?, ?)', mock_data)
        db.commit()

init_db()

@app.route('/api/execute', methods=['POST'])
def execute_query():
    try:
        data = request.get_json()
        if not data or 'query' not in data:
            return jsonify({'error': 'No query provided'}), 400
            
        query = data['query'].strip()
        if not query:
            return jsonify({'error': 'Query is empty'}), 400

        print(f"Executing query: {query}")  # Debug log
        
        # Create a test table if it doesn't exist
        db = get_db()
        c = db.cursor()
        c.execute('''CREATE TABLE IF NOT EXISTS test_data
                     (id INTEGER PRIMARY KEY AUTOINCREMENT,
                      name TEXT,
                      value INTEGER)''')
        
        # Insert some test data if the table is empty
        c.execute('SELECT COUNT(*) FROM test_data')
        if c.fetchone()[0] == 0:
            c.execute('''INSERT INTO test_data (name, value) VALUES 
                        ('Test 1', 100),
                        ('Test 2', 200),
                        ('Test 3', 300)''')
            db.commit()
        
        # Execute the query
        c.execute(query)
        
        # Get column names
        columns = [description[0] for description in c.description] if c.description else []
        
        # Fetch all rows
        rows = c.fetchall()
        
        # Convert rows to list of lists for JSON serialization
        rows = [list(row) for row in rows]
        
        return jsonify({
            'columns': columns,
            'rows': rows
        })
        
    except sqlite3.Error as e:
        print(f"Database error: {str(e)}")  # Debug log
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        print(f"Error executing query: {str(e)}")  # Debug log
        print(traceback.format_exc())  # Print full traceback
        return jsonify({'error': str(e)}), 400

@app.route('/api/save-query', methods=['POST'])
def save_query():
    data = request.json
    name = data.get('name')
    query = data.get('query')
    
    if not name or not query:
        return jsonify({
            'success': False,
            'error': 'Name and query are required'
        }), 400
    
    try:
        db = get_db()
        c = db.cursor()
        
        # Check if name already exists
        c.execute('SELECT id FROM saved_queries WHERE name = ?', (name,))
        if c.fetchone() is not None:
            return jsonify({
                'success': False,
                'error': 'A query with this name already exists'
            }), 400
        
        c.execute('INSERT INTO saved_queries (name, query) VALUES (?, ?)', (name, query))
        query_id = c.lastrowid
        db.commit()
        
        return jsonify({
            'success': True,
            'message': 'Query saved successfully',
            'queryId': query_id
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400

@app.route('/api/saved-queries', methods=['GET'])
def get_saved_queries():
    db = get_db()
    c = db.cursor()
    c.execute('SELECT id, name, query, created_at FROM saved_queries ORDER BY created_at DESC')
    queries = [{'id': row[0], 'name': row[1], 'query': row[2], 'created_at': row[3]} 
               for row in c.fetchall()]
    
    return jsonify(queries)

@app.route('/api/saved-queries/<int:query_id>', methods=['PUT'])
def update_saved_query(query_id):
    data = request.json
    query = data.get('query')
    
    if not query:
        return jsonify({
            'success': False,
            'error': 'Query content is required'
        }), 400
    
    try:
        db = get_db()
        c = db.cursor()
        
        # Check if query exists
        c.execute('SELECT id FROM saved_queries WHERE id = ?', (query_id,))
        if c.fetchone() is None:
            return jsonify({
                'success': False,
                'error': 'Query not found'
            }), 404
        
        # Update the query
        c.execute('UPDATE saved_queries SET query = ? WHERE id = ?', (query, query_id))
        db.commit()
        
        return jsonify({
            'success': True,
            'message': 'Query updated successfully'
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400

@app.route('/api/scheduled-queries', methods=['GET'])
def get_scheduled_queries():
    db = get_db()
    c = db.cursor()
    c.execute('SELECT id, query, schedule_time, created_at FROM scheduled_queries ORDER BY schedule_time DESC')
    queries = [{'id': row[0], 'query': row[1], 'schedule_time': row[2], 'created_at': row[3]} 
               for row in c.fetchall()]
    
    return jsonify(queries)

@app.route('/api/schedule', methods=['POST'])
def schedule_query():
    data = request.json
    query = data.get('query')
    schedule_time = data.get('schedule_time')
    
    if not query or not schedule_time:
        return jsonify({
            'success': False,
            'error': 'Query and schedule time are required'
        }), 400
    
    try:
        # Save to database
        db = get_db()
        c = db.cursor()
        c.execute('INSERT INTO scheduled_queries (query, schedule_time) VALUES (?, ?)',
                 (query, schedule_time))
        db.commit()
        
        # Add the job to the scheduler
        job = scheduler.add_job(
            func=execute_query,
            trigger='date',
            run_date=datetime.fromisoformat(schedule_time),
            args=[query]
        )
        
        return jsonify({
            'success': True,
            'job_id': job.id,
            'message': 'Query scheduled successfully'
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400

@app.route('/api/rename-query', methods=['POST'])
def rename_query():
    data = request.json
    old_name = data.get('oldName')
    new_name = data.get('newName')
    
    if not old_name or not new_name:
        return jsonify({
            'success': False,
            'error': 'Old name and new name are required'
        }), 400
    
    try:
        db = get_db()
        c = db.cursor()
        
        # Check if new name already exists
        c.execute('SELECT id FROM saved_queries WHERE name = ?', (new_name,))
        if c.fetchone() is not None:
            return jsonify({
                'success': False,
                'error': 'A query with this name already exists'
            }), 400
        
        # Update the query name
        c.execute('UPDATE saved_queries SET name = ? WHERE name = ?', (new_name, old_name))
        db.commit()
        
        return jsonify({
            'success': True,
            'message': 'Query renamed successfully'
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400

@app.route('/api/delete-query', methods=['POST'])
def delete_query():
    data = request.json
    name = data.get('name')
    
    if not name:
        return jsonify({
            'success': False,
            'error': 'Query name is required'
        }), 400
    
    try:
        db = get_db()
        c = db.cursor()
        
        # Delete the query
        c.execute('DELETE FROM saved_queries WHERE name = ?', (name,))
        db.commit()
        
        return jsonify({
            'success': True,
            'message': 'Query deleted successfully'
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400

@app.route('/api/tables', methods=['GET'])
def get_tables():
    try:
        db = get_db()
        c = db.cursor()
        
        # Get all table names from sqlite_master
        c.execute("""
            SELECT name 
            FROM sqlite_master 
            WHERE type='table' 
            AND name NOT LIKE 'sqlite_%'
            ORDER BY name
        """)
        
        tables = [row[0] for row in c.fetchall()]
        return jsonify({
            'success': True,
            'tables': tables
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400

if __name__ == '__main__':
    app.run(debug=True, port=5002)
