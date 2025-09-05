import React from 'react';
import {
  Box,
  Button,
  Grid,
  Paper,
  TextField,
  Typography
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import '../../pages/pagestyle.scss';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  maxWidth: 400,
  width: '100%',
  borderRadius: theme.spacing(2),
  boxShadow: '0px 10px 25px rgba(0, 0, 0, 0.1)',
  backgroundColor: '#fff',
  textAlign: 'center',
}));

function Login() {
  const navigate = useNavigate();

  const handleLogin = () => {
    
    sessionStorage.setItem('isLoggedIn', 'true');

    const loginMenu = {
      "Planning Team": {
        1: "Planning_Dashboard",
        2: "Planning_Report",
      },
      "Designing Team": {
        1: "Designing_Dashboard",
        2: "Designing_Report",
      },
      "Coating Team": {
        1: "Coating_Dashboard",
        2: "Coating_Report",
      },
    };

    sessionStorage.setItem("loginMenu", JSON.stringify(loginMenu));

    navigate('/dashboard');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <StyledPaper>
        <Typography variant="h5" mb={2.5} fontWeight="500" sx={{ fontFamily: 'poppins , sans-serif' }}>
          Welcome
        </Typography>

        <TextField
          label="Email"
          variant="outlined"
          fullWidth
          margin="normal"
        />
        <TextField
          label="Password"
          type="password"
          variant="outlined"
          fullWidth
          margin="normal"
        />

        <Button
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 3, py: 1.5, fontWeight: 'bold' }}
          onClick={handleLogin}
        >
          Login
        </Button>
      </StyledPaper>
    </Box>
  );
}

export default Login;
