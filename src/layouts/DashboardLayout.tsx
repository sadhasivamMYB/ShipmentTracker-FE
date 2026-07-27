import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Folder as FolderIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon
} from '@mui/icons-material';
import { logout } from '../store/slices/authSlice';
import type { RootState } from '../store/store';

const drawerWidth = 260;

const menuItems = [
  // { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  // { text: 'Workspaces', icon: <FolderIcon />, path: '/workspace' },
  { text: 'Workspaces', icon: <FolderIcon />, path: '/' },
  { text: 'Admin', icon: <SettingsIcon />, path: '/admin' },
];

export default function DashboardLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector((state: RootState) => state.auth.user);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            borderRight: '1px solid',
            borderColor: 'divider',
            bgcolor: 'white'
          },
        }}
        variant="permanent"
        anchor="left"
      >
        <Toolbar className="flex items-center gap-2 border-b border-gray-200 mt-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xs">ERP</span>
          </div>
          <Typography variant="h6" className="font-bold text-gray-900 tracking-tight">
            DocTracker
          </Typography>
        </Toolbar>

        <Box className="overflow-auto mt-4 px-3">
          <List className="flex flex-col gap-1">
            {menuItems
              .filter((item) => {
                if (item.text === 'Admin' && user?.role !== 'admin') return false;
                return true;
              })
              .map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  selected={location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path))}
                  onClick={() => navigate(item.path)}
                  sx={{
                    borderRadius: '8px',
                    mb: '4px',
                    '&.Mui-selected': {
                      bgcolor: 'primary.50',
                      color: 'primary.main',
                      '& .MuiListItemIcon-root': {
                        color: 'primary.main',
                      }
                    },
                    '&:hover': {
                      bgcolor: 'gray.50',
                    }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: '40px', color: 'text.secondary' }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={<Typography sx={{ fontSize: '0.875rem', fontWeight: 500 }}>{item.text}</Typography>}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>

        <Box className="mt-auto border-t border-gray-200">
          <Box className="flex items-center gap-3 p-4">
            <Avatar className="bg-primary text-white w-10 h-10 text-sm">
              {user?.email?.charAt(0).toUpperCase() || 'A'}
            </Avatar>
            <Box className="flex flex-col overflow-hidden">
              <Typography variant="body2" className="text-gray-900 font-semibold truncate">
                {user?.name || 'Admin User'}
              </Typography>
              <Typography variant="caption" className="text-gray-500 truncate">
                {user?.email || 'admin@company.com'}
              </Typography>
            </Box>
          </Box>
          <Box className="px-4 pb-4">
            <ListItemButton onClick={handleLogout} sx={{ borderRadius: '8px', color: 'error.main' }}>
              <ListItemIcon sx={{ minWidth: '40px', color: 'error.main' }}>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText
                primary={<Typography sx={{ fontSize: '0.875rem', fontWeight: 500 }}>Logout</Typography>}
              />
            </ListItemButton>
          </Box>
        </Box>
      </Drawer>

      <Box
        component="main"
        sx={{ flexGrow: 1, p: 3, width: `calc(100% - ${drawerWidth}px)` }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
