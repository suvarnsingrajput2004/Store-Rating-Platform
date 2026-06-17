import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Rating,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { StarRate as StarRateIcon, Edit as EditIcon } from '@mui/icons-material';
import { ratingAPI } from '../services/ratingService';

const MyRatings = () => {
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Edit Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedRating, setSelectedRating] = useState(null);
  const [newRatingValue, setNewRatingValue] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const fetchRatings = async () => {
    try {
      setLoading(true);
      const res = await ratingAPI.getMyRatings();
      if (res.success) {
        setRatings(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch ratings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRatings();
  }, []);

  const handleEditClick = (rating) => {
    setSelectedRating(rating);
    setNewRatingValue(rating.rating);
    setEditModalOpen(true);
  };

  const handleUpdateRating = async () => {
    try {
      setSubmitting(true);
      await ratingAPI.updateRating(selectedRating.id, newRatingValue);
      setEditModalOpen(false);
      await fetchRatings();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update rating');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <StarRateIcon sx={{ fontSize: 32, mr: 2, color: 'primary.main' }} />
        <Typography variant="h4" component="h1" fontWeight="bold">
          My Ratings
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Paper 
        sx={{ 
          p: 3, 
          background: 'rgba(30, 41, 59, 0.7)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Store Name</TableCell>
                <TableCell>Store Address</TableCell>
                <TableCell align="center">My Rating</TableCell>
                <TableCell>Rating Date</TableCell>
                <TableCell>Last Updated</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : ratings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                    You haven't rated any stores yet.
                  </TableCell>
                </TableRow>
              ) : (
                ratings.map((rating) => (
                  <TableRow key={rating.id} hover>
                    <TableCell sx={{ fontWeight: 'bold' }}>{rating.store_name}</TableCell>
                    <TableCell>{rating.store_address}</TableCell>
                    <TableCell align="center">
                      <Rating value={rating.rating} readOnly size="small" sx={{ color: 'secondary.main' }} />
                    </TableCell>
                    <TableCell>{formatDate(rating.created_at)}</TableCell>
                    <TableCell>{formatDate(rating.updated_at)}</TableCell>
                    <TableCell align="center">
                      <Button 
                        size="small" 
                        variant="outlined" 
                        startIcon={<EditIcon />}
                        onClick={() => handleEditClick(rating)}
                      >
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={editModalOpen} onClose={() => setEditModalOpen(false)}>
        <DialogTitle>Update Rating for {selectedRating?.store_name}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4, minWidth: 300 }}>
          <Rating 
            value={newRatingValue} 
            onChange={(e, v) => setNewRatingValue(v)} 
            size="large" 
            sx={{ fontSize: '3rem', color: 'secondary.main' }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditModalOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleUpdateRating}
            disabled={submitting || newRatingValue === 0}
          >
            {submitting ? 'Updating...' : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MyRatings;
