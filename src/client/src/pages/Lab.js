import React from "react";
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Paper,
  Chip,
  Avatar,
  Divider,
  Alert,
} from "@mui/material";
import {
  Chat as ChatIcon,
  Science as ScienceIcon,
  BugReport as ExperimentIcon,
  Code as CodeIcon,
  Psychology as PsychologyIcon,
  AutoFixHigh as AutoFixHighIcon,
} from "@mui/icons-material";
import { Link } from "react-router-dom";

// 실험실 기능들
const labFeatures = [
  {
    id: "realtime-chat",
    title: "실시간 채팅",
    description: "다른 사용자들과 실시간으로 대화할 수 있는 채팅 기능입니다.",
    icon: <ChatIcon sx={{ fontSize: 40 }} />,
    color: "#4CAF50",
    status: "active",
    link: "/chat",
    features: ["실시간 메시징", "온라인 사용자 표시", "메시지 기록"],
  },
  {
    id: "ai-assistant",
    title: "AI 어시스턴트",
    description: "AI가 도와주는 코딩 어시스턴트 기능입니다.",
    icon: <PsychologyIcon sx={{ fontSize: 40 }} />,
    color: "#FF9800",
    status: "coming-soon",
    link: null,
    features: ["코드 리뷰", "버그 찾기", "최적화 제안"],
  },
  {
    id: "code-playground",
    title: "코드 놀이터",
    description: "브라우저에서 바로 코딩하고 테스트할 수 있는 환경입니다.",
    icon: <CodeIcon sx={{ fontSize: 40 }} />,
    color: "#2196F3",
    status: "coming-soon",
    link: null,
    features: ["라이브 에디터", "실시간 미리보기", "코드 공유"],
  },
  {
    id: "magic-tools",
    title: "마법 도구",
    description: "개발에 유용한 다양한 도구들을 모아놓은 공간입니다.",
    icon: <AutoFixHighIcon sx={{ fontSize: 40 }} />,
    color: "#9C27B0",
    status: "coming-soon",
    link: null,
    features: ["JSON 포맷터", "색상 팔레트", "Base64 인코더"],
  },
];

function Lab() {
  const getStatusChip = (status) => {
    switch (status) {
      case "active":
        return <Chip label="사용 가능" color="success" size="small" />;
      case "beta":
        return <Chip label="베타" color="warning" size="small" />;
      case "coming-soon":
        return <Chip label="준비 중" color="default" size="small" />;
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* 헤더 */}
      <Box sx={{ textAlign: "center", mb: 6 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Avatar
            sx={{
              bgcolor: "primary.main",
              width: 64,
              height: 64,
              mr: 2,
            }}
          >
            <ScienceIcon sx={{ fontSize: 32 }} />
          </Avatar>
          <Typography variant="h3" component="h1" fontWeight="bold">
            실험실
          </Typography>
        </Box>
        <Typography variant="h6" color="text.secondary" paragraph>
          새로운 기능들을 실험하고 테스트해보는 공간입니다
        </Typography>
        <Typography variant="body1" color="text.secondary">
          혁신적인 아이디어들을 구현하고 사용자들과 함께 발전시켜 나가는
          곳이에요
        </Typography>
      </Box>

      {/* 안내 메시지 */}
      <Alert severity="info" sx={{ mb: 4 }}>
        <Typography variant="body2">
          실험실의 기능들은 테스트 단계에 있을 수 있습니다. 피드백이나 개선
          아이디어가 있으시면 언제든 알려주세요! 🚀
        </Typography>
      </Alert>

      {/* 기능 카드들 */}
      <Grid container spacing={4}>
        {labFeatures.map((feature) => (
          <Grid item xs={12} md={6} key={feature.id}>
            <Card
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: 4,
                },
                opacity: feature.status === "coming-soon" ? 0.7 : 1,
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Avatar
                    sx={{
                      bgcolor: feature.color,
                      width: 56,
                      height: 56,
                      mr: 2,
                    }}
                  >
                    {feature.icon}
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h5" component="h2" gutterBottom>
                      {feature.title}
                    </Typography>
                    {getStatusChip(feature.status)}
                  </Box>
                </Box>

                <Typography variant="body1" color="text.secondary" paragraph>
                  {feature.description}
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle2" gutterBottom>
                  주요 기능:
                </Typography>
                <Box component="ul" sx={{ pl: 2, m: 0 }}>
                  {feature.features.map((item, index) => (
                    <Typography
                      key={index}
                      component="li"
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 0.5 }}
                    >
                      {item}
                    </Typography>
                  ))}
                </Box>
              </CardContent>

              <CardActions sx={{ p: 2, pt: 0 }}>
                {feature.status === "active" && feature.link ? (
                  <Button
                    component={Link}
                    to={feature.link}
                    variant="contained"
                    fullWidth
                    sx={{
                      bgcolor: feature.color,
                      "&:hover": {
                        bgcolor: feature.color,
                        filter: "brightness(0.9)",
                      },
                    }}
                  >
                    사용해보기
                  </Button>
                ) : (
                  <Button disabled variant="outlined" fullWidth>
                    {feature.status === "coming-soon" ? "곧 출시" : "준비 중"}
                  </Button>
                )}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* 하단 정보 */}
      <Paper sx={{ mt: 6, p: 4, textAlign: "center", bgcolor: "grey.50" }}>
        <ExperimentIcon sx={{ fontSize: 48, color: "primary.main", mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          더 많은 실험이 진행 중이에요!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          새로운 기능에 대한 아이디어나 요청사항이 있으시다면 언제든지 피드백을
          보내주세요. 함께 만들어가는 플랫폼입니다.
        </Typography>
      </Paper>
    </Container>
  );
}

export default Lab;
