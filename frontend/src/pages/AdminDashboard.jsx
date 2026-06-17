import React, { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import adminService from '../services/adminService';
import {
  Grid,
  Paper,
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Button,
  Rating
} from '@mui/material';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import StorefrontIcon from '@mui/icons-material/Storefront';
import StarIcon from '@mui/icons-material/Star';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await adminService.getDashboardStats();
        if (response.success) {
          setData(response.data);
        } else {
          setError(response.message || 'Failed to load stats.');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Error fetching dashboard analytics.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress sx={{ color: '#635bff' }} />
      </Box>
    );
  }

  const stats = data?.stats || { totalUsers: 0, totalStores: 0, totalRatings: 0 };
  const latestUsers = data?.latestUsers || [];
  const latestStores = data?.latestStores || [];

  return (
    <Box className="fade-in">
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 4, letterSpacing: '-0.05rem' }}>
        Admin Dashboard
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3, backgroundColor: 'rgba(211, 47, 47, 0.15)', color: '#ff8a80' }}>
          {error}
        </Alert>
      )}

      {/* Stats Cards Section */}
      <Grid container spacing={3} sx={{ mb: 5 }}>
        {/* Users Card */}
        <Grid item xs={12} sm={4}>
          <Card
            elevation={0}
            sx={{
              background: 'linear-gradient(135deg, rgba(99, 91, 255, 0.15) 0%, rgba(99, 91, 255, 0.05) 100%)',
              border: '1px solid rgba(99, 91, 255, 0.25)',
              borderRadius: 4,
              boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2)',
            }}
          >
            <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 3 }}>
              <Box>
                <Typography variant="body2" sx={{ color: 'var(--text-secondary)', fontWeight: 500, mb: 1 }}>
                  TOTAL USERS
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 800, color: 'white' }}>
                  {stats.totalUsers}
                </Typography>
              </Box>
              <Box sx={{ p: 2, borderRadius: 3, backgroundColor: 'rgba(99, 91, 255, 0.2)', color: '#635bff', display: 'flex' }}>
                <PeopleAltIcon sx={{ fontSize: '2rem' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Stores Card */}
        <Grid item xs={12} sm={4}>
          <Card
            elevation={0}
            sx={{
              background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.15) 0%, rgba(0, 212, 255, 0.05) 100%)',
              border: '1px solid rgba(0, 212, 255, 0.25)',
              borderRadius: 4,
              boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2)',
            }}
          >
            <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 3 }}>
              <Box>
                <Typography variant="body2" sx={{ color: 'var(--text-secondary)', fontWeight: 500, mb: 1 }}>
                  TOTAL STORES
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 800, color: 'white' }}>
                  {stats.totalStores}
                </Typography>
              </Box>
              <Box sx={{ p: 2, borderRadius: 3, backgroundColor: 'rgba(0, 212, 255, 0.2)', color: '#00d4ff', display: 'flex' }}>
                <StorefrontIcon sx={{ fontSize: '2rem' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Ratings Card */}
        <Grid item xs={12} sm={4}>
          <Card
            elevation={0}
            sx={{
              background: 'linear-gradient(135deg, rgba(255, 183, 77, 0.15) 0%, rgba(255, 183, 77, 0.05) 100%)',
              border: '1px solid rgba(255, 183, 77, 0.25)',
              borderRadius: 4,
              boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2)',
            }}
          >
            <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 3 }}>
              <Box>
                <Typography variant="body2" sx={{ color: 'var(--text-secondary)', fontWeight: 500, mb: 1 }}>
                  TOTAL RATINGS
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 800, color: 'white' }}>
                  {stats.totalRatings}
                </Typography>
              </Box>
              <Box sx={{ p: 2, borderRadius: 3, backgroundColor: 'rgba(255, 183, 77, 0.2)', color: '#ffb74d', display: 'flex' }}>
                <StarIcon sx={{ fontSize: '2rem' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Latest Entries Tables */}
      <Grid container spacing={4}>
        {/* Latest Users Table */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 4,
              backgroundColor: 'rgba(26, 29, 40, 0.65)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2)'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Latest Users
              </Typography>
              <Button
                component={RouterLink}
                to="/admin/users"
                size="small"
                endIcon={<ArrowForwardIcon />}
                sx={{ color: '#00d4ff', fontWeight: 600 }}
              >
                Manage
              </Button>
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ '& th': { borderBottom: '1px solid rgba(255,255,255,0.08)', fontWeight: 600, color: 'var(--text-secondary)' } }}>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {latestUsers.length > 0 ? (
                    latestUsers.map((u) => (
                      <TableRow key={u.id} hover sx={{ '& td': { borderBottom: '1px solid rgba(255,255,255,0.05)', py: 1.5 }, cursor: 'pointer' }} onClick={() => navigate(`/admin/users/${u.id}`)}>
                        <TableCell sx={{ color: 'white', fontWeight: 500 }}>{u.name}</TableCell>
                        <TableCell sx={{ color: 'var(--text-secondary)' }}>{u.email}</TableCell>
                        <TableCell>
                          <Box
                            component="span"
                            sx={{
                              px: 1.2,
                              py: 0.3,
                              borderRadius: 1.5,
                              fontSize: '0.7rem',
                              fontWeight: 600,
                              backgroundColor: u.role === 'ADMIN' ? 'rgba(99,91,255,0.15)' : u.role === 'STORE_OWNER' ? 'rgba(0,212,255,0.15)' : 'rgba(255,255,255,0.08)',
                              color: u.role === 'ADMIN' ? '#635bff' : u.role === 'STORE_OWNER' ? '#00d4ff' : 'var(--text-secondary)'
                            }}
                          >
                            {u.role}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} align="center" sx={{ color: 'var(--text-secondary)', py: 3 }}>
                        No users registered yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Latest Stores Table */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 4,
              backgroundColor: 'rgba(26, 29, 40, 0.65)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2)'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Latest Stores
              </Typography>
              <Button
                component={RouterLink}
                to="/admin/stores"
                size="small"
                endIcon={<ArrowForwardIcon />}
                sx={{ color: '#00d4ff', fontWeight: 600 }}
              >
                Manage
              </Button>
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ '& th': { borderBottom: '1px solid rgba(255,255,255,0.08)', fontWeight: 600, color: 'var(--text-secondary)' } }}>
                    <TableCell>Store Name</TableCell>
                    <TableCell>Address</TableCell>
                    <TableCell align="right">Avg Rating</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {latestStores.length > 0 ? (
                    latestStores.map((s) => (
                      <TableRow key={s.id} hover sx={{ '& td': { borderBottom: '1px solid rgba(255,255,255,0.05)', py: 1.5 }, cursor: 'pointer' }} onClick={() => navigate(`/admin/stores/${s.id}`)}>
                        <TableCell sx={{ color: 'white', fontWeight: 500 }}>{s.name}</TableCell>
                        <TableCell sx={{ color: 'var(--text-secondary)', maxwidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {s.address}
                        </TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                            <Rating name="read-only-star" value={s.average_rating} precision={0.5} readOnly size="small" />
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#ffb74d' }}>
                              {s.average_rating > 0 ? s.average_rating : '-'}
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} align="center" sx={{ color: 'var(--text-secondary)', py: 3 }}>
                        No stores created yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;
