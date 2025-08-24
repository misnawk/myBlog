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

    // 붙여넣기 시 자동으로 이미지 업로드 및 스크롤 위치 유지
    useEffect(() => {
        if (!mounted || !quillRef.current) return;

        const quill = quillRef.current.getEditor();
        const editorElement = quill.container.querySelector('.ql-editor');
        const container = quill.container.querySelector('.ql-container');
        
        // 스크롤 위치 저장 함수
        const saveScrollPosition = () => {
            if (container) {
                return {
                    scrollTop: container.scrollTop,
                    scrollHeight: container.scrollHeight,
                    clientHeight: container.clientHeight
                };
            }
            return null;
        };
        
        // 스크롤 위치 복원 함수
        const restoreScrollPosition = (scrollInfo) => {
            if (container && scrollInfo) {
                // 여러 프레임에 걸쳐 안정적으로 복원
                const restore = () => {
                    if (container.scrollHeight >= scrollInfo.scrollTop + scrollInfo.clientHeight) {
                        container.scrollTop = scrollInfo.scrollTop;
                    } else {
                        // 내용이 변경되어 스크롤 위치가 유효하지 않은 경우, 맨 아래로
                        container.scrollTop = container.scrollHeight;
                    }
                };
                
                // 즉시 한 번 실행
                restore();
                
                // 다음 프레임에서도 한 번 더 실행 (안정성 확보)
                requestAnimationFrame(restore);
            }
        };
        
        const handleTextChange = async (delta, oldDelta, source) => {
            if (source !== 'user') return;
            
            // data URI 이미지 찾기
            const ops = delta.ops || [];
            for (let i = 0; i < ops.length; i++) {
                const op = ops[i];
                if (op.insert && op.insert.image && op.insert.image.startsWith('data:')) {
                    const scrollInfo = saveScrollPosition();
                    
                    try {
                        const res = await fetch(op.insert.image);
                        const blob = await res.blob();
                        const file = new File([blob], 'image.png', { type: blob.type });
                        
                        const imageUrl = await imageUploader(file);
                        
                        // Quill의 내용을 가져와서 data URI를 실제 URL로 교체
                        const content = quill.getContents();
                        const ops = content.ops;
                        let updated = false;
                        
                        for (let j = 0; j < ops.length; j++) {
                            if (ops[j].insert && ops[j].insert.image === op.insert.image) {
                                ops[j].insert.image = imageUrl;
                                updated = true;
                                break;
                            }
                        }
                        
                        if (updated) {
                            // 현재 선택 위치 저장
                            const selection = quill.getSelection();
                            
                            // 내용 업데이트 (silent 모드로 재귀 호출 방지)
                            quill.setContents(content, 'silent');
                            
                            // 선택 위치 복원
                            if (selection) {
                                quill.setSelection(selection);
                            }
                            
                            // 스크롤 위치 복원
                            restoreScrollPosition(scrollInfo);
                        }
                    } catch (error) {
                        console.error('이미지 업로드 실패:', error);
                        restoreScrollPosition(scrollInfo);
                    }
                }
            }
        };

        // 붙여넣기 이벤트 처리
        const handlePaste = async (e) => {
            const clipboardData = e.clipboardData;
            if (!clipboardData) return;
            
            const items = Array.from(clipboardData.items);
            const imageItems = items.filter(item => item.type.startsWith('image/'));
            
            if (imageItems.length > 0) {
                e.preventDefault();
                
                // 현재 스크롤 위치 저장
                const scrollInfo = saveScrollPosition();
                
                for (const item of imageItems) {
                    const file = item.getAsFile();
                    if (file) {
                        try {
                            const imageUrl = await imageUploader(file);
                            const range = quill.getSelection() || { index: quill.getLength() };
                            quill.insertEmbed(range.index, 'image', imageUrl);
                            quill.setSelection(range.index + 1);
                        } catch (error) {
                            console.error('이미지 업로드 실패:', error);
                        }
                    }
                }
                
                // 스크롤 위치 복원
                restoreScrollPosition(scrollInfo);
            }
        };
        
        quill.on('text-change', handleTextChange);
        
        if (editorElement) {
            editorElement.addEventListener('paste', handlePaste);
        }
        
        return () => {
            quill.off('text-change', handleTextChange);
            if (editorElement) {
                editorElement.removeEventListener('paste', handlePaste);
            }
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
                const editor = quillRef.current.getEditor();
                const container = editor.container.querySelector('.ql-container');
                
                // 현재 스크롤 위치 저장
                const scrollInfo = container ? {
                    scrollTop: container.scrollTop,
                    scrollHeight: container.scrollHeight,
                    clientHeight: container.clientHeight
                } : null;
                
                const imageUrl = await imageUploader(file);
               
                const range = editor.getSelection() || { index: editor.getLength() };    
                editor.insertEmbed(range.index, 'image', imageUrl);
                editor.setSelection(range.index + 1);
                
                // 스크롤 위치 복원
                if (container && scrollInfo) {
                    const restore = () => {
                        if (container.scrollHeight >= scrollInfo.scrollTop + scrollInfo.clientHeight) {
                            container.scrollTop = scrollInfo.scrollTop;
                        } else {
                            container.scrollTop = container.scrollHeight;
                        }
                    };
                    restore();
                    requestAnimationFrame(restore);
                }
            } catch (error) {
                console.error('이미지 업로드 실패:', error);
                alert('이미지 업로드 실패');
            }
        };
    }, []);

    // 비디오 핸들러를 useCallback으로 메모이제이션
    const videoHandler = useCallback(() => {
        const url = prompt('비디오 URL을 입력하세요 (YouTube, Vimeo 등):');
        if (!url) return;
        
        try {
            const editor = quillRef.current.getEditor();
            const range = editor.getSelection() || { index: editor.getLength() };
            
            // YouTube URL을 iframe으로 변환
            let videoEmbed = url;
            if (url.includes('youtube.com/watch?v=')) {
                const videoId = url.split('v=')[1]?.split('&')[0];
                if (videoId) {
                    videoEmbed = `https://www.youtube.com/embed/${videoId}`;
                }
            } else if (url.includes('youtu.be/')) {
                const videoId = url.split('youtu.be/')[1]?.split('?')[0];
                if (videoId) {
                    videoEmbed = `https://www.youtube.com/embed/${videoId}`;
                }
            } else if (url.includes('vimeo.com/')) {
                const videoId = url.split('vimeo.com/')[1]?.split('/')[0];
                if (videoId) {
                    videoEmbed = `https://player.vimeo.com/video/${videoId}`;
                }
            }
            
            // iframe 삽입
            editor.insertEmbed(range.index, 'video', videoEmbed);
            editor.setSelection(range.index + 1);
        } catch (error) {
            console.error('비디오 삽입 실패:', error);
            alert('비디오 삽입에 실패했습니다.');
        }
    }, []);

    // modules를 useMemo로 메모이제이션
    const modules = useMemo(() => ({
        toolbar: {
            container: [
                [{ header: [1, 2, 3, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ color: [] }, { background: [] }],  // 글자색, 배경색
                [{ align: [] }],  // 정렬
                ['blockquote', 'code-block'],
                [{ list: 'ordered' }, { list: 'bullet' }],
                [{ indent: '-1' }, { indent: '+1' }],  // 들여쓰기
                [{ script: 'sub' }, { script: 'super' }],
                ['link', 'image', 'video'],  // 비디오 추가
                ['clean']
            ],
            handlers: {
                image: imageHandler,
                video: videoHandler
            }
        },
        // syntax 모듈 대신 기본 코드블록만 사용
    }), [imageHandler, videoHandler]);

    // formats도 useMemo로 메모이제이션
    const formats = useMemo(() => [
        'header',
        'bold', 'italic', 'underline', 'strike',
        'color', 'background', 'align',  // 색상, 배경색, 정렬
        'blockquote', 'code-block',
        'list', 'bullet', 'indent', 'script',
        'link', 'image', 'video'
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
        <Container maxWidth={false} sx={{ py: 4, px: { xs: 2, sm: 4, md: 6, lg: 8 } }}>
            <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate(`/blogDetail/${id}`)}
                sx={{ mb: 3 }}
            >
                게시글로 돌아가기
            </Button>

            <Paper elevation={3} sx={{ p: { xs: 3, sm: 4, md: 6 } }}>
                <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
                    게시글 수정
                </Typography>

                <Stack spacing={5} sx={{ maxWidth: '100%' }}>
                    {/* 제목 입력 */}
                    <TextField
                        fullWidth
                        label="제목"
                        variant="outlined"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="제목을 입력하세요"
                        error={title.length > 30}
                        helperText={`${title.length}/30`}
                        inputProps={{ maxLength: 30 }}
                        sx={{ 
                            '& .MuiInputBase-input': { 
                                fontSize: '1.5rem',
                                fontWeight: 600 
                            }
                        }}
                    />

                    {/* 카테고리 선택 */}
                    <FormControl sx={{ minWidth: 300, maxWidth: 400 }}>
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
                    <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                                본문 내용
                            </Typography>
                        </Box>
                        <Box sx={{ 
                            // 전체 에디터 래퍼에 고정 높이 설정
                            '& .quill': {
                                backgroundColor: '#fff',
                                borderRadius: 1,
                                height: '1200px',
                                display: 'flex',
                                flexDirection: 'column',
                                border: '1px solid rgba(0, 0, 0, 0.23)',
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                            },
                            '& .ql-toolbar': {
                                borderRadius: '4px 4px 0 0',
                                borderColor: 'rgba(0, 0, 0, 0.23)',
                                position: 'sticky',
                                top: 0,
                                zIndex: 1,
                                backgroundColor: '#f8f9fa',
                                flexShrink: 0,  // 툴바는 축소되지 않도록
                                borderBottom: '2px solid #e9ecef'
                            },
                            // CSS 스타일 수정 - 스크롤 컨테이너 명확히 지정
                            '& .ql-container': {
                                borderRadius: '0 0 4px 4px',
                                borderColor: 'rgba(0, 0, 0, 0.23)',
                                minHeight: '1000px',
                                maxHeight: '1200px',
                                overflowY: 'auto',     // 세로 스크롤만
                                overflowX: 'hidden',   // 가로 스크롤 제거
                                position: 'relative',
                                scrollBehavior: 'auto', // smooth 제거 (버그 원인이 될 수 있음)
                                backgroundColor: '#fff'
                            },
                            '& .ql-editor': {
                                minHeight: '1000px',
                                fontSize: '16px',
                                lineHeight: '1.8',
                                padding: '40px',
                                // 에디터는 스크롤하지 않음
                                overflow: 'visible',
                                fontFamily: '"Noto Sans KR", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
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
                                backgroundColor: '#282c34 !important',
                                borderRadius: '12px !important',
                                margin: '20px 0 !important'
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
                            },
                            // 이미지 스타일 개선
                            '& .ql-editor img': {
                                maxWidth: '100%',
                                height: 'auto',
                                borderRadius: '8px',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                                margin: '10px 0'
                            },
                            // 블록쿼트 스타일 개선
                            '& .ql-editor blockquote': {
                                borderLeft: '4px solid #007bff',
                                paddingLeft: '20px',
                                margin: '20px 0',
                                fontStyle: 'italic',
                                backgroundColor: '#f8f9fa',
                                borderRadius: '0 8px 8px 0',
                                padding: '15px 20px'
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
                    </Box>

                    {/* 버튼들 */}
                    <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', mt: 8, flexWrap: 'wrap' }}>
                        <Button
                            variant="contained"
                            size="large"
                            startIcon={<SaveIcon />}
                            onClick={handleSave}
                            disabled={isLoading}
                            sx={{ px: 6, py: 1.5, fontSize: '1.1rem' }}
                        >
                            {isLoading ? '수정 중...' : '수정 완료'}
                        </Button>
                        <Button
                            variant="outlined"
                            size="large"
                            startIcon={<CancelIcon />}
                            onClick={handleCancel}
                            sx={{ px: 6, py: 1.5, fontSize: '1.1rem' }}
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