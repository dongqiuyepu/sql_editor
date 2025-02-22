import React from 'react';
import { Box } from '@mui/material';
import MonacoEditor from '@monaco-editor/react';

function Editor({ value, onChange }) {
  const handleEditorBeforeMount = (monaco) => {
    monaco.languages.register({ id: 'sql' });
    monaco.editor.defineTheme('sqlTheme', {
      base: 'vs',
      inherit: true,
      rules: [
        { token: 'keyword', foreground: '0000FF', fontStyle: 'bold' },
        { token: 'string', foreground: 'a31515' },
        { token: 'identifier', foreground: '001080' },
        { token: 'number', foreground: '098658' },
        { token: 'delimiter', foreground: '000000' },
        { token: 'operator', foreground: '000000' },
        { token: 'comment', foreground: '008000' }
      ],
      colors: {
        'editor.foreground': '#000000',
        'editor.background': '#ffffff'
      }
    });
  };

  const handleEditorDidMount = (editor, monaco) => {
    // Force a re-render of the editor to apply syntax highlighting
    editor.trigger('keyboard', 'type', { text: ' ' });
    editor.trigger('keyboard', 'backspace', null);
  };

  return (
    <Box sx={{ 
      width: '100%',
      height: '100%',
      position: 'relative',
      '& .monaco-editor': {
        '& .scrollbar': {
          '&.vertical': {
            display: 'none !important'
          }
        }
      }
    }}>
      <MonacoEditor
        height="100%"
        defaultLanguage="sql"
        language="sql"
        theme="sqlTheme"
        value={value || ''}
        onChange={onChange}
        beforeMount={handleEditorBeforeMount}
        onMount={handleEditorDidMount}
        options={{
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          scrollbar: {
            vertical: 'hidden',
            verticalScrollbarSize: 0,
            alwaysConsumeMouseWheel: false
          },
          overviewRulerLanes: 0,
          hideCursorInOverviewRuler: true,
          overviewRulerBorder: false,
          fontSize: 14,
          lineHeight: 21,
          automaticLayout: true,
          wordWrap: 'on',
          padding: { top: 8, bottom: 48 },
          fixedOverflowWidgets: true
        }}
      />
    </Box>
  );
}

export default Editor;
