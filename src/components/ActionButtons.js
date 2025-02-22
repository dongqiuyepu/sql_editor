import React, { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SaveIcon from '@mui/icons-material/Save';
import ScheduleIcon from '@mui/icons-material/Schedule';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api';

function ActionButtons({ query, onExecute, onSave, onSchedule }) {
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [queryName, setQueryName] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');

  const handleSaveQuery = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/save-query`, {
        name: queryName,
        query: query
      });
      
      if (response.data.success) {
        onSave && onSave(queryName, query);
        setSaveDialogOpen(false);
        setQueryName('');
      }
    } catch (error) {
      console.error('Failed to save query:', error);
    }
  };

  const handleScheduleQuery = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/schedule`, {
        query: query,
        schedule_time: scheduleTime
      });
      
      if (response.data.success) {
        onSchedule && onSchedule(scheduleTime, query);
        setScheduleDialogOpen(false);
        setScheduleTime('');
      }
    } catch (error) {
      console.error('Failed to schedule query:', error);
    }
  };

  return (
    <Box sx={{ 
      p: 2,
      borderTop: 1,
      borderColor: 'divider',
      bgcolor: 'background.paper',
      display: 'flex',
      gap: 2,
      justifyContent: 'flex-end'
    }}>
      <Button
        variant="contained"
        color="primary"
        startIcon={<PlayArrowIcon />}
        onClick={onExecute}
      >
        Run SQL
      </Button>
      <Button
        variant="outlined"
        startIcon={<SaveIcon />}
        onClick={() => setSaveDialogOpen(true)}
      >
        Save Query
      </Button>
      <Button
        variant="outlined"
        startIcon={<ScheduleIcon />}
        onClick={() => setScheduleDialogOpen(true)}
      >
        Schedule
      </Button>

      {/* Save Query Dialog */}
      <Dialog 
        open={saveDialogOpen} 
        onClose={() => setSaveDialogOpen(false)}
        PaperProps={{
          sx: { bgcolor: 'background.paper' }
        }}
      >
        <DialogTitle>Save Query</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Query Name"
            fullWidth
            value={queryName}
            onChange={(e) => setQueryName(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.23)',
                },
              },
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveQuery} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Schedule Query Dialog */}
      <Dialog 
        open={scheduleDialogOpen} 
        onClose={() => setScheduleDialogOpen(false)}
        PaperProps={{
          sx: { bgcolor: 'background.paper' }
        }}
      >
        <DialogTitle>Schedule Query</DialogTitle>
        <DialogContent>
          <TextField
            type="datetime-local"
            margin="dense"
            fullWidth
            value={scheduleTime}
            onChange={(e) => setScheduleTime(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.23)',
                },
              },
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setScheduleDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleScheduleQuery} variant="contained" color="primary">
            Schedule
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ActionButtons;
