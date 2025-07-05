import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
    Stack,
    Snackbar,
    Alert
} from '@mui/material';
import { Save as SaveIcon, Cancel as CancelIcon } from '@mui/icons-material';
import createPost from '../api/postApi';
import imageUploader from '../api/imgPostApi';

export default function CreatePost() {
    const navigate = useNavigate();
    
    // 상태 관리
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [category, setCategory] = useState('');
    const [mounted, setMounted] = useState(false); // 컴포넌트 마운트 확인용
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });
    const [isLoading, setIsLoading] = useState(false);
    
    // 에디터 참조 생성
    const quillRef = useRef(null);
    const timeoutRef = useRef(null);
    const abortControllerRef = useRef(null);

    // 컴포넌트 마운트 확인
    useEffect(() => {
        setMounted(true);
    }, []);

    // 붙여넣기 시 자동으로 이미지 업로드
useEffect(() => {
    if (!mounted || !quillRef.current) return;

    const quill = quillRef.current.getEditor();
    
    const handleTextChange = async (delta, oldDelta, source) => {
        if (source !== 'user') return;
        
        // 새로 추가된 이미지 찾기
        const images = quill.container.querySelectorAll('img[src^="data:"]');
        
        for (const img of images) {
            try {
                const res = await fetch(img.src);
                const blob = await res.blob();
                const file = new File([blob], 'image.png', { type: blob.type });
                
                const imageUrl = await imageUploader(file);
                img.src = imageUrl; // 직접 src 교체
            } catch (error) {
                console.error('이미지 업로드 실패:', error);
            }
        }
    };
    
    quill.on('text-change', handleTextChange);
    
    return () => {
        quill.off('text-change', handleTextChange);
    };
}, [mounted]);




    // 이미지 핸들러를 useCallback으로 메모이제이션
    const imageHandler = useCallback(() => {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();

        input.onchange = async () => {
            const file = input.files[0];
            
            if (file.size > 5 * 1024 * 1024) {
                alert('파일 크기는 5MB 이하여야 합니다.');
                return;
            }
            
            try {
                const imageUrl = await imageUploader(file);
               
                const editor = quillRef.current.getEditor();
                const range = editor.getSelection();    
                editor.insertEmbed(range.index, 'image', imageUrl);
                editor.setSelection(range.index + 1);
            } catch (error) {
                console.error('이미지 업로드 실패:', error);
                alert('이미지 업로드 실패');
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

    const handleSave = async () => {
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
        };      
        
        try {
            setIsLoading(true);
            
            // AbortController 생성
            abortControllerRef.current = new AbortController();
            
            // axios 요청에 signal 추가 필요 (createPost API 수정 필요)
            const result = await createPost(postData, abortControllerRef.current.signal);
            
            //여기서 중단되면 아래 코드 실행 안됨
            console.log('게시글 생성 성공:', result);
            
            // 성공 알림
            setSnackbar({
                open: true,
                message: '게시글이 성공적으로 저장되었습니다! 🎉',
                severity: 'success'
            });
            
            // 1초 후 페이지 이동
            timeoutRef.current = setTimeout(() => {
                navigate('/');
            }, 1000);
            
        } catch (error) {
            setIsLoading(false);
            
            if (error.name === 'AbortError') {
                // 🔥 취소된 경우 - 저장 안됨
                console.log('저장이 취소되었습니다.');
                setSnackbar({
                    open: true,
                    message: '저장이 취소되었습니다.',
                    severity: 'info'
                });
            } else {
                // 실제 에러
                console.error('게시글 생성 실패:', error);
                setSnackbar({
                    open: true,
                    message: '게시글 저장에 실패했습니다. 😢',
                    severity: 'error'
                });
            }
        }
    };

    const handleCancel = () => {
        // 진행 중인 모든 작업 취소
        if (abortControllerRef.current) {
            abortControllerRef.current.abort(); //  API 요청 취소
        }
        
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current); //  타이머 취소
        }
        
        setIsLoading(false); //로딩 상태 초기화
        
        // 내용이 있으면 확인 후 이동
        if (title || (content && content !== '<p><br></p>')) {
            if (window.confirm('작성 중인 내용이 있습니다. 정말 취소하시겠습니까?')) {
                navigate('/');
            }
        } else {
            navigate('/');
        }
    };

    // 컴포넌트 언마운트 시 정리
    useEffect(() => {
        return () => {
            // 컴포넌트 언마운트 시 정리
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

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
                            <MenuItem value="프론트">프론트</MenuItem>
                            <MenuItem value="백엔드">백엔드</MenuItem>
                            <MenuItem value="데이터베이스">데이터베이스</MenuItem>
                            <MenuItem value="보안">보안</MenuItem>
                            <MenuItem value="네트워크">네트워크</MenuItem>         
                            <MenuItem value="모의해킹">모의해킹</MenuItem> 
                            <MenuItem value="인공지능">인공지능</MenuItem>
                            <MenuItem value="주식">주식</MenuItem>
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
                            disabled={isLoading}
                            sx={{ px: 4 }}
                        >
                            {isLoading ? '저장 중...' : '저장'}
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
            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert 
                    onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    );
}

