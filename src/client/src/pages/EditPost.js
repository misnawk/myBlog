import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
    Alert,
    CircularProgress
} from '@mui/material';
import { Save as SaveIcon, Cancel as CancelIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { updatePost } from '../api/postApi';
import { getPost } from '../api/postGetApi';
import imageUploader from '../api/imgPostApi';
import { useAuth } from '../contexts/AuthContext';
import { CATEGORIES } from '../components/categories';
import { toast } from 'react-toastify';

export default function EditPost() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    
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
    const [loading, setLoading] = useState(true);
    
    // 에디터 참조 생성
    const quillRef = useRef(null);
    const timeoutRef = useRef(null);
    const abortControllerRef = useRef(null);

    // 컴포넌트 마운트 확인
    useEffect(() => {
        setMounted(true);
    }, []);

    // 페이지 설정
    useEffect(() => {
        // highlight.js는 이미 전역적으로 설정됨
    }, []);

    // 게시글 데이터 로드
    useEffect(() => {
        console.log(' EditPost 페이지 로딩 시작, ID:', id);
        
        const fetchPost = async () => {
            try {
                const postData = await getPost(id);
                console.log(' 수정할 게시글 데이터:', postData);
                
                // 작성자 확인
                if (!user || user.email !== postData.author?.email) {
                    toast.error('게시글 수정 권한이 없습니다.');
                    navigate('/blog');
                    return;
                }
                
                setTitle(postData.title || '');
                setContent(postData.content || '');
                setCategory(postData.category || '');
                
            } catch (error) {
                console.error(' 게시글 조회 실패:', error);
                toast.error('게시글을 불러오는데 실패했습니다.');
                navigate('/blog');
            } finally {
                setLoading(false);
            }
        };

        fetchPost();
    }, [id, user, navigate]);

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
                ['code-block', 'code'],  // 코드블록과 인라인 코드 추가
                ['link', 'image'],
                ['clean']
            ],
            handlers: {
                image: imageHandler
            }
        },
        // syntax 모듈 대신 기본 코드블록만 사용
    }), [imageHandler]);

    // formats도 useMemo로 메모이제이션
    const formats = useMemo(() => [
        'header',
        'bold', 'italic', 'underline', 'strike', 'blockquote',
        'list', 'bullet', 'script',
        'code-block', 'code',  // 코드블록과 인라인 코드 포맷 추가
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
            
            const result = await updatePost(id, postData);
            
            console.log('게시글 수정 성공:', result);
            
            // 성공 알림
            setSnackbar({
                open: true,
                message: '게시글이 성공적으로 수정되었습니다! 🎉',
                severity: 'success'
            });
            
            // 1초 후 상세 페이지로 이동
            timeoutRef.current = setTimeout(() => {
                navigate(`/blogDetail/${id}`);
            }, 1000);
            
        } catch (error) {
            setIsLoading(false);
            
            if (error.name === 'AbortError') {
                // 취소된 경우
                console.log('수정이 취소되었습니다.');
                setSnackbar({
                    open: true,
                    message: '수정이 취소되었습니다.',
                    severity: 'info'
                });
            } else if (error.response?.status === 401 || error.response?.status === 403) {
                // 토큰 만료 또는 권한 오류
                console.log('인증 오류 발생 - 자동 로그아웃 처리됨');
                toast.error('게시글 수정 권한이 없습니다.');
            } else {
                // 실제 에러
                console.error('게시글 수정 실패:', error);
                setSnackbar({
                    open: true,
                    message: '게시글 수정에 실패했습니다. 😢',
                    severity: 'error'
                });
            }
        }
    };

    const handleCancel = () => {
        // 진행 중인 모든 작업 취소
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        
        setIsLoading(false);
        
        // 상세 페이지로 이동
        navigate(`/blogDetail/${id}`);
    };

    // 컴포넌트 언마운트 시 정리
    useEffect(() => {
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress />
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate(`/blogDetail/${id}`)}
                sx={{ mb: 3 }}
            >
                게시글로 돌아가기
            </Button>

            <Paper elevation={3} sx={{ p: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
                    게시글 수정
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
                            {CATEGORIES.map((cat) => (
                                <MenuItem key={cat.id} value={cat.name}>
                                    {cat.name}
                                </MenuItem>
                            ))}
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
                        },
                        // 코드블록 스타일 개선 - 더 생생한 색상
                        '& .ql-syntax': {
                            backgroundColor: '#282c34 !important',
                            color: '#abb2bf !important',
                            padding: '20px !important',
                            borderRadius: '12px !important',
                            fontFamily: '"JetBrains Mono", "Fira Code", Consolas, Monaco, "Courier New", monospace !important',
                            fontSize: '14px !important',
                            lineHeight: '1.7 !important',
                            overflow: 'auto !important',
                            position: 'relative !important',
                            margin: '20px 0 !important',
                            border: '1px solid #3e4451 !important',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15) !important',
                            // 더 선명한 문법 하이라이팅 색상
                            '& .hljs-keyword, & .hljs-selector-tag': { color: '#c678dd !important' }, // 보라색 - 키워드
                            '& .hljs-string, & .hljs-attr': { color: '#98c379 !important' }, // 초록색 - 문자열
                            '& .hljs-number, & .hljs-literal': { color: '#d19a66 !important' }, // 주황색 - 숫자
                            '& .hljs-function, & .hljs-title': { color: '#61dafb !important' }, // 하늘색 - 함수
                            '& .hljs-comment': { color: '#5c6370 !important', fontStyle: 'italic' }, // 회색 - 주석
                            '& .hljs-variable, & .hljs-name': { color: '#e06c75 !important' }, // 빨간색 - 변수
                            '& .hljs-tag': { color: '#e06c75 !important' }, // 빨간색 - HTML 태그
                            '& .hljs-attribute': { color: '#d19a66 !important' }, // 주황색 - 속성
                            '& .hljs-built_in, & .hljs-type': { color: '#e5c07b !important' }, // 노란색 - 내장함수
                            '& .hljs-params': { color: '#abb2bf !important' }, // 기본색 - 매개변수
                            '& .hljs-meta': { color: '#56b6c2 !important' }, // 청록색 - 메타
                            '& .hljs-doctag': { color: '#c678dd !important' }, // 보라색 - 문서 태그
                            '& .hljs-operator': { color: '#56b6c2 !important' } // 청록색 - 연산자
                        },
                        '& .ql-code-block-container': {
                            backgroundColor: '#1e1e1e !important',
                            borderRadius: '8px !important',
                            margin: '16px 0 !important'
                        },
                        // 인라인 코드 스타일 - 개선
                        '& code:not(.ql-syntax)': {
                            backgroundColor: '#383e49',
                            color: '#e06c75',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '87%',
                            fontFamily: '"JetBrains Mono", "Fira Code", Consolas, Monaco, "Courier New", monospace',
                            fontWeight: '500',
                            border: '1px solid #4a5364'
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
                            {isLoading ? '수정 중...' : '수정 완료'}
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