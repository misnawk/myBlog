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
} from "@mui/material";
import { Link } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import AccountCircle from "@mui/icons-material/AccountCircle";

function Header() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
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
          <Button color="inherit" component={Link} to="/categories">
            카테고리
          </Button>
          <Button color="inherit" component={Link} to="/about">
            소개
          </Button>
        </Box>

        {/* 사용자 메뉴 */}
        <Box sx={{ ml: 2 }}>
          <IconButton size="large" onClick={handleMenu} color="inherit">
            <AccountCircle />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
          {!isLoggedIn && (
            <MenuItem component={Link} to="/login" onClick={handleClose}>
              로그인
            </MenuItem>
            )}
          {isLoggedIn && (
            <MenuItem component={Link} to="/logout" onClick={handleClose}>
              로그아웃
            </MenuItem>
          )}
          {!isLoggedIn && (
            <MenuItem component={Link} to="/register" onClick={handleClose}>
              회원가입
            </MenuItem>
          )} 
          {isLoggedIn && (
            <MenuItem component={Link} to="/profile" onClick={handleClose}>
              내정보
            </MenuItem>
          )}
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Header;
