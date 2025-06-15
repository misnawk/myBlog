import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Avatar from '@mui/material/Avatar';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import CommentIcon from '@mui/icons-material/Comment';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ShareIcon from '@mui/icons-material/Share';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MarkdownRenderer from '../components/MarkdownRenderer';

// 임시 포스트 데이터 (실제로는 API에서 가져와야 함)
const posts = [
  {
    id: 1,
    title: "React Hooks 완벽 가이드",
    content: `# React Hooks 완벽 가이드

React Hooks는 **React 16.8**에서 도입된 혁신적인 기능으로, 함수형 컴포넌트에서도 상태 관리와 생명주기 메서드를 사용할 수 있게 해줍니다.

## 📚 이 가이드에서 다루는 내용

1. **useState** - 상태 관리
2. **useEffect** - 생명주기 관리  
3. **useContext** - Context API 사용
4. **useReducer** - 복잡한 상태 관리
5. **useCallback** - 메모이제이션된 콜백
6. **useMemo** - 메모이제이션된 값
7. **useRef** - DOM 참조 및 값 저장

## 🚀 useState Hook

가장 기본적인 Hook으로, 함수형 컴포넌트에 상태를 추가할 수 있습니다.

\`\`\`javascript
import React, { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>현재 카운트: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        증가
      </button>
    </div>
  );
}
\`\`\`

## ⚡ useEffect Hook

컴포넌트의 생명주기를 관리하고 부수 효과(side effects)를 처리합니다.

\`\`\`javascript
import React, { useState, useEffect } from 'react';

function Timer() {
  const [seconds, setSeconds] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(seconds => seconds + 1);
    }, 1000);
    
    // 클린업 함수
    return () => clearInterval(interval);
  }, []); // 빈 배열: 마운트시에만 실행
  
  return <div>타이머: {seconds}초</div>;
}
\`\`\`

## 💡 주요 포인트

> **중요**: Hook은 항상 함수형 컴포넌트의 최상위 레벨에서 호출해야 합니다. 조건문, 반복문, 중첩 함수 내에서는 사용할 수 없습니다.

### Hook 사용 규칙
- ✅ 함수형 컴포넌트 내에서만 사용
- ✅ 최상위 레벨에서 호출
- ✅ 일관된 순서로 호출
- ❌ 조건문 내에서 사용 금지
- ❌ 일반 JavaScript 함수에서 사용 금지

## 📊 성능 최적화

React Hooks를 사용할 때 성능을 고려한 몇 가지 팁:

| Hook | 용도 | 사용 시기 |
|------|------|-----------|
| \`useMemo\` | 값 메모이제이션 | 계산 비용이 높은 작업 |
| \`useCallback\` | 함수 메모이제이션 | 자식 컴포넌트 최적화 |
| \`React.memo\` | 컴포넌트 메모이제이션 | 불필요한 리렌더링 방지 |

---

이제 React Hooks를 마스터해서 더 효율적이고 깔끔한 React 코드를 작성해보세요! 🎉`,
    image: "https://source.unsplash.com/random/800x600?react",
    category: "프론트엔드",
    date: "2024-03-15",
    readTime: "5분",
    likes: 42,
    comments: 12,
    tags: ["React", "JavaScript", "Hooks"],
    author: {
      name: "김개발",
      avatar: "https://source.unsplash.com/random/100x100?portrait",
    },
  },
  {
    id: 2,
    title: "Node.js 성능 최적화",
    content: "Node.js 애플리케이션의 성능을 최적화하는 다양한 방법을 소개합니다.",
    image: "https://source.unsplash.com/random/800x600?nodejs",
    category: "백엔드",
    date: "2024-03-14",
    readTime: "8분",
    likes: 35,
    comments: 8,
    tags: ["Node.js", "JavaScript", "Performance"],
    author: {
      name: "이서버",
      avatar: "https://source.unsplash.com/random/100x100?portrait2",
    },
  },
  {
    id: 3,
    title: "Docker 컨테이너 관리",
    content: "Docker 컨테이너를 효율적으로 관리하는 방법과 모범 사례를 알아봅니다.",
    image: "https://source.unsplash.com/random/800x600?docker",
    category: "DevOps",
    date: "2024-03-13",
    readTime: "6분",
    likes: 28,
    comments: 5,
    tags: ["Docker", "DevOps", "Container"],
    author: {
      name: "박인프라",
      avatar: "https://source.unsplash.com/random/100x100?portrait3",
    },
  },
  {
    id: 4,
    title: "TypeScript 타입 시스템",
    content: "TypeScript의 타입 시스템을 깊이 있게 이해하고 활용하는 방법을 알아봅니다.",
    image: "https://source.unsplash.com/random/800x600?typescript",
    category: "프론트엔드",
    date: "2024-03-12",
    readTime: "7분",
    likes: 31,
    comments: 9,
    tags: ["TypeScript", "JavaScript", "Type System"],
    author: {
      name: "최타입",
      avatar: "https://source.unsplash.com/random/100x100?portrait4",
    },
  },
];

