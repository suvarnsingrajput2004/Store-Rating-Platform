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
  TablePagination,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Rating,
  Button
} from '@mui/material';
import { Search as SearchIcon, Store as StoreIcon, Visibility as ViewIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { storeAPI } from '../services/storeService';

const StoreListing = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination & Filters
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [search, setSearch] = useState('');
  
  const navigate = useNavigate();

  const fetchStores = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await storeAPI.getStores({
        page: page + 1,
        limit: rowsPerPage,
        search,
        sortBy: 'average_rating', // Default sort by best rating
        sortOrder: 'DESC'
      });
      
      if (response.success) {
        setStores(response.data);
        setTotalRows(response.pagination.total);
      } else {
        setError('Failed to fetch stores');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchStores();
    }, 500); // Debounce search

    return () => clearTimeout(delayDebounceFn);
  }, [search, page, rowsPerPage]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
    setPage(0);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <StoreIcon sx={{ fontSize: 32, mr: 2, color: 'primary.main' }} />
        <Typography variant="h4" component="h1" fontWeight="bold">
          Explore Stores
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Paper 
        sx={{ 
          p: 3, 
          mb: 3, 
          background: 'rgba(30, 41, 59, 0.7)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <TextField
            placeholder="Search by name or address..."
            variant="outlined"
            size="small"
            value={search}
            onChange={handleSearchChange}
            sx={{ width: 300 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Store Name</TableCell>
                <TableCell>Address</TableCell>
                <TableCell align="center">Total Ratings</TableCell>
                <TableCell align="center">Avg Rating</TableCell>
                <TableCell align="center">My Rating</TableCell>
                <TableCell align="center">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : stores.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                    No stores found matching your criteria.
                  </TableCell>
                </TableRow>
              ) : (
                stores.map((store) => (
                  <TableRow key={store.id} hover>
                    <TableCell sx={{ fontWeight: 'medium' }}>{store.name}</TableCell>
                    <TableCell>{store.address}</TableCell>
                    <TableCell align="center">{store.total_ratings}</TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography sx={{ mr: 1, fontWeight: 'bold' }}>{store.average_rating}</Typography>
                        <Rating value={store.average_rating} precision={0.1} readOnly size="small" />
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      {store.my_rating ? (
                        <Rating value={store.my_rating} readOnly size="small" sx={{ color: 'secondary.main' }} />
                      ) : (
                        <Typography variant="body2" color="text.secondary">Not Rated</Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Button 
                        variant="contained" 
                        size="small" 
                        startIcon={<ViewIcon />}
                        onClick={() => navigate(`/stores/${store.id}`)}
                      >
                        {store.my_rating ? 'Update Rating' : 'Rate Now'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={totalRows}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  );
};

export default StoreListing;
