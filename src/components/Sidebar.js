import React from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Typography,
  IconButton,
  Tooltip,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ScheduleIcon from '@mui/icons-material/Schedule';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ErrorIcon from '@mui/icons-material/Error';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';

const Sidebar = ({ 
  savedQueries = [], 
  scheduledQueries = [], 
  tables = [],
  onQuerySelect,
  onTableSelect,
  onQueryDelete,
  onQueryRename,
  openQueryIds,
  activeQueryName,
}) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircleIcon fontSize="small" sx={{ color: 'success.main' }} />;
      case 'error':
        return <ErrorIcon fontSize="small" sx={{ color: 'error.main' }} />;
      case 'running':
        return <PendingIcon fontSize="small" sx={{ color: 'info.main' }} />;
      default:
        return <PendingIcon fontSize="small" sx={{ color: 'text.secondary' }} />;
    }
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return 'Not scheduled';
    const date = new Date(dateStr);
    return date.toLocaleString();
  };

  return (
    <Box sx={{ 
      width: 250, 
      borderRight: 1, 
      borderColor: 'divider',
      bgcolor: 'background.paper',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Tables Section */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="subtitle2" sx={{ mb: 1, fontSize: '0.75rem' }}>
          Tables
        </Typography>
        <List dense disablePadding>
          {tables.map((table) => (
            <ListItem
              key={table}
              dense
              sx={{ 
                py: 0.5,
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
            >
              <ListItemText 
                primary={table}
                primaryTypographyProps={{
                  fontSize: '0.8rem',
                  sx: { cursor: 'pointer' }
                }}
                onClick={() => onTableSelect(table)}
              />
            </ListItem>
          ))}
        </List>
      </Box>

      {/* Saved Queries Section */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="subtitle2" sx={{ mb: 1, fontSize: '0.75rem' }}>
          Saved Queries
        </Typography>
        <List dense disablePadding>
          {savedQueries.map((query) => (
            <ListItem
              key={query.name}
              dense
              sx={{ 
                py: 0.5,
                '&:hover': {
                  bgcolor: 'action.hover',
                  '& .actions': {
                    opacity: 1,
                  },
                },
              }}
            >
              <ListItemText 
                primary={query.name}
                primaryTypographyProps={{
                  fontSize: '0.8rem',
                  sx: { cursor: 'pointer' }
                }}
                onClick={() => onQuerySelect(query)}
              />
              <Box 
                className="actions" 
                sx={{ 
                  opacity: 0,
                  transition: 'opacity 0.2s',
                  display: 'flex',
                  gap: 0.5,
                }}
              >
                <IconButton 
                  size="small" 
                  onClick={() => onQueryRename(query)}
                  sx={{ p: 0.5 }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton 
                  size="small" 
                  onClick={() => onQueryDelete(query)}
                  sx={{ p: 0.5 }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            </ListItem>
          ))}
        </List>
      </Box>

      {/* Scheduled Queries Section */}
      <Box sx={{ p: 2, flex: 1, overflow: 'auto' }}>
        <Typography variant="subtitle2" sx={{ mb: 1, fontSize: '0.75rem' }}>
          Scheduled Queries ({scheduledQueries.length})
        </Typography>
        <List dense disablePadding>
          {(scheduledQueries || []).map((query) => (
            <ListItem
              key={query.id}
              dense
              sx={{ 
                py: 0.5,
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 24 }}>
                <Tooltip title={query.status || 'pending'}>
                  {getStatusIcon(query.status)}
                </Tooltip>
              </ListItemIcon>
              <ListItemText
                primary={query.name}
                secondary={
                  <Box component="span" sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <AccessTimeIcon sx={{ fontSize: 12 }} />
                      Next run: {formatDateTime(query.nextRunTime)}
                    </Typography>
                    <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <ScheduleIcon sx={{ fontSize: 12 }} />
                      {query.frequency || 'once'}
                    </Typography>
                  </Box>
                }
                primaryTypographyProps={{
                  fontSize: '0.8rem',
                }}
                secondaryTypographyProps={{
                  sx: { mt: 0.5 }
                }}
              />
            </ListItem>
          ))}
        </List>
      </Box>
    </Box>
  );
};

export default Sidebar;
