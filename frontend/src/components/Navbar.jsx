import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Box,
  Container,
  Avatar,
  Tooltip,
  Divider
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import StarRateIcon from '@mui/icons-material/StarRate';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [anchorElNav, setAnchorElNav] = useState(null);
  const [anchorElUser, setAnchorElUser] = useState(null);

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleLogout = async () => {
    handleCloseUserMenu();
    await logout();
    navigate('/login');
  };

  const renderNavLinks = () => {
    if (!isAuthenticated) return null;

    // Admin routes
    if (user.role === 'ADMIN') {
      return (
        <>
          <Button
            component={RouterLink}
            to="/admin/dashboard"
            onClick={handleCloseNavMenu}
            sx={{ my: 2, color: 'white', display: 'block' }}
          >
            Admin Dashboard
          </Button>
          <Button
            component={RouterLink}
            to="/admin/users"
            onClick={handleCloseNavMenu}
            sx={{ my: 2, color: 'white', display: 'block' }}
          >
            Manage Users
          </Button>
          <Button
            component={RouterLink}
            to="/admin/stores"
            onClick={handleCloseNavMenu}
            sx={{ my: 2, color: 'white', display: 'block' }}
          >
            Manage Stores
          </Button>
        </>
      );
    }

    // Owner routes
    if (user.role === 'STORE_OWNER') {
      return (
        <Button
          component={RouterLink}
          to="/owner/dashboard"
          onClick={handleCloseNavMenu}
          sx={{ my: 2, color: 'white', display: 'block' }}
        >
          Owner Dashboard
        </Button>
      );
    }

    // Normal User routes
    return (
      <>
        <Button
          component={RouterLink}
          to="/stores"
          onClick={handleCloseNavMenu}
          sx={{ my: 2, color: 'white', display: 'block' }}
        >
          Explore Stores
        </Button>
        <Button
          component={RouterLink}
          to="/my-ratings"
          onClick={handleCloseNavMenu}
          sx={{ my: 2, color: 'white', display: 'block' }}
        >
          My Ratings
        </Button>
      </>
    );
  };

  return (
    <AppBar
      position="sticky"
      sx={{
        background: 'rgba(26, 29, 40, 0.75)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: 'none'
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {/* LOGO Desktop */}
          <StarRateIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1, color: '#00d4ff' }} />
          <Typography
            variant="h6"
            noWrap
            component={RouterLink}
            to={isAuthenticated ? '/' : '/login'}
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontWeight: 700,
              letterSpacing: '.1rem',
              color: 'inherit',
              textDecoration: 'none',
              background: 'linear-gradient(90deg, #ffffff 0%, #a0aec0 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            RATESTORE
          </Typography>

          {/* Hamburger menu for mobile */}
          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: 'block', md: 'none' },
                '& .MuiPaper-root': {
                  backgroundColor: '#1a1d28',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  color: 'white'
                }
              }}
            >
              {isAuthenticated ? (
                <>
                  {user.role === 'ADMIN' && [
                    <MenuItem key="dash" component={RouterLink} to="/admin/dashboard" onClick={handleCloseNavMenu}>
                      <Typography textAlign="center">Admin Dashboard</Typography>
                    </MenuItem>,
                    <MenuItem key="users" component={RouterLink} to="/admin/users" onClick={handleCloseNavMenu}>
                      <Typography textAlign="center">Manage Users</Typography>
                    </MenuItem>,
                    <MenuItem key="stores" component={RouterLink} to="/admin/stores" onClick={handleCloseNavMenu}>
                      <Typography textAlign="center">Manage Stores</Typography>
                    </MenuItem>
                  ]}
                  {user.role === 'STORE_OWNER' && (
                    <MenuItem component={RouterLink} to="/owner/dashboard" onClick={handleCloseNavMenu}>
                      <Typography textAlign="center">Owner Dashboard</Typography>
                    </MenuItem>
                  )}
                  {user.role === 'USER' && [
                    <MenuItem key="stores" component={RouterLink} to="/stores" onClick={handleCloseNavMenu}>
                      <Typography textAlign="center">Explore Stores</Typography>
                    </MenuItem>,
                    <MenuItem key="ratings" component={RouterLink} to="/my-ratings" onClick={handleCloseNavMenu}>
                      <Typography textAlign="center">My Ratings</Typography>
                    </MenuItem>
                  ]}
                </>
              ) : (
                <>
                  <MenuItem component={RouterLink} to="/login" onClick={handleCloseNavMenu}>
                    <Typography textAlign="center">Login</Typography>
                  </MenuItem>
                  <MenuItem component={RouterLink} to="/register" onClick={handleCloseNavMenu}>
                    <Typography textAlign="center">Register</Typography>
                  </MenuItem>
                </>
              )}
            </Menu>
          </Box>

          {/* LOGO Mobile */}
          <StarRateIcon sx={{ display: { xs: 'flex', md: 'none' }, mr: 1, color: '#00d4ff' }} />
          <Typography
            variant="h5"
            noWrap
            component={RouterLink}
            to={isAuthenticated ? '/' : '/login'}
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'none' },
              flexGrow: 1,
              fontWeight: 700,
              color: 'inherit',
              textDecoration: 'none',
              background: 'linear-gradient(90deg, #ffffff 0%, #a0aec0 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            RATESTORE
          </Typography>

          {/* Desktop links */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, gap: 2, ml: 4 }}>
            {renderNavLinks()}
          </Box>

          {/* Right menu (User Avatar / Profile) */}
          <Box sx={{ flexGrow: 0 }}>
            {isAuthenticated ? (
              <>
                <Tooltip title="Open settings">
                  <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                    <Avatar
                      sx={{
                        bg: 'linear-gradient(135deg, #635bff 0%, #00d4ff 100%)',
                        color: 'white',
                        fontWeight: 600,
                        border: '1px solid rgba(255, 255, 255, 0.2)'
                      }}
                    >
                      {user.name ? user.name[0].toUpperCase() : 'U'}
                    </Avatar>
                  </IconButton>
                </Tooltip>
                <Menu
                  sx={{
                    mt: '45px',
                    '& .MuiPaper-root': {
                      backgroundColor: '#171923',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      color: 'white',
                      width: '200px'
                    }
                  }}
                  id="menu-appbar"
                  anchorEl={anchorElUser}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={Boolean(anchorElUser)}
                  onClose={handleCloseUserMenu}
                >
                  <Box sx={{ px: 2, py: 1.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'white', noWrap: true }}>
                      {user.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'var(--text-secondary)' }}>
                      {user.role}
                    </Typography>
                  </Box>
                  <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />
                  <MenuItem
                    component={RouterLink}
                    to="/profile"
                    onClick={handleCloseUserMenu}
                    sx={{ color: 'white' }}
                  >
                    My Profile
                  </MenuItem>
                  <MenuItem
                    component={RouterLink}
                    to="/change-password"
                    onClick={handleCloseUserMenu}
                    sx={{ color: 'white' }}
                  >
                    Change Password
                  </MenuItem>
                  <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />
                  <MenuItem onClick={handleLogout} sx={{ color: '#ff4d4d' }}>
                    Logout
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Box sx={{ display: 'flex', gap: 1.5 }}>
                <Button
                  component={RouterLink}
                  to="/login"
                  sx={{ color: 'white' }}
                >
                  Login
                </Button>
                <Button
                  component={RouterLink}
                  to="/register"
                  variant="contained"
                  sx={{
                    background: 'linear-gradient(135deg, #635bff 0%, #4f46e5 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #4f46e5 0%, #635bff 100%)',
                    }
                  }}
                >
                  Register
                </Button>
              </Box>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;
