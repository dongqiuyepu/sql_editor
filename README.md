# SQL Editor Application

A web-based SQL editor with a modern interface, featuring code editing capabilities, query execution, and result visualization.

## Features

- Modern code editor interface with syntax highlighting
- Execute SQL queries and view results in a tabulated format
- Save and manage frequently used queries
- Schedule query execution for later
- Dark theme optimized for long coding sessions

## Setup

### Backend Setup

1. Create a Python virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Run the Flask backend:
```bash
python app.py
```

### Frontend Setup

1. Install Node.js dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

The application will be available at http://localhost:3000

## UI Frameworks Used

### Core Frameworks

1. **Material-UI (MUI) v5.15.10**
   - Primary UI Framework (`@mui/material`)
   - Components Used:
     - Layout: `Box`, `Paper`, `Container`
     - Navigation: `Tabs`, `Tab`
     - Forms: `TextField`, `Button`, `Select`, `MenuItem`
     - Feedback: `Alert`, `Dialog`
     - Data Display: `Typography`, `Table` components
     - Lists: `List`, `ListItem`, `ListItemIcon`, `ListItemText`
     - Icons: Various icons from `@mui/icons-material`

2. **Monaco Editor v0.44.0**
   - Code editor component (`@monaco-editor/react`)
   - SQL query editing with syntax highlighting
   - Code completion support

3. **Emotion v11.11.3**
   - CSS-in-JS solution
   - Used by Material-UI for styling
   - Packages:
     - `@emotion/react`
     - `@emotion/styled`

4. **React v18.2.0**
   - Core framework
   - Used with React DOM for rendering

### Supporting Libraries

- **date-fns** (v2.29.3)
  - Date formatting and manipulation

- **axios** (v1.6.7)
  - HTTP client for API requests

- **uuid** (v9.0.1)
  - Generating unique IDs

### Development Tools

- **react-app-rewired**
  - Customizing Create React App configuration

- **monaco-editor-webpack-plugin**
  - Webpack configuration for Monaco Editor

## Project Structure

- `/src` - React frontend code
  - `/components` - React components
    - `Editor.js` - SQL code editor component
    - `ResultPanel.js` - Query results display
    - `Sidebar.js` - Navigation and controls
  - `App.js` - Main application component
- `app.py` - Flask backend server
- `requirements.txt` - Python dependencies
- `package.json` - Node.js dependencies
