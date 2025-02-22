import React from 'react';
import { SvgIcon } from '@mui/material';

function SqlIcon(props) {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24">
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        style={{
          font: 'bold 13px monospace',
          fill: 'currentColor',
          letterSpacing: '-1px'
        }}
      >
        {'<>'}
      </text>
    </SvgIcon>
  );
}

export default SqlIcon;
