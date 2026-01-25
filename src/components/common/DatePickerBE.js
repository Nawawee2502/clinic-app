import React from 'react';
import { TextField } from '@mui/material';

/**
 * Reusable Date Picker component supporting Thai Buddhist Year (BE).
 * 
 * @param {Object} props
 * @param {string} props.label - Label for the input
 * @param {string} props.value - Date value in AD format (YYYY-MM-DD)
 * @param {function} props.onChange - Function called with new date string (YYYY-MM-DD AD)
 * @param {boolean} props.disabled - Whether the input is disabled
 */
const DatePickerBE = ({ label, value, onChange, disabled, ...props }) => {
    // Helper: Convert AD date string (YYYY-MM-DD) to BE date string for display
    const convertDateCEToBE = (ceDate) => {
        if (!ceDate) return '';
        const parts = ceDate.split('-');
        if (parts.length !== 3) return ceDate;
        const [year, month, day] = parts;
        const beYear = parseInt(year) + 543;
        return `${beYear}-${month}-${day}`;
    };

    // Helper: Convert BE date string input back to AD date string for state
    const convertDateBEToCE = (beDate) => {
        if (!beDate) return '';
        const parts = beDate.split('-');
        if (parts.length !== 3) return beDate;
        const [year, month, day] = parts;
        const ceYear = parseInt(year) - 543;
        return `${ceYear}-${month}-${day}`;
    };

    const displayValue = value ? convertDateCEToBE(value) : '';

    const handleChange = (e) => {
        const beValue = e.target.value;
        const ceValue = beValue ? convertDateBEToCE(beValue) : '';
        onChange(ceValue);
    };

    return (
        <TextField
            {...props}
            type="date"
            label={label}
            value={displayValue}
            onChange={handleChange}
            disabled={disabled}
            size="small"
            InputLabelProps={{ shrink: true }}
            inputProps={{
                // Prevent creating dates way too far in the future
                max: convertDateCEToBE('9999-12-31')
            }}
            sx={{
                "& .MuiOutlinedInput-root": {
                    borderRadius: "10px",
                    ...props.sx
                }
            }}
        />
    );
};

export default DatePickerBE;
