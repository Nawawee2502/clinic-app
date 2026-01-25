import React from 'react';
import { Grid, FormControl, Select, MenuItem, Typography, InputLabel } from '@mui/material';

// Helper to get Thai Month Options
const getMonthOptions = () => [
    { value: 1, label: 'มกราคม' },
    { value: 2, label: 'กุมภาพันธ์' },
    { value: 3, label: 'มีนาคม' },
    { value: 4, label: 'เมษายน' },
    { value: 5, label: 'พฤษภาคม' },
    { value: 6, label: 'มิถุนายน' },
    { value: 7, label: 'กรกฎาคม' },
    { value: 8, label: 'สิงหาคม' },
    { value: 9, label: 'กันยายน' },
    { value: 10, label: 'ตุลาคม' },
    { value: 11, label: 'พฤศจิกายน' },
    { value: 12, label: 'ธันวาคม' }
];

// Helper to get Year Options (Thai BE)
const getYearOptionsBE = (yearsBack = 5) => {
    const currentYear = new Date().getFullYear() + 543;
    const options = [];
    for (let i = 0; i <= yearsBack; i++) {
        const year = currentYear - i;
        options.push({ value: year.toString(), label: year.toString() });
    }
    return options;
};

/**
 * Reusable Filter Component for Month and Year
 * 
 * @param {Object} props
 * @param {string|number} props.year - Current Selected Year (Thai BE string usually)
 * @param {function} props.setYear - Setter for Year
 * @param {string|number} props.month - Current Selected Month (1-12)
 * @param {function} props.setMonth - Setter for Month
 * @param {boolean} props.showMonth - Whether to show month selector (default true)
 * @param {number} props.yearsBack - How many years back to show (default 5)
 */
const MonthYearFilter = ({
    year,
    setYear,
    month,
    setMonth,
    showMonth = true,
    yearsBack = 5,
    yearLabel = "ปี (พ.ศ.)",
    monthLabel = "เดือน"
}) => {
    return (
        <Grid container spacing={2} alignItems="center">
            {/* Year Selector */}
            <Grid item xs={12} md={showMonth ? 6 : 12}>
                <FormControl fullWidth size="small">
                    <InputLabel id="year-filter-label">{yearLabel}</InputLabel>
                    <Select
                        labelId="year-filter-label"
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        label={yearLabel}
                        sx={{ borderRadius: "10px", bgcolor: 'white' }}
                        displayEmpty
                    >
                        {getYearOptionsBE(yearsBack).map(opt => (
                            <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Grid>

            {/* Month Selector */}
            {showMonth && (
                <Grid item xs={12} md={6}>
                    <FormControl fullWidth size="small">
                        <InputLabel id="month-filter-label">{monthLabel}</InputLabel>
                        <Select
                            labelId="month-filter-label"
                            value={month}
                            onChange={(e) => setMonth(e.target.value)}
                            label={monthLabel}
                            sx={{ borderRadius: "10px", bgcolor: 'white' }}
                        >
                            {getMonthOptions().map(opt => (
                                <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
            )}
        </Grid>
    );
};

export default MonthYearFilter;
