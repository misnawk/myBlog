import React, { useState } from "react";
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
  Grid,
  Snackbar,
  Alert,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Google as GoogleIcon,
  GitHub as GitHubIcon,
  Email as EmailIcon,
  VpnKey as VpnKeyIcon,
} from "@mui/icons-material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { sendVerificationCode, verifyEmail, register } from '../api/authApi';

const steps = ['이메일 인증', '회원 정보 입력', '완료'];

function Register() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // 이메일 인증 단계 데이터
  const [emailData, setEmailData] = useState({
    email: '',
    verificationCode: '',
    isEmailVerified: false,
  });

  // 회원가입 정보 데이터
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
  });

  const [emailError, setEmailError] = useState('');
  const [codeError, setCodeError] = useState('');

  // 이메일 유효성 검사
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      return '이메일을 입력해주세요.';
    }
    if (!emailRegex.test(email)) {
      return '올바른 이메일 형식이 아닙니다.';
    }
    return '';
  };

  // 이메일 변경 핸들러
  const handleEmailChange = (e) => {
    const email = e.target.value;
    setEmailData({ ...emailData, email });
    setEmailError(validateEmail(email));
  };

  // 인증 코드 변경 핸들러
  const handleCodeChange = (e) => {
    const code = e.target.value.replace(/\D/g, '').slice(0, 6);
    setEmailData({ ...emailData, verificationCode: code });
    setCodeError('');
  };

  // 폼 데이터 변경 핸들러
  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 카운트다운 시작
  const startCountdown = () => {
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // 인증 코드 발송
  const handleSendCode = async () => {
    if (emailError || !emailData.email) {
      setSnackbar({
        open: true,
        message: '올바른 이메일을 입력해주세요.',
        severity: 'error'
      });
      return;
    }

    setLoading(true);
    try {
      await sendVerificationCode(emailData.email);
      setSnackbar({
        open: true,
        message: '인증 코드가 발송되었습니다.',
        severity: 'success'
      });
      startCountdown();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || '인증 코드 발송에 실패했습니다.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // 이메일 인증 코드 검증
  const handleVerifyCode = async () => {
    if (!emailData.verificationCode || emailData.verificationCode.length !== 6) {
      setCodeError('6자리 인증 코드를 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      await verifyEmail(emailData.email, emailData.verificationCode);
      setEmailData({ ...emailData, isEmailVerified: true });
      setSnackbar({
        open: true,
        message: '이메일 인증이 완료되었습니다.',
        severity: 'success'
      });
      setActiveStep(1);
    } catch (error) {
      setCodeError(error.response?.data?.message || '인증 코드가 올바르지 않습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 회원가입 처리
  const handleRegister = async (e) => {
    e.preventDefault();

    // 비밀번호 확인
    if (formData.password !== formData.confirmPassword) {
      setSnackbar({
        open: true,
        message: '비밀번호가 일치하지 않습니다.',
        severity: 'error'
      });
      return;
    }

    setLoading(true);
    try {
      await register({
        username: formData.username,
        email: emailData.email,
        password: formData.password,
      });

      setActiveStep(2);
      setSnackbar({
        open: true,
        message: '회원가입이 완료되었습니다!',
        severity: 'success'
      });

      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || '회원가입에 실패했습니다.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // 이메일 인증 단계 렌더링
  const renderEmailStep = () => (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h6" gutterBottom textAlign="center" color="primary">
        이메일 인증
      </Typography>
      <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mb: 3 }}>
        회원가입을 위해 이메일 인증을 완료해주세요.
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            error={!!emailError}
            helperText={emailError}
            required
            fullWidth
            label="이메일 주소"
            type="email"
            value={emailData.email}
            onChange={handleEmailChange}
            disabled={loading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        
        <Grid item xs={12}>
          <Button
            fullWidth
            variant="contained"
            onClick={handleSendCode}
            disabled={loading || !!emailError || !emailData.email || countdown > 0}
          >
            {loading ? (
              <CircularProgress size={24} />
            ) : countdown > 0 ? (
              `재발송 (${countdown}초)`
            ) : (
              '인증 코드 발송'
            )}
          </Button>
        </Grid>

        <Grid item xs={12}>
          <TextField
            error={!!codeError}
            helperText={codeError}
            required
            fullWidth
            label="인증 코드 (6자리)"
            value={emailData.verificationCode}
            onChange={handleCodeChange}
            disabled={loading}
            placeholder="123456"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <VpnKeyIcon />
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        <Grid item xs={12}>
          <Button
            fullWidth
            variant="contained"
            onClick={handleVerifyCode}
            disabled={loading || !emailData.verificationCode || emailData.verificationCode.length !== 6}
          >
            {loading ? <CircularProgress size={24} /> : '인증 코드 확인'}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );

  // 회원 정보 입력 단계 렌더링
  const renderFormStep = () => (
    <Box component="form" onSubmit={handleRegister} sx={{ width: '100%' }}>
      <Typography variant="h6" gutterBottom textAlign="center" color="primary">
        회원 정보 입력
      </Typography>
      <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mb: 3 }}>
        인증된 이메일: <strong>{emailData.email}</strong>
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            required
            fullWidth
            label="사용자 이름"
            name="username"
            value={formData.username}
            onChange={handleFormChange}
            disabled={loading}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            required
            fullWidth
            label="비밀번호"
            name="password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={handleFormChange}
            disabled={loading}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            required
            fullWidth
            label="비밀번호 확인"
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            value={formData.confirmPassword}
            onChange={handleFormChange}
            disabled={loading}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        <Grid item xs={12}>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{ mt: 2 }}
          >
            {loading ? <CircularProgress size={24} /> : '회원가입 완료'}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );

  // 완료 단계 렌더링
  const renderCompleteStep = () => (
    <Box sx={{ textAlign: 'center', py: 4 }}>
      <Typography variant="h5" color="success.main" gutterBottom>
        🎉 회원가입 완료!
      </Typography>
      <Typography variant="body1" color="text.secondary">
        로그인 페이지로 이동합니다...
      </Typography>
    </Box>
  );

  return (
    <Container component="main" maxWidth="sm">
      <Box sx={{ marginTop: 4, marginBottom: 8 }}>
        <Paper elevation={3} sx={{ padding: 4 }}>
          <Typography component="h1" variant="h4" textAlign="center" gutterBottom>
            회원가입
          </Typography>

          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {activeStep === 0 && renderEmailStep()}
          {activeStep === 1 && renderFormStep()}
          {activeStep === 2 && renderCompleteStep()}

          {activeStep < 2 && (
            <>
              <Divider sx={{ my: 3 }}>또는</Divider>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<GoogleIcon />}
                sx={{ mb: 1 }}
                disabled={loading}
              >
                Google로 계속하기
              </Button>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<GitHubIcon />}
                disabled={loading}
              >
                GitHub로 계속하기
              </Button>
            </>
          )}

          <Box sx={{ mt: 3, textAlign: "center" }}>
            <Typography variant="body2">
              이미 계정이 있으신가요?{" "}
              <Link component={RouterLink} to="/login">
                로그인
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default Register;
