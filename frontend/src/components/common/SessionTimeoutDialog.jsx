import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Typography,
  Box
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

const SessionTimeoutDialog = ({ open, onStayLoggedIn, onLogoutNow }) => {
  return (
    <Dialog
      open={open}
      aria-labelledby="session-timeout-dialog-title"
      aria-describedby="session-timeout-dialog-description"
      // Prevent closing by clicking outside or pressing escape
      // to force the user to make a choice.
      disableEscapeKeyDown
      onClose={(event, reason) => {
        if (reason !== 'backdropClick' && reason !== 'escapeKeyDown') {
          onStayLoggedIn();
        }
      }}
      PaperProps={{
        sx: {
          borderRadius: 2,
          minWidth: 320,
          p: 1
        }
      }}
    >
      <DialogTitle id="session-timeout-dialog-title" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'warning.main' }}>
        <WarningAmberIcon />
        <Typography variant="h6" component="span" fontWeight="bold">
          Session Timeout Warning
        </Typography>
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="session-timeout-dialog-description" sx={{ color: 'text.primary', mt: 1 }}>
          Your session will expire in 1 minute due to inactivity.
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button 
          onClick={onLogoutNow} 
          color="error" 
          variant="outlined"
        >
          Logout Now
        </Button>
        <Button 
          onClick={onStayLoggedIn} 
          color="primary" 
          variant="contained" 
          autoFocus
        >
          Stay Logged In
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SessionTimeoutDialog;
