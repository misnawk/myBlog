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
import { CATEGORIES } from '../components/categories';
import { useAuth } from '../contexts/AuthContext';

export default function CreatePost() {
    const navigate = useNavigate();
    const { isTokenValid, user } = useAuth();
    
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
    
    // 추가 기능을 위한 상태
    const [autoSaveStatus, setAutoSaveStatus] = useState('');
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    
    // 에디터 참조 생성
    const quillRef = useRef(null);
    const timeoutRef = useRef(null);
    const abortControllerRef = useRef(null);

    // 페이지 설정
    useEffect(() => {
        // highlight.js는 이미 전역적으로 설정됨
    }, []);

    // 페이지 로드 시 토큰 검증
    useEffect(() => {
        console.log(' CreatePost 페이지 토큰 검증 시작');
        
        if (!isTokenValid()) {
            console.log(' 토큰이 유효하지 않음 - 로그인 페이지로 이동');
            navigate('/login', { 
                replace: true,
                state: { message: '글쓰기 권한이 없습니다. 로그인해주세요.' }
            });
            return;
        }
        
        console.log(' 토큰 검증 완료 - 사용자:', user?.email);
        setMounted(true);
    }, [isTokenValid, navigate, user]);

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
        setHasUnsavedChanges(true);
    }, []);

    // 자동저장 기능 (localStorage)
    useEffect(() => {
        if (!hasUnsavedChanges || !content.trim()) return;

        const autoSaveTimeout = setTimeout(() => {
            try {
                const autoSaveData = {
                    title,
                    content,
                    category,
                    savedAt: new Date().toISOString()
                };
                localStorage.setItem('createPost_autoSave', JSON.stringify(autoSaveData));
                setAutoSaveStatus('자동 저장됨');
                
                setTimeout(() => setAutoSaveStatus(''), 3000);
            } catch (error) {
                console.error('자동저장 실패:', error);
            }
        }, 3000); // 3초 후 자동저장

        return () => clearTimeout(autoSaveTimeout);
    }, [title, content, category, hasUnsavedChanges]);

    // 페이지 이탈 시 경고
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (hasUnsavedChanges) {
                e.preventDefault();
                e.returnValue = '작성 중인 내용이 있습니다. 정말 나가시겠습니까?';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [hasUnsavedChanges]);

    // 자동저장된 데이터 복원
    useEffect(() => {
        try {
            const savedData = localStorage.getItem('createPost_autoSave');
            if (savedData) {
                const data = JSON.parse(savedData);
                const savedTime = new Date(data.savedAt);
                const now = new Date();
                const diffHours = (now - savedTime) / (1000 * 60 * 60);
                
                // 24시간 이내의 자동저장 데이터만 복원
                if (diffHours < 24) {
                    if (window.confirm('이전에 작성 중이던 내용이 있습니다. 복원하시겠습니까?')) {
                        setTitle(data.title || '');
                        setContent(data.content || '');
                        setCategory(data.category || '');
                        setHasUnsavedChanges(true);
                    } else {
                        localStorage.removeItem('createPost_autoSave');
                    }
                } else {
                    localStorage.removeItem('createPost_autoSave');
                }
            }
        } catch (error) {
            console.error('자동저장 데이터 복원 실패:', error);
        }
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
            
            // 자동저장 데이터 삭제
            localStorage.removeItem('createPost_autoSave');
            setHasUnsavedChanges(false);
            
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
            } else if (error.response?.status === 401 || error.response?.status === 403) {
                // 토큰 만료 또는 권한 오류 - config.js에서 이미 처리됨
                console.log('인증 오류 발생 - 자동 로그아웃 처리됨');
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
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Paper elevation={3} sx={{ p: 6 }}>
                <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
                    새 글 작성
                </Typography>

                <Stack spacing={3}>
                    {/* 제목 입력 */}
                    <Box>
                        <TextField
                            fullWidth
                            label="제목"
                            variant="outlined"
                            value={title}
                            onChange={(e) => {
                                setTitle(e.target.value);
                                setHasUnsavedChanges(true);
                            }}
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
                    </Box>

                    {/* 카테고리 선택 */}
                    <FormControl sx={{ minWidth: 250 }}>
                        <InputLabel>카테고리</InputLabel>
                        <Select
                            value={category}
                            label="카테고리"
                            onChange={(e) => {
                                setCategory(e.target.value);
                                setHasUnsavedChanges(true);
                            }}
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
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                <Typography variant="caption" color="text.secondary">
                                    본문 내용
                                </Typography>
                                {autoSaveStatus && (
                                    <Typography variant="caption" color="success.main" sx={{ fontStyle: 'italic' }}>
                                        {autoSaveStatus}
                                    </Typography>
                                )}
                                {hasUnsavedChanges && (
                                    <Typography variant="caption" color="warning.main" sx={{ fontStyle: 'italic' }}>
                                        저장되지 않은 변경사항
                                    </Typography>
                                )}
                            </Box>
                        </Box>
                        <Box sx={{ 
                            // 전체 에디터 래퍼에 고정 높이 설정
                            '& .quill': {
                                backgroundColor: '#fff',
                                borderRadius: 1,
                                height: '700px',
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
                                minHeight: '500px',
                                maxHeight: '700px',
                                overflowY: 'auto',     // 세로 스크롤만
                                overflowX: 'hidden',   // 가로 스크롤 제거
                                position: 'relative',
                                scrollBehavior: 'auto', // smooth 제거 (버그 원인이 될 수 있음)
                                backgroundColor: '#fff'
                            },
                            '& .ql-editor': {
                                minHeight: '500px',
                                fontSize: '16px',
                                lineHeight: '1.8',
                                padding: '24px',
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
                            disabled={isLoading || !hasUnsavedChanges}
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

