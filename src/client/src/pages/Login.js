import React, { useState } from "react";
import axios from "../api/config";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  InputAdornment,
  IconButton,
  Link,
  Divider,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Google as GoogleIcon,
  GitHub as GitHubIcon,
} from "@mui/icons-material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';

function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };



  const handleSubmit = async(e) => {
    e.preventDefault(); // 기본 동작 방지
    try {
      const response =  await axios.post(`/api/auth/login`,{
        email:formData.email,
        password:formData.password,
      });

      //토큰 값 따로 변수에 저장
      const token = response.data.access_token;
      console.log("토큰 값:", token);


      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      console.log("서버 응답 전체:", response.data);
      console.log("토큰 값:", response.data.access_token); 

      // blog 페이지로 리다이렉트
      navigate('/home');
      
    } catch (error) {
      console.error("로그인 실패:",error);
      toast.error('로그인 실패! 이메일과 비밀번호를 확인해주세요.');
    }
    console.log("Login attempt:", formData);
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
          }}
        >
          <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
            로그인
          </Typography>

          <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%" }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="이메일 주소"
              name="email"
              autoComplete="email"
              autoFocus
              value={formData.email}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="비밀번호"
              type={showPassword ? "text" : "password"}
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              로그인
            </Button>

          
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Link
              component={RouterLink}
                to="/forgot-email"
                variant="body2"
              >
                이메일을 잊으셨나요?
              </Link>
           
              <Link
                component={RouterLink}
                to="/forgot-password"
                variant="body2"  
              >
                비밀번호를 잊으셨나요?
              </Link>
            </Box>

            <Divider sx={{ my: 2 }}>또는</Divider>

            <Button
              fullWidth
              variant="outlined"
              startIcon={<GoogleIcon />}
              sx={{ mb: 1 }}
            >
              Google로 계속하기
            </Button>
            <Button fullWidth variant="outlined" startIcon={<GitHubIcon />}>
              GitHub로 계속하기
            </Button>

            <Box sx={{ mt: 2, textAlign: "center" }}>
              <Typography variant="body2">
                계정이 없으신가요?{" "}
                <Link component={RouterLink} to="/register">
                  회원가입
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}

export default Login;
