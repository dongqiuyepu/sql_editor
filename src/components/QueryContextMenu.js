import React from 'react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

function QueryContextMenu({ anchorEl, onClose, onOpen, onRename, onDelete }) {
  const open = Boolean(anchorEl);

  const handleItemClick = (action) => {
    onClose();
    switch (action) {
      case 'open':
        onOpen();
        break;
      case 'rename':
        onRename();
        break;
      case 'delete':
        onDelete();
        break;
      default:
        break;
    }
  };

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      onClick={onClose}
      PaperProps={{
        sx: {
          minWidth: 120,
          boxShadow: 'rgba(0, 0, 0, 0.12) 0px 2px 8px',
          '& .MuiMenuItem-root': {
            fontSize: '0.8rem',
            py: 0.75,
            px: 1.5,
          },
        },
      }}
    >
      <MenuItem onClick={() => handleItemClick('open')}>
        <ListItemIcon>
          <OpenInNewIcon sx={{ fontSize: '1.2rem' }} />
        </ListItemIcon>
        <ListItemText 
          primary="Open" 
          primaryTypographyProps={{ 
            fontSize: 'inherit',
          }} 
        />
      </MenuItem>
      <MenuItem onClick={() => handleItemClick('rename')}>
        <ListItemIcon>
          <DriveFileRenameOutlineIcon sx={{ fontSize: '1.2rem' }} />
        </ListItemIcon>
        <ListItemText 
          primary="Rename" 
          primaryTypographyProps={{ 
            fontSize: 'inherit',
          }} 
        />
      </MenuItem>
      <MenuItem onClick={() => handleItemClick('delete')}>
        <ListItemIcon>
          <DeleteOutlineIcon sx={{ fontSize: '1.2rem' }} />
        </ListItemIcon>
        <ListItemText 
          primary="Delete" 
          primaryTypographyProps={{ 
            fontSize: 'inherit',
            color: 'error.main',
          }} 
        />
      </MenuItem>
    </Menu>
  );
}

export default QueryContextMenu;
