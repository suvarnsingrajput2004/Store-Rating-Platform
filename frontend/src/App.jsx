import React, { useState } from 'react';
import { BrowserRouter, useNavigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Snackbar, Alert } from '@mui/material';

import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes/AppRoutes';
import useAuth from './hooks/useAuth';
import useIdleTimeout from './hooks/useIdleTimeout';
import SessionTimeoutDialog from './components/common/SessionTimeoutDialog';

// Create a custom dark theme matching premium design requirements
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#0d0e12',
      paper: '#1a1d28',
    },
    primary: {
      main: '#635bff', // Premium Royal Purple
    },
    secondary: {
      main: '#00d4ff', // Electric Cyan
    },
    text: {
      primary: '#f7fafc',
      secondary: '#a0aec0',
    },
    error: {
      main: '#ff4d4d',
    },
    warning: {
      main: '#ffb74d',
    },
    success: {
      main: '#81c784',
    },
  },
  typography: {
    fontFamily: [
      'Outfit',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h4: {
      letterSpacing: '-0.05rem',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});


const SessionManager = ({ children }) => {
  const { isAuthenticated, logout } = useAuth();
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const handleLogout = React.useCallback((reason) => {
    console.log('[SessionManager] handleLogout called, reason:', reason);
    logout();
    if (reason === 'idle_timeout') {
      setSnackbarOpen(true);
    }
  }, [logout]);

  const { isWarningOpen, stayLoggedIn, logoutNow } = useIdleTimeout(isAuthenticated, handleLogout);

  // Debug: confirm this component is alive and what state it sees
  React.useEffect(() => {
    console.log('[SessionManager] mounted/updated — isAuthenticated:', isAuthenticated, '— isWarningOpen:', isWarningOpen);
  }, [isAuthenticated, isWarningOpen]);

  return (
    <>
      <SessionTimeoutDialog 
        open={isWarningOpen} 
        onStayLoggedIn={stayLoggedIn} 
        onLogoutNow={logoutNow} 
      />
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="warning" onClose={() => setSnackbarOpen(false)}>
          Session expired due to inactivity. Please login again.
        </Alert>
      </Snackbar>
      {children}
    </>
  );
};

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <BrowserRouter>
        <AuthProvider>
          <SessionManager>
            <AppRoutes />
          </SessionManager>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
