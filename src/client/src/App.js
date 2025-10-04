import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { CssBaseline, ThemeProvider, createTheme, Box } from "@mui/material";
import { ToastContainer } from "react-toastify";
import Lab from "./pages/Lab";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
// highlight.js 전역 설정을 먼저 로드
import "./utils/highlightSetup";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminPage from "./pages/AdminPage";
import Blog from "./pages/Blog";
import BlogDetail from "./pages/BlogDetail";
import CreatePost from "./pages/CreatePost";
import EditPost from "./pages/EditPost";
import Chating from "./pages/Chating";
import ProtectedRoute from "./components/ProtectedRoute";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1976d2",
      light: "#42a5f5",
      dark: "#1565c0",
      contrastText: "#fff",
    },
    secondary: {
      main: "#dc004e",
      light: "#ff4081",
      dark: "#c51162",
      contrastText: "#fff",
    },
    background: {
      default: "#fff",
      paper: "#fff",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
        },
      },
    },
  },
  typography: {
    fontFamily: [
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "Roboto",
      '"Helvetica Neue"',
      "Arial",
      "sans-serif",
    ].join(","),
  },
});

function AppContent() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  // 보호된 경로 목록 (글쓰기, 수정, 채팅 보호)
  const protectedRoutes = [
    "/category",
    "/tag",
    "/about",
    "/admin",
    "/lab",
    "/create",
    "/edit",
    "/chat",
  ];
  const isProtectedRoute = protectedRoutes.some((route) =>
    location.pathname.startsWith(route.replace("/:id", ""))
  );

  // 로그인하지 않은 상태에서 보호된 경로 접근 시 로그인 페이지로 리다이렉트
  if (!isAuthenticated() && isProtectedRoute) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
      }}
    >
      <Header />
      <Box component="main" sx={{ flexGrow: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/lab" element={<Lab />} />
          <Route path="/blogDetail/:id" element={<BlogDetail />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/create" element={<CreatePost />} />
          <Route path="/edit/:id" element={<EditPost />} />
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <Chating />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Box>
      <Footer />

      {/* 토스트 알림 컨테이너 */}
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </Box>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
