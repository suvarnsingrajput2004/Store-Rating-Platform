import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import adminService from '../services/adminService';
import {
  Box,
  Typography,
  Paper,
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
  Tooltip,
  Rating
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';

const ManageStores = () => {
  const navigate = useNavigate();

  // List States
  const [stores, setStores] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState('');

  // Paging, Sorting, Search Params
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('DESC');

  // Owner users list for dropdown mapping
  const [ownersList, setOwnersList] = useState([]);
  const [loadingOwners, setLoadingOwners] = useState(false);

  // Dialog Modals States
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  // Form Fields State
  const [formData, setFormData] = useState({ id: '', name: '', address: '', owner_id: '' });
  const [formErrors, setFormErrors] = useState({});
  const [dialogLoading, setDialogLoading] = useState(false);
  const [dialogError, setDialogError] = useState('');

  // Active target for deletion
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  const fetchStores = async () => {
    setLoading(true);
    setListError('');
    try {
      const response = await adminService.getStores({
        page: page + 1,
        limit: rowsPerPage,
        search,
        sortBy,
        sortOrder
      });
      if (response.success) {
        setStores(response.data);
        setTotal(response.pagination.total);
      } else {
        setListError(response.message || 'Failed to retrieve stores.');
      }
    } catch (err) {
      setListError(err.response?.data?.message || 'Error occurred while querying stores.');
    } finally {
      setLoading(false);
    }
  };

  const fetchOwners = async () => {
    setLoadingOwners(true);
    try {
      const response = await adminService.getUsers({
        limit: 100,
        role: 'STORE_OWNER'
      });
      if (response.success) {
        setOwnersList(response.data);
      }
    } catch (err) {
      console.error('Error loading store owners for dropdown select list:', err);
    } finally {
      setLoadingOwners(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, [page, rowsPerPage, sortBy, sortOrder]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    fetchStores();
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
    setFormData({ id: '', name: '', address: '', owner_id: '' });
    setFormErrors({});
    setDialogError('');
    fetchOwners();
    setOpenAddDialog(true);
  };

  const handleOpenEdit = (store) => {
    setFormData({
      id: store.id,
      name: store.name,
      address: store.address,
      owner_id: store.owner_id || ''
    });
    setFormErrors({});
    setDialogError('');
    fetchOwners();
    setOpenEditDialog(true);
  };

  const handleOpenDelete = (id) => {
    setDeleteTargetId(id);
    setOpenDeleteDialog(true);
  };

  // Validation
  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) {
      errors.name = 'Store name is required.';
    } else if (formData.name.length > 255) {
      errors.name = 'Store name cannot exceed 255 characters.';
    }

    if (!formData.address.trim()) {
      errors.address = 'Store address is required.';
    } else if (formData.address.length > 400) {
      errors.address = 'Store address cannot exceed 400 characters.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit Operations
  const handleAddStore = async (e) => {
    e.preventDefault();
    setDialogError('');

    if (!validateForm()) return;

    setDialogLoading(true);
    try {
      const response = await adminService.createStore({
        name: formData.name,
        address: formData.address,
        owner_id: formData.owner_id || null
      });
      if (response.success) {
        setOpenAddDialog(false);
        fetchStores();
      } else {
        setDialogError(response.message || 'Creation failed.');
      }
    } catch (err) {
      setDialogError(err.response?.data?.message || 'Error creating store.');
    } finally {
      setDialogLoading(false);
    }
  };

  const handleEditStore = async (e) => {
    e.preventDefault();
    setDialogError('');

    if (!validateForm()) return;

    setDialogLoading(true);
    try {
      const response = await adminService.updateStore(formData.id, {
        name: formData.name,
        address: formData.address,
        owner_id: formData.owner_id || null
      });
      if (response.success) {
        setOpenEditDialog(false);
        fetchStores();
      } else {
        setDialogError(response.message || 'Update failed.');
      }
    } catch (err) {
      setDialogError(err.response?.data?.message || 'Error updating store details.');
    } finally {
      setDialogLoading(false);
    }
  };

  const handleDeleteStore = async () => {
    setDialogLoading(true);
    setDialogError('');
    try {
      const response = await adminService.deleteStore(deleteTargetId);
      if (response.success) {
        setOpenDeleteDialog(false);
        fetchStores();
      } else {
        setDialogError(response.message || 'Deletion failed.');
      }
    } catch (err) {
      setDialogError(err.response?.data?.message || 'Error deleting store.');
    } finally {
      setDialogLoading(false);
    }
  };

  return (
    <Box className="fade-in">
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, letterSpacing: '-0.05rem' }}>
          Store Management
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
          Add Store
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
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
            <TextField
              fullWidth
              size="small"
              placeholder="Search by store name, address, or owner..."
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
            <Button type="submit" variant="contained" sx={{ minWidth: '120px', py: 1, textTransform: 'none' }}>
              Search
            </Button>
          </Stack>
        </form>
      </Paper>

      {/* Stores Data Table */}
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
                    Store Name
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortBy === 'address'}
                    direction={sortBy === 'address' ? sortOrder : 'ASC'}
                    onClick={() => handleSort('address')}
                    sx={{ color: 'var(--text-secondary)' }}
                  >
                    Address
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortBy === 'owner_id'}
                    direction={sortBy === 'owner_id' ? sortOrder : 'ASC'}
                    onClick={() => handleSort('owner_id')}
                    sx={{ color: 'var(--text-secondary)' }}
                  >
                    Owner Name
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortBy === 'average_rating'}
                    direction={sortBy === 'average_rating' ? sortOrder : 'ASC'}
                    onClick={() => handleSort('average_rating')}
                    sx={{ color: 'var(--text-secondary)' }}
                  >
                    Average Rating
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
              ) : stores.length > 0 ? (
                stores.map((store) => (
                  <TableRow key={store.id} hover sx={{ '& td': { borderBottom: '1px solid rgba(255,255,255,0.05)', py: 1.5 } }}>
                    <TableCell sx={{ color: 'white', fontWeight: 500 }}>{store.name}</TableCell>
                    <TableCell sx={{ color: 'var(--text-secondary)', maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {store.address}
                    </TableCell>
                    <TableCell sx={{ color: 'var(--text-secondary)' }}>
                      {store.owner_name ? (
                        <Button
                          size="small"
                          onClick={() => navigate(`/admin/users/${store.owner_id}`)}
                          sx={{ textTransform: 'none', color: '#00d4ff', py: 0 }}
                        >
                          {store.owner_name}
                        </Button>
                      ) : (
                        <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'rgba(255,255,255,0.3)', pl: 1 }}>
                          No Owner Assigned
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Rating name="store-avg-star" value={store.average_rating} precision={0.5} readOnly size="small" />
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#ffb74d' }}>
                          {store.average_rating > 0 ? `${store.average_rating} (${store.total_ratings})` : 'No ratings'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <Tooltip title="View Details">
                          <IconButton onClick={() => navigate(`/admin/stores/${store.id}`)} sx={{ color: '#00d4ff' }}>
                            <VisibilityIcon size="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit Store">
                          <IconButton onClick={() => handleOpenEdit(store)} sx={{ color: '#ffb74d' }}>
                            <EditIcon size="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Store">
                          <IconButton onClick={() => handleOpenDelete(store.id)} sx={{ color: '#ff4d4d' }}>
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
                    No stores matching criteria found.
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

      {/* --- ADD STORE DIALOG MODAL --- */}
      <Dialog open={openAddDialog} onClose={() => !dialogLoading && setOpenAddDialog(false)} PaperProps={{ sx: { backgroundColor: '#171923', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 3, color: 'white', minWidth: '360px' } }}>
        <DialogTitle sx={{ fontWeight: 600 }}>Add New Store</DialogTitle>
        <form onSubmit={handleAddStore}>
          <DialogContent>
            {dialogError && <Alert severity="error" sx={{ mb: 2 }}>{dialogError}</Alert>}
            <TextField
              margin="dense"
              required
              fullWidth
              name="name"
              label="Store Name"
              type="text"
              value={formData.name}
              onChange={handleFormChange}
              error={!!formErrors.name}
              helperText={formErrors.name}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              required
              fullWidth
              name="address"
              label="Street Address"
              type="text"
              placeholder="Maximum 400 characters"
              multiline
              rows={3}
              value={formData.address}
              onChange={handleFormChange}
              error={!!formErrors.address}
              helperText={formErrors.address}
              sx={{ mb: 2 }}
            />
            <TextField
              select
              fullWidth
              name="owner_id"
              label="Select Owner (Store Owner Role Users)"
              value={formData.owner_id}
              onChange={handleFormChange}
              helperText="Optional owner assignment"
              sx={{ textAlign: 'left' }}
              SelectProps={{
                MenuProps: {
                  PaperProps: {
                    sx: { backgroundColor: '#1a1d28', color: 'white' }
                  }
                }
              }}
            >
              <MenuItem value=""><em>None - Leave Unassigned</em></MenuItem>
              {loadingOwners ? (
                <MenuItem disabled>Loading owners...</MenuItem>
              ) : ownersList.length > 0 ? (
                ownersList.map((owner) => (
                  <MenuItem key={owner.id} value={owner.id}>
                    {owner.name} ({owner.email})
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>No Store Owners registered yet</MenuItem>
              )}
            </TextField>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={() => setOpenAddDialog(false)} disabled={dialogLoading} sx={{ color: 'var(--text-secondary)' }}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={dialogLoading}>
              {dialogLoading ? <CircularProgress size={20} /> : 'Add'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* --- EDIT STORE DIALOG MODAL --- */}
      <Dialog open={openEditDialog} onClose={() => !dialogLoading && setOpenEditDialog(false)} PaperProps={{ sx: { backgroundColor: '#171923', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 3, color: 'white', minWidth: '360px' } }}>
        <DialogTitle sx={{ fontWeight: 600 }}>Modify Store Details</DialogTitle>
        <form onSubmit={handleEditStore}>
          <DialogContent>
            {dialogError && <Alert severity="error" sx={{ mb: 2 }}>{dialogError}</Alert>}
            <TextField
              margin="dense"
              required
              fullWidth
              name="name"
              label="Store Name"
              type="text"
              value={formData.name}
              onChange={handleFormChange}
              error={!!formErrors.name}
              helperText={formErrors.name}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              required
              fullWidth
              name="address"
              label="Street Address"
              type="text"
              placeholder="Maximum 400 characters"
              multiline
              rows={3}
              value={formData.address}
              onChange={handleFormChange}
              error={!!formErrors.address}
              helperText={formErrors.address}
              sx={{ mb: 2 }}
            />
            <TextField
              select
              fullWidth
              name="owner_id"
              label="Select Owner (Store Owner Role Users)"
              value={formData.owner_id}
              onChange={handleFormChange}
              helperText="Optional owner assignment"
              sx={{ textAlign: 'left' }}
              SelectProps={{
                MenuProps: {
                  PaperProps: {
                    sx: { backgroundColor: '#1a1d28', color: 'white' }
                  }
                }
              }}
            >
              <MenuItem value=""><em>None - Leave Unassigned</em></MenuItem>
              {loadingOwners ? (
                <MenuItem disabled>Loading owners...</MenuItem>
              ) : ownersList.length > 0 ? (
                ownersList.map((owner) => (
                  <MenuItem key={owner.id} value={owner.id}>
                    {owner.name} ({owner.email})
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>No Store Owners registered yet</MenuItem>
              )}
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

      {/* --- DELETE STORE CONFIRMATION --- */}
      <Dialog open={openDeleteDialog} onClose={() => !dialogLoading && setOpenDeleteDialog(false)} PaperProps={{ sx: { backgroundColor: '#171923', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 3, color: 'white' } }}>
        <DialogTitle sx={{ fontWeight: 600 }}>Delete Store Profile?</DialogTitle>
        <DialogContent>
          {dialogError && <Alert severity="error" sx={{ mb: 2 }}>{dialogError}</Alert>}
          <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
            Are you sure you want to permanently delete this store? This will delete all user rating review records submitted for this store. This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setOpenDeleteDialog(false)} disabled={dialogLoading} sx={{ color: 'var(--text-secondary)' }}>Cancel</Button>
          <Button onClick={handleDeleteStore} variant="contained" color="error" disabled={dialogLoading}>
            {dialogLoading ? <CircularProgress size={20} /> : 'Delete Store'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ManageStores;
