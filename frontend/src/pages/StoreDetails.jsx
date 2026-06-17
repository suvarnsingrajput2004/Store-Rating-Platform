import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import adminService from '../services/adminService';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  CircularProgress,
  Alert,
  Divider,
  Stack,
  Rating,
  Avatar,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  LinearProgress
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import StorefrontIcon from '@mui/icons-material/Storefront';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import StarIcon from '@mui/icons-material/Star';

const glassPaper = {
  p: 3,
  borderRadius: 4,
  backgroundColor: 'rgba(26, 29, 40, 0.65)',
  backdropFilter: 'blur(16px)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2)'
};

const InfoRow = ({ icon, label, value }) => (
  <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ py: 1.5 }}>
    <Box sx={{ color: 'var(--text-secondary)', mt: 0.3, flexShrink: 0 }}>{icon}</Box>
    <Box sx={{ flex: 1 }}>
      <Typography variant="caption" sx={{ color: 'var(--text-secondary)', fontWeight: 500, display: 'block', mb: 0.3 }}>
        {label}
      </Typography>
      <Box>{value || <Typography variant="body1" sx={{ color: 'white', fontWeight: 500 }}>—</Typography>}</Box>
    </Box>
  </Stack>
);

const RatingDistributionBar = ({ star, count, total }) => {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 0.8 }}>
      <Stack direction="row" alignItems="center" spacing={0.5} sx={{ minWidth: 48 }}>
        <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>{star}</Typography>
        <StarIcon sx={{ fontSize: '0.9rem', color: '#ffb74d' }} />
      </Stack>
      <Box sx={{ flex: 1, position: 'relative' }}>
        <LinearProgress
          variant="determinate"
          value={pct}
          sx={{
            height: 8,
            borderRadius: 4,
            backgroundColor: 'rgba(255,255,255,0.08)',
            '& .MuiLinearProgress-bar': {
              borderRadius: 4,
              backgroundColor: star >= 4 ? '#4caf50' : star === 3 ? '#ffb74d' : '#f44336'
            }
          }}
        />
      </Box>
      <Typography variant="body2" sx={{ color: 'var(--text-secondary)', minWidth: 48, textAlign: 'right' }}>
        {count} ({pct}%)
      </Typography>
    </Stack>
  );
};

const StoreDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Edit modal
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [storeOwners, setStoreOwners] = useState([]);
  const [formData, setFormData] = useState({ name: '', address: '', owner_id: '' });
  const [formErrors, setFormErrors] = useState({});
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

  // Delete modal
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const fetchStore = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await adminService.getStoreById(id);
      if (response.success) {
        setStore(response.data);
      } else {
        setError(response.message || 'Failed to load store details.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching store details.');
    } finally {
      setLoading(false);
    }
  };

  const fetchOwners = async () => {
    try {
      const res = await adminService.getUsers({ role: 'STORE_OWNER', limit: 100, page: 1 });
      if (res.success) setStoreOwners(res.data);
    } catch (_) {}
  };

  useEffect(() => {
    fetchStore();
    fetchOwners();
  }, [id]);

  const handleOpenEdit = () => {
    if (!store) return;
    setFormData({
      name: store.name,
      address: store.address || '',
      owner_id: store.owner_id || ''
    });
    setFormErrors({});
    setEditError('');
    setOpenEditDialog(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: '' }));
    setEditError('');
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditError('');
    const errors = {};
    if (!formData.name || formData.name.trim().length < 20 || formData.name.trim().length > 60) {
      errors.name = 'Store name must be between 20 and 60 characters.';
    }
    if (!formData.address || formData.address.trim().length < 10) {
      errors.address = 'Address must be at least 10 characters.';
    }
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setEditLoading(true);
    try {
      const response = await adminService.updateStore(id, {
        name: formData.name,
        address: formData.address,
        owner_id: formData.owner_id || null
      });
      if (response.success) {
        setOpenEditDialog(false);
        fetchStore();
      } else {
        setEditError(response.message || 'Update failed.');
      }
    } catch (err) {
      setEditError(err.response?.data?.message || 'Error updating store.');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setDeleteLoading(true);
    setDeleteError('');
    try {
      const response = await adminService.deleteStore(id);
      if (response.success) {
        navigate('/admin/stores');
      } else {
        setDeleteError(response.message || 'Deletion failed.');
      }
    } catch (err) {
      setDeleteError(err.response?.data?.message || 'Error deleting store.');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Compute rating distribution from store.ratings_distribution (if provided by API)
  const ratingsDistribution = store?.ratings_distribution || {};
  const totalRatings = store?.total_ratings || 0;
  const avgRating = store?.average_rating ? parseFloat(store.average_rating) : 0;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress sx={{ color: '#635bff' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
        <Alert severity="error" sx={{ backgroundColor: 'rgba(211, 47, 47, 0.15)', color: '#ff8a80' }}>
          {error}
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/admin/stores')}
          sx={{ mt: 2, color: 'var(--text-secondary)' }}
        >
          Back to Stores
        </Button>
      </Box>
    );
  }

  return (
    <Box className="fade-in">
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Tooltip title="Back to Stores">
            <IconButton
              onClick={() => navigate('/admin/stores')}
              sx={{
                backgroundColor: 'rgba(255,255,255,0.06)',
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.12)' }
              }}
            >
              <ArrowBackIcon />
            </IconButton>
          </Tooltip>
          <Typography variant="h4" sx={{ fontWeight: 700, letterSpacing: '-0.05rem' }}>
            Store Details
          </Typography>
        </Stack>
        <Stack direction="row" spacing={1.5}>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={handleOpenEdit}
            sx={{
              borderColor: 'rgba(255,183,77,0.5)',
              color: '#ffb74d',
              '&:hover': { borderColor: '#ffb74d', backgroundColor: 'rgba(255,183,77,0.08)' }
            }}
          >
            Edit Store
          </Button>
          <Button
            variant="outlined"
            startIcon={<DeleteIcon />}
            onClick={() => setOpenDeleteDialog(true)}
            sx={{
              borderColor: 'rgba(255,77,77,0.5)',
              color: '#ff4d4d',
              '&:hover': { borderColor: '#ff4d4d', backgroundColor: 'rgba(255,77,77,0.08)' }
            }}
          >
            Delete Store
          </Button>
        </Stack>
      </Stack>

      <Grid container spacing={4}>
        {/* Left Column */}
        <Grid item xs={12} md={4}>
          <Stack spacing={3}>
            {/* Store Identity Card */}
            <Paper elevation={0} sx={glassPaper}>
              <Box
                sx={{
                  width: 72,
                  height: 72,
                  borderRadius: 3,
                  backgroundColor: 'rgba(0, 212, 255, 0.12)',
                  border: '1px solid rgba(0, 212, 255, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2
                }}
              >
                <StorefrontIcon sx={{ fontSize: '2rem', color: '#00d4ff' }} />
              </Box>

              <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                {store.name}
              </Typography>
              <Typography variant="body2" sx={{ color: 'var(--text-secondary)', mb: 2.5 }}>
                {store.address || 'No address provided'}
              </Typography>

              <Divider sx={{ mb: 2, borderColor: 'rgba(255,255,255,0.08)' }} />

              <Typography variant="caption" sx={{ color: 'var(--text-secondary)', fontWeight: 600, display: 'block', mb: 1 }}>
                STORE ID
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontFamily: 'monospace',
                  color: '#00d4ff',
                  backgroundColor: 'rgba(0,212,255,0.08)',
                  p: 1,
                  borderRadius: 1.5
                }}
              >
                #{store.id}
              </Typography>
            </Paper>

            {/* Rating Summary Card */}
            <Paper
              elevation={0}
              sx={{
                ...glassPaper,
                border: '1px solid rgba(255, 183, 77, 0.18)'
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
                <StarIcon sx={{ color: '#ffb74d' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Rating Summary
                </Typography>
              </Stack>
              <Divider sx={{ mb: 2.5, borderColor: 'rgba(255,255,255,0.08)' }} />

              {totalRatings > 0 ? (
                <>
                  <Stack direction="row" alignItems="baseline" spacing={1} sx={{ mb: 1 }}>
                    <Typography variant="h2" sx={{ fontWeight: 800, color: '#ffb74d', lineHeight: 1 }}>
                      {avgRating.toFixed(1)}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>/ 5.0</Typography>
                  </Stack>
                  <Rating value={avgRating} precision={0.5} readOnly size="medium" sx={{ mb: 0.5 }} />
                  <Typography variant="body2" sx={{ color: 'var(--text-secondary)', mb: 2.5 }}>
                    Based on {totalRatings} {totalRatings === 1 ? 'review' : 'reviews'}
                  </Typography>

                  <Divider sx={{ mb: 2, borderColor: 'rgba(255,255,255,0.08)' }} />
                  <Typography variant="caption" sx={{ color: 'var(--text-secondary)', fontWeight: 600, display: 'block', mb: 1.5 }}>
                    RATING BREAKDOWN
                  </Typography>
                  {[5, 4, 3, 2, 1].map((star) => (
                    <RatingDistributionBar
                      key={star}
                      star={star}
                      count={ratingsDistribution[star] || 0}
                      total={totalRatings}
                    />
                  ))}
                </>
              ) : (
                <Box sx={{ textAlign: 'center', py: 2 }}>
                  <StarIcon sx={{ fontSize: '2.5rem', color: 'rgba(255,183,77,0.3)', mb: 1 }} />
                  <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
                    No ratings submitted yet.
                  </Typography>
                </Box>
              )}
            </Paper>
          </Stack>
        </Grid>

        {/* Right Column */}
        <Grid item xs={12} md={8}>
          <Stack spacing={3}>
            {/* Store Info */}
            <Paper elevation={0} sx={glassPaper}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                Store Information
              </Typography>
              <Divider sx={{ mb: 2, borderColor: 'rgba(255,255,255,0.08)' }} />

              <InfoRow
                icon={<StorefrontIcon fontSize="small" />}
                label="Store Name"
                value={<Typography variant="body1" sx={{ color: 'white', fontWeight: 500 }}>{store.name}</Typography>}
              />
              <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)' }} />
              <InfoRow
                icon={<LocationOnIcon fontSize="small" />}
                label="Address"
                value={<Typography variant="body1" sx={{ color: 'white', fontWeight: 500 }}>{store.address || '—'}</Typography>}
              />
              <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)' }} />
              <InfoRow
                icon={<CalendarTodayIcon fontSize="small" />}
                label="Created On"
                value={<Typography variant="body1" sx={{ color: 'white', fontWeight: 500 }}>{new Date(store.created_at).toLocaleString()}</Typography>}
              />
              <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)' }} />
              <InfoRow
                icon={<CalendarTodayIcon fontSize="small" />}
                label="Last Updated"
                value={<Typography variant="body1" sx={{ color: 'white', fontWeight: 500 }}>{new Date(store.updated_at).toLocaleString()}</Typography>}
              />
            </Paper>

            {/* Owner Info */}
            <Paper
              elevation={0}
              sx={{
                ...glassPaper,
                border: store.owner ? '1px solid rgba(99, 91, 255, 0.18)' : '1px solid rgba(255,255,255,0.08)'
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
                <PersonIcon sx={{ color: '#635bff' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Store Owner
                </Typography>
              </Stack>
              <Divider sx={{ mb: 2.5, borderColor: 'rgba(255,255,255,0.08)' }} />

              {store.owner ? (
                <Card
                  elevation={0}
                  sx={{
                    backgroundColor: 'rgba(99, 91, 255, 0.05)',
                    border: '1px solid rgba(99, 91, 255, 0.15)',
                    borderRadius: 3,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: 'rgba(99, 91, 255, 0.1)',
                      borderColor: 'rgba(99, 91, 255, 0.35)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 20px rgba(99, 91, 255, 0.12)'
                    }
                  }}
                  onClick={() => navigate(`/admin/users/${store.owner.id}`)}
                >
                  <CardContent sx={{ p: 2.5 }}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Avatar
                        sx={{
                          width: 48,
                          height: 48,
                          fontSize: '1.2rem',
                          fontWeight: 700,
                          backgroundColor: 'rgba(99,91,255,0.2)',
                          color: '#635bff',
                          border: '1px solid rgba(99,91,255,0.4)'
                        }}
                      >
                        {store.owner.name?.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'white' }}>
                          {store.owner.name}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
                          {store.owner.email}
                        </Typography>
                      </Box>
                      <Box sx={{ ml: 'auto' }}>
                        <Box
                          component="span"
                          sx={{
                            px: 1.2,
                            py: 0.4,
                            borderRadius: 1.5,
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            backgroundColor: 'rgba(0,212,255,0.15)',
                            color: '#00d4ff',
                            border: '1px solid rgba(0,212,255,0.3)'
                          }}
                        >
                          STORE_OWNER
                        </Box>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              ) : (
                <Box
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    backgroundColor: 'rgba(255,255,255,0.04)',
                    border: '1px dashed rgba(255,255,255,0.12)',
                    textAlign: 'center'
                  }}
                >
                  <PersonIcon sx={{ color: 'var(--text-secondary)', mb: 1, fontSize: '2rem' }} />
                  <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
                    No owner assigned to this store.
                  </Typography>
                  <Button
                    size="small"
                    onClick={handleOpenEdit}
                    sx={{ mt: 1.5, color: '#635bff' }}
                  >
                    Assign Owner
                  </Button>
                </Box>
              )}
            </Paper>
          </Stack>
        </Grid>
      </Grid>

      {/* ---- EDIT STORE DIALOG ---- */}
      <Dialog
        open={openEditDialog}
        onClose={() => !editLoading && setOpenEditDialog(false)}
        PaperProps={{
          sx: {
            backgroundColor: '#171923',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 3,
            color: 'white',
            minWidth: '400px'
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>Edit Store</DialogTitle>
        <form onSubmit={handleEditSubmit}>
          <DialogContent>
            {editError && <Alert severity="error" sx={{ mb: 2 }}>{editError}</Alert>}
            <TextField
              margin="dense"
              required
              fullWidth
              name="name"
              label="Store Name"
              value={formData.name}
              onChange={handleFormChange}
              error={!!formErrors.name}
              helperText={formErrors.name || 'Must be 20–60 characters.'}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              required
              fullWidth
              name="address"
              label="Address"
              multiline
              rows={3}
              value={formData.address}
              onChange={handleFormChange}
              error={!!formErrors.address}
              helperText={formErrors.address || 'At least 10 characters.'}
              sx={{ mb: 2 }}
            />
            <TextField
              select
              fullWidth
              name="owner_id"
              label="Assign Owner (optional)"
              value={formData.owner_id}
              onChange={handleFormChange}
              sx={{ textAlign: 'left' }}
            >
              <MenuItem value="">— No Owner —</MenuItem>
              {storeOwners.map((owner) => (
                <MenuItem key={owner.id} value={owner.id}>
                  {owner.name} ({owner.email})
                </MenuItem>
              ))}
            </TextField>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={() => setOpenEditDialog(false)} disabled={editLoading} sx={{ color: 'var(--text-secondary)' }}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={editLoading}>
              {editLoading ? <CircularProgress size={20} /> : 'Save Changes'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* ---- DELETE STORE DIALOG ---- */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => !deleteLoading && setOpenDeleteDialog(false)}
        PaperProps={{
          sx: {
            backgroundColor: '#171923',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 3,
            color: 'white'
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>Delete This Store?</DialogTitle>
        <DialogContent>
          {deleteError && <Alert severity="error" sx={{ mb: 2 }}>{deleteError}</Alert>}
          <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
            You are about to permanently delete{' '}
            <strong style={{ color: 'white' }}>{store?.name}</strong>. All associated ratings will
            be removed. This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setOpenDeleteDialog(false)} disabled={deleteLoading} sx={{ color: 'var(--text-secondary)' }}>
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} variant="contained" color="error" disabled={deleteLoading}>
            {deleteLoading ? <CircularProgress size={20} /> : 'Delete Store'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StoreDetails;
