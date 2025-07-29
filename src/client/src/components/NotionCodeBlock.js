import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { 
    Box, 
    Button, 
    IconButton, 
    Select, 
    MenuItem, 
    FormControl,
    Snackbar,
    Paper
} from '@mui/material';
import { ContentCopy, Check } from '@mui/icons-material';

const LANGUAGES = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'cpp', label: 'C++' },
    { value: 'csharp', label: 'C#' },
    { value: 'html', label: 'HTML' },
    { value: 'css', label: 'CSS' },
    { value: 'sql', label: 'SQL' },
    { value: 'bash', label: 'Bash' },
    { value: 'json', label: 'JSON' },
    { value: 'markdown', label: 'Markdown' },
    { value: 'plaintext', label: 'Plain Text' }
];

export default function NotionCodeBlock({ code, language: initialLanguage, onChange }) {
    const [language, setLanguage] = useState(initialLanguage || 'javascript');
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const handleLanguageChange = (event) => {
        const newLanguage = event.target.value;
        setLanguage(newLanguage);
        if (onChange) {
            onChange({ code, language: newLanguage });
        }
    };

    return (
        <Paper 
            elevation={0} 
            sx={{ 
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                overflow: 'hidden',
                my: 2,
                backgroundColor: '#1e1e1e'
            }}
        >
            {/* 헤더 영역 */}
            <Box 
                sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    px: 2,
                    py: 1,
                    backgroundColor: '#2d2d2d',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                }}
            >
                <FormControl size="small" sx={{ minWidth: 120 }}>
                    <Select
                        value={language}
                        onChange={handleLanguageChange}
                        sx={{
                            color: 'white',
                            '& .MuiOutlinedInput-notchedOutline': {
                                border: 'none'
                            },
                            '&:hover': {
                                backgroundColor: 'rgba(255, 255, 255, 0.1)'
                            },
                            fontSize: '0.875rem'
                        }}
                    >
                        {LANGUAGES.map((lang) => (
                            <MenuItem key={lang.value} value={lang.value}>
                                {lang.label}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <IconButton
                    onClick={handleCopy}
                    size="small"
                    sx={{ 
                        color: 'white',
                        '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.1)'
                        }
                    }}
                >
                    {copied ? <Check fontSize="small" /> : <ContentCopy fontSize="small" />}
                </IconButton>
            </Box>

            {/* 코드 영역 */}
            <Box sx={{ position: 'relative' }}>
                <SyntaxHighlighter
                    language={language}
                    style={vscDarkPlus}
                    customStyle={{
                        margin: 0,
                        padding: '16px',
                        backgroundColor: '#1e1e1e',
                        fontSize: '14px',
                        lineHeight: 1.6
                    }}
                    showLineNumbers={true}
                    wrapLines={true}
                >
                    {code || '// 코드를 입력하세요'}
                </SyntaxHighlighter>
            </Box>
        </Paper>
    );
} 