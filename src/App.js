import React, { useState, useEffect } from 'react';
import { 
  Box, 
  CssBaseline, 
  ThemeProvider, 
  createTheme, 
  Typography,
} from '@mui/material';
import Editor from '@monaco-editor/react';
import Sidebar from './components/Sidebar';
import EditorTabs from './components/EditorTabs';
import ResultPanel from './components/ResultPanel';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import Button from '@mui/material/Button';
import SaveIcon from '@mui/icons-material/Save';
import ScheduleIcon from '@mui/icons-material/Schedule';
import ErrorIcon from '@mui/icons-material/Error';
import SaveQueryDialog from './components/SaveQueryDialog';
import Alert from '@mui/material/Alert';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import Paper from '@mui/material/Paper';
import AddIcon from '@mui/icons-material/Add';
import ScheduleConfigTab from './components/ScheduleConfigTab';

// Define API base URL
const API_BASE_URL = 'http://localhost:5002/api';

const theme = createTheme({
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          margin: 0,
          padding: 0,
          height: '100vh',
          overflow: 'hidden',
        },
      },
    },
  },
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    background: {
      default: '#f8f9fa',
      paper: '#ffffff',
    },
  },
});

function App() {
  const [tabs, setTabs] = useState([]);
  const [activeTabId, setActiveTabId] = useState(null);
  const [tables, setTables] = useState([]);
  const [savedQueries, setSavedQueries] = useState([]);
  const [scheduledQueries, setScheduledQueries] = useState([]); // Initialize scheduledQueries as an array
  const [openQueryIds, setOpenQueryIds] = useState(new Set());
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    loadSavedQueries();
    fetchScheduledQueries();
    loadTables();
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        const activeTab = getActiveTab();
        if (activeTab?.savedQueryId) {
          // If it's a saved query, update it directly
          handleUpdateSavedQuery(activeTab.savedQueryId, activeTab.query);
        } else if (activeTab) {
          // If it's not saved yet, open save dialog
          setSaveDialogOpen(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [tabs, activeTabId]);

  const getActiveTab = () => {
    if (!activeTabId || !tabs.length) return null;
    return tabs.find(tab => tab.id === activeTabId) || null;
  };

  const handleUpdateSavedQuery = async (queryId, queryContent) => {
    if (!queryId || !queryContent) return;

    try {
      const response = await fetch(`${API_BASE_URL}/saved-queries/${queryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: queryContent,
        }),
      });

      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to update query');
      }

      // Refresh saved queries list
      await loadSavedQueries();
      
      // Update tab to remove unsaved status
      setTabs(prevTabs => 
        prevTabs.map(tab => 
          tab.savedQueryId === queryId 
            ? { ...tab, isUnsaved: false }
            : tab
        )
      );

      setSaveError(null);
    } catch (error) {
      console.error('Error updating query:', error);
      setSaveError(error.message);
    }
  };

  const loadSavedQueries = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/saved-queries`);
      if (!response.ok) {
        throw new Error('Failed to load saved queries');
      }
      const data = await response.json();
      setSavedQueries(data);
    } catch (error) {
      console.error('Error loading saved queries:', error);
    }
  };

  const fetchScheduledQueries = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/scheduled-queries`);
      console.log('Scheduled queries response:', response.data); // Debug log
      if (response.data.success) {
        // Ensure we're setting an array
        const queries = Array.isArray(response.data.queries) ? response.data.queries : [];
        setScheduledQueries(queries);
      } else {
        setScheduledQueries([]);
      }
    } catch (error) {
      console.error('Error fetching scheduled queries:', error);
      setScheduledQueries([]);
    }
  };

  const loadTables = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/tables`);
      setTables(response.data);
    } catch (error) {
      console.error('Failed to load tables:', error);
    }
  };

  const handleNewQuery = () => {
    const newTab = {
      id: uuidv4(),
      query: '',
      name: `Query ${tabs.length + 1}`,
      isUnsaved: true,
      isSavedQuery: false,
      savedQueryId: null
    };
    setTabs([...tabs, newTab]);
    setActiveTabId(newTab.id);
  };

  const handleQueryChange = (value) => {
    setTabs(tabs.map(tab => 
      tab.id === activeTabId ? { ...tab, query: value, isUnsaved: true } : tab
    ));
  };

  const handleTabChange = (tabId) => {
    if (tabId && tabs.find(tab => tab.id === tabId)) {
      setActiveTabId(tabId);
    }
  };

  const handleTabClose = (tabId) => {
    // If we're closing the active tab, update activeTabId first
    if (tabId === activeTabId) {
      const remainingTabs = tabs.filter(tab => tab.id !== tabId);
      if (remainingTabs.length === 0) {
        setActiveTabId(null);
      } else {
        const currentIndex = tabs.findIndex(tab => tab.id === tabId);
        const nextIndex = Math.max(0, currentIndex - 1);
        setActiveTabId(remainingTabs[nextIndex].id);
      }
    }
    
    // Then update the tabs
    setTabs(prevTabs => prevTabs.filter(tab => tab.id !== tabId));
  };

  const handleQuerySelect = (query, queryName) => {
    if (openQueryIds.has(queryName)) {
      // If query is already open, switch to its tab
      const existingTab = tabs.find(tab => tab.savedQueryId === queryName);
      if (existingTab) {
        setActiveTabId(existingTab.id);
      }
      return;
    }

    // Create new tab for the query
    const newTab = {
      id: uuidv4(),
      query,
      name: queryName,
      savedQueryId: queryName,
      isUnsaved: false,
      isSavedQuery: true
    };
    setTabs([...tabs, newTab]);
    setActiveTabId(newTab.id);
    setOpenQueryIds(new Set([...openQueryIds, queryName]));
  };

  const handleTableSelect = (tableName) => {
    const newTab = {
      id: uuidv4(),
      query: `SELECT * FROM ${tableName};`,
      name: `${tableName} Query`,
      isUnsaved: true,
      isSavedQuery: false,
      savedQueryId: null
    };
    setTabs([...tabs, newTab]);
    setActiveTabId(newTab.id);
  };

  const executeQuery = async () => {
    const activeTab = getActiveTab();
    if (!activeTab) return;

    try {
      const response = await axios.post(`${API_BASE_URL}/execute`, {
        query: activeTab.query
      });
      setResults(response.data);
    } catch (error) {
      console.error('Query execution error:', error);
      setError(error.response?.data?.error || 'Failed to execute query');
      setResults(null);
    }
  };

  const handleSaveQuery = () => {
    const activeTab = getActiveTab();
    if (!activeTab) return;

    if (activeTab.savedQueryId) {
      // If it's already a saved query, update it directly
      handleUpdateSavedQuery(activeTab.savedQueryId, activeTab.query);
    } else {
      // If it's a new query, open dialog for naming
      setSaveDialogOpen(true);
    }
  };

  const handleSaveQuerySubmit = async (name) => {
    const activeTab = getActiveTab();
    if (!activeTab) return;

    try {
      const response = await fetch(`${API_BASE_URL}/save-query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          query: activeTab.query,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to save query');
      }

      // Get the newly created query's ID from the response
      const savedQueryId = data.queryId;

      if (!savedQueryId) {
        throw new Error('Server did not return query ID');
      }

      // Update tabs to mark this as a saved query
      setTabs(prevTabs =>
        prevTabs.map(tab =>
          tab.id === activeTab.id
            ? {
                ...tab,
                name,
                isUnsaved: false,
                isSavedQuery: true,
                savedQueryId: savedQueryId
              }
            : tab
        )
      );

      // Refresh saved queries list
      await loadSavedQueries();
      setSaveDialogOpen(false);
      setSaveError(null);
    } catch (error) {
      console.error('Error saving query:', error);
      setSaveError(error.message);
    }
  };

  const handleScheduleQuery = () => {
    const activeTab = getActiveTab();
    if (!activeTab) return;

    // Create a new schedule configuration tab
    const newTab = {
      id: uuidv4(),
      name: 'Schedule Query',
      type: 'schedule',
      query: activeTab.query,
    };

    setTabs([...tabs, newTab]);
    setActiveTabId(newTab.id);
  };

  const handleScheduleSubmit = async (config) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/schedule-query`, config);
      
      if (response.data.success) {
        // Close the schedule tab
        const newTabs = tabs.filter(tab => tab.id !== activeTabId);
        setTabs(newTabs);
        setActiveTabId(newTabs[0]?.id || null);
        
        // Refresh the scheduled queries list
        await fetchScheduledQueries();
        
        // Show success message
        alert('Query scheduled successfully!');
      }
    } catch (error) {
      console.error('Error scheduling query:', error);
      alert(error.response?.data?.error || 'Error scheduling query');
    }
  };

  const handleQueryRename = async (query, newName) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/rename-query`, {
        oldName: query.name,
        newName: newName
      });

      if (response.data.success) {
        // Update the tab name if the query is open
        setTabs(prevTabs => prevTabs.map(tab => {
          if (tab.savedQueryId === query.name) {
            return { ...tab, name: newName, savedQueryId: newName };
          }
          return tab;
        }));

        // Refresh queries after rename
        await loadSavedQueries();
      } else {
        throw new Error(response.data.error || 'Failed to rename query');
      }
    } catch (error) {
      setError(error.response?.data?.error || error.message || 'Failed to rename query');
    }
  };

  const handleQueryDelete = async (query) => {
    try {
      await axios.post(`${API_BASE_URL}/delete-query`, {
        name: query.name,
      });

      // Close the tab if the query is open
      setTabs(prevTabs => {
        const newTabs = prevTabs.filter(tab => tab.savedQueryId !== query.name);
        
        // If we removed the active tab, switch to another tab
        if (activeTabId && !newTabs.find(tab => tab.id === activeTabId)) {
          const lastTab = newTabs[newTabs.length - 1];
          setActiveTabId(lastTab ? lastTab.id : null);
        }
        
        return newTabs;
      });

      // Remove from openQueryIds
      const newOpenQueryIds = new Set(openQueryIds);
      newOpenQueryIds.delete(query.name);
      setOpenQueryIds(newOpenQueryIds);

      // Refresh saved queries after delete
      await loadSavedQueries();
    } catch (error) {
      setError('Failed to delete query');
    }
  };

  const handleSavedQuerySelect = (query) => {
    // Check if the query is already open
    const existingTab = tabs.find(tab => tab.savedQueryId === query.name);
    if (existingTab) {
      setActiveTabId(existingTab.id);
      return;
    }

    // Create a new tab for the query
    const newTab = {
      id: uuidv4(),
      name: query.name,
      query: query.query,
      savedQueryId: query.name,
      isUnsaved: false,
      isSavedQuery: true
    };

    setTabs([...tabs, newTab]);
    setActiveTabId(newTab.id);
  };

  const handleTabNameChange = (tabId, newName) => {
    setTabs(prevTabs => prevTabs.map(tab => {
      if (tab.id === tabId) {
        // Only mark as unsaved if it's not a saved query
        return { 
          ...tab, 
          name: newName,
          isUnsaved: !tab.isSavedQuery 
        };
      }
      return tab;
    }));
  };

  const handleTabQueryChange = (tabId, value) => {
    if (!tabId) return;
    
    setTabs(prevTabs =>
      prevTabs.map(tab =>
        tab.id === tabId
          ? { 
              ...tab, 
              query: value, 
              isUnsaved: tab.query !== value 
            }
          : tab
      )
    );
  };

  const handleScheduleTab = (query) => {
    // Create a new tab for scheduling
    const newTab = {
      id: uuidv4(),
      type: 'schedule',
      query,
    };
    
    setTabs([...tabs, newTab]);
    setActiveTabId(newTab.id);
  };

  const renderTabContent = (tab) => {
    switch (tab.type) {
      case 'schedule':
        return (
          <ScheduleConfigTab
            query={tab.query}
            onSchedule={handleScheduleSubmit}
            onChange={(newQuery) => handleTabQueryChange(tab.id, newQuery)}
          />
        );
      default:
        return (
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Editor Panel */}
            <Box sx={{ 
              flex: 1,
              minHeight: 0,
              position: 'relative',
              borderBottom: 1,
              borderColor: 'divider',
            }}>
              <Editor
                value={tab.query}
                onChange={(value) => handleTabQueryChange(tab.id, value)}
                height="100%"
                defaultLanguage="sql"
                options={{
                  minimap: { enabled: false },
                  fontSize: 13,
                  wordWrap: 'on',
                }}
              />
              
              {/* Action Buttons */}
              <Box sx={{ 
                position: 'absolute',
                bottom: 8,
                right: 24,
                display: 'flex',
                gap: 0.5,
                alignItems: 'center',
                zIndex: 1,
              }}>
                <Button
                  variant="contained"
                  onClick={executeQuery}
                  size="small"
                  sx={{ 
                    minWidth: 0,
                    px: 1,
                    py: 0.5,
                    fontSize: '0.7rem',
                    textTransform: 'none',
                    lineHeight: 1.2,
                    bgcolor: 'black',
                    '&:hover': {
                      bgcolor: 'grey.900',
                    },
                  }}
                >
                  Run
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => setSaveDialogOpen(true)}
                  size="small"
                  sx={{ 
                    minWidth: 0,
                    px: 1,
                    py: 0.5,
                    fontSize: '0.7rem',
                    textTransform: 'none',
                    lineHeight: 1.2,
                    bgcolor: 'grey.200',
                    border: 'none',
                    color: 'text.primary',
                    '&:hover': {
                      bgcolor: 'grey.300',
                      border: 'none',
                    },
                  }}
                >
                  Save
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => handleScheduleTab(tab.query)}
                  size="small"
                  sx={{ 
                    minWidth: 0,
                    px: 1,
                    py: 0.5,
                    fontSize: '0.7rem',
                    textTransform: 'none',
                    lineHeight: 1.2,
                    bgcolor: 'grey.200',
                    border: 'none',
                    color: 'text.primary',
                    '&:hover': {
                      bgcolor: 'grey.300',
                      border: 'none',
                    },
                  }}
                >
                  Schedule
                </Button>
              </Box>
            </Box>

            {/* Results Panel */}
            <Box sx={{ 
              height: '40%',
              minHeight: 0,
              bgcolor: 'background.paper',
              overflow: 'auto',
            }}>
              <ResultPanel results={results} error={error} />
            </Box>
          </Box>
        );
    }
  };

  useEffect(() => {
    if (tabs.length === 0) {
      const initialTab = {
        id: `tab${Date.now()}`,
        name: '',
        query: '',
        isUnsaved: false,
      };
      setTabs([initialTab]);
      setActiveTabId(initialTab.id);
    }
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ 
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden',
      }}>
        {/* Header Bar */}
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: 48,
          bgcolor: (theme) => 
            theme.palette.mode === 'light' ? 'grey.50' : 'grey.900',
        }}>
          <Typography
            variant="h6"
            sx={{
              fontSize: '1rem',
              fontWeight: 600,
              letterSpacing: '0.05em',
              color: 'text.primary',
            }}
          >
            QUERY STUDIO
          </Typography>
        </Box>

        {/* Content Container */}
        <Box sx={{ 
          display: 'flex',
          flex: 1,
          minHeight: 0,
        }}>
          {/* Sidebar */}
          <Sidebar
            savedQueries={savedQueries}
            scheduledQueries={scheduledQueries} // Pass scheduledQueries to Sidebar
            onQuerySelect={handleSavedQuerySelect}
            onQueryRename={handleQueryRename}
            onQueryDelete={handleQueryDelete}
          />

          {/* Main Content */}
          <Box sx={{ 
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            minWidth: 0,
          }}>
            <EditorTabs
              tabs={tabs}
              activeTabId={activeTabId}
              onTabChange={handleTabChange}
              onTabClose={handleTabClose}
              onNewQuery={handleNewQuery}
              onTabNameChange={handleTabNameChange}
            />
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              {getActiveTab() && renderTabContent(getActiveTab())}
            </Box>
          </Box>
        </Box>
      </Box>
      <SaveQueryDialog
        open={saveDialogOpen}
        onClose={() => {
          setSaveDialogOpen(false);
          setSaveError(null);
        }}
        onSave={handleSaveQuerySubmit}
        initialName={getActiveTab()?.name || ''}
        error={saveError}
      />
      {error && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            bgcolor: 'error.main',
            color: 'error.contrastText',
            p: 2,
            borderRadius: 1,
            boxShadow: 2,
            maxWidth: '80%',
            zIndex: 1500,
          }}
        >
          <Typography variant="body2">{error}</Typography>
        </Box>
      )}
      {success && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            bgcolor: 'success.main',
            color: 'success.contrastText',
            p: 2,
            borderRadius: 1,
            boxShadow: 2,
            maxWidth: '80%',
            zIndex: 1500,
          }}
        >
          <Typography variant="body2">{success}</Typography>
        </Box>
      )}
    </ThemeProvider>
  );
}

export default App;
