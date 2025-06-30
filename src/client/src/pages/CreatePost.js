import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { 
    Container, 
    Paper, 
    TextField, 
    Typography, 
    Button, 
    Box, 
    FormControl, 
    InputLabel, 
    Select, 
    MenuItem,
    Stack
} from '@mui/material';
import { Save as SaveIcon, Cancel as CancelIcon } from '@mui/icons-material';

export default function CreatePost() {
    // 상태 관리
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [category, setCategory] = useState('');
    const [mounted, setMounted] = useState(false); // 컴포넌트 마운트 확인용
    
    // 에디터 참조 생성
    const quillRef = useRef(null);

    // 컴포넌트 마운트 확인
    useEffect(() => {
        setMounted(true);
    }, []);

    // 이미지 핸들러를 useCallback으로 메모이제이션
    const imageHandler = useCallback(() => {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();

        input.onchange = async () => {
            const file = input.files[0];
            
            // 파일 크기 체크
            if (file.size > 5 * 1024 * 1024) {
                alert('파일 크기는 5MB 이하여야 합니다.');
                return;
            }
            
            const formData = new FormData();
            formData.append('image', file);
            
            try {
                // Quill 인스턴스 가져오기
                const quill = quillRef.current?.getEditor();
                if (!quill) return;
                
                const range = quill.getSelection();
                
                // 로딩 텍스트 삽입
                quill.insertText(range.index, '이미지 업로드 중...');
                
                const response = await fetch(
                    `https://api.imgbb.com/1/upload?key=${process.env.REACT_APP_IMGBB_API_KEY || '115376878bc76479b9c6775a72f120aa'}`, 
                    {
                        method: 'POST',
                        body: formData
                    }
                );

                if (!response.ok) throw new Error('업로드 실패');
                
                const data = await response.json();
                const imageUrl = data.data.url;
                
                // 로딩 텍스트 제거
                quill.deleteText(range.index, 16);
                // 이미지 삽입
                quill.insertEmbed(range.index, 'image', imageUrl);
                
            } catch (error) {
                console.error('이미지 업로드 실패:', error);
                alert('이미지 업로드에 실패했습니다.');
                
                // 에러 시 로딩 텍스트 제거
                const quill = quillRef.current?.getEditor();
                if (quill) {
                    const text = quill.getText();
                    const loadingIndex = text.indexOf('이미지 업로드 중...');
                    if (loadingIndex !== -1) {
                        quill.deleteText(loadingIndex, 16);
                    }
                }
            }
        };
    }, []);

    // modules를 useMemo로 메모이제이션
    const modules = useMemo(() => ({
        toolbar: {
            container: [
                [{ header: [1, 2, false] }],
                ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                [{ list: 'ordered' }, { list: 'bullet' }],
                [{ script: 'sub' }, { script: 'super' }],
                ['link', 'image'],
                ['clean']
            ],
            handlers: {
                image: imageHandler
            }
        }
    }), [imageHandler]);

    // formats도 useMemo로 메모이제이션
    const formats = useMemo(() => [
        'header',
        'bold', 'italic', 'underline', 'strike', 'blockquote',
        'list', 'bullet', 'script',
        'link', 'image'
    ], []);

    // content 변경 핸들러
    const handleContentChange = useCallback((value) => {
        setContent(value);
    }, []);

    const handleSave = () => {
        // 유효성 검사
        if (!title.trim()) {
            alert('제목을 입력해주세요');
            return;
        }
        if (!category) {
            alert('카테고리를 선택해주세요');
            return;
        }
        if (!content.trim() || content === '<p><br></p>') {
            alert('내용을 입력해주세요');
            return;
        }
        
        const postData = {
            title: title.trim(),
            content,
            category,
            createdAt: new Date().toISOString()
        };
        
        console.log('저장할 데이터:', postData);
        // TODO: API 호출 로직 추가
    };

    const handleCancel = () => {
        if (title || (content && content !== '<p><br></p>')) {
            if (window.confirm('작성 중인 내용이 있습니다. 정말 취소하시겠습니까?')) {
                // TODO: 라우터로 이전 페이지 이동
                console.log('취소됨');
            }
        } else {
            // TODO: 라우터로 이전 페이지 이동
            console.log('취소됨');
        }
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Paper elevation={3} sx={{ p: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
                    새 글 작성
                </Typography>

                <Stack spacing={3}>
                    {/* 제목 입력 */}
                    <TextField
                        fullWidth
                        label="제목"
                        variant="outlined"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="제목을 입력하세요"
                        sx={{ 
                            '& .MuiInputBase-input': { 
                                fontSize: '1.5rem',
                                fontWeight: 600 
                            }
                        }}
                    />

                    {/* 카테고리 선택 */}
                    <FormControl sx={{ minWidth: 250 }}>
                        <InputLabel>카테고리</InputLabel>
                        <Select
                            value={category}
                            label="카테고리"
                            onChange={(e) => setCategory(e.target.value)}
                        >
                            <MenuItem value="">
                                <em>카테고리를 선택하세요</em>
                            </MenuItem>
                            <MenuItem value="tech">프론트</MenuItem>
                            <MenuItem value="life">백엔드</MenuItem>
                            <MenuItem value="travel">데이터베이스</MenuItem>
                            <MenuItem value="food">보안</MenuItem>
                            <MenuItem value="food">네트워크</MenuItem>         
                            <MenuItem value="food">모의해킹</MenuItem> 
                            <MenuItem value="food">인공지능</MenuItem>
                        </Select>
                    </FormControl>

                    {/* 에디터 */}
                    <Box sx={{ 
                        '& .quill': {
                            backgroundColor: '#fff',
                            borderRadius: 1
                        },
                        '& .ql-toolbar': {
                            borderRadius: '4px 4px 0 0',
                            borderColor: 'rgba(0, 0, 0, 0.23)',
                            position: 'sticky',
                            top: 0,
                            zIndex: 1,
                            backgroundColor: '#fff'
                        },
                        '& .ql-container': {
                            borderRadius: '0 0 4px 4px',
                            borderColor: 'rgba(0, 0, 0, 0.23)',
                            minHeight: '400px'
                        },
                        '& .ql-editor': {
                            minHeight: '400px',
                            fontSize: '16px'
                        }
                    }}>
                        {mounted && (
                            <ReactQuill
                                ref={quillRef}
                                theme='snow'
                                value={content}
                                onChange={handleContentChange}
                                modules={modules}
                                formats={formats}
                                preserveWhitespace
                            />
                        )}
                    </Box>
                    
                    {/* mounted 에 대해서...*/}
                    {/*마운트 확인되면 띄어주기*/}
                    {/*이전에 그전에 컴포넌트 띄어주니 문제가 생겨서 마운트 확인 후 띄어주는 방식으로 변경*/}
                    {/* 메모이제이션: 동일한 계산의 반복을 방지하기 위해 이전 결과를 메모리에 저장하는 최적화 기법*/}

                    {/* 버튼들 */}
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 3 }}>
                        <Button
                            variant="contained"
                            size="large"
                            startIcon={<SaveIcon />}
                            onClick={handleSave}
                            sx={{ px: 4 }}
                        >
                            저장
                        </Button>
                        <Button
                            variant="outlined"
                            size="large"
                            startIcon={<CancelIcon />}
                            onClick={handleCancel}
                            sx={{ px: 4 }}
                            color="secondary"
                        >
                            취소
                        </Button>
                    </Box>
                </Stack>
            </Paper>
        </Container>
    );
}