export default function BlogDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [commentMenuAnchor, setCommentMenuAnchor] = useState(null);
  const [selectedComment, setSelectedComment] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editComment, setEditComment] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [relatedPosts, setRelatedPosts] = useState([]);

  useEffect(() => {
    // 실제로는 API 호출로 대체
    const foundPost = posts.find(p => p.id === parseInt(id));
    if (foundPost) {
      setPost(foundPost);
      setLikeCount(foundPost.likes);
      
      // 관련 포스트 찾기 (같은 카테고리나 태그를 가진 포스트)
      const related = posts
        .filter(p => p.id !== foundPost.id && (
          p.category === foundPost.category ||
          p.tags.some(tag => foundPost.tags.includes(tag))
        ))
        .slice(0, 3); // 최대 3개까지만 표시
      setRelatedPosts(related);

      // 임시 댓글 데이터
      setComments([
        {
          id: 1,
          author: "이코딩",
          avatar: "https://source.unsplash.com/random/100x100?portrait1",
          content: "정말 유용한 글이네요! 특히 useEffect 부분이 도움이 많이 되었습니다.",
          date: "2024-03-15 14:30",
          isAuthor: false,
        },
        {
          id: 2,
          author: "박프론트",
          avatar: "https://source.unsplash.com/random/100x100?portrait2",
          content: "useCallback과 useMemo의 차이점이 명확하게 설명되어 있어서 좋았습니다.",
          date: "2024-03-15 15:45",
          isAuthor: true,
        },
      ]);
    }
  }, [id]);

  const handleLike = () => {
    // 실제로는 API 호출로 대체
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
    setSnackbar({
      open: true,
      message: isLiked ? '좋아요를 취소했습니다.' : '좋아요를 눌렀습니다.',
      severity: 'success'
    });
  };

  const handleShare = () => {
    // 실제로는 공유 기능 구현
    navigator.clipboard.writeText(window.location.href);
    setSnackbar({
      open: true,
      message: '링크가 클립보드에 복사되었습니다.',
      severity: 'success'
    });
  };

  const handleCommentMenuOpen = (event, comment) => {
    setCommentMenuAnchor(event.currentTarget);
    setSelectedComment(comment);
  };

  const handleCommentMenuClose = () => {
    setCommentMenuAnchor(null);
    setSelectedComment(null);
  };

  const handleEditClick = () => {
    setEditComment(selectedComment.content);
    setEditDialogOpen(true);
    handleCommentMenuClose();
  };

  const handleDeleteClick = () => {
    // 실제로는 API 호출로 대체
    setComments(comments.filter(c => c.id !== selectedComment.id));
    handleCommentMenuClose();
    setSnackbar({
      open: true,
      message: '댓글이 삭제되었습니다.',
      severity: 'success'
    });
  };

  const handleEditSubmit = () => {
    // 실제로는 API 호출로 대체
    setComments(comments.map(c => 
      c.id === selectedComment.id 
        ? { ...c, content: editComment }
        : c
    ));
    setEditDialogOpen(false);
    setSnackbar({
      open: true,
      message: '댓글이 수정되었습니다.',
      severity: 'success'
    });
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (comment.trim()) {
      const newComment = {
        id: comments.length + 1,
        author: "현재 사용자",
        avatar: "https://source.unsplash.com/random/100x100?portrait3",
        content: comment,
        date: new Date().toLocaleString(),
        isAuthor: true,
      };
      setComments([...comments, newComment]);
      setComment('');
      setSnackbar({
        open: true,
        message: '댓글이 작성되었습니다.',
        severity: 'success'
      });
    }
  };

  if (!post) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography>포스트를 찾을 수 없습니다.</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/blog')}
        sx={{ mb: 3 }}
      >
        목록으로 돌아가기
      </Button>

      <Paper sx={{ p: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {post.title}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Avatar src={post.author.avatar} sx={{ mr: 2 }} />
          <Box>
            <Typography variant="subtitle1">{post.author.name}</Typography>
            <Typography variant="body2" color="text.secondary">
              {post.date}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ mb: 3 }}>
          <img
            src={post.image}
            alt={post.title}
            style={{ width: '100%', maxHeight: '400px', objectFit: 'cover' }}
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
          {post.tags.map((tag) => (
            <Chip key={tag} label={tag} />
          ))}
        </Box>

        <Box sx={{ display: 'flex', gap: 3, mb: 3, alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
            <AccessTimeIcon sx={{ fontSize: 16, mr: 0.5 }} />
            {post.readTime}
          </Typography>
          <Button
            startIcon={isLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
            onClick={handleLike}
            color={isLiked ? 'secondary' : 'primary'} // 'default'를 'primary'로 변경
          >
            {likeCount}
          </Button>
          <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
            <CommentIcon sx={{ fontSize: 16, mr: 0.5 }} />
            {comments.length}
          </Typography>
          <Button
            startIcon={<ShareIcon />}
            onClick={handleShare}
          >
            공유하기
          </Button>
        </Box>

        <MarkdownRenderer content={post.content} sx={{ mt: 3 }} />
      </Paper>

      {/* 댓글 섹션 */}
      <Paper sx={{ p: 4 }}>
        <Typography variant="h6" gutterBottom>
          댓글 ({comments.length})
        </Typography>

        <Box component="form" onSubmit={handleCommentSubmit} sx={{ mb: 4 }}>
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="댓글을 작성하세요..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Button type="submit" variant="contained">
            댓글 작성
          </Button>
        </Box>

        <List>
          {comments.map((comment, index) => (
            <React.Fragment key={comment.id}>
              <ListItem alignItems="flex-start">
                <ListItemAvatar>
                  <Avatar src={comment.avatar} />
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography component="span" variant="subtitle2">
                          {comment.author}
                        </Typography>
                        {comment.isAuthor && (
                          <Chip
                            label="작성자"
                            size="small"
                            color="primary"
                            sx={{ ml: 1 }}
                          />
                        )}
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography component="span" variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                          {comment.date}
                        </Typography>
                        {comment.isAuthor && (
                          <IconButton
                            size="small"
                            onClick={(e) => handleCommentMenuOpen(e, comment)}
                          >
                            <MoreVertIcon />
                          </IconButton>
                        )}
                      </Box>
                    </Box>
                  }
                  secondary={comment.content}
                />
              </ListItem>
              {index < comments.length - 1 && <Divider variant="inset" component="li" />}
            </React.Fragment>
          ))}
        </List>
      </Paper>

      {/* 댓글 메뉴 */}
      <Menu
        anchorEl={commentMenuAnchor}
        open={Boolean(commentMenuAnchor)}
        onClose={handleCommentMenuClose}
      >
        <MenuItem onClick={handleEditClick}>
          <EditIcon sx={{ mr: 1 }} /> 수정
        </MenuItem>
        <MenuItem onClick={handleDeleteClick}>
          <DeleteIcon sx={{ mr: 1 }} /> 삭제
        </MenuItem>
      </Menu>

      {/* 댓글 수정 다이얼로그 */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>댓글 수정</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={3}
            value={editComment}
            onChange={(e) => setEditComment(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>취소</Button>
          <Button onClick={handleEditSubmit} variant="contained">
            수정
          </Button>
        </DialogActions>
      </Dialog>

      {/* 관련 포스트 섹션 */}
      {relatedPosts.length > 0 && (
        <Paper sx={{ p: 4, mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            관련 포스트
          </Typography>
          <Grid container spacing={3}>
            {relatedPosts.map((relatedPost) => (
              <Grid item xs={12} md={4} key={relatedPost.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 3,
                    },
                  }}
                >
                  <CardMedia
                    component="img"
                    height="140"
                    image={relatedPost.image}
                    alt={relatedPost.title}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" component="h3" gutterBottom>
                      {relatedPost.title}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                      {relatedPost.tags.slice(0, 2).map((tag) => (
                        <Chip key={tag} label={tag} size="small" />
                      ))}
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        {relatedPost.readTime}
                      </Typography>
                      <Button
                        component={Link}
                        to={`/blog/${relatedPost.id}`}
                        size="small"
                      >
                        자세히 보기
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

      {/* 알림 스낵바 */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
