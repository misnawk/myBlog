import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  InputBase,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  useTheme,
  useMediaQuery,
  Collapse,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import AccountCircle from "@mui/icons-material/AccountCircle";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
import CreateIcon from "@mui/icons-material/Create";
import MenuIcon from "@mui/icons-material/Menu";
import CategoryIcon from "@mui/icons-material/Category";
import SettingsIcon from "@mui/icons-material/Settings";
import InfoIcon from "@mui/icons-material/Info";
import HomeIcon from "@mui/icons-material/Home";
import LoginIcon from "@mui/icons-material/Login";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import { useAuth } from "../../contexts/AuthContext";
import ChatIcon from "@mui/icons-material/Chat";

function Header() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [anchorEl, setAnchorEl] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
    setMobileMenuOpen(false);
    navigate("/");
  };

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuOpen(false);
  };

  const handleNavigation = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  // 모바일 메뉴 아이템들
  const mobileMenuItems = [
    { text: "홈", icon: <HomeIcon />, path: "/" },
    { text: "실시간 채팅", icon: <ChatIcon />, path: "/chat" },
  ];

  if (isMobile) {
    // 모바일 UI
    return (
      <>
        <AppBar position="static">
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={handleMobileMenuToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>

            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              <Link to="/" style={{ textDecoration: "none", color: "white" }}>
                코드의숲
              </Link>
            </Typography>

            {/* 모바일 검색 아이콘 */}
            <IconButton
              color="inherit"
              onClick={() => setSearchOpen(!searchOpen)}
              sx={{ mr: 1 }}
            >
              <SearchIcon />
            </IconButton>

            {/* 모바일 사용자 메뉴 */}
            <IconButton size="large" onClick={handleMenu} color="inherit">
              <AccountCircle />
            </IconButton>
          </Toolbar>

          {/* 모바일 검색창 */}
          <Collapse in={searchOpen}>
            <Box sx={{ p: 2, bgcolor: "rgba(255, 255, 255, 0.1)" }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  bgcolor: "rgba(255, 255, 255, 0.15)",
                  borderRadius: 1,
                  p: "2px 4px",
                }}
              >
                <InputBase
                  placeholder="검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  sx={{ color: "white", ml: 1, flex: 1 }}
                />
                <IconButton sx={{ p: "10px", color: "white" }}>
                  <SearchIcon />
                </IconButton>
              </Box>
            </Box>
          </Collapse>
        </AppBar>

        {/* 모바일 드로어 메뉴 */}
        <Drawer
          anchor="left"
          open={mobileMenuOpen}
          onClose={handleMobileMenuClose}
          sx={{
            "& .MuiDrawer-paper": {
              width: 280,
              boxSizing: "border-box",
            },
          }}
        >
          <Box
            sx={{ p: 2, bgcolor: theme.palette.primary.main, color: "white" }}
          >
            <Typography variant="h6">코드의숲</Typography>
            {isAuthenticated() && user && (
              <Typography variant="body2" sx={{ mt: 1, opacity: 0.8 }}>
                {user.username}님 환영합니다
              </Typography>
            )}
          </Box>

          <Divider />

          <List>
            {mobileMenuItems.map((item) => (
              <ListItem
                button
                key={item.text}
                onClick={() => handleNavigation(item.path)}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}

            {isAuthenticated() && (
              <>
                <ListItem button onClick={() => handleNavigation("/create")}>
                  <ListItemIcon>
                    <CreateIcon />
                  </ListItemIcon>
                  <ListItemText primary="글쓰기" />
                </ListItem>
                <ListItem
                  button
                  onClick={() => handleNavigation("/category-admin")}
                >
                  <ListItemIcon>
                    <SettingsIcon />
                  </ListItemIcon>
                  <ListItemText primary="카테고리 관리" />
                </ListItem>
              </>
            )}

            <Divider sx={{ my: 1 }} />

            {isAuthenticated() ? (
              <>
                <ListItem button onClick={() => handleNavigation("/profile")}>
                  <ListItemIcon>
                    <PersonIcon />
                  </ListItemIcon>
                  <ListItemText primary="내 정보" />
                </ListItem>
                <ListItem button onClick={handleLogout}>
                  <ListItemIcon>
                    <LogoutIcon />
                  </ListItemIcon>
                  <ListItemText primary="로그아웃" />
                </ListItem>
              </>
            ) : (
              <>
                <ListItem button onClick={() => handleNavigation("/login")}>
                  <ListItemIcon>
                    <LoginIcon />
                  </ListItemIcon>
                  <ListItemText primary="로그인" />
                </ListItem>
                <ListItem button onClick={() => handleNavigation("/register")}>
                  <ListItemIcon>
                    <PersonAddIcon />
                  </ListItemIcon>
                  <ListItemText primary="회원가입" />
                </ListItem>
              </>
            )}
          </List>
        </Drawer>

        {/* 사용자 메뉴 */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          {isAuthenticated()
            ? [
                <MenuItem
                  key="create"
                  onClick={() => {
                    handleNavigation("/create");
                    handleClose();
                  }}
                >
                  <CreateIcon sx={{ mr: 1 }} />
                  글쓰기
                </MenuItem>,
                <MenuItem
                  key="category-admin"
                  onClick={() => {
                    handleNavigation("/category-admin");
                    handleClose();
                  }}
                >
                  <SettingsIcon sx={{ mr: 1 }} />
                  카테고리 관리
                </MenuItem>,
                <MenuItem
                  key="profile"
                  onClick={() => {
                    handleNavigation("/profile");
                    handleClose();
                  }}
                >
                  <PersonIcon sx={{ mr: 1 }} />내 정보
                </MenuItem>,
                <MenuItem key="logout" onClick={handleLogout}>
                  <LogoutIcon sx={{ mr: 1 }} />
                  로그아웃
                </MenuItem>,
              ]
            : [
                <MenuItem
                  key="login"
                  onClick={() => {
                    handleNavigation("/login");
                    handleClose();
                  }}
                >
                  <LoginIcon sx={{ mr: 1 }} />
                  로그인
                </MenuItem>,
                <MenuItem
                  key="register"
                  onClick={() => {
                    handleNavigation("/register");
                    handleClose();
                  }}
                >
                  <PersonAddIcon sx={{ mr: 1 }} />
                  회원가입
                </MenuItem>,
              ]}
        </Menu>
      </>
    );
  }

  // PC UI (기존 유지)
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          <Link to="/" style={{ textDecoration: "none", color: "white" }}>
            코드의숲
          </Link>
        </Typography>

        {/* 검색창 */}
        {/* <Box
          sx={{
            display: "flex",
            alignItems: "center",
            bgcolor: "rgba(255, 255, 255, 0.15)",
            borderRadius: 1,
            p: "2px 4px",
            mr: 2,
          }}
        >
          <InputBase
            placeholder="검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ color: "white", ml: 1, flex: 1 }}
          />
          <IconButton sx={{ p: "10px", color: "white" }}>
            <SearchIcon />
          </IconButton>
        </Box> */}

        {/* 네비게이션 메뉴 */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {isAuthenticated() && (
            <Button
              color="inherit"
              component={Link}
              to="/create"
              startIcon={<CreateIcon />}
              sx={{
                bgcolor: "rgba(255, 255, 255, 0.1)",
                "&:hover": {
                  bgcolor: "rgba(255, 255, 255, 0.2)",
                },
              }}
            >
              글쓰기
            </Button>
          )}

          {isAuthenticated() && (
            <Button
              color="inherit"
              component={Link}
              to="/category-admin"
              startIcon={<SettingsIcon />}
              sx={{
                bgcolor: "rgba(255, 255, 255, 0.1)",
                "&:hover": {
                  bgcolor: "rgba(255, 255, 255, 0.2)",
                },
              }}
            >
              카테고리 관리
            </Button>
          )}

          {isAuthenticated() && (
            <Button
              color="inherit"
              component={Link}
              to="/chat"
              startIcon={<ChatIcon />}
              sx={{
                bgcolor: "rgba(255, 255, 255, 0.1)",
                "&:hover": {
                  bgcolor: "rgba(255, 255, 255, 0.2)",
                },
              }}
            >
              실시간 채팅
            </Button>
          )}
        </Box>

        {/* 사용자 메뉴 */}
        <Box sx={{ ml: 2, display: "flex", alignItems: "center", gap: 1 }}>
          {isAuthenticated() && user && (
            <Chip
              label={user.username}
              size="small"
              sx={{
                color: "white",
                borderColor: "white",
                bgcolor: "rgba(255, 255, 255, 0.1)",
              }}
              variant="outlined"
            />
          )}

          <IconButton size="large" onClick={handleMenu} color="inherit">
            <AccountCircle />
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            {isAuthenticated()
              ? [
                  <MenuItem
                    key="create"
                    component={Link}
                    to="/create"
                    onClick={handleClose}
                  >
                    <CreateIcon sx={{ mr: 1 }} />
                    글쓰기
                  </MenuItem>,
                  <MenuItem
                    key="category-admin"
                    component={Link}
                    to="/category-admin"
                    onClick={handleClose}
                  >
                    <SettingsIcon sx={{ mr: 1 }} />
                    카테고리 관리
                  </MenuItem>,
                  <MenuItem
                    key="profile"
                    component={Link}
                    to="/profile"
                    onClick={handleClose}
                  >
                    <PersonIcon sx={{ mr: 1 }} />내 정보
                  </MenuItem>,
                  <MenuItem key="logout" onClick={handleLogout}>
                    <LogoutIcon sx={{ mr: 1 }} />
                    로그아웃
                  </MenuItem>,
                ]
              : [
                  <MenuItem
                    key="login"
                    component={Link}
                    to="/login"
                    onClick={handleClose}
                  >
                    로그인
                  </MenuItem>,
                  <MenuItem
                    key="register"
                    component={Link}
                    to="/register"
                    onClick={handleClose}
                  >
                    회원가입
                  </MenuItem>,
                ]}
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Header;
