import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { 
  Container, 
  Box, 
  Typography, 
  List, 
  ListItem, 
  ListItemText, 
  IconButton, 
  Chip,
  Card,
  CardContent,
  Divider,
  Fab,
  Tooltip,
  Stack,
  Avatar
} from '@mui/material';
import { 
  FormatBold, 
  FormatItalic, 
  FormatUnderlined, 
  Undo, 
  Redo, 
  Save,
  AutoAwesome,
  Schedule,
  CheckCircle,
  Title,
  FormatQuote,
  Code,
  Image as ImageIcon,
  FormatListBulleted,
  FormatListNumbered,
  Palette,
  Close
} from '@mui/icons-material';
import { createEditor, Transforms, Editor, Element, Range } from 'slate';
import { Slate, Editable, withReact, ReactEditor } from 'slate-react';
import { withHistory } from 'slate-history';
import imageCompression from 'browser-image-compression';

// 슬래시 명령어 목록
const SLASH_COMMANDS = [
  { key: '1', label: '제목 1', type: 'heading-one', icon: <Title sx={{ color: '#000000' }} />, description: '큰 제목' },
  { key: '2', label: '제목 2', type: 'heading-two', icon: <Title sx={{ color: '#000000', fontSize: 20 }} />, description: '중간 제목' },
  { key: '3', label: '제목 3', type: 'heading-three', icon: <Title sx={{ color: '#757575', fontSize: 18 }} />, description: '작은 제목' },
  { key: 'ul', label: '불릿 리스트', type: 'bulleted-list', icon: <FormatListBulleted sx={{ color: '#757575' }} />, description: '순서 없는 목록' },
  { key: 'ol', label: '번호 리스트', type: 'numbered-list', icon: <FormatListNumbered sx={{ color: '#757575' }} />, description: '순서 있는 목록' },
  { key: 'quote', label: '인용구', type: 'block-quote', icon: <FormatQuote sx={{ color: '#757575' }} />, description: '인용문 블록' },
  { key: 'code', label: '코드 블록', type: 'code-block', icon: <Code sx={{ color: '#4caf50' }} />, description: '코드 스니펫' },
  { key: 'image', label: '이미지', type: 'image', icon: <ImageIcon sx={{ color: '#f44336' }} />, description: '이미지 업로드' },
  { key: 'p', label: '일반 텍스트', type: 'paragraph', icon: <Typography sx={{ color: '#757575', fontSize: 16, fontWeight: 'bold' }}>P</Typography>, description: '일반 단락' },
];

// 색상 팔레트 (상수로 추가)
const TEXT_COLORS = [
  { key: 'default', label: '기본', color: '#000000' },
  { key: 'gray', label: '회색', color: '#9B9A97' },
  { key: 'brown', label: '갈색', color: '#64473A' },
  { key: 'orange', label: '주황', color: '#D9730D' },
  { key: 'yellow', label: '노랑', color: '#DFAB01' },
  { key: 'green', label: '초록', color: '#0F7B6C' },
  { key: 'blue', label: '파랑', color: '#0B6E99' },
  { key: 'purple', label: '보라', color: '#6940A5' },
  { key: 'pink', label: '분홍', color: '#AD1A72' },
  { key: 'red', label: '빨강', color: '#E03E3E' },
];

// 이미지 압축 및 Base64 변환
const compressAndConvertImage = async (file) => {
  try {
    console.log('📁 원본 이미지:', {
      name: file.name,
      size: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
      type: file.type
    });

    // 압축 옵션
    const options = {
      maxSizeMB: 1,          // 최대 1MB
      maxWidthOrHeight: 1920, // 최대 1920px
      useWebWorker: true,     // 웹워커 사용으로 성능 향상
      quality: 0.8,           // 품질 80%
      initialQuality: 0.6     // 초기 품질 60%
    };
    
    // 이미지 압축
    const compressedFile = await imageCompression(file, options);
    
    console.log('🗜️ 압축된 이미지:', {
      size: `${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`,
      compressionRatio: `${((file.size - compressedFile.size) / file.size * 100).toFixed(1)}% 절약`
    });
    
    // Base64 변환
    const base64 = await imageCompression.getDataUrlFromFile(compressedFile);
    
    return {
      src: base64,
      originalSize: file.size,
      compressedSize: compressedFile.size,
      compressionRatio: ((file.size - compressedFile.size) / file.size * 100).toFixed(1)
    };
  } catch (error) {
    console.error('❌ 이미지 압축 실패:', error);
    // 압축 실패 시 원본으로 폴백
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
      reader.readAsDataURL(file);
      reader.onload = () => resolve({
        src: reader.result,
        originalSize: file.size,
        compressedSize: file.size,
        compressionRatio: '0'
      });
      reader.onerror = reject;
    });
  }
};

