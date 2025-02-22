import React from 'react';
import { 
  Box, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Typography 
} from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

function ResultPanel({ results, error }) {
  console.log('ResultPanel props:', { results, error });

  if (error) {
    return (
      <Box sx={{ 
        p: 2,
        height: '100%',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 1,
      }}>
        <ErrorOutlineIcon color="error" />
        <Typography color="error.main" sx={{ fontSize: '0.75rem' }}>{error}</Typography>
      </Box>
    );
  }

  if (!results || !results.rows || !results.columns) {
    return (
      <Box sx={{ 
        p: 2,
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Typography sx={{ fontSize: '0.75rem' }}>No results to display</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <Box sx={{ 
        p: 1,
        borderBottom: 1,
        borderColor: 'divider',
        bgcolor: (theme) => theme.palette.grey[50],
      }}>
        <Typography variant="caption" sx={{ fontWeight: 500, fontSize: '0.7rem' }}>
          {results.rows.length} {results.rows.length === 1 ? 'row' : 'rows'}
        </Typography>
      </Box>
      <TableContainer 
        component={Paper} 
        sx={{ 
          flex: 1,
          overflow: 'auto',
          borderRadius: 0,
          boxShadow: 'none',
        }}
      >
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              {results.columns.map((column, index) => (
                <TableCell 
                  key={index}
                  sx={{
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    bgcolor: (theme) => theme.palette.grey[50],
                    fontSize: '0.75rem',
                    py: 0.5,
                  }}
                >
                  {column}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {results.rows.map((row, rowIndex) => (
              <TableRow 
                key={rowIndex}
                sx={{
                  '&:nth-of-type(odd)': {
                    bgcolor: (theme) => theme.palette.grey[50],
                  },
                }}
              >
                {row.map((cell, cellIndex) => (
                  <TableCell 
                    key={cellIndex}
                    sx={{
                      whiteSpace: 'nowrap',
                      fontSize: '0.75rem',
                      py: 0.5,
                    }}
                  >
                    {cell !== null ? cell.toString() : 'NULL'}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default ResultPanel;
