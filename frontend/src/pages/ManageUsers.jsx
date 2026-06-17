import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import adminService from '../services/adminService';
import { validateName, validateEmail, validatePassword } from '../utils/validation';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  MenuItem,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TablePagination,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Stack,
  Tooltip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';

const ManageUsers = () => {
  const navigate = useNavigate();

  // List States
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState('');

  // Paging, Sorting, Filtering Params
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('DESC');
  const [roleFilter, setRoleFilter] = useState('');

  // Dialog Modals States
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  // Form Fields State
  const [formData, setFormData] = useState({ id: '', name: '', email: '', password: '', role: 'USER' });
  const [formErrors, setFormErrors] = useState({});
  const [dialogLoading, setDialogLoading] = useState(false);
  const [dialogError, setDialogError] = useState('');

  // Active target for deletion
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    setListError('');
    try {
      const response = await adminService.getUsers({
        page: page + 1,
        limit: rowsPerPage,
        search,
        sortBy,
        sortOrder,
        role: roleFilter
      });
      if (response.success) {
        setUsers(response.data);
        setTotal(response.pagination.total);
      } else {
        setListError(response.message || 'Failed to retrieve users.');
      }
    } catch (err) {
      setListError(err.response?.data?.message || 'Error occurred while querying users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, rowsPerPage, sortBy, sortOrder, roleFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    fetchUsers();
  };

  const handleSort = (columnName) => {
    const isAsc = sortBy === columnName && sortOrder === 'ASC';
    setSortOrder(isAsc ? 'DESC' : 'ASC');
    setSortBy(columnName);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
    setDialogError('');
  };

  // Open Dialog triggers
  const handleOpenAdd = () => {
    setFormData({ id: '', name: '', email: '', password: '', role: 'USER' });
    setFormErrors({});
    setDialogError('');
    setOpenAddDialog(true);
  };

  const handleOpenEdit = (user) => {
    setFormData({ id: user.id, name: user.name, email: user.email, password: '', role: user.role });
    setFormErrors({});
    setDialogError('');
    setOpenEditDialog(true);
  };

  const handleOpenDelete = (id) => {
    setDeleteTargetId(id);
    setOpenDeleteDialog(true);
  };

  // Submit Operations
  const handleAddUser = async (e) => {
    e.preventDefault();
    setDialogError('');

    const nameErr = validateName(formData.name);
    const emailErr = validateEmail(formData.email);
    const passErr = validatePassword(formData.password);

    if (nameErr || emailErr || passErr) {
      setFormErrors({ name: nameErr, email: emailErr, password: passErr });
      return;
    }

    setDialogLoading(true);
    try {
      const response = await adminService.createUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role
      });
      if (response.success) {
        setOpenAddDialog(false);
        fetchUsers();
      } else {
        setDialogError(response.message || 'Creation failed.');
      }
    } catch (err) {
      setDialogError(err.response?.data?.message || 'Error creating user.');
    } finally {
      setDialogLoading(false);
    }
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    setDialogError('');

    const nameErr = validateName(formData.name);
    const emailErr = validateEmail(formData.email);

    if (nameErr || emailErr) {
      setFormErrors({ name: nameErr, email: emailErr });
      return;
    }

    setDialogLoading(true);
    try {
      const response = await adminService.updateUser(formData.id, {
        name: formData.name,
        email: formData.email,
        role: formData.role
      });
      if (response.success) {
        setOpenEditDialog(false);
        fetchUsers();
      } else {
        setDialogError(response.message || 'Update failed.');
      }
    } catch (err) {
      setDialogError(err.response?.data?.message || 'Error updating user details.');
    } finally {
      setDialogLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    setDialogLoading(true);
    setDialogError('');
    try {
      const response = await adminService.deleteUser(deleteTargetId);
      if (response.success) {
        setOpenDeleteDialog(false);
        fetchUsers();
      } else {
        setDialogError(response.message || 'Deletion failed.');
      }
    } catch (err) {
      setDialogError(err.response?.data?.message || 'Error deleting user.');
    } finally {
      setDialogLoading(false);
    }
  };

  return (
    <Box className="fade-in">
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, letterSpacing: '-0.05rem' }}>
          User Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenAdd}
          sx={{
            background: 'linear-gradient(135deg, #635bff 0%, #00d4ff 100%)',
            boxShadow: '0 4px 15px rgba(99, 91, 255, 0.4)',
            '&:hover': {
              background: 'linear-gradient(135deg, #00d4ff 0%, #635bff 100%)'
            }
          }}
        >
          Add User
        </Button>
      </Stack>

      {listError && (
        <Alert severity="error" sx={{ mb: 3, backgroundColor: 'rgba(211, 47, 47, 0.15)', color: '#ff8a80' }}>
          {listError}
        </Alert>
      )}

      {/* Filter and Search Panel */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 4,
          backgroundColor: 'rgba(26, 29, 40, 0.65)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 3
        }}
      >
        <form onSubmit={handleSearchSubmit}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={5}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ color: 'var(--text-secondary)', mr: 1 }} />
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.15)' }
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={3} md={3}>
              <TextField
                select
                fullWidth
                size="small"
                label="Role Filter"
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setPage(0);
                }}
                sx={{
                  textAlign: 'left',
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.15)' }
                  },
                  '& .MuiInputLabel-root': { color: 'var(--text-secondary)' }
                }}
              >
                <MenuItem value="">All Roles</MenuItem>
                <MenuItem value="USER">USER</MenuItem>
                <MenuItem value="STORE_OWNER">STORE_OWNER</MenuItem>
                <MenuItem value="ADMIN">ADMIN</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={3} md={2}>
              <Button type="submit" variant="contained" fullWidth sx={{ py: 1, textTransform: 'none' }}>
                Search
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>

      {/* Users Data Table */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 4,
          backgroundColor: 'rgba(26, 29, 40, 0.65)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2)',
          overflow: 'hidden'
        }}
      >
        <TableContainer>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow sx={{ '& th': { borderBottom: '1px solid rgba(255,255,255,0.08)', fontWeight: 600, color: 'var(--text-secondary)' } }}>
                <TableCell>
                  <TableSortLabel
                    active={sortBy === 'name'}
                    direction={sortBy === 'name' ? sortOrder : 'ASC'}
                    onClick={() => handleSort('name')}
                    sx={{ color: 'var(--text-secondary)' }}
                  >
                    Name
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortBy === 'email'}
                    direction={sortBy === 'email' ? sortOrder : 'ASC'}
                    onClick={() => handleSort('email')}
                    sx={{ color: 'var(--text-secondary)' }}
                  >
                    Email
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortBy === 'role'}
                    direction={sortBy === 'role' ? sortOrder : 'ASC'}
                    onClick={() => handleSort('role')}
                    sx={{ color: 'var(--text-secondary)' }}
                  >
                    Role
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortBy === 'created_at'}
                    direction={sortBy === 'created_at' ? sortOrder : 'ASC'}
                    onClick={() => handleSort('created_at')}
                    sx={{ color: 'var(--text-secondary)' }}
                  >
                    Created At
                  </TableSortLabel>
                </TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                    <CircularProgress size={30} />
                  </TableCell>
                </TableRow>
              ) : users.length > 0 ? (
                users.map((user) => (
                  <TableRow key={user.id} hover sx={{ '& td': { borderBottom: '1px solid rgba(255,255,255,0.05)', py: 1.5 } }}>
                    <TableCell sx={{ color: 'white', fontWeight: 500 }}>{user.name}</TableCell>
                    <TableCell sx={{ color: 'var(--text-secondary)' }}>{user.email}</TableCell>
                    <TableCell>
                      <Box
                        component="span"
                        sx={{
                          px: 1.2,
                          py: 0.3,
                          borderRadius: 1.5,
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          backgroundColor: user.role === 'ADMIN' ? 'rgba(99,91,255,0.15)' : user.role === 'STORE_OWNER' ? 'rgba(0,212,255,0.15)' : 'rgba(255,255,255,0.08)',
                          color: user.role === 'ADMIN' ? '#635bff' : user.role === 'STORE_OWNER' ? '#00d4ff' : 'var(--text-secondary)'
                        }}
                      >
                        {user.role}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ color: 'var(--text-secondary)' }}>
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <Tooltip title="View Profile">
                          <IconButton onClick={() => navigate(`/admin/users/${user.id}`)} sx={{ color: '#00d4ff' }}>
                            <VisibilityIcon size="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit User">
                          <IconButton onClick={() => handleOpenEdit(user)} sx={{ color: '#ffb74d' }}>
                            <EditIcon size="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete User">
                          <IconButton onClick={() => handleOpenDelete(user.id)} sx={{ color: '#ff4d4d' }}>
                            <DeleteIcon size="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ color: 'var(--text-secondary)', py: 4 }}>
                    No users matching criteria found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={total}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{
            borderTop: '1px solid rgba(255,255,255,0.08)',
            color: 'var(--text-secondary)',
            '& .MuiTablePagination-selectIcon': { color: 'var(--text-secondary)' }
          }}
        />
      </Paper>

      {/* --- ADD USER DIALOG MODAL --- */}
      <Dialog open={openAddDialog} onClose={() => !dialogLoading && setOpenAddDialog(false)} PaperProps={{ sx: { backgroundColor: '#171923', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 3, color: 'white', minWidth: '350px' } }}>
        <DialogTitle sx={{ fontWeight: 600 }}>Create New User</DialogTitle>
        <form onSubmit={handleAddUser}>
          <DialogContent>
            {dialogError && <Alert severity="error" sx={{ mb: 2 }}>{dialogError}</Alert>}
            <TextField
              margin="dense"
              required
              fullWidth
              name="name"
              label="Full Name"
              type="text"
              value={formData.name}
              onChange={handleFormChange}
              error={!!formErrors.name}
              helperText={formErrors.name || 'Must be 20-60 characters.'}
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
              margin="dense"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              value={formData.password}
              onChange={handleFormChange}
              error={!!formErrors.password}
              helperText={formErrors.password || '8-16 chars, 1 uppercase, 1 special character.'}
              sx={{ mb: 2 }}
            />
            <TextField
              select
              fullWidth
              name="role"
              label="User Role"
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
            <Button onClick={() => setOpenAddDialog(false)} disabled={dialogLoading} sx={{ color: 'var(--text-secondary)' }}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={dialogLoading}>
              {dialogLoading ? <CircularProgress size={20} /> : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* --- EDIT USER DIALOG MODAL --- */}
      <Dialog open={openEditDialog} onClose={() => !dialogLoading && setOpenEditDialog(false)} PaperProps={{ sx: { backgroundColor: '#171923', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 3, color: 'white', minWidth: '350px' } }}>
        <DialogTitle sx={{ fontWeight: 600 }}>Modify User Details</DialogTitle>
        <form onSubmit={handleEditUser}>
          <DialogContent>
            {dialogError && <Alert severity="error" sx={{ mb: 2 }}>{dialogError}</Alert>}
            <TextField
              margin="dense"
              required
              fullWidth
              name="name"
              label="Full Name"
              type="text"
              value={formData.name}
              onChange={handleFormChange}
              error={!!formErrors.name}
              helperText={formErrors.name || 'Must be 20-60 characters.'}
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
              label="User Role"
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
            <Button onClick={() => setOpenEditDialog(false)} disabled={dialogLoading} sx={{ color: 'var(--text-secondary)' }}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={dialogLoading}>
              {dialogLoading ? <CircularProgress size={20} /> : 'Save'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* --- DELETE USER CONFIRMATION --- */}
      <Dialog open={openDeleteDialog} onClose={() => !dialogLoading && setOpenDeleteDialog(false)} PaperProps={{ sx: { backgroundColor: '#171923', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 3, color: 'white' } }}>
        <DialogTitle sx={{ fontWeight: 600 }}>Delete User Profile?</DialogTitle>
        <DialogContent>
          {dialogError && <Alert severity="error" sx={{ mb: 2 }}>{dialogError}</Alert>}
          <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
            Are you sure you want to permanently delete this user? This will remove all their rating reviews and unmap any stores they own. This action is irreversible.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setOpenDeleteDialog(false)} disabled={dialogLoading} sx={{ color: 'var(--text-secondary)' }}>Cancel</Button>
          <Button onClick={handleDeleteUser} variant="contained" color="error" disabled={dialogLoading}>
            {dialogLoading ? <CircularProgress size={20} /> : 'Delete User'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ManageUsers;
