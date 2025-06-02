import React, {useEffect} from 'react';
import {verifyToken} from '../utils/auth';
import {useNavigate} from 'react-router-dom';
import{Box, CircularProgress, Typography} from '@mui/material';

function Landing() {
    const navigate = useNavigate();
  
    useEffect(() => {
        const checkAuthAndRedirect = async () => {
            try {
                const isValid = await verifyToken();
                console.log("토큰 검증 결과:", isValid);
                if(isValid){
                    navigate('/home');
                }else{
                    navigate('/login');
                }
              } catch (error) {
                navigate('/login');
              }
        }
        checkAuthAndRedirect();
    }, [navigate]);

    return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            gap: 2
          }}
        >
          <CircularProgress size={40} />
          <Typography variant="body1" color="text.secondary">
            인증을 확인하는 중...
          </Typography>
        </Box>
      );
}export default Landing;