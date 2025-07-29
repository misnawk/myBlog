import React, { useEffect, useRef } from 'react';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css'; // 다크 테마
import { Box, Paper, Typography, IconButton, Tooltip } from '@mui/material';
import { ContentCopy, Check } from '@mui/icons-material';
import { useState } from 'react';

// 언어별 import (필요한 언어들 추가)
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-csharp';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-yaml';
import 'prismjs/components/prism-docker';

// 플러그인
import 'prismjs/plugins/line-numbers/prism-line-numbers';
import 'prismjs/plugins/line-numbers/prism-line-numbers.css';

const languageMap = {
    'js': 'javascript',
    'ts': 'typescript',
    'py': 'python',
    'md': 'markdown',
    'yml': 'yaml',
    'sh': 'bash',
    'dockerfile': 'docker'
};

export default function CodeBlockWithPrism({ 
    code, 
    language = 'javascript', 
    showLineNumbers = true,
    filename = null 
}) {
    const codeRef = useRef(null);
    const [copied, setCopied] = useState(false);

    // 언어 정규화
    const normalizedLanguage = languageMap[language] || language;

    useEffect(() => {
        if (codeRef.current) {
            Prism.highlightElement(codeRef.current);
        }
    }, [code, normalizedLanguage]);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    return (
        <Paper 
            elevation={0}
            sx={{ 
                borderRadius: 2,
                overflow: 'hidden',
                my: 2,
                border: '1px solid',
                borderColor: 'divider',
                backgroundColor: '#2d2d30' // VS Code 스타일
            }}
        >
            {/* 헤더 */}
            <Box 
                sx={{ 
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    px: 2,
                    py: 1,
                    backgroundColor: '#252526',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {filename && (
                        <Typography 
                            variant="caption" 
                            sx={{ 
                                color: '#cccccc',
                                fontFamily: 'monospace',
                                fontSize: '0.8rem'
                            }}
                        >
                            {filename}
                        </Typography>
                    )}
                    <Typography 
                        variant="caption" 
                        sx={{ 
                            color: '#858585',
                            fontFamily: 'monospace',
                            fontSize: '0.75rem'
                        }}
                    >
                        {normalizedLanguage}
                    </Typography>
                </Box>

                <Tooltip title={copied ? "복사됨!" : "코드 복사"}>
                    <IconButton
                        onClick={handleCopy}
                        size="small"
                        sx={{ 
                            color: '#cccccc',
                            '&:hover': {
                                backgroundColor: 'rgba(255, 255, 255, 0.1)'
                            }
                        }}
                    >
                        {copied ? <Check fontSize="small" /> : <ContentCopy fontSize="small" />}
                    </IconButton>
                </Tooltip>
            </Box>

            {/* 코드 영역 */}
            <Box 
                sx={{ 
                    position: 'relative',
                    '& pre': {
                        margin: 0,
                        padding: '16px !important',
                        backgroundColor: '#1e1e1e !important',
                        fontSize: '14px',
                        lineHeight: 1.6,
                        fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                        overflow: 'auto'
                    },
                    '& code': {
                        fontFamily: 'inherit'
                    },
                    // 라인 넘버 스타일
                    '& .line-numbers-rows': {
                        borderRight: '1px solid #464647',
                        backgroundColor: '#1e1e1e'
                    },
                    '& .line-numbers-rows > span': {
                        color: '#858585'
                    }
                }}
            >
                <pre className={showLineNumbers ? 'line-numbers' : ''}>
                    <code 
                        ref={codeRef}
                        className={`language-${normalizedLanguage}`}
                    >
                        {code.trim()}
                    </code>
                </pre>
            </Box>
        </Paper>
    );
} 