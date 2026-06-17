import React from 'react';
import Navbar from '../components/Navbar';
import { Box, Container } from '@mui/material';

/**
 * Common Layout component that provides global page structure, consistent margins, and the navigation bar.
 */
const MainLayout = ({ children }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        width: '100%',
        background: 'linear-gradient(135deg, #0f1016 0%, #171923 100%)'
      }}
    >
      <Navbar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 4,
          px: { xs: 2, sm: 3 },
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Container maxWidth="lg" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          {children}
        </Container>
      </Box>
    </Box>
  );
};

export default MainLayout;
