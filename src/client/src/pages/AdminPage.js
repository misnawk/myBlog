import React, { useState } from "react";
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Chip,
  Avatar,
  useTheme,
} from "@mui/material";
import {
  Category as CategoryIcon,
  Article as ArticleIcon,
  People as PeopleIcon,
  Analytics as AnalyticsIcon,
  Settings as SettingsIcon,
  Dashboard as DashboardIcon,
  Comment as CommentIcon,
  Security as SecurityIcon,
  Backup as BackupIcon,
  Notifications as NotificationsIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import CategoryManagement from "../components/CategoryManagement";

function AdminPage() {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const theme = useTheme();
  const [selectedMenu, setSelectedMenu] = useState("dashboard");

  // 관리자 권한 확인
  if (!isAdmin()) {
    return (
      <Container maxWidth="md" sx={{ mt: 8, textAlign: "center" }}>
        <Paper sx={{ p: 6 }}>
          <Typography variant="h4" color="error" gutterBottom>
            🚫 접근 권한이 없습니다
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            관리자 페이지에 접근하려면 관리자 권한이 필요합니다.
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate("/")}
            sx={{ mr: 2 }}
          >
            홈으로 돌아가기
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate(-1)}
          >
            이전 페이지
          </Button>
        </Paper>
      </Container>
    );
  }

  // 관리자 메뉴 항목들
  const adminMenuItems = [
    {
      id: "dashboard",
      title: "대시보드",
      icon: <DashboardIcon />,
      description: "전체 현황 및 통계",
      color: "#1976d2",
    },
    {
      id: "categories",
      title: "카테고리 관리",
      icon: <CategoryIcon />,
      description: "블로그 카테고리 추가, 수정, 삭제",
      color: "#2e7d32",
    },
    {
      id: "posts",
      title: "게시글 관리",
      icon: <ArticleIcon />,
      description: "모든 게시글 관리 및 편집",
      color: "#ed6c02",
    },
    {
      id: "comments",
      title: "댓글 관리",
      icon: <CommentIcon />,
      description: "댓글 승인, 삭제 및 관리",
      color: "#9c27b0",
    },
    {
      id: "users",
      title: "사용자 관리",
      icon: <PeopleIcon />,
      description: "사용자 계정 및 권한 관리",
      color: "#d32f2f",
    },
    {
      id: "analytics",
      title: "통계 분석",
      icon: <AnalyticsIcon />,
      description: "방문자 및 게시글 통계",
      color: "#7b1fa2",
    },
    {
      id: "security",
      title: "보안 설정",
      icon: <SecurityIcon />,
      description: "보안 정책 및 접근 제어",
      color: "#c62828",
    },
    {
      id: "backup",
      title: "백업 관리",
      icon: <BackupIcon />,
      description: "데이터 백업 및 복원",
      color: "#558b2f",
    },
    {
      id: "notifications",
      title: "알림 설정",
      icon: <NotificationsIcon />,
      description: "시스템 알림 및 이메일 설정",
      color: "#f57c00",
    },
    {
      id: "settings",
      title: "시스템 설정",
      icon: <SettingsIcon />,
      description: "전체 시스템 설정 관리",
      color: "#424242",
    },
  ];

  // 통계 데이터 (임시)
  const statsData = [
    { title: "총 게시글", value: "127", change: "+12", color: "#1976d2" },
    { title: "총 카테고리", value: "18", change: "+2", color: "#2e7d32" },
    { title: "총 댓글", value: "342", change: "+28", color: "#ed6c02" },
    { title: "총 사용자", value: "45", change: "+5", color: "#9c27b0" },
  ];

  const handleMenuClick = (item) => {
    setSelectedMenu(item.id);
    // 더 이상 외부 페이지로 이동하지 않음
    // if (item.path) {
    //   navigate(item.path);
    // }
  };

  const renderDashboard = () => (
    <Box>
      {/* 통계 카드들 */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statsData.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              sx={{
                background: `linear-gradient(135deg, ${stat.color}15, ${stat.color}05)`,
                border: `1px solid ${stat.color}30`,
              }}
            >
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      {stat.title}
                    </Typography>
                    <Typography variant="h4" sx={{ color: stat.color }}>
                      {stat.value}
                    </Typography>
                    <Chip
                      label={stat.change}
                      size="small"
                      sx={{
                        mt: 1,
                        bgcolor: `${stat.color}20`,
                        color: stat.color,
                      }}
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* 최근 활동 */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              최근 게시글
            </Typography>
            <List>
              {[
                "React Hook 완벽 가이드",
                "NestJS 인증 시스템 구축",
                "TypeScript 고급 타입 활용",
                "Docker 컨테이너 최적화",
              ].map((title, index) => (
                <ListItem key={index} divider>
                  <ListItemIcon>
                    <ArticleIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={title}
                    secondary={`${index + 1}일 전`}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              최근 댓글
            </Typography>
            <List>
              {[
                { user: "김개발", comment: "정말 유용한 글이네요!" },
                { user: "박코딩", comment: "따라해보니 잘 되네요" },
                { user: "이프론트", comment: "더 자세한 설명 부탁드려요" },
                { user: "최백엔드", comment: "감사합니다!" },
              ].map((item, index) => (
                <ListItem key={index} divider>
                  <ListItemIcon>
                    <Avatar sx={{ width: 32, height: 32 }}>
                      {item.user[0]}
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary={item.comment}
                    secondary={`${item.user} • ${index + 1}시간 전`}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );

  const renderComingSoon = (title) => (
    <Paper
      sx={{
        p: 6,
        textAlign: "center",
        bgcolor: "grey.50",
        border: "2px dashed",
        borderColor: "grey.300",
      }}
    >
      <Typography variant="h5" color="textSecondary" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body1" color="textSecondary">
        이 기능은 곧 추가될 예정입니다.
      </Typography>
    </Paper>
  );

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* 헤더 */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          관리자 페이지
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {user?.username}님, 관리자 대시보드에 오신 것을 환영합니다.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* 사이드바 메뉴 */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2, px: 1 }}>
              관리 메뉴
            </Typography>
            <List>
              {adminMenuItems.map((item) => (
                <ListItemButton
                  key={item.id}
                  selected={selectedMenu === item.id}
                  onClick={() => handleMenuClick(item)}
                  sx={{
                    borderRadius: 1,
                    mb: 1,
                    "&.Mui-selected": {
                      bgcolor: `${item.color}15`,
                      "&:hover": {
                        bgcolor: `${item.color}20`,
                      },
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: item.color }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.title}
                    secondary={item.description}
                    primaryTypographyProps={{
                      fontSize: "0.9rem",
                      fontWeight: selectedMenu === item.id ? 600 : 400,
                    }}
                    secondaryTypographyProps={{
                      fontSize: "0.75rem",
                    }}
                  />
                </ListItemButton>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* 메인 콘텐츠 */}
        <Grid item xs={12} md={9}>
          <Paper sx={{ p: 3, minHeight: 600 }}>
            {selectedMenu === "dashboard" && renderDashboard()}
            {selectedMenu === "categories" && <CategoryManagement />}
            {selectedMenu === "posts" && renderComingSoon("게시글 관리")}
            {selectedMenu === "comments" && renderComingSoon("댓글 관리")}
            {selectedMenu === "users" && renderComingSoon("사용자 관리")}
            {selectedMenu === "analytics" && renderComingSoon("통계 분석")}
            {selectedMenu === "security" && renderComingSoon("보안 설정")}
            {selectedMenu === "backup" && renderComingSoon("백업 관리")}
            {selectedMenu === "notifications" && renderComingSoon("알림 설정")}
            {selectedMenu === "settings" && renderComingSoon("시스템 설정")}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default AdminPage;
