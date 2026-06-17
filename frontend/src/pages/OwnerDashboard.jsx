import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Rating,
  LinearProgress
} from '@mui/material';
import { Dashboard as DashboardIcon, Store as StoreIcon, Star as StarIcon, People as PeopleIcon } from '@mui/icons-material';
import { ownerAPI } from '../services/ownerService';

const StatCard = ({ title, value, icon, color }) => (
  <Card 
    sx={{ 
      background: 'rgba(30, 41, 59, 0.7)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      height: '100%'
    }}
  >
    <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
      <Box 
        sx={{ 
          p: 2, 
          borderRadius: 2, 
          bgcolor: `${color}20`, 
          color: color, 
          mr: 3 
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography variant="body2" color="text.secondary" fontWeight="bold">
          {title}
        </Typography>
        <Typography variant="h4" fontWeight="bold">
          {value}
        </Typography>
      </Box>
    </CardContent>
  </Card>
);

const OwnerDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await ownerAPI.getDashboard();
        if (res.success) {
          setData(res.data);
        } else {
          setError(res.message || 'Failed to fetch dashboard data');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!data) {
    return (
      <Box sx={{ textAlign: 'center', mt: 10 }}>
        <Typography variant="h4" color="text.secondary" gutterBottom>
          Welcome, Store Owner
        </Typography>
        <Typography variant="body1" color="text.secondary">
          You have not been assigned to a store yet. Please contact the administrator.
        </Typography>
      </Box>
    );
  }

  const { store, recent_ratings } = data;
  const dist = store.ratings_distribution;

  const calculatePercentage = (count) => {
    if (store.total_ratings === 0) return 0;
    return (count / store.total_ratings) * 100;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <DashboardIcon sx={{ fontSize: 32, mr: 2, color: 'primary.main' }} />
        <Typography variant="h4" component="h1" fontWeight="bold">
          Owner Dashboard
        </Typography>
      </Box>

      {/* Stats Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Total Ratings" 
            value={store.total_ratings} 
            icon={<PeopleIcon sx={{ fontSize: 32 }} />} 
            color="#3b82f6" 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Average Rating" 
            value={store.average_rating} 
            icon={<StarIcon sx={{ fontSize: 32 }} />} 
            color="#eab308" 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Highest Rating Count" 
            value={store.highest_rating_count} 
            icon={<StarRateIcon sx={{ fontSize: 32 }} />} 
            color="#10b981" 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Lowest Rating Count" 
            value={store.lowest_rating_count} 
            icon={<StarRateIcon sx={{ fontSize: 32 }} />} 
            color="#ef4444" 
          />
        </Grid>
      </Grid>

      <Grid container spacing={4}>
        {/* Rating Distribution */}
        <Grid item xs={12} md={4}>
          <Paper 
            sx={{ 
              p: 3, 
              background: 'rgba(30, 41, 59, 0.7)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              height: '100%'
            }}
          >
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
              <StoreIcon sx={{ mr: 1 }} /> {store.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
              {store.address}
            </Typography>

            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
              Rating Distribution
            </Typography>

            {[5, 4, 3, 2, 1].map((star) => (
              <Box key={star} sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                <Typography variant="body2" sx={{ minWidth: 20 }}>{star}</Typography>
                <StarIcon sx={{ fontSize: 16, color: '#faaf00', mr: 1 }} />
                <Box sx={{ flexGrow: 1, mr: 2 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={calculatePercentage(dist[star] || 0)} 
                    sx={{ 
                      height: 8, 
                      borderRadius: 4,
                      bgcolor: 'rgba(255,255,255,0.1)',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: '#faaf00'
                      }
                    }}
                  />
                </Box>
                <Typography variant="body2" sx={{ minWidth: 30, textAlign: 'right' }}>
                  {dist[star] || 0}
                </Typography>
              </Box>
            ))}
          </Paper>
        </Grid>

        {/* Users Who Rated Table */}
        <Grid item xs={12} md={8}>
          <Paper 
            sx={{ 
              p: 3, 
              background: 'rgba(30, 41, 59, 0.7)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              height: '100%'
            }}
          >
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
              Recent Ratings
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>User</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell align="center">Rating</TableCell>
                    <TableCell>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recent_ratings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                        No ratings received yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    recent_ratings.map((row, idx) => (
                      <TableRow key={idx} hover>
                        <TableCell sx={{ fontWeight: 'medium' }}>{row.user_name}</TableCell>
                        <TableCell>{row.user_email}</TableCell>
                        <TableCell align="center">
                          <Rating value={row.rating} readOnly size="small" />
                        </TableCell>
                        <TableCell>{formatDate(row.rating_date)}</TableCell>
                      </TableRow>
                    ))
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

export default OwnerDashboard;
