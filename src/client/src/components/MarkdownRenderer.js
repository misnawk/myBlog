import React, { useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import DOMPurify from 'dompurify';
import { isHtmlContent } from '../utils/htmlUtils';

const MarkdownRenderer = ({ content, sx = {} }) => {
  const containerRef = useRef(null);
  
  // HTML인지 마크다운인지 감지
  const isHTML = isHtmlContent(content);
  
  // 줄바꿈 처리 개선: 더 정교한 처리
  let processedContent = content || '';
  
  if (isHTML) {
    // HTML 콘텐츠를 안전하게 정제 (보안 강화)
    processedContent = DOMPurify.sanitize(processedContent, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 's', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 
                     'ul', 'ol', 'li', 'blockquote', 'pre', 'code', 'a', 'img', 'video', 'iframe', 'div', 'span'],
      ALLOWED_ATTR: ['href', 'src', 'alt', 'class', 'target', 'rel', 'width', 'height', 'controls', 'autoplay', 'muted', 'loop', 'poster', 'frameborder', 'allowfullscreen'],
      ALLOW_DATA_ATTR: false
    });
    
     // HTML 구조 내부의 줄바꿈은 건드리지 않고, 실제 텍스트 콘텐츠의 줄바꿈만 처리
     // 이미 ReactQuill에서 적절히 구조화된 HTML이므로 추가 줄바꿈 변환을 하지 않음
     // (ReactQuill은 줄바꿈을 <p> 태그나 <br> 태그로 이미 처리함)
  } else {
    // 일반 텍스트의 경우 HTML 특수문자 이스케이프 후 줄바꿈 변환
    processedContent = processedContent
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')   
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\r\n/g, '<br>')
      .replace(/\r/g, '<br>')
      .replace(/\n/g, '<br>');
    
    // 이미 이스케이프되었으므로 DOMPurify 없이 처리
    // (하지만 보안을 위해 간단한 검증은 유지)
    if (processedContent.includes('<script') || processedContent.includes('javascript:')) {
      processedContent = '⚠️ 보안상 위험한 콘텐츠가 감지되어 표시할 수 없습니다.';
    }
  }
  
  // 코드 하이라이팅 적용 (성능 최적화)
  useEffect(() => {
    if (!containerRef.current || !window.hljs) return;
    
    // 컨테이너 내부의 코드블록만 검색하여 성능 향상
    const codeBlocks = containerRef.current.querySelectorAll('pre code:not(.hljs)');
    const reactQuillBlocks = containerRef.current.querySelectorAll('.ql-syntax:not(.hljs)');
    
    // 하이라이팅 적용
    [...codeBlocks, ...reactQuillBlocks].forEach((block) => {
      window.hljs.highlightElement(block);
    });
  }, [content]);
  
  return (
    <Box 
      ref={containerRef}
      sx={{ 
        '& h1': { fontSize: '2rem', fontWeight: 'bold', mb: 2, mt: 3 },
        '& h2': { fontSize: '1.5rem', fontWeight: 'bold', mb: 2, mt: 2 },
        '& h3': { fontSize: '1.25rem', fontWeight: 'bold', mb: 1.5, mt: 2 },
        '& p': { mb: 2, lineHeight: 1.6 },
        '& strong': { fontWeight: 'bold' },
        '& em': { fontStyle: 'italic' },
        // 인라인 코드 스타일 - 가독성 개선 (GitHub 스타일)
        '& code:not(.hljs)': { 
          backgroundColor: '#f6f8fa', 
          color: '#24292f',
          padding: '2px 4px', 
          borderRadius: '6px',
          fontSize: '85%',
          fontFamily: '"ui-monospace", "SFMono-Regular", "SF Mono", "Consolas", "Liberation Mono", "Menlo", monospace',
          fontWeight: '400',
          border: '1px solid #d0d7de',
          boxShadow: 'inset 0 1px 0 rgba(208, 215, 222, 0.2)'
        },
        // 일반 pre 태그 스타일
        '& pre': { 
          backgroundColor: '#282c34', 
          padding: '20px', 
          borderRadius: '12px',
          overflow: 'auto',
          margin: '20px 0',
          border: '1px solid #3e4451',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          '& code': {
            backgroundColor: 'transparent',
            padding: 0,
            color: '#abb2bf'
          }
        },
        // ReactQuill 코드블록 스타일 - 개선된 색상
        '& .ql-syntax': {
          backgroundColor: '#282c34 !important',
          color: '#abb2bf !important',
          padding: '20px !important',
          borderRadius: '12px !important',
          fontFamily: '"JetBrains Mono", "Fira Code", Consolas, Monaco, "Courier New", monospace !important',
          fontSize: '14px !important',
          lineHeight: '1.7 !important',
          overflow: 'auto !important',
          margin: '20px 0 !important',
          display: 'block !important',
          border: '1px solid #3e4451 !important',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15) !important'
        },
        // highlight.js 스타일 - 개선된 색상
        '& .hljs': {
          backgroundColor: '#282c34 !important',
          color: '#abb2bf !important',
          padding: '20px !important',
          borderRadius: '12px !important',
          overflow: 'auto !important',
          border: '1px solid #3e4451 !important',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15) !important'
        },
        // 더 생생한 문법 하이라이팅 색상 (Atom One Dark 테마)
        '& .hljs-keyword, & .ql-syntax .hljs-keyword': { color: '#c678dd !important' }, // 보라색 - 키워드
        '& .hljs-string, & .ql-syntax .hljs-string': { color: '#98c379 !important' }, // 초록색 - 문자열
        '& .hljs-number, & .ql-syntax .hljs-number': { color: '#d19a66 !important' }, // 주황색 - 숫자
        '& .hljs-function, & .ql-syntax .hljs-function': { color: '#61dafb !important' }, // 하늘색 - 함수
        '& .hljs-comment, & .ql-syntax .hljs-comment': { color: '#5c6370 !important', fontStyle: 'italic' }, // 회색 - 주석
        '& .hljs-variable, & .ql-syntax .hljs-variable': { color: '#e06c75 !important' }, // 빨간색 - 변수
        '& .hljs-tag, & .ql-syntax .hljs-tag': { color: '#e06c75 !important' }, // 빨간색 - HTML 태그
        '& .hljs-attr, & .ql-syntax .hljs-attr': { color: '#d19a66 !important' }, // 주황색 - 속성
        '& .hljs-built_in, & .ql-syntax .hljs-built_in': { color: '#e5c07b !important' }, // 노란색 - 내장함수
        '& .hljs-title, & .ql-syntax .hljs-title': { color: '#61dafb !important' }, // 하늘색 - 제목
        '& .hljs-class, & .ql-syntax .hljs-class': { color: '#e5c07b !important' }, // 노란색 - 클래스
        '& .hljs-params, & .ql-syntax .hljs-params': { color: '#abb2bf !important' }, // 기본색 - 매개변수
        '& .hljs-meta, & .ql-syntax .hljs-meta': { color: '#56b6c2 !important' }, // 청록색 - 메타
        '& .hljs-operator, & .ql-syntax .hljs-operator': { color: '#56b6c2 !important' }, // 청록색 - 연산자
        '& .hljs-literal, & .ql-syntax .hljs-literal': { color: '#d19a66 !important' }, // 주황색 - 리터럴
        '& .hljs-type, & .ql-syntax .hljs-type': { color: '#e5c07b !important' }, // 노란색 - 타입
        '& .hljs-name, & .ql-syntax .hljs-name': { color: '#e06c75 !important' }, // 빨간색 - 이름
        '& ul': { pl: 2, mb: 2 },
        '& ol': { pl: 2, mb: 2 },
        '& li': { mb: 0.5 },
        '& blockquote': { 
          borderLeft: '4px solid #3b82f6',
          backgroundColor: '#f8fafc',
          margin: '16px 0',
          padding: '12px 18px 12px 22px',
          borderRadius: '0 6px 6px 0',
          fontStyle: 'italic',
          color: '#475569',
          fontSize: '1.05em',
          lineHeight: 1.5,
          boxShadow: '0 2px 8px rgba(59, 130, 246, 0.08), 0 1px 3px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e2e8f0',
          borderLeft: '4px solid #3b82f6',
          position: 'relative',
          fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
          '& p': {
            margin: '0 !important',
            fontWeight: '400',
            letterSpacing: '0.01em'
          },
          '&:before': {
            content: '""',
            position: 'absolute',
            left: '-4px',
            top: '0',
            bottom: '0',
            width: '4px',
            background: 'linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%)',
            borderRadius: '0 2px 2px 0'
          }
        },
        '& img': {
          maxWidth: '100%',
          height: 'auto',
          borderRadius: '8px',
          mb: 2
        },
        '& video': {
          maxWidth: '100%',
          height: 'auto',
          borderRadius: '8px',
          mb: 2,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
        },
        '& iframe': {
          maxWidth: '100%',
          borderRadius: '8px',
          mb: 2,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
        },
        // ReactQuill 스타일 추가
        '& .ql-align-center': { textAlign: 'center' },
        '& .ql-align-right': { textAlign: 'right' },
        '& .ql-align-justify': { textAlign: 'justify' },
        ...sx 
      }}
    >
      {/* 모든 콘텐츠를 HTML로 렌더링 (줄바꿈 처리 개선) */}
      <div dangerouslySetInnerHTML={{ __html: processedContent }} />
    </Box>
  );
};

export default MarkdownRenderer;