// 이미지 삽입 함수 (압축 기능 추가)
const insertImage = async (editor, file) => {
  try {
    // 로딩 상태 표시
    console.log('🚀 이미지 업로드 시작...');
    
    // 이미지 압축 및 변환
    const imageData = await compressAndConvertImage(file);
    
    if (imageData) {
      const image = {
        type: 'image',
        src: imageData.src,
        alt: file.name,
        size: 'medium',
        metadata: {
          originalSize: imageData.originalSize,
          compressedSize: imageData.compressedSize,
          compressionRatio: imageData.compressionRatio
        },
        children: [{ text: '' }],
      };

      Transforms.insertNodes(editor, image);
      Transforms.insertNodes(editor, {
        type: 'paragraph',
        children: [{ text: '' }],
      });
      
      console.log('✅ 이미지 업로드 완료!');
    }
  } catch (error) {
    console.error('❌ 이미지 업로드 실패:', error);
  }
};

// 서식 관련 유틸리티 함수들
const isMarkActive = (editor, format) => {
  const marks = Editor.marks(editor);
  return marks ? marks[format] === true : false;
};

const toggleMark = (editor, format) => {
  const isActive = isMarkActive(editor, format);
  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
};

// 블록 타입 관련 유틸리티 함수들
const isBlockActive = (editor, format) => {
  const [match] = Editor.nodes(editor, {
    match: n => !Editor.isEditor(n) && Element.isElement(n) && n.type === format,
  });
  return !!match;
};

const toggleBlock = (editor, format) => {
  const isActive = isBlockActive(editor, format);
  
  Transforms.setNodes(
    editor,
    { type: isActive ? 'paragraph' : format },
    { match: n => !Editor.isEditor(n) && Element.isElement(n) }
  );
};

// 코드 블록에서 Enter 키 처리 (개선된 버전)
const handleCodeBlockEnter = (editor) => {
  const { selection } = editor;
  if (!selection) return false;

  const [currentNode] = Editor.node(editor, selection);
  const currentText = currentNode.text || '';
  
  // 현재 줄이 비어있는지 확인
  const beforeCursor = currentText.slice(0, selection.anchor.offset);
  const lines = beforeCursor.split('\n');
  const currentLine = lines[lines.length - 1];
  
  // 빈 줄에서 Enter를 누르면 코드 블록 탈출
  if (currentLine.trim() === '') {
    // 코드 블록을 일반 텍스트로 변경
    Transforms.setNodes(editor, { type: 'paragraph' });
    return true;
  }
  
  // 일반 줄바꿈
  Editor.insertText(editor, '\n');
  return true;
};

// 모던한 호버 툴바 컴포넌트
const ModernHoverToolbar = ({ editor, visible, position, onColorPickerToggle }) => {
  if (!visible) return null;

  const formatButtons = [
    { format: 'bold', icon: <FormatBold />, tooltip: '볼드 (Ctrl+B)' },
    { format: 'italic', icon: <FormatItalic />, tooltip: '이탤릭 (Ctrl+I)' },
    { format: 'underline', icon: <FormatUnderlined />, tooltip: '언더라인 (Ctrl+U)' },
  ];

  return (
    <Card
      sx={{
        position: 'absolute',
        top: position.top - 70,
        left: position.left,
        zIndex: 1000,
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        borderRadius: 2,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.2)',
      }}
    >
      <Box sx={{ display: 'flex', p: 0.5 }}>
        {formatButtons.map(({ format, icon, tooltip }) => (
          <Tooltip key={format} title={tooltip} arrow>
            <IconButton
              size="small"
              onMouseDown={(e) => {
                e.preventDefault();
                toggleMark(editor, format);
              }}
              sx={{
                color: 'white',
                backgroundColor: isMarkActive(editor, format) ? 'rgba(255,255,255,0.3)' : 'transparent',
                '&:hover': { 
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  transform: 'scale(1.1)',
                },
                transition: 'all 0.2s ease',
                mx: 0.5,
              }}
            >
              {icon}
            </IconButton>
          </Tooltip>
        ))}
        
        <Tooltip title="텍스트 색상" arrow>
          <IconButton
            size="small"
            onClick={onColorPickerToggle}
            sx={{
              color: 'white',
              '&:hover': { 
                backgroundColor: 'rgba(255,255,255,0.2)',
                transform: 'scale(1.1)',
              },
              transition: 'all 0.2s ease',
              mx: 0.5,
            }}
          >
            <Palette />
          </IconButton>
        </Tooltip>
      </Box>
    </Card>
  );
};

