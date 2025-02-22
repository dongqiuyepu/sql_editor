import React, { useState, useEffect } from 'react';
import { 
  Box, 
  List, 
  ListItemButton, 
  ListItemText, 
  ListItemIcon, 
  Typography, 
  Collapse,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Menu,
  MenuItem,
} from '@mui/material';
import TableIcon from '@mui/icons-material/TableChart';
import SaveIcon from '@mui/icons-material/Save';
import ScheduleIcon from '@mui/icons-material/Schedule';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import StorageIcon from '@mui/icons-material/Storage';
import SqlIcon from './SqlIcon';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5002/api';

function Sidebar({ 
  savedQueries, 
  scheduledQueries, 
  tables, 
  onQuerySelect, 
  onTableSelect,
  openQueryIds,
  activeQueryName,
  onQueryRename,
  onQueryDelete,
}) {
  const [tablesState, setTablesState] = useState([]);
  const [openTables, setOpenTables] = useState(false);
  const [openQueries, setOpenQueries] = useState(false);
  const [openScheduledQueries, setOpenScheduledQueries] = useState(false);
  const [contextMenu, setContextMenu] = useState(null);
  const [selectedQuery, setSelectedQuery] = useState(null);

  const [renameDialog, setRenameDialog] = useState({
    open: false,
    queryName: '',
    newName: '',
  });

  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    queryName: '',
  });

  useEffect(() => {
    // Fetch database tables
    const fetchTables = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/tables`);
        if (response.data.success) {
          setTablesState(response.data.tables || []);
        }
      } catch (error) {
        console.error('Error fetching tables:', error);
        setTablesState([]);
      }
    };

    fetchTables();
  }, []);

  const handleTableClick = (tableName) => {
    const query = `SELECT * FROM ${tableName} LIMIT 100;`;
    onQuerySelect(query);
  };

  const toggleSection = (section) => {
    switch (section) {
      case 'tables':
        setOpenTables(!openTables);
        break;
      case 'savedQueries':
        setOpenQueries(!openQueries);
        break;
      case 'scheduledQueries':
        setOpenScheduledQueries(!openScheduledQueries);
        break;
      default:
        break;
    }
  };

  const handleContextMenu = (event, query) => {
    event.preventDefault();
    setContextMenu(event.currentTarget);
    setSelectedQuery(query);
  };

  const handleContextMenuClose = () => {
    setContextMenu(null);
    setSelectedQuery(null);
  };

  const handleQueryOpen = () => {
    if (selectedQuery) {
      onQuerySelect(selectedQuery);
    }
  };

  const handleQueryRename = () => {
    if (selectedQuery) {
      setRenameDialog({
        open: true,
        queryName: selectedQuery.name,
        newName: selectedQuery.name,
      });
    }
  };

  const handleQueryDelete = () => {
    if (selectedQuery) {
      setDeleteDialog({
        open: true,
        queryName: selectedQuery.name,
      });
    }
  };

  const handleRenameConfirm = () => {
    if (selectedQuery && renameDialog.newName.trim()) {
      onQueryRename(selectedQuery, renameDialog.newName.trim());
      setRenameDialog({ open: false, queryName: '', newName: '' });
      setSelectedQuery(null);
      setContextMenu(null);
    }
  };

  const handleDeleteConfirm = () => {
    if (selectedQuery) {
      onQueryDelete(selectedQuery);
      setDeleteDialog({ open: false, queryName: '' });
      setSelectedQuery(null);
      setContextMenu(null);
    }
  };

  return (
    <Box sx={{
      width: 240,
      height: '100%',
      bgcolor: 'background.paper',
      borderRight: 1,
      borderColor: 'divider',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      <List
        component="nav"
        sx={{
          p: 0,
        }}
      >
        {/* Tables Section */}
        <ListItemButton 
          onClick={() => toggleSection('tables')} 
          sx={{
            py: 0.5,
            minHeight: 32,
          }}
        >
          <ListItemIcon sx={{ minWidth: 32 }}>
            <TableIcon sx={{ fontSize: 16 }} />
          </ListItemIcon>
          <ListItemText 
            primary="Tables" 
            primaryTypographyProps={{ 
              fontSize: '0.75rem',
              fontWeight: 500,
            }} 
          />
          {openTables ? <ExpandLessIcon sx={{ fontSize: 16 }} /> : <ExpandMoreIcon sx={{ fontSize: 16 }} />}
        </ListItemButton>
        <Collapse in={openTables} timeout="auto">
          <List component="div" disablePadding sx={{ py: 0 }}>
            {tablesState.map((table) => (
              <ListItemButton
                key={table}
                onClick={() => handleTableClick(table)}
                sx={{
                  pl: 4,
                  py: 0.25,
                  minHeight: 28,
                }}
              >
                <ListItemIcon sx={{ minWidth: 28 }}>
                  <TableIcon sx={{ fontSize: 14 }} />
                </ListItemIcon>
                <ListItemText 
                  primary={table}
                  primaryTypographyProps={{ 
                    fontSize: '0.7rem',
                    noWrap: true,
                  }}
                />
              </ListItemButton>
            ))}
          </List>
        </Collapse>

        {/* Saved Queries Section */}
        <ListItemButton 
          onClick={() => toggleSection('savedQueries')} 
          sx={{
            py: 0.5,
            minHeight: 32,
          }}
        >
          <ListItemIcon sx={{ minWidth: 32 }}>
            <SaveIcon sx={{ fontSize: 16 }} />
          </ListItemIcon>
          <ListItemText 
            primary="Saved Queries" 
            primaryTypographyProps={{ 
              fontSize: '0.75rem',
              fontWeight: 500,
            }} 
          />
          {openQueries ? <ExpandLessIcon sx={{ fontSize: 16 }} /> : <ExpandMoreIcon sx={{ fontSize: 16 }} />}
        </ListItemButton>
        <Collapse in={openQueries} timeout="auto">
          <List component="div" disablePadding sx={{ py: 0 }}>
            {savedQueries.map((query) => (
              <ListItemButton
                key={query.id}
                onClick={() => onQuerySelect(query)}
                onContextMenu={(e) => handleContextMenu(e, query)}
                sx={{
                  pl: 4,
                  py: 0.25,
                  minHeight: 28,
                }}
              >
                <ListItemIcon sx={{ minWidth: 28 }}>
                  <SqlIcon sx={{ fontSize: 14 }} />
                </ListItemIcon>
                <ListItemText 
                  primary={query.name}
                  primaryTypographyProps={{ 
                    fontSize: '0.7rem',
                    noWrap: true,
                  }}
                />
              </ListItemButton>
            ))}
          </List>
        </Collapse>

        {/* Scheduled Queries Section */}
        <ListItemButton 
          onClick={() => toggleSection('scheduledQueries')} 
          sx={{
            py: 0.5,
            minHeight: 32,
          }}
        >
          <ListItemIcon sx={{ minWidth: 32 }}>
            <ScheduleIcon sx={{ fontSize: 16 }} />
          </ListItemIcon>
          <ListItemText 
            primary="Scheduled Queries" 
            primaryTypographyProps={{ 
              fontSize: '0.75rem',
              fontWeight: 500,
            }} 
          />
          {openScheduledQueries ? <ExpandLessIcon sx={{ fontSize: 16 }} /> : <ExpandMoreIcon sx={{ fontSize: 16 }} />}
        </ListItemButton>
        <Collapse in={openScheduledQueries} timeout="auto">
          <List component="div" disablePadding sx={{ py: 0 }}>
            {scheduledQueries.map((query) => (
              <ListItemButton
                key={query.id}
                onClick={() => onQuerySelect(query)}
                sx={{
                  pl: 4,
                  py: 0.25,
                  minHeight: 28,
                }}
              >
                <ListItemIcon sx={{ minWidth: 28 }}>
                  <SqlIcon sx={{ fontSize: 14 }} />
                </ListItemIcon>
                <ListItemText 
                  primary={query.name}
                  primaryTypographyProps={{ 
                    fontSize: '0.7rem',
                    noWrap: true,
                  }}
                />
              </ListItemButton>
            ))}
          </List>
        </Collapse>
      </List>

      <Menu
        anchorEl={contextMenu}
        open={Boolean(contextMenu)}
        onClose={handleContextMenuClose}
      >
        <MenuItem onClick={handleQueryOpen}>Open</MenuItem>
        <MenuItem onClick={handleQueryRename}>Rename</MenuItem>
        <MenuItem onClick={handleQueryDelete}>Delete</MenuItem>
      </Menu>

      <Dialog 
        open={renameDialog.open} 
        onClose={() => setRenameDialog({ open: false, queryName: '', newName: '' })}
        PaperProps={{
          sx: {
            borderRadius: 1,
            minWidth: 400,
          }
        }}
      >
        <DialogTitle sx={{ 
          py: 1.5,
          px: 2,
          fontSize: '0.9rem',
        }}>
          Rename Query
        </DialogTitle>
        <DialogContent sx={{ p: 2 }}>
          <TextField
            autoFocus
            margin="dense"
            label="New Name"
            type="text"
            fullWidth
            value={renameDialog.newName}
            onChange={(e) => setRenameDialog(prev => ({ ...prev, newName: e.target.value }))}
            size="small"
            InputLabelProps={{
              sx: { fontSize: '0.8rem' }
            }}
            inputProps={{
              sx: { fontSize: '0.8rem' }
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 2, py: 1.5 }}>
          <Button 
            onClick={() => setRenameDialog({ open: false, queryName: '', newName: '' })}
            sx={{ 
              fontSize: '0.75rem',
              textTransform: 'none',
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleRenameConfirm}
            variant="contained"
            sx={{ 
              fontSize: '0.75rem',
              textTransform: 'none',
              bgcolor: 'black',
              '&:hover': {
                bgcolor: 'grey.900',
              },
            }}
          >
            Rename
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, queryName: '' })}
        PaperProps={{
          sx: {
            borderRadius: 1,
            minWidth: 400,
          }
        }}
      >
        <DialogTitle sx={{ 
          py: 1.5,
          px: 2,
          fontSize: '0.9rem',
        }}>
          Delete Query
        </DialogTitle>
        <DialogContent sx={{ p: 2 }}>
          <Typography sx={{ fontSize: '0.8rem' }}>
            Are you sure you want to delete "{deleteDialog.queryName}"?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 2, py: 1.5 }}>
          <Button 
            onClick={() => setDeleteDialog({ open: false, queryName: '' })}
            sx={{ 
              fontSize: '0.75rem',
              textTransform: 'none',
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm}
            variant="contained"
            sx={{ 
              fontSize: '0.75rem',
              textTransform: 'none',
              bgcolor: 'error.main',
              '&:hover': {
                bgcolor: 'error.dark',
              },
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Sidebar;
