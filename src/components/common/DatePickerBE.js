import React, { useRef } from 'react';
import { Box, TextField, InputAdornment, IconButton } from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

/**
 * DatePickerBE — แสดงวันที่เป็น พ.ศ. (DD/MM/2569) แต่ calendar วันถูกต้อง
 * คลิกที่ช่อง หรือไอคอน calendar → เปิด native date picker (CE) → แปลงเป็น พ.ศ.
 */
const DatePickerBE = ({ label, value, onChange, disabled, ...props }) => {
    const hiddenInputRef = useRef(null);

    // ค.ศ. YYYY-MM-DD → พ.ศ. DD/MM/YYYY+543
    const formatDisplayBE = (ceDate) => {
        if (!ceDate) return '';
        const parts = ceDate.split('-');
        if (parts.length !== 3) return ceDate;
        const [year, month, day] = parts;
        const beYear = parseInt(year) + 543;
        return `${day}/${month}/${beYear}`;
    };

    const openPicker = () => {
        if (disabled || !hiddenInputRef.current) return;
        try {
            hiddenInputRef.current.showPicker(); // Modern browsers
        } catch {
            hiddenInputRef.current.click();      // Fallback
        }
    };

    return (
        <Box sx={{ position: 'relative' }}>
            {/* TextField แสดง พ.ศ. */}
            <TextField
                label={label}
                value={formatDisplayBE(value)}
                size="small"
                fullWidth
                disabled={disabled}
                InputLabelProps={{ shrink: true }}
                inputProps={{ readOnly: true, style: { cursor: disabled ? 'default' : 'pointer' } }}
                onClick={openPicker}
                InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                            <IconButton
                                size="small"
                                onClick={openPicker}
                                disabled={disabled}
                                tabIndex={-1}
                            >
                                <CalendarTodayIcon fontSize="small" />
                            </IconButton>
                        </InputAdornment>
                    )
                }}
                sx={{
                    '& .MuiOutlinedInput-root': {
                        borderRadius: '10px',
                        cursor: disabled ? 'default' : 'pointer',
                        bgcolor: disabled ? undefined : 'white',
                    },
                    ...props.sx
                }}
            />

            {/* native input ซ่อน — ใช้เปิด calendar เท่านั้น */}
            <input
                ref={hiddenInputRef}
                type="date"
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                style={{
                    position: 'absolute',
                    opacity: 0,
                    pointerEvents: 'none',
                    width: 0,
                    height: 0,
                    top: 0,
                    left: 0,
                }}
            />
        </Box>
    );
};

export default DatePickerBE;
