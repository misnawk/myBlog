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
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import AccountCircle from "@mui/icons-material/AccountCircle";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
import CreateIcon from "@mui/icons-material/Create";
import { useAuth } from "../../contexts/AuthContext";

function Header() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
    navigate('/');
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          <Link to="/" style={{ textDecoration: "none", color: "white" }}>
            코드의숲
          </Link>
        </Typography>

        {/* 검색창 */}
        <Box
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
        </Box>

        {/* 네비게이션 메뉴 */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Button color="inherit" component={Link} to="/blog">
            블로그
          </Button>
          <Button color="inherit" component={Link} to="/categories">
            카테고리
          </Button>
          {isAuthenticated() && (
            <Button 
              color="inherit" 
              component={Link} 
              to="/create"
              startIcon={<CreateIcon />}
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.1)',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.2)'
                }
              }}
            >
              글쓰기
            </Button>
          )}
          <Button color="inherit" component={Link} to="/about">
            소개
          </Button>
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
                bgcolor: "rgba(255, 255, 255, 0.1)"
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
            {isAuthenticated() ? (
              // 로그인된 사용자 메뉴
              [
                <MenuItem key="create" component={Link} to="/create" onClick={handleClose}>
                  <CreateIcon sx={{ mr: 1 }} />
                  글쓰기
                </MenuItem>,
                <MenuItem key="profile" component={Link} to="/profile" onClick={handleClose}>
                  <PersonIcon sx={{ mr: 1 }} />
                  내 정보
                </MenuItem>,
                <MenuItem key="logout" onClick={handleLogout}>
                  <LogoutIcon sx={{ mr: 1 }} />
                  로그아웃
                </MenuItem>
              ]
            ) : (
              // 미로그인 사용자 메뉴
              [
                <MenuItem key="login" component={Link} to="/login" onClick={handleClose}>
                  로그인
                </MenuItem>,
                <MenuItem key="register" component={Link} to="/register" onClick={handleClose}>
                  회원가입
                </MenuItem>
              ]
            )}
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Header;
