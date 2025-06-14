import React, { useState } from 'react';
import {
  Container,
  Card,
  CardContent,
  TextField,
  Typography,
  Box,
  Fab,
  Chip,
  Stack,
  IconButton,
  Tooltip,
  Divider,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import CodeIcon from '@mui/icons-material/Code';
import PreviewIcon from '@mui/icons-material/Preview';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';

function CreatePost() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    tags: [],
    excerpt: ''
  });
  const [tagInput, setTagInput] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);

  const categories = ['프론트엔드', '백엔드', 'DevOps', '알고리즘', '일상'];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handlePublish = async () => {
    // TODO: API 호출하여 포스트 저장
    console.log('포스트 발행:', formData);
    setPublishDialogOpen(false);
    // navigate('/blog');
  };

  const insertMarkdown = (syntax) => {
    // 마크다운 문법 삽입 로직
    const textarea = document.getElementById('content-textarea');
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = formData.content.substring(start, end);
      let newText = '';
      
      switch (syntax) {
        case 'bold':
          newText = `**${selectedText || '굵은 텍스트'}**`;
          break;
        case 'italic':
          newText = `*${selectedText || '기울임 텍스트'}*`;
          break;
        case 'code':
          newText = selectedText.includes('\n') 
            ? `\`\`\`\n${selectedText || '코드 블록'}\n\`\`\``
            : `\`${selectedText || '인라인 코드'}\``;
          break;
        default:
          return;
      }
      
      const updatedContent = 
        formData.content.substring(0, start) + 
        newText + 
        formData.content.substring(end);
      
      handleInputChange('content', updatedContent);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 6, mb: 6 }}>
      <Card 
        elevation={0} 
        sx={{ 
          border: '1px solid', 
          borderColor: 'divider',
          borderRadius: 3,
          overflow: 'visible'
        }}
      >
        <CardContent sx={{ p: 5 }}>
          {/* 제목 입력 */}
          <TextField
            fullWidth
            variant="standard"
            placeholder="무엇에 대해 쓰고 싶나요?"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            InputProps={{ 
              disableUnderline: true,
              sx: {
                fontSize: '2.5rem',
                fontWeight: 600,
                color: 'text.primary',
                '& input::placeholder': {
                  color: 'text.secondary',
                  opacity: 0.7
                }
              }
            }}
            sx={{ mb: 4 }}
          />

          {/* 툴바 */}
          <Box sx={{ mb: 3, pb: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Tooltip title="굵게 (Ctrl+B)">
                <IconButton 
                  size="small" 
                  onClick={() => insertMarkdown('bold')}
                  sx={{ 
                    '&:hover': { 
                      backgroundColor: 'action.hover',
                      transform: 'scale(1.1)'
                    }
                  }}
                >
                  <FormatBoldIcon />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="기울임 (Ctrl+I)">
                <IconButton 
                  size="small" 
                  onClick={() => insertMarkdown('italic')}
                  sx={{ 
                    '&:hover': { 
                      backgroundColor: 'action.hover',
                      transform: 'scale(1.1)'
                    }
                  }}
                >
                  <FormatItalicIcon />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="코드 블록">
                <IconButton 
                  size="small" 
                  onClick={() => insertMarkdown('code')}
                  sx={{ 
                    '&:hover': { 
                      backgroundColor: 'action.hover',
                      transform: 'scale(1.1)'
                    }
                  }}
                >
                  <CodeIcon />
                </IconButton>
              </Tooltip>
              
              <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
              
              <Tooltip title="파일 첨부">
                <IconButton 
                  size="small"
                  sx={{ 
                    '&:hover': { 
                      backgroundColor: 'action.hover',
                      transform: 'scale(1.1)'
                    }
                  }}
                >
                  <AttachFileIcon />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="미리보기">
                <IconButton 
                  size="small"
                  onClick={() => setPreviewOpen(true)}
                  sx={{ 
                    '&:hover': { 
                      backgroundColor: 'action.hover',
                      transform: 'scale(1.1)'
                    }
                  }}
                >
                  <PreviewIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          </Box>

          {/* 내용 입력 */}
          <TextField
            id="content-textarea"
            fullWidth
            multiline
            rows={15}
            variant="standard"
            placeholder="여기에 내용을 작성하세요...

마크다운 문법을 지원합니다:
- **굵은 텍스트**
- *기울임 텍스트*
- `인라인 코드`
- 코드 블록은 ```로 감싸세요

당신의 이야기를 들려주세요! ✨"
            value={formData.content}
            onChange={(e) => handleInputChange('content', e.target.value)}
            InputProps={{ 
              disableUnderline: true,
              sx: {
                fontSize: '1.125rem',
                lineHeight: 1.7,
                '& textarea::placeholder': {
                  color: 'text.secondary',
                  opacity: 0.7
                }
              }
            }}
            sx={{ mb: 4 }}
          />

          {/* 태그 입력 */}
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              variant="standard"
              placeholder="태그를 추가하세요... (Enter로 추가)"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
              InputProps={{ 
                disableUnderline: true,
                sx: {
                  fontSize: '1rem',
                  color: 'text.secondary'
                }
              }}
              sx={{ mb: 2 }}
            />

            {/* 태그 목록 */}
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {formData.tags.map((tag, index) => (
                <Chip
                  key={index}
                  label={tag}
                  variant="outlined"
                  size="small"
                  onDelete={() => handleRemoveTag(tag)}
                  sx={{
                    borderRadius: 2,
                    '&:hover': {
                      backgroundColor: 'action.hover'
                    }
                  }}
                />
              ))}
              <Chip
                icon={<AddIcon />}
                label="태그 추가"
                variant="outlined"
                size="small"
                onClick={handleAddTag}
                disabled={!tagInput.trim()}
                sx={{
                  borderRadius: 2,
                  cursor: 'pointer',
                  '&:hover:not(.Mui-disabled)': {
                    backgroundColor: 'primary.light',
                    color: 'primary.contrastText'
                  }
                }}
              />
            </Stack>
          </Box>
        </CardContent>
      </Card>

      {/* 플로팅 발행 버튼 */}
      <Fab
        color="primary"
        onClick={() => setPublishDialogOpen(true)}
        disabled={!formData.title.trim() || !formData.content.trim()}
        sx={{
          position: 'fixed',
          bottom: 32,
          right: 32,
          boxShadow: 3,
          '&:hover': {
            transform: 'scale(1.1)',
            boxShadow: 6
          },
          transition: 'all 0.3s ease'
        }}
      >
        <SendIcon />
      </Fab>

      {/* 미리보기 다이얼로그 */}
      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h5">미리보기</Typography>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Paper elevation={0} sx={{ p: 3, backgroundColor: 'background.default' }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
              {formData.title || '제목을 입력하세요'}
            </Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
              {formData.content || '내용을 입력하세요'}
            </Typography>
            {formData.tags.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {formData.tags.map((tag, index) => (
                    <Chip key={index} label={tag} size="small" />
                  ))}
                </Stack>
              </Box>
            )}
          </Paper>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>닫기</Button>
        </DialogActions>
      </Dialog>

      {/* 발행 설정 다이얼로그 */}
      <Dialog
        open={publishDialogOpen}
        onClose={() => setPublishDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle>
          <Typography variant="h6">포스트 발행</Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>카테고리</InputLabel>
              <Select
                value={formData.category}
                label="카테고리"
                onChange={(e) => handleInputChange('category', e.target.value)}
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="포스트 요약"
              multiline
              rows={3}
              placeholder="포스트에 대한 간단한 설명을 입력하세요..."
              value={formData.excerpt}
              onChange={(e) => handleInputChange('excerpt', e.target.value)}
              sx={{ mb: 2 }}
            />

            <Typography variant="body2" color="text.secondary">
              제목: {formData.title || '(제목 없음)'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              내용 길이: {formData.content.length}자
            </Typography>
            <Typography variant="body2" color="text.secondary">
              태그: {formData.tags.join(', ') || '(태그 없음)'}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPublishDialogOpen(false)}>취소</Button>
          <Button 
            variant="contained" 
            onClick={handlePublish}
            disabled={!formData.category || !formData.excerpt.trim()}
          >
            발행하기
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default CreatePost;