import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Alert,
  Rating,
  Button,
  LinearProgress,
  Card,
  CardContent,
  Divider,
  Snackbar
} from '@mui/material';
import { Store as StoreIcon, Star as StarIcon, Person as PersonIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { storeAPI } from '../services/storeService';
import { ratingAPI } from '../services/ratingService';

const UserStoreDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [myRating, setMyRating] = useState(0);
  const [ratingId, setRatingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchStoreData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const storeRes = await storeAPI.getStoreById(id);
      if (storeRes.success) {
        setStore(storeRes.data);
      } else {
        setError('Failed to fetch store details');
      }

      // We need to know if the user already rated this store to populate "My Rating"
      // Wait, StoreService.getStoreById doesn't return my_rating directly because it's a generic public endpoint
      // We should check the user's ratings list to see if they rated this store
      const myRatingsRes = await ratingAPI.getMyRatings();
      if (myRatingsRes.success) {
        const userRatingForThisStore = myRatingsRes.data.find(r => r.store_id === parseInt(id));
        if (userRatingForThisStore) {
          setMyRating(userRatingForThisStore.rating);
          setRatingId(userRatingForThisStore.id);
        }
      }
      
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStoreData();
  }, [id]);

  const handleRatingChange = (event, newValue) => {
    setMyRating(newValue);
  };

  const handleSubmitRating = async () => {
    if (myRating === 0) {
      setSnackbar({ open: true, message: 'Please select a rating from 1 to 5 stars', severity: 'warning' });
      return;
    }

    try {
      setSubmitting(true);
      if (ratingId) {
        // Update existing rating
        await ratingAPI.updateRating(ratingId, myRating);
        setSnackbar({ open: true, message: 'Rating updated successfully!', severity: 'success' });
      } else {
        // Submit new rating
        const res = await ratingAPI.submitRating(id, myRating);
        setRatingId(res.data.id);
        setSnackbar({ open: true, message: 'Rating submitted successfully!', severity: 'success' });
      }
      
      // Refresh store data to get updated averages
      await fetchStoreData();
    } catch (err) {
      setSnackbar({ 
        open: true, 
        message: err.response?.data?.message || err.message || 'Failed to submit rating', 
        severity: 'error' 
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !store) {
    return <Alert severity="error">{error || 'Store not found'}</Alert>;
  }

  const { ratings_distribution = {}, total_ratings = 0 } = store;

  const calculatePercentage = (count) => {
    if (total_ratings === 0) return 0;
    return (count / total_ratings) * 100;
  };

  return (
    <Box>
      <Button 
        startIcon={<ArrowBackIcon />} 
        onClick={() => navigate('/stores')}
        sx={{ mb: 3 }}
      >
        Back to Stores
      </Button>

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Paper 
            sx={{ 
              p: 4, 
              background: 'rgba(30, 41, 59, 0.7)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              mb: 4
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <StoreIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
              <Typography variant="h3" fontWeight="bold">
                {store.name}
              </Typography>
            </Box>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 4, ml: 7 }}>
              {store.address}
            </Typography>
            
            <Divider sx={{ mb: 4, borderColor: 'rgba(255,255,255,0.1)' }} />

            <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
              Rate this Store
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3, bgcolor: 'rgba(0,0,0,0.2)', borderRadius: 2 }}>
              <Rating 
                value={myRating} 
                onChange={handleRatingChange} 
                size="large" 
                sx={{ fontSize: '3rem', mb: 3, color: 'secondary.main' }}
              />
              <Button 
                variant="contained" 
                color="secondary" 
                size="large" 
                onClick={handleSubmitRating}
                disabled={submitting}
                sx={{ px: 5, py: 1.5, fontWeight: 'bold' }}
              >
                {submitting ? <CircularProgress size={24} /> : (ratingId ? 'Update Rating' : 'Submit Rating')}
              </Button>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card 
            sx={{ 
              background: 'rgba(30, 41, 59, 0.7)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            <CardContent>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
                Rating Overview
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                <Typography variant="h2" fontWeight="bold" sx={{ mr: 2, color: 'primary.main' }}>
                  {store.average_rating}
                </Typography>
                <Box>
                  <Rating value={store.average_rating} precision={0.1} readOnly size="medium" />
                  <Typography variant="body2" color="text.secondary">
                    Based on {total_ratings} {total_ratings === 1 ? 'rating' : 'ratings'}
                  </Typography>
                </Box>
              </Box>

              {[5, 4, 3, 2, 1].map((star) => (
                <Box key={star} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2" sx={{ minWidth: 20 }}>{star}</Typography>
                  <StarIcon sx={{ fontSize: 16, color: '#faaf00', mr: 1 }} />
                  <Box sx={{ flexGrow: 1, mr: 2 }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={calculatePercentage(ratings_distribution[star] || 0)} 
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
                    {ratings_distribution[star] || 0}
                  </Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UserStoreDetails;
