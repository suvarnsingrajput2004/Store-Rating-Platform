import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Container, Paper } from '@mui/material';
import GppBadIcon from '@mui/icons-material/GppBad';

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm" sx={{ display: 'flex', minHeight: '70vh', alignItems: 'center', justifyContent: 'center' }}>
      <Paper
        elevation={0}
        className="fade-in"
        sx={{
          padding: 5,
          borderRadius: 4,
          backgroundColor: 'rgba(26, 29, 40, 0.65)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
          textAlign: 'center',
          width: '100%'
        }}
      >
        <Box
          sx={{
            p: 2,
            borderRadius: '50%',
            backgroundColor: 'rgba(211, 47, 47, 0.15)',
            color: '#ff8a80',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 3
          }}
        >
          <GppBadIcon sx={{ fontSize: '3.5rem' }} />
        </Box>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
          Access Denied
        </Typography>
        <Typography variant="body1" sx={{ color: 'var(--text-secondary)', mb: 4 }}>
          You do not have the required permissions to view this page. If you believe this is an error, please contact your administrator.
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate('/')}
          sx={{
            py: 1.2,
            px: 4,
            fontWeight: 600,
            textTransform: 'none',
            background: 'linear-gradient(135deg, #635bff 0%, #00d4ff 100%)',
            boxShadow: '0 4px 15px rgba(99, 91, 255, 0.3)',
            '&:hover': {
              background: 'linear-gradient(135deg, #00d4ff 0%, #635bff 100%)'
            }
          }}
        >
          Back to Safety
        </Button>
      </Paper>
    </Container>
  );
};

export default Unauthorized;
