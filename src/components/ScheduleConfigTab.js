import React, { useState } from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Typography,
  FormHelperText,
  Grid,
  Paper,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import Editor from './Editor';

const FREQUENCY_OPTIONS = [
  { value: 'once', label: 'Once' },
  { value: 'hourly', label: 'Hourly' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
];

function ScheduleConfigTab({ query: initialQuery, onSchedule, onChange }) {
  const [config, setConfig] = useState({
    name: '',
    description: '',
    startTime: new Date(),
    frequency: 'once',
    retryCount: 0,
    notifyOnFailure: true,
    timeoutSeconds: 300, // 5 minutes default
  });
  const [query, setQuery] = useState(initialQuery);

  const handleChange = (field) => (event) => {
    setConfig({
      ...config,
      [field]: event.target.value,
    });
  };

  const handleDateChange = (newValue) => {
    setConfig({
      ...config,
      startTime: newValue,
    });
  };

  const handleQueryChange = (value) => {
    setQuery(value);
    if (onChange) {
      onChange(value);
    }
  };

  const handleSubmit = () => {
    onSchedule({
      ...config,
      query,
    });
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Header */}
        <Box sx={{ 
          p: 2,
          borderBottom: 1,
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 500 }}>
            Schedule Configuration
          </Typography>
          <Button 
            variant="contained"
            onClick={handleSubmit}
            sx={{ 
              fontSize: '0.75rem',
              textTransform: 'none',
              bgcolor: 'black',
              '&:hover': {
                bgcolor: 'grey.900',
              },
            }}
          >
            Schedule Query
          </Button>
        </Box>

        {/* Content */}
        <Box sx={{ 
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}>
          {/* Query Editor */}
          <Box sx={{ 
            flex: 1,
            minHeight: 0,
            position: 'relative',
          }}>
            <Editor
              value={query}
              onChange={handleQueryChange}
              height="100%"
              defaultLanguage="sql"
              options={{
                minimap: { enabled: false },
                fontSize: 13,
                wordWrap: 'on',
              }}
            />
          </Box>

          {/* Schedule Settings */}
          <Box sx={{ 
            p: 2,
            borderTop: 1,
            borderColor: 'divider',
            bgcolor: 'background.paper',
          }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Schedule Name"
                  value={config.name}
                  onChange={handleChange('name')}
                  size="small"
                  required
                  InputLabelProps={{
                    sx: { fontSize: '0.8rem' }
                  }}
                  inputProps={{
                    sx: { fontSize: '0.8rem' }
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel sx={{ fontSize: '0.8rem' }}>Frequency</InputLabel>
                  <Select
                    value={config.frequency}
                    onChange={handleChange('frequency')}
                    label="Frequency"
                    sx={{ fontSize: '0.8rem' }}
                  >
                    {FREQUENCY_OPTIONS.map(option => (
                      <MenuItem 
                        key={option.value} 
                        value={option.value}
                        sx={{ fontSize: '0.8rem' }}
                      >
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <DateTimePicker
                  label="Start Time"
                  value={config.startTime}
                  onChange={handleDateChange}
                  renderInput={(params) => (
                    <TextField 
                      {...params} 
                      fullWidth 
                      size="small"
                      InputLabelProps={{
                        sx: { fontSize: '0.8rem' }
                      }}
                      inputProps={{
                        ...params.inputProps,
                        sx: { fontSize: '0.8rem' }
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Timeout (seconds)"
                  type="number"
                  value={config.timeoutSeconds}
                  onChange={handleChange('timeoutSeconds')}
                  size="small"
                  InputLabelProps={{
                    sx: { fontSize: '0.8rem' }
                  }}
                  inputProps={{
                    min: 0,
                    max: 3600,
                    sx: { fontSize: '0.8rem' }
                  }}
                  helperText="Maximum execution time (0-3600 seconds)"
                  FormHelperTextProps={{
                    sx: { fontSize: '0.7rem' }
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  value={config.description}
                  onChange={handleChange('description')}
                  multiline
                  rows={2}
                  size="small"
                  InputLabelProps={{
                    sx: { fontSize: '0.8rem' }
                  }}
                  inputProps={{
                    sx: { fontSize: '0.8rem' }
                  }}
                />
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Box>
    </LocalizationProvider>
  );
}

export default ScheduleConfigTab;
