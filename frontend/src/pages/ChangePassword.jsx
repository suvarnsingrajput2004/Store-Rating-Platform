import React, { useState } from 'react';
import authService from '../services/authService';
import { validatePassword } from '../utils/validation';
import {
  Paper,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Container,
  InputAdornment,
  IconButton
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import VpnKeyOutlinedIcon from '@mui/icons-material/VpnKeyOutlined';

const ChangePassword = () => {
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    setServerError('');
    setSuccessMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setSuccessMsg('');

    // Validate inputs
    const oldPassError = formData.oldPassword ? null : 'Current password is required.';
    const newPassError = validatePassword(formData.newPassword);
    const confirmPassError =
      formData.newPassword !== formData.confirmPassword
        ? 'Passwords do not match.'
        : null;

    if (oldPassError || newPassError || confirmPassError) {
      setErrors({
        oldPassword: oldPassError,
        newPassword: newPassError,
        confirmPassword: confirmPassError
      });
      return;
    }

    setLoading(true);
    try {
      const response = await authService.changePassword({
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword
      });

      if (response.success) {
        setSuccessMsg(response.message || 'Password changed successfully.');
        setFormData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setServerError(response.message || 'Failed to update password.');
      }
    } catch (err) {
      setServerError(err.response?.data?.message || 'Error occurred while updating password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 2 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
        Change Password
      </Typography>

      <Paper
        elevation={0}
        className="fade-in"
        sx={{
          p: 4,
          borderRadius: 4,
          backgroundColor: 'rgba(26, 29, 40, 0.65)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #635bff 0%, #00d4ff 100%)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2,
              boxShadow: '0 4px 20px rgba(99, 91, 255, 0.4)'
            }}
          >
            <VpnKeyOutlinedIcon />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Security Settings
          </Typography>
          <Typography variant="body2" sx={{ color: 'var(--text-secondary)', textAlign: 'center' }}>
            Update your account password
          </Typography>
        </Box>

        {serverError && (
          <Alert severity="error" sx={{ mb: 3, backgroundColor: 'rgba(211, 47, 47, 0.15)', color: '#ff8a80' }}>
            {serverError}
          </Alert>
        )}

        {successMsg && (
          <Alert severity="success" sx={{ mb: 3, backgroundColor: 'rgba(76, 175, 80, 0.15)', color: '#81c784' }}>
            {successMsg}
          </Alert>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <TextField
            margin="normal"
            required
            fullWidth
            name="oldPassword"
            label="Current Password"
            type={showOldPass ? 'text' : 'password'}
            id="oldPassword"
            value={formData.oldPassword}
            onChange={handleChange}
            error={!!errors.oldPassword}
            helperText={errors.oldPassword}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowOldPass(!showOldPass)} sx={{ color: 'var(--text-secondary)' }}>
                    {showOldPass ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                color: 'white',
                '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.15)' },
                '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                '&.Mui-focused fieldset': { borderColor: '#635bff' }
              },
              '& .MuiInputLabel-root': { color: 'var(--text-secondary)' },
              '& .MuiInputLabel-root.Mui-focused': { color: '#635bff' }
            }}
          />

          <TextField
            margin="normal"
            required
            fullWidth
            name="newPassword"
            label="New Password"
            type={showNewPass ? 'text' : 'password'}
            id="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            error={!!errors.newPassword}
            helperText={errors.newPassword || '8-16 chars, 1 uppercase, 1 special char'}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowNewPass(!showNewPass)} sx={{ color: 'var(--text-secondary)' }}>
                    {showNewPass ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                color: 'white',
                '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.15)' },
                '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                '&.Mui-focused fieldset': { borderColor: '#635bff' }
              },
              '& .MuiInputLabel-root': { color: 'var(--text-secondary)' },
              '& .MuiInputLabel-root.Mui-focused': { color: '#635bff' },
              '& .MuiFormHelperText-root': { color: errors.newPassword ? '#f44336' : 'rgba(255, 255, 255, 0.5)' }
            }}
          />

          <TextField
            margin="normal"
            required
            fullWidth
            name="confirmPassword"
            label="Confirm New Password"
            type={showConfirmPass ? 'text' : 'password'}
            id="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowConfirmPass(!showConfirmPass)} sx={{ color: 'var(--text-secondary)' }}>
                    {showConfirmPass ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
            sx={{
              mb: 3,
              '& .MuiOutlinedInput-root': {
                color: 'white',
                '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.15)' },
                '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                '&.Mui-focused fieldset': { borderColor: '#635bff' }
              },
              '& .MuiInputLabel-root': { color: 'var(--text-secondary)' },
              '& .MuiInputLabel-root.Mui-focused': { color: '#635bff' }
            }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{
              py: 1.5,
              borderRadius: 2,
              fontWeight: 600,
              fontSize: '1rem',
              textTransform: 'none',
              background: 'linear-gradient(135deg, #635bff 0%, #00d4ff 100%)',
              boxShadow: '0 4px 15px rgba(99, 91, 255, 0.4)',
              '&:hover': {
                background: 'linear-gradient(135deg, #00d4ff 0%, #635bff 100%)'
              },
              '&.Mui-disabled': {
                color: 'rgba(255, 255, 255, 0.3)',
                backgroundColor: 'rgba(255, 255, 255, 0.12)'
              }
            }}
          >
            {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Update Password'}
          </Button>
        </form>
      </Paper>
    </Container>
  );
};

export default ChangePassword;
