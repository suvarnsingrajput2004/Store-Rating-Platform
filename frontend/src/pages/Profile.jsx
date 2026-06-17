import React, { useState, useEffect } from 'react';
import authService from '../services/authService';
import {
  Paper,
  Box,
  Typography,
  Divider,
  Grid,
  CircularProgress,
  Alert,
  Avatar
} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import EmailIcon from '@mui/icons-material/Email';
import ShieldIcon from '@mui/icons-material/Shield';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await authService.getProfile();
        if (response.success) {
          setProfile(response.data);
        } else {
          setError(response.message || 'Failed to load profile.');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Error fetching profile details.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress sx={{ color: '#635bff' }} />
      </Box>
    );
  }

  return (
    <Box className="fade-in" sx={{ mt: 2 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
        User Profile
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3, backgroundColor: 'rgba(211, 47, 47, 0.15)', color: '#ff8a80' }}>
          {error}
        </Alert>
      )}

      {profile && (
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: 4,
            backgroundColor: 'rgba(26, 29, 40, 0.65)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
          }}
        >
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={3} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Avatar
                sx={{
                  width: 100,
                  height: 100,
                  fontSize: '3rem',
                  fontWeight: 600,
                  background: 'linear-gradient(135deg, #635bff 0%, #00d4ff 100%)',
                  boxShadow: '0 4px 20px rgba(99, 91, 255, 0.4)',
                  border: '2px solid rgba(255, 255, 255, 0.2)'
                }}
              >
                {profile.name ? profile.name[0].toUpperCase() : 'U'}
              </Avatar>
              <Typography variant="h6" sx={{ mt: 2, fontWeight: 600, textAlign: 'center' }}>
                {profile.name}
              </Typography>
              <Typography variant="body2" sx={{ color: '#00d4ff', textTransform: 'uppercase', fontWeight: 600, fontSize: '0.75rem', mt: 0.5 }}>
                {profile.role}
              </Typography>
            </Grid>

            <Grid item xs={12} md={9}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <Box>
                  <Typography variant="caption" sx={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <AccountCircleIcon fontSize="small" /> FULL NAME
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {profile.name}
                  </Typography>
                </Box>
                
                <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />

                <Box>
                  <Typography variant="caption" sx={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <EmailIcon fontSize="small" /> EMAIL ADDRESS
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {profile.email}
                  </Typography>
                </Box>
                
                <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />

                <Box>
                  <Typography variant="caption" sx={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <ShieldIcon fontSize="small" /> PLATFORM ROLE
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {profile.role === 'ADMIN' && 'System Administrator'}
                    {profile.role === 'STORE_OWNER' && 'Store Owner'}
                    {profile.role === 'USER' && 'Normal User'}
                  </Typography>
                </Box>

                <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />

                <Box>
                  <Typography variant="caption" sx={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <CalendarTodayIcon fontSize="small" /> MEMBER SINCE
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {new Date(profile.created_at).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      )}
    </Box>
  );
};

export default Profile;
