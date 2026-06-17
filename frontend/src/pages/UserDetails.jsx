import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import adminService from '../services/adminService';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
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
  MenuItem
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import BadgeIcon from '@mui/icons-material/Badge';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import StorefrontIcon from '@mui/icons-material/Storefront';
import StarIcon from '@mui/icons-material/Star';
import { validateName, validateEmail } from '../utils/validation';

const roleBadgeStyle = (role) => ({
  px: 1.5,
  py: 0.4,
  borderRadius: 2,
  fontSize: '0.72rem',
  fontWeight: 700,
  letterSpacing: '0.05em',
  backgroundColor:
    role === 'ADMIN'
      ? 'rgba(99,91,255,0.2)'
      : role === 'STORE_OWNER'
      ? 'rgba(0,212,255,0.2)'
      : 'rgba(255,255,255,0.08)',
  color:
    role === 'ADMIN'
      ? '#635bff'
      : role === 'STORE_OWNER'
      ? '#00d4ff'
      : 'var(--text-secondary)',
  border: `1px solid ${
    role === 'ADMIN'
      ? 'rgba(99,91,255,0.4)'
      : role === 'STORE_OWNER'
      ? 'rgba(0,212,255,0.4)'
      : 'rgba(255,255,255,0.12)'
  }`
});

const InfoRow = ({ icon, label, value }) => (
  <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ py: 1.5 }}>
    <Box sx={{ color: 'var(--text-secondary)', mt: 0.3, flexShrink: 0 }}>{icon}</Box>
    <Box sx={{ flex: 1 }}>
      <Typography variant="caption" sx={{ color: 'var(--text-secondary)', fontWeight: 500, display: 'block', mb: 0.3 }}>
        {label}
      </Typography>
      <Typography variant="body1" sx={{ color: 'white', fontWeight: 500 }}>
        {value || '—'}
      </Typography>
    </Box>
  </Stack>
);

const UserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Edit modal state
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', role: 'USER' });
  const [formErrors, setFormErrors] = useState({});
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

  // Delete modal state
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const fetchUser = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await adminService.getUserById(id);
      if (response.success) {
        setUser(response.data);
      } else {
        setError(response.message || 'Failed to load user details.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching user details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [id]);

  const handleOpenEdit = () => {
    if (!user) return;
    setFormData({ name: user.name, email: user.email, role: user.role });
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
    const nameErr = validateName(formData.name);
    const emailErr = validateEmail(formData.email);
    if (nameErr || emailErr) {
      setFormErrors({ name: nameErr, email: emailErr });
      return;
    }
    setEditLoading(true);
    try {
      const response = await adminService.updateUser(id, {
        name: formData.name,
        email: formData.email,
        role: formData.role
      });
      if (response.success) {
        setOpenEditDialog(false);
        fetchUser();
      } else {
        setEditError(response.message || 'Update failed.');
      }
    } catch (err) {
      setEditError(err.response?.data?.message || 'Error updating user.');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setDeleteLoading(true);
    setDeleteError('');
    try {
      const response = await adminService.deleteUser(id);
      if (response.success) {
        navigate('/admin/users');
      } else {
        setDeleteError(response.message || 'Deletion failed.');
      }
    } catch (err) {
      setDeleteError(err.response?.data?.message || 'Error deleting user.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const avatarLetter = user?.name ? user.name.trim().charAt(0).toUpperCase() : '?';
  const avatarColor =
    user?.role === 'ADMIN' ? '#635bff' : user?.role === 'STORE_OWNER' ? '#00d4ff' : '#4caf50';

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
          onClick={() => navigate('/admin/users')}
          sx={{ mt: 2, color: 'var(--text-secondary)' }}
        >
          Back to Users
        </Button>
      </Box>
    );
  }

  return (
    <Box className="fade-in">
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Tooltip title="Back to Users">
            <IconButton
              onClick={() => navigate('/admin/users')}
              sx={{
                backgroundColor: 'rgba(255,255,255,0.06)',
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.12)' }
              }}
            >
              <ArrowBackIcon />
            </IconButton>
          </Tooltip>
          <Typography variant="h4" sx={{ fontWeight: 700, letterSpacing: '-0.05rem' }}>
            User Details
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
            Edit User
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
            Delete User
          </Button>
        </Stack>
      </Stack>

      <Grid container spacing={4}>
        {/* Left: User Profile Card */}
        <Grid item xs={12} md={4}>
          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: 4,
              backgroundColor: 'rgba(26, 29, 40, 0.65)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2)',
              textAlign: 'center'
            }}
          >
            <Avatar
              sx={{
                width: 90,
                height: 90,
                fontSize: '2.5rem',
                fontWeight: 800,
                mx: 'auto',
                mb: 2,
                backgroundColor: `${avatarColor}30`,
                color: avatarColor,
                border: `2px solid ${avatarColor}60`
              }}
            >
              {avatarLetter}
            </Avatar>

            <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
              {user.name}
            </Typography>
            <Typography variant="body2" sx={{ color: 'var(--text-secondary)', mb: 2 }}>
              {user.email}
            </Typography>

            <Box sx={roleBadgeStyle(user.role)} component="span" display="inline-block">
              {user.role}
            </Box>

            <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.08)' }} />

            <Typography variant="caption" sx={{ color: 'var(--text-secondary)', fontWeight: 600, display: 'block', mb: 1, textAlign: 'left' }}>
              USER ID
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontFamily: 'monospace',
                color: '#635bff',
                backgroundColor: 'rgba(99,91,255,0.1)',
                p: 1,
                borderRadius: 1.5,
                wordBreak: 'break-all',
                textAlign: 'left'
              }}
            >
              #{user.id}
            </Typography>
          </Paper>
        </Grid>

        {/* Right: Details Panel */}
        <Grid item xs={12} md={8}>
          <Stack spacing={3}>
            {/* Account Info */}
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
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                Account Information
              </Typography>
              <Divider sx={{ mb: 2, borderColor: 'rgba(255,255,255,0.08)' }} />

              <InfoRow
                icon={<PersonIcon fontSize="small" />}
                label="Full Name"
                value={user.name}
              />
              <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)' }} />
              <InfoRow
                icon={<EmailIcon fontSize="small" />}
                label="Email Address"
                value={user.email}
              />
              <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)' }} />
              <InfoRow
                icon={<BadgeIcon fontSize="small" />}
                label="Role"
                value={
                  <Box sx={roleBadgeStyle(user.role)} component="span" display="inline-block">
                    {user.role}
                  </Box>
                }
              />
              <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)' }} />
              <InfoRow
                icon={<CalendarTodayIcon fontSize="small" />}
                label="Registered On"
                value={new Date(user.created_at).toLocaleString()}
              />
              <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)' }} />
              <InfoRow
                icon={<CalendarTodayIcon fontSize="small" />}
                label="Last Updated"
                value={new Date(user.updated_at).toLocaleString()}
              />
            </Paper>

            {/* Store Owner Panel — shown only if role is STORE_OWNER */}
            {user.role === 'STORE_OWNER' && (
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 4,
                  backgroundColor: 'rgba(26, 29, 40, 0.65)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(0, 212, 255, 0.18)',
                  boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2)'
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
                  <StorefrontIcon sx={{ color: '#00d4ff' }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Owned Store
                  </Typography>
                </Stack>
                <Divider sx={{ mb: 2.5, borderColor: 'rgba(255,255,255,0.08)' }} />

                {user.store ? (
                  <Card
                    elevation={0}
                    sx={{
                      backgroundColor: 'rgba(0, 212, 255, 0.05)',
                      border: '1px solid rgba(0, 212, 255, 0.15)',
                      borderRadius: 3,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        backgroundColor: 'rgba(0, 212, 255, 0.1)',
                        borderColor: 'rgba(0, 212, 255, 0.35)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 20px rgba(0, 212, 255, 0.1)'
                      }
                    }}
                    onClick={() => navigate(`/admin/stores/${user.store.id}`)}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                            {user.store.name}
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'var(--text-secondary)', mb: 1.5 }}>
                            {user.store.address || 'Address not set'}
                          </Typography>
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography variant="caption" sx={{ color: 'var(--text-secondary)', display: 'block', mb: 0.5 }}>
                            Avg. Rating
                          </Typography>
                          {user.store.average_rating > 0 ? (
                            <Stack direction="row" alignItems="center" spacing={0.5} justifyContent="flex-end">
                              <StarIcon sx={{ color: '#ffb74d', fontSize: '1rem' }} />
                              <Typography variant="h6" sx={{ fontWeight: 800, color: '#ffb74d' }}>
                                {parseFloat(user.store.average_rating).toFixed(1)}
                              </Typography>
                            </Stack>
                          ) : (
                            <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
                              No ratings yet
                            </Typography>
                          )}
                        </Box>
                      </Stack>
                      {user.store.average_rating > 0 && (
                        <Rating
                          value={parseFloat(user.store.average_rating)}
                          precision={0.5}
                          readOnly
                          size="small"
                          sx={{ mt: 0.5 }}
                        />
                      )}
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
                    <StorefrontIcon sx={{ color: 'var(--text-secondary)', mb: 1, fontSize: '2rem' }} />
                    <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
                      No store assigned to this owner yet.
                    </Typography>
                    <Button
                      component={RouterLink}
                      to="/admin/stores"
                      size="small"
                      sx={{ mt: 1.5, color: '#00d4ff' }}
                    >
                      Manage Stores
                    </Button>
                  </Box>
                )}
              </Paper>
            )}
          </Stack>
        </Grid>
      </Grid>

      {/* ---- EDIT USER DIALOG ---- */}
      <Dialog
        open={openEditDialog}
        onClose={() => !editLoading && setOpenEditDialog(false)}
        PaperProps={{
          sx: {
            backgroundColor: '#171923',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 3,
            color: 'white',
            minWidth: '360px'
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>Edit User</DialogTitle>
        <form onSubmit={handleEditSubmit}>
          <DialogContent>
            {editError && <Alert severity="error" sx={{ mb: 2 }}>{editError}</Alert>}
            <TextField
              margin="dense"
              required
              fullWidth
              name="name"
              label="Full Name"
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
              name="email"
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={handleFormChange}
              error={!!formErrors.email}
              helperText={formErrors.email}
              sx={{ mb: 2 }}
            />
            <TextField
              select
              fullWidth
              name="role"
              label="Role"
              value={formData.role}
              onChange={handleFormChange}
              sx={{ textAlign: 'left' }}
            >
              <MenuItem value="USER">USER</MenuItem>
              <MenuItem value="STORE_OWNER">STORE_OWNER</MenuItem>
              <MenuItem value="ADMIN">ADMIN</MenuItem>
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

      {/* ---- DELETE USER DIALOG ---- */}
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
        <DialogTitle sx={{ fontWeight: 600 }}>Delete This User?</DialogTitle>
        <DialogContent>
          {deleteError && <Alert severity="error" sx={{ mb: 2 }}>{deleteError}</Alert>}
          <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
            You are about to permanently delete{' '}
            <strong style={{ color: 'white' }}>{user?.name}</strong>. All their ratings and store
            associations will be removed. This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setOpenDeleteDialog(false)} disabled={deleteLoading} sx={{ color: 'var(--text-secondary)' }}>
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} variant="contained" color="error" disabled={deleteLoading}>
            {deleteLoading ? <CircularProgress size={20} /> : 'Delete User'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserDetails;