// 상태 인디케이터 컴포넌트
const StatusIndicator = ({ lastSaved }) => {
  const timeDiff = (new Date() - lastSaved) / 1000;
  const isRecent = timeDiff < 10;
  
  return (
    <Chip
      icon={isRecent ? <CheckCircle /> : <Schedule />}
      label={isRecent ? '저장됨' : `${Math.floor(timeDiff)}초 전 저장`}
      color={isRecent ? 'success' : 'default'}
      size="small"
      variant="outlined"
      sx={{
        background: isRecent ? 'linear-gradient(45deg, #4caf50, #8bc34a)' : 'transparent',
        color: isRecent ? 'white' : 'inherit',
        '& .MuiChip-icon': {
          color: isRecent ? 'white' : 'inherit',
        }
      }}
    />
  );
};

// 이미지 크기 옵션
const IMAGE_SIZES = [
  { key: 'small', label: '작게', width: '25%' },
  { key: 'medium', label: '보통', width: '50%' },
  { key: 'large', label: '크게', width: '75%' },
  { key: 'full', label: '전체 너비', width: '100%' },
];

function CreatePost() {
  const initialValue = [
    {
      type: 'paragraph',
      children: [{ text: '' }],
    },
  ];

  const [value, setValue] = useState(initialValue);
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashMenuPosition, setSlashMenuPosition] = useState({ top: 0, left: 0 });
  const [selectedCommandIndex, setSelectedCommandIndex] = useState(0);
  const [filteredCommands, setFilteredCommands] = useState(SLASH_COMMANDS);
  const [showHoverToolbar, setShowHoverToolbar] = useState(false);
  const [hoverToolbarPosition, setHoverToolbarPosition] = useState({ top: 0, left: 0 });
  const [lastSaved, setLastSaved] = useState(new Date());
  const [selectedImagePath, setSelectedImagePath] = useState(null);
  const [showImageResizeMenu, setShowImageResizeMenu] = useState(false);
  const [imageMenuPosition, setImageMenuPosition] = useState({ top: 0, left: 0 });
  const [showCursorHelp, setShowCursorHelp] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [colorPickerPosition, setColorPickerPosition] = useState({ top: 0, left: 0 });
  
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);
  const slashMenuRef = useRef(null);
  const fileInputRef = useRef(null);
  const editorRef = useRef(null);

  // 1. toggleColorPicker를 가장 먼저 정의
  const toggleColorPicker = useCallback((event) => {
    if (event) {
      const rect = event.target.getBoundingClientRect();
      setColorPickerPosition({
        top: rect.bottom + window.scrollY + 5,
        left: rect.left + window.scrollX,
      });
    }
    setShowColorPicker(prev => !prev);
  }, []);

  // 2. applyTextColor 정의
  const applyTextColor = useCallback((colorKey) => {
    if (colorKey === 'default') {
      Editor.removeMark(editor, 'color');
    } else {
      const color = TEXT_COLORS.find(c => c.key === colorKey)?.color;
      if (color) {
        Editor.addMark(editor, 'color', color);
      }
    }
    setShowColorPicker(false);
  }, [editor]);

  // 자동저장 (5초마다)
  useEffect(() => {
    const autoSave = setInterval(() => {
      console.log('자동저장:', value);
      setLastSaved(new Date());
    }, 5000);

    return () => clearInterval(autoSave);
  }, [value]);

  // 선택 영역 변경 감지 (호버 툴바용)
  const updateHoverToolbar = useCallback(() => {
    const { selection } = editor;
    
    if (!selection || Range.isCollapsed(selection)) {
      setShowHoverToolbar(false);
      return;
    }

    try {
      const domSelection = window.getSelection();
      const domRange = domSelection.getRangeAt(0);
      const rect = domRange.getBoundingClientRect();
      
      setHoverToolbarPosition({
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX + rect.width / 2 - 100,
      });
      setShowHoverToolbar(true);
    } catch (error) {
      setShowHoverToolbar(false);
    }
  }, [editor]);

  // 수동 저장
  const handleSave = useCallback(() => {
    console.log('수동 저장:', value);
    setLastSaved(new Date());
  }, [value]);

  // 파일 선택 핸들러
  const handleFileSelect = useCallback((event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      insertImage(editor, file);
    }
    event.target.value = '';
  }, [editor]);

  // 개선된 슬래시 명령어 실행 (문제 2 해결)
  const executeSlashCommand = useCallback((command) => {
    const { selection } = editor;
    if (!selection) return;

    // 현재 블록의 전체 텍스트를 가져와서 슬래시 위치 찾기
    const [start] = Range.edges(selection);
    const blockStart = Editor.start(editor, Editor.above(editor, { match: n => Element.isElement(n) })[1]);
    const beforeRange = { anchor: blockStart, focus: start };
    const beforeText = Editor.string(editor, beforeRange);
    
    // 슬래시 위치 찾기
    const slashIndex = beforeText.lastIndexOf('/');
    if (slashIndex !== -1) {
      // 슬래시부터 현재 위치까지 선택하여 삭제
      const slashPoint = {
        path: start.path,
        offset: slashIndex
      };
      
      Transforms.select(editor, {
        anchor: slashPoint,
        focus: start,
      });
      Transforms.delete(editor);
    }

    if (command.type === 'image') {
      fileInputRef.current?.click();
    } else {
      toggleBlock(editor, command.type);
    }
    
    setShowSlashMenu(false);
  }, [editor]);

  // 드래그 앤 드롭 핸들러
  const onDrop = useCallback((event) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (imageFile) {
      insertImage(editor, imageFile);
    }
  }, [editor]);

  const onDragOver = useCallback((event) => {
    event.preventDefault();
  }, []);

  // 붙여넣기 핸들러
  const onPaste = useCallback((event) => {
    const items = Array.from(event.clipboardData.items);
    const imageItem = items.find(item => item.type.startsWith('image/'));
    
    if (imageItem) {
      event.preventDefault();
      const file = imageItem.getAsFile();
      if (file) {
        insertImage(editor, file);
      }
    }
  }, [editor]);

  // 5. onKeyDown은 마지막에 정의
  const onKeyDown = useCallback((event) => {
    if (event.key === 'F1') {
      event.preventDefault();
      setShowCursorHelp(prev => !prev);
      return;
    }

    // 슬래시 메뉴가 열려있을 때
    if (showSlashMenu) {
      switch (event.key) {
        case 'ArrowDown': {
          event.preventDefault();
          setSelectedCommandIndex(prev => 
            prev < filteredCommands.length - 1 ? prev + 1 : 0
          );
          break;
        }
        case 'ArrowUp': {
          event.preventDefault();
          setSelectedCommandIndex(prev => 
            prev > 0 ? prev - 1 : filteredCommands.length - 1
          );
          break;
        }
        case 'Enter': {
          event.preventDefault();
          executeSlashCommand(filteredCommands[selectedCommandIndex]);
          break;
        }
        case 'Escape': {
          event.preventDefault();
          setShowSlashMenu(false);
          break;
        }
        default:
          break;
      }
      return;
    }

    // 코드 블록에서 Enter 키 처리 (문제 1 해결)
    const [match] = Editor.nodes(editor, {
      match: n => !Editor.isEditor(n) && Element.isElement(n) && n.type === 'code-block',
    });
    
    if (match) {
      if (event.key === 'Enter') {
        event.preventDefault();
        if (event.shiftKey) {
          // Shift+Enter: 강제로 코드 블록 탈출
          Transforms.setNodes(editor, { type: 'paragraph' });
          return;
        }
        handleCodeBlockEnter(editor);
        return;
      }
      
      // 화살표 키로 탈출 (코드 블록 끝에서)
      if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
        const { selection } = editor;
        if (selection && Range.isCollapsed(selection)) {
          const [node] = Editor.node(editor, selection);
          const isAtEnd = selection.anchor.offset === node.text.length;
          
          if (isAtEnd && event.key === 'ArrowDown') {
            event.preventDefault();
            // 새 paragraph 추가하고 이동
            Transforms.insertNodes(editor, {
              type: 'paragraph',
              children: [{ text: '' }],
            });
            return;
          }
        }
      }
    }

    // Ctrl 키 조합 처리
    if (event.ctrlKey) {
      switch (event.key) {
        case 'b': {
          event.preventDefault();
          toggleMark(editor, 'bold');
          break;
        }
        case 'i': {
          event.preventDefault();
          toggleMark(editor, 'italic');
          break;
        }
        case 'u': {
          event.preventDefault();
          toggleMark(editor, 'underline');
          break;
        }
        case 'z': {
          event.preventDefault();
          if (event.shiftKey) {
            editor.redo();
          } else {
            editor.undo();
          }
          break;
        }
        case 'y': {
          event.preventDefault();
          editor.redo();
          break;
        }
        case 's': {
          event.preventDefault();
          handleSave();
          break;
        }
        case '1': {
          event.preventDefault();
          toggleBlock(editor, 'heading-one');
          break;
        }
        case '2': {
          event.preventDefault();
          toggleBlock(editor, 'heading-two');
          break;
        }
        case '3': {
          event.preventDefault();
          toggleBlock(editor, 'heading-three');
          break;
        }
        default:
          break;
      }
    }

    // Ctrl+Shift+C로 색상 피커 열기
    if (event.ctrlKey && event.shiftKey && event.key === 'C') {
      event.preventDefault();
      toggleColorPicker(event);
      return;
    }
  }, [editor, showSlashMenu, filteredCommands, selectedCommandIndex, executeSlashCommand, handleSave, toggleColorPicker]);

  // 텍스트 변경 감지
  const onChange = useCallback((newValue) => {
    setValue(newValue);
    setTimeout(updateHoverToolbar, 0);

    const { selection } = editor;
    if (!selection || !Range.isCollapsed(selection)) {
      setShowSlashMenu(false);
      return;
    }

    const [start] = Range.edges(selection);
    const blockStart = Editor.start(editor, Editor.above(editor, { match: n => Element.isElement(n) })[1]);
    const beforeRange = { anchor: blockStart, focus: start };
    const beforeText = Editor.string(editor, beforeRange);

    if (beforeText.includes('/')) {
      const slashIndex = beforeText.lastIndexOf('/');
      const searchText = beforeText.slice(slashIndex + 1);
      
      const filtered = SLASH_COMMANDS.filter(cmd => 
        cmd.key.includes(searchText.toLowerCase()) || 
        cmd.label.includes(searchText)
      );
      
      setFilteredCommands(filtered);
      setSelectedCommandIndex(0);
      setShowSlashMenu(true);

      try {
        const domSelection = window.getSelection();
        const domRange = domSelection.getRangeAt(0);
        const rect = domRange.getBoundingClientRect();
        const editorRect = editorRef.current.getBoundingClientRect();
        
        // 에디터 컨테이너 기준으로 상대 위치 계산
        setSlashMenuPosition({
          top: rect.bottom - editorRect.top + 5,
          left: rect.left - editorRect.left,
        });
      } catch (error) {
        // 기본 위치로 폴백
        setSlashMenuPosition({ top: 50, left: 50 });
      }
    } else {
      setShowSlashMenu(false);
    }
  }, [editor, updateHoverToolbar]);

  // 블록 렌더링 함수
  const renderElement = useCallback((props) => {
    const { attributes, children, element } = props;

    const baseStyle = {
      margin: '12px 0',
      transition: 'all 0.2s ease',
    };

    switch (element.type) {
      case 'heading-one':
        return (
          <Typography 
            variant="h3" 
            component="h1" 
            {...attributes} 
            sx={{ 
              ...baseStyle,
              fontWeight: 700,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.02em',
            }}
          >
            {children}
          </Typography>
        );
      case 'heading-two':
        return (
          <Typography 
            variant="h4" 
            component="h2" 
            {...attributes} 
            sx={{ 
              ...baseStyle,
              fontWeight: 600,
              color: '#1976d2',
              letterSpacing: '-0.01em',
            }}
          >
            {children}
          </Typography>
        );
      case 'heading-three':
        return (
          <Typography 
            variant="h5" 
            component="h3" 
            {...attributes} 
            sx={{ 
              ...baseStyle,
              fontWeight: 600,
              color: '#1976d2',
            }}
          >
            {children}
          </Typography>
        );
      case 'block-quote':
        return (
          <Card 
            {...attributes} 
            sx={{ 
              ...baseStyle,
              background: 'linear-gradient(135deg, #ffa726 0%, #fb8c00 100%)',
              color: 'white',
              borderRadius: 2,
            }}
          >
            <CardContent sx={{ py: 2 }}>
              <Typography variant="body1" sx={{ fontStyle: 'italic', fontSize: '1.1em' }}>
                {children}
              </Typography>
            </CardContent>
          </Card>
        );
      case 'bulleted-list':
        return <Box component="ul" {...attributes} sx={{ ...baseStyle, pl: 3, '& li': { mb: 1 } }}>{children}</Box>;
      case 'numbered-list':
        return <Box component="ol" {...attributes} sx={{ ...baseStyle, pl: 3, '& li': { mb: 1 } }}>{children}</Box>;
      case 'list-item':
        return <Typography component="li" {...attributes} sx={{ lineHeight: 1.8 }}>{children}</Typography>;
      case 'code-block':
        return (
          <Card 
            {...attributes} 
            sx={{ 
              ...baseStyle,
              backgroundColor: '#1e1e1e',
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            <Box sx={{ 
              backgroundColor: '#2d2d2d', 
              px: 2, 
              py: 1, 
              borderBottom: '1px solid #404040' 
            }}>
              <Typography variant="caption" sx={{ color: '#9e9e9e', fontWeight: 500 }}>
                CODE
              </Typography>
            </Box>
            <CardContent>
              <Typography
                component="pre"
                sx={{ 
                  fontFamily: '"Fira Code", "Monaco", "Menlo", monospace',
                  fontSize: '14px',
                  color: '#e0e0e0',
                  margin: 0,
                  whiteSpace: 'pre-wrap',
                  lineHeight: 1.6,
                }}
              >
                <code>{children}</code>
              </Typography>
            </CardContent>
          </Card>
        );
      case 'image':
        const imageSize = element.size || 'medium';
        const sizeConfig = IMAGE_SIZES.find(s => s.key === imageSize) || IMAGE_SIZES[1];
        
        return (
          <Card 
            {...attributes} 
            contentEditable={false} 
            sx={{ 
              ...baseStyle, 
              overflow: 'hidden',
              width: sizeConfig.width,
              margin: '16px auto',
              position: 'relative',
              '&:hover': {
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              },
              cursor: 'pointer',
            }}
          >
            <img 
              src={element.src} 
              alt={element.alt || '이미지'}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                
                // 안전 가드 추가
                try {
                  const path = ReactEditor.findPath(editor, element);
                  if (path) {
                    handleImageClick(e, element, path);
                  }
                } catch (error) {
                  console.warn('이미지 경로를 찾을 수 없습니다:', error);
                }
              }}
              style={{ 
                width: '100%', 
                height: 'auto',
                display: 'block'
              }}
            />
            {children}
          </Card>
        );
      default:
        return (
          <Typography 
            component="p" 
            {...attributes} 
            sx={{ 
              ...baseStyle,
              fontSize: '16px',
              lineHeight: 1.7,
              color: '#333',
            }}
          >
            {children}
          </Typography>
        );
    }
  }, []);

  // 텍스트 렌더링 함수
  const renderLeaf = useCallback((props) => {
    let { attributes, children, leaf } = props;

    if (leaf.bold) {
      children = <Box component="strong" sx={{ fontWeight: 700 }}>{children}</Box>;
    }

    if (leaf.italic) {
      children = <Box component="em" sx={{ fontStyle: 'italic' }}>{children}</Box>;
    }

    if (leaf.underline) {
      children = <Box component="u" sx={{ textDecoration: 'underline' }}>{children}</Box>;
    }

    // 색상 적용 (중요!)
    if (leaf.color) {
      children = <Box component="span" sx={{ color: leaf.color }}>{children}</Box>;
    }

    return <span {...attributes}>{children}</span>;
  }, []);

  // 이미지 크기 변경 함수
  const changeImageSize = useCallback((size) => {
    if (!selectedImagePath) return;
    
    Transforms.setNodes(
      editor,
      { size: size },
      { at: selectedImagePath }
    );
    
    setShowImageResizeMenu(false);
    setSelectedImagePath(null);
  }, [editor, selectedImagePath]);

  // 이미지 클릭 핸들러
  const handleImageClick = useCallback((event, element, path) => {
    event.preventDefault();
    event.stopPropagation();
    
    const rect = event.target.getBoundingClientRect();
    setImageMenuPosition({
      top: rect.bottom + window.scrollY + 5,
      left: rect.left + window.scrollX,
    });
    
    setSelectedImagePath(path);
    setShowImageResizeMenu(true);
  }, [setImageMenuPosition, setSelectedImagePath, setShowImageResizeMenu]);

  // 마우스 움직임 추적
  const handleMouseMove = useCallback((event) => {
    setCursorPosition({
      x: event.clientX,
      y: event.clientY
    });
  }, []);

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      py: 4,
    }}>
      <Container maxWidth="lg">
        {/* 헤더 */}
        <Card sx={{ 
          mb: 3, 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          borderRadius: 3,
          overflow: 'hidden',
        }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
                  <AutoAwesome />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                    열심히 개발하자..
                  </Typography>
                </Box>
              </Box>
              
              <Stack direction="row" spacing={1} alignItems="center">
                <StatusIndicator lastSaved={lastSaved} />
                <Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(255,255,255,0.3)' }} />
                <Tooltip title="실행취소 (Ctrl+Z)">
                  <IconButton 
                    onClick={() => editor.undo()} 
                    disabled={!editor.history.undos.length}
                    sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
                  >
                    <Undo />
                  </IconButton>
                </Tooltip>
                <Tooltip title="다시실행 (Ctrl+Y)">
                  <IconButton 
                    onClick={() => editor.redo()} 
                    disabled={!editor.history.redos.length}
                    sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
                  >
                    <Redo />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        {/* 에디터 */}
        <Card 
          ref={editorRef}
          sx={{ 
            borderRadius: 3,
            boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
            overflow: 'visible',
            background: 'white',
            position: 'relative',
            minHeight: 700,
          }}
          onDrop={onDrop}
          onDragOver={onDragOver}
        >
          <CardContent sx={{ p: 4 }}>
            {/* 도움말을 여기로 이동 */}
            <Box sx={{ 
              mb: 2, 
              p: 1, 
              backgroundColor: '#f0f8ff', 
              borderRadius: 1,
              textAlign: 'center'
            }}>
              <Typography variant="caption" color="text.secondary">
                눌러 도움말을 확인하세요
              </Typography>
            </Box>

            <Slate 
              editor={editor} 
              initialValue={initialValue}
              onChange={onChange}
            >
              <Editable
                renderElement={renderElement}
                renderLeaf={renderLeaf}
                onKeyDown={onKeyDown}
                onPaste={onPaste}
                onMouseMove={handleMouseMove}
                style={{
                  outline: 'none',
                  fontSize: '16px',
                  lineHeight: '1.7',
                  minHeight: '600px',
                }}
              />
            </Slate>

            {/* 호버 툴바 */}
            <ModernHoverToolbar 
              editor={editor}
              visible={showHoverToolbar}
              position={hoverToolbarPosition}
              onColorPickerToggle={toggleColorPicker}
            />

            {/* 슬래시 명령어 메뉴 */}
            {showSlashMenu && (
              <Card
                ref={slashMenuRef}
                sx={{
                  position: 'absolute',
                  top: slashMenuPosition.top,
                  left: slashMenuPosition.left,
                  minWidth: 280,
                  maxHeight: 300,
                  overflow: 'auto',
                  zIndex: 1000,
                  boxShadow: '0 12px 48px rgba(0,0,0,0.15)',
                  borderRadius: 2,
                  border: '1px solid #e0e0e0',
                  maxWidth: 'calc(100% - 40px)',
                }}
              >
                <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    블록 선택
                  </Typography>
                </Box>
                <List dense sx={{ p: 0 }}>
                  {filteredCommands.map((command, index) => (
                    <ListItem
                      key={command.key}
                      onClick={() => executeSlashCommand(command)}
                      sx={{
                        cursor: 'pointer',
                        backgroundColor: index === selectedCommandIndex ? '#f5f5f5' : 'transparent',
                        '&:hover': {
                          backgroundColor: '#f0f8ff',
                        },
                        py: 1.5,
                        px: 2,
                      }}
                    >
                      <Box sx={{ mr: 2, display: 'flex', alignItems: 'center', minWidth: 32 }}>
                        {command.icon}
                      </Box>
                      <ListItemText 
                        primary={
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {command.label}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="caption" color="text.secondary">
                            {command.description} • /{command.key}
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Card>
            )}

            {showImageResizeMenu && (
              <Card
                sx={{
                  position: 'absolute',
                  top: imageMenuPosition.top,
                  left: imageMenuPosition.left,
                  minWidth: 200,
                  zIndex: 1000,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                  borderRadius: 2,
                  border: '1px solid #e0e0e0',
                }}
              >
                <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    이미지 크기
                  </Typography>
                </Box>
                <List dense sx={{ p: 0 }}>
                  {IMAGE_SIZES.map((size) => (
                    <ListItem
                      key={size.key}
                      onClick={() => changeImageSize(size.key)}
                      sx={{
                        cursor: 'pointer',
                        '&:hover': {
                          backgroundColor: '#f0f8ff',
                        },
                        py: 1,
                        px: 2,
                      }}
                    >
                      <ListItemText 
                        primary={
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {size.label}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="caption" color="text.secondary">
                            {size.width}
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Card>
            )}

            {showCursorHelp && (
              <Card
                sx={{
                  position: 'fixed',
                  top: cursorPosition.y + 10,
                  left: cursorPosition.x + 10,
                  minWidth: 250,
                  maxWidth: 350,
                  zIndex: 9999,
                  boxShadow: '0 12px 48px rgba(0,0,0,0.2)',
                  borderRadius: 2,
                  border: '2px solid #667eea',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                }}
              >
                <Box sx={{ 
                  p: 2, 
                  borderBottom: '1px solid rgba(255,255,255,0.2)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    💡 단축키 도움말
                  </Typography>
                  <IconButton 
                    size="small" 
                    onClick={() => setShowCursorHelp(prev => !prev)}
                    sx={{ color: 'white' }}
                  >
                    <Close fontSize="small" />
                  </IconButton>
                </Box>
                <Box sx={{ p: 2 }}>
                  <Stack spacing={1}>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      <strong>Ctrl+B</strong> - 볼드
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      <strong>Ctrl+I</strong> - 이탤릭
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      <strong>Ctrl+U</strong> - 언더라인
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      <strong>/</strong> - 명령어 메뉴
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      <strong>빈줄 Enter</strong> - 코드블록 탈출
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      <strong>Shift+Enter</strong> - 강제 코드블록 탈출
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      <strong>드래그&드롭</strong> - 이미지 업로드
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      <strong>F1</strong> - 이 도움말 토글
                    </Typography>
                  </Stack>
                </Box>
              </Card>
            )}

            {showColorPicker && (
              <Card
                sx={{
                  position: 'fixed',
                  top: colorPickerPosition.top,
                  left: colorPickerPosition.left,
                  minWidth: 250,
                  zIndex: 9999,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                  borderRadius: 2,
                  border: '1px solid #e0e0e0',
                }}
              >
                <Box sx={{ 
                  p: 2, 
                  borderBottom: '1px solid #e0e0e0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    텍스트 색상
                  </Typography>
                  <IconButton 
                    size="small" 
                    onClick={() => setShowColorPicker(false)}
                  >
                    <Close fontSize="small" />
                  </IconButton>
                </Box>
                <Box sx={{ p: 2 }}>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 1 }}>
                    {TEXT_COLORS.map((color) => (
                      <Tooltip key={color.key} title={color.label} arrow>
                        <Box
                          onClick={() => applyTextColor(color.key)}
                          sx={{
                            width: 40,
                            height: 40,
                            backgroundColor: color.color,
                            borderRadius: 1,
                            cursor: 'pointer',
                            border: color.key === 'default' ? '2px solid #ccc' : '2px solid transparent',
                            '&:hover': {
                              transform: 'scale(1.1)',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                            },
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {color.key === 'default' && (
                            <Typography variant="caption" sx={{ color: 'white', fontWeight: 'bold' }}>
                              A
                            </Typography>
                          )}
                        </Box>
                      </Tooltip>
                    ))}
                  </Box>
                </Box>
              </Card>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
          </CardContent>
        </Card>

        {/* 플로팅 저장 버튼 */}
        <Fab
          color="primary"
          onClick={handleSave}
          sx={{
            position: 'fixed',
            bottom: 32,
            right: 32,
            background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
            '&:hover': {
              background: 'linear-gradient(45deg, #5a6fd8 30%, #6a4190 90%)',
              transform: 'scale(1.1)',
            },
            transition: 'all 0.3s ease',
            boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
          }}
        >
          <Save />
        </Fab>
      </Container>
    </Box>
  );
}

export default CreatePost;