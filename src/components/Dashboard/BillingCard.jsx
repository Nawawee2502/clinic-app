// src/components/BillingCard.jsx
import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

const BillingCard = ({ title, amount, changeAmount, changePercent, trend, chartComponent }) => {
    // Determine trend color and icon
    const trendColor = trend === 'up' ? 'green' : trend === 'down' ? 'red' : 'inherit';
    const TrendIcon = trend === 'up' ? TrendingUpIcon : trend === 'down' ? TrendingDownIcon : null;

    // Format the amount with commas
    const formattedAmount = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2
    }).format(amount);

    // Format change amount (if present)
    const formattedChangeAmount = changeAmount
        ? new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            signDisplay: 'always'
        }).format(changeAmount)
        : null;

    return (
        <Card
            elevation={0}
            sx={{
                bgcolor: 'white',
                border: '1px solid #e0e0e0',
                borderRadius: 2,
                height: '100%'
            }}
        >
            <CardContent>
                {/* Header with title and info icon */}
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        mb: 1
                    }}
                >
                    <Typography variant="h6" fontWeight="medium">
                        {title}
                    </Typography>
                    <HelpOutlineIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                </Box>

                {/* Amount */}
                <Typography
                    variant="h4"
                    fontWeight="bold"
                    sx={{ mb: 0.5 }}
                >
                    {formattedAmount}
                </Typography>

                {/* Change indicators (if available) */}
                {(changePercent || formattedChangeAmount) && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        {changePercent && (
                            <Typography
                                color={trendColor}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    fontSize: '0.875rem',
                                    fontWeight: 'medium'
                                }}
                            >
                                {TrendIcon && <TrendIcon fontSize="small" sx={{ mr: 0.5 }} />}
                                {changePercent}% {trend === 'up' ? 'up' : 'down'}
                            </Typography>
                        )}

                        {formattedChangeAmount && (
                            <Typography
                                sx={{
                                    color: 'text.secondary',
                                    fontSize: '0.875rem'
                                }}
                            >
                                {formattedChangeAmount}
                            </Typography>
                        )}
                    </Box>
                )}

                {/* Chart */}
                {chartComponent && (
                    <Box sx={{ mt: 2, height: 80 }}>
                        {chartComponent}
                    </Box>
                )}
            </CardContent>
        </Card>
    );
};

export default BillingCard;