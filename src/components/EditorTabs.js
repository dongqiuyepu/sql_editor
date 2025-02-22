import React from 'react';
import { Box, Tabs, Tab, Typography, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';

function EditorTabs({ tabs, activeTabId, onTabChange, onTabClose, onNewQuery }) {
  const handleClose = (event, tabId) => {
    event.stopPropagation();
    onTabClose(tabId);
  };

  return (
    <Box sx={{
      minHeight: 28,
      bgcolor: (theme) => 
        theme.palette.mode === 'light' ? 'grey.50' : 'grey.900',
      pl: 0,
      borderBottom: 1,
      borderColor: 'divider',
    }}>
      <Tabs 
        value={activeTabId || false}
        onChange={(e, value) => value !== 'new' && onTabChange(value)}
        variant={tabs.length > 0 ? "scrollable" : "standard"}
        scrollButtons={tabs.length > 0 ? "auto" : false}
        sx={{
          minHeight: 28,
          '& .MuiTabs-indicator': {
            display: 'none',
          },
          '& .MuiTabs-scroller': {
            ml: 0,
          },
          '& .MuiTabs-flexContainer': {
            pl: 0,
            gap: 1,
          },
          '& .MuiTab-root': {
            minHeight: 28,
            py: 0,
            px: 1,
            fontSize: '0.7rem',
            textTransform: 'none',
            color: 'text.secondary',
            '&.Mui-selected': {
              color: 'text.primary',
              bgcolor: 'background.paper',
            },
          },
          '& .MuiTabs-scrollButtons': {
            display: tabs.length > 0 ? 'auto' : 'none',
            width: 24,
            height: 28,
          },
        }}
      >
        {tabs.map((tab) => (
          <Tab
            key={tab.id}
            value={tab.id}
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {!tab.savedQueryId && <EditIcon sx={{ fontSize: '0.75rem' }} />}
                <Typography
                  component="span"
                  sx={{
                    fontSize: '0.7rem',
                    fontWeight: 400,
                    maxWidth: 100,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {tab.name || 'Untitled'}
                </Typography>
                {tab.isUnsaved && (
                  <FiberManualRecordIcon 
                    sx={{ 
                      fontSize: 8, 
                      color: 'warning.main',
                      animation: tab.isUnsaved ? 'pulse 2s infinite' : 'none',
                      '@keyframes pulse': {
                        '0%': { opacity: 0.5 },
                        '50%': { opacity: 1 },
                        '100%': { opacity: 0.5 },
                      }
                    }} 
                  />
                )}
                <IconButton
                  size="small"
                  onClick={(e) => handleClose(e, tab.id)}
                  sx={{
                    p: 0.125,
                    ml: 0.125,
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                  }}
                >
                  <CloseIcon sx={{ fontSize: '0.75rem' }} />
                </IconButton>
              </Box>
            }
          />
        ))}
        <Tab
          value="new"
          icon={
            <Box 
              sx={{ 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 16,
                height: 16,
                borderRadius: '50%',
                border: 1,
                borderColor: 'grey.500',
                bgcolor: 'grey.500',
                '&:hover': {
                  bgcolor: 'black',
                  borderColor: 'black',
                },
              }}
            >
              <AddIcon sx={{ fontSize: '0.8rem', color: 'white' }} />
            </Box>
          }
          sx={{
            minWidth: 28,
            minHeight: 28,
            p: 0,
          }}
          onClick={onNewQuery}
        />
      </Tabs>
    </Box>
  );
}

export default EditorTabs;
