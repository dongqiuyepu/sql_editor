import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';

function SaveQueryDialog({ open, onClose, onSave, initialName = '', error = null }) {
  const [queryName, setQueryName] = useState(initialName);

  const handleSave = () => {
    if (queryName.trim()) {
      onSave(queryName.trim());
    }
  };

  const handleClose = () => {
    setQueryName('');
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      PaperProps={{
        sx: {
          borderRadius: 1,
          minWidth: 400,
          bgcolor: 'white',
        }
      }}
    >
      <DialogTitle sx={{ 
        py: 1.5,
        px: 2,
        fontSize: '0.9rem',
        color: 'black',
      }}>
        Save Query
      </DialogTitle>
      <DialogContent sx={{ p: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2, fontSize: '0.8rem' }}>
            {error}
          </Alert>
        )}
        <TextField
          autoFocus
          margin="dense"
          id="name"
          label="Query Name"
          type="text"
          fullWidth
          variant="outlined"
          value={queryName}
          onChange={(e) => setQueryName(e.target.value)}
          error={!!error}
          helperText={error}
          size="small"
          InputLabelProps={{
            sx: { 
              fontSize: '0.8rem',
              color: 'text.secondary',
              '&.Mui-focused': {
                color: 'text.primary',
              },
            }
          }}
          inputProps={{
            sx: { fontSize: '0.8rem' }
          }}
          FormHelperTextProps={{
            sx: { fontSize: '0.75rem' }
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: 'grey.300',
              },
              '&:hover fieldset': {
                borderColor: 'grey.400',
              },
              '&.Mui-focused fieldset': {
                borderColor: 'grey.600',
              },
            },
          }}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && queryName.trim()) {
              handleSave();
            }
          }}
        />
      </DialogContent>
      <DialogActions sx={{ 
        px: 2, 
        py: 1.5,
      }}>
        <Button 
          onClick={handleClose}
          sx={{ 
            fontSize: '0.75rem',
            textTransform: 'none',
            color: 'text.secondary',
            '&:hover': {
              bgcolor: 'grey.100',
            },
          }}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSave}
          variant="contained"
          sx={{ 
            fontSize: '0.75rem',
            textTransform: 'none',
            bgcolor: 'black',
            '&:hover': {
              bgcolor: 'grey.900',
            },
          }}
          disabled={!queryName.trim()}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default SaveQueryDialog;
