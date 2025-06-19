// src/components/TopBar.jsx
import React from 'react';
import { Box, Typography, IconButton, Badge, Avatar, Tooltip } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

const TopBar = ({ title, userName, userEmail }) => {
    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                py: 2,
                px: 3,
                borderBottom: '1px solid #e0e0e0',
                bgcolor: 'white',
                position: 'fixed',
                width: 'calc(100% - 240px)',
                left: 240,
                top: 0,
                zIndex: 1000,
                height: 64
            }}
        >
            {/* Left: Title */}
            <Typography variant="h6" fontWeight="bold">
                {title}
            </Typography>

            {/* Right: Controls */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {/* Navigation arrows */}
                <Box sx={{ display: 'flex', mr: 2 }}>
                    <IconButton
                        sx={{
                            bgcolor: '#f5f5f5',
                            mr: 0.5,
                            '&:hover': { bgcolor: '#e0e0e0' }
                        }}
                    >
                        <KeyboardArrowLeftIcon />
                    </IconButton>
                    <IconButton
                        sx={{
                            bgcolor: '#f5f5f5',
                            '&:hover': { bgcolor: '#e0e0e0' }
                        }}
                    >
                        <KeyboardArrowRightIcon />
                    </IconButton>
                </Box>

                {/* Date Filter */}
                <Tooltip title="Date Filter">
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            py: 1,
                            px: 2,
                            border: '1px solid #e0e0e0',
                            borderRadius: 1,
                            cursor: 'pointer',
                            '&:hover': { bgcolor: '#f5f5f5' }
                        }}
                    >
                        <CalendarTodayIcon fontSize="small" />
                        <Typography variant="body2">Date Filter</Typography>
                    </Box>
                </Tooltip>

                {/* Notifications */}
                <Tooltip title="Notifications">
                    <IconButton>
                        <Badge badgeContent={3} color="error">
                            <NotificationsIcon />
                        </Badge>
                    </IconButton>
                </Tooltip>

                {/* User Profile */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar
                        src="/path-to-user-avatar.jpg"
                        alt={userName}
                        sx={{ width: 36, height: 36 }}
                    />
                    <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                        <Typography variant="subtitle2" fontWeight="bold">
                            {userName || 'Abu Fahim'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {userEmail || 'hello@fahim.com'}
                        </Typography>
                    </Box>
                </Box>

                {/* More Options */}
                <IconButton sx={{ ml: 1 }}>
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 18,
                            height: 18,
                            '& > div': {
                                width: 3,
                                height: 3,
                                borderRadius: '50%',
                                bgcolor: '#666',
                                my: 0.2
                            }
                        }}
                    >
                        <Box />
                        <Box />
                        <Box />
                    </Box>
                </IconButton>
            </Box>
        </Box>
    );
};

export default TopBar;