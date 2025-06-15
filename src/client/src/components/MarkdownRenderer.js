import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Box } from '@mui/material';

const MarkdownRenderer = ({ content, sx = {} }) => {
  return (
    <Box 
      sx={{ 
        '& h1': { fontSize: '2rem', fontWeight: 'bold', mb: 2, mt: 3 },
        '& h2': { fontSize: '1.5rem', fontWeight: 'bold', mb: 2, mt: 2 },
        '& h3': { fontSize: '1.25rem', fontWeight: 'bold', mb: 1.5, mt: 2 },
        '& p': { mb: 2, lineHeight: 1.6 },
        '& strong': { fontWeight: 'bold' },
        '& em': { fontStyle: 'italic' },
        '& code': { 
          backgroundColor: '#f5f5f5', 
          padding: '2px 4px', 
          borderRadius: '3px',
          fontSize: '0.875rem',
          fontFamily: 'monospace'
        },
        '& pre': { 
          backgroundColor: '#f5f5f5', 
          padding: '16px', 
          borderRadius: '8px',
          overflow: 'auto',
          '& code': {
            backgroundColor: 'transparent',
            padding: 0
          }
        },
        '& ul': { pl: 2, mb: 2 },
        '& ol': { pl: 2, mb: 2 },
        '& li': { mb: 0.5 },
        '& blockquote': { 
          borderLeft: '4px solid #ddd', 
          pl: 2, 
          ml: 0, 
          fontStyle: 'italic',
          color: '#666'
        },
        ...sx 
      }}
    >
      <ReactMarkdown>{content || ''}</ReactMarkdown>
    </Box>
  );
};

export default MarkdownRenderer;