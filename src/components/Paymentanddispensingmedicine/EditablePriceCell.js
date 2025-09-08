import React, { useState } from 'react';
import {
    Box,
    Typography,
    TextField,
    IconButton
} from "@mui/material";
import {
    Edit as EditIcon,
    Check as CheckIcon,
    Close as CloseIcon
} from "@mui/icons-material";

const EditablePriceCell = ({
    type,
    index,
    currentPrice,
    onSave,
    onCancel,
    isEditing
}) => {
    const [tempPrice, setTempPrice] = useState(currentPrice.toString());

    const handleSave = () => {
        onSave(type, index, tempPrice);
    };

    const handleEdit = () => {
        onCancel(); // ยกเลิกการแก้ไขอื่นๆ ก่อน
        setTempPrice(currentPrice.toString());
        // เรียกฟังก์ชันแก้ไขจาก parent
        if (window.editPrice) {
            window.editPrice(type, index);
        }
    };

    if (!isEditing) {
        return (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="body2" fontWeight="bold" sx={{ color: '#4caf50' }}>
                    ฿{currentPrice.toFixed(2)}
                </Typography>
                <IconButton size="small" onClick={handleEdit}>
                    <EditIcon fontSize="small" />
                </IconButton>
            </Box>
        );
    }

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TextField
                size="small"
                type="number"
                value={tempPrice}
                onChange={(e) => setTempPrice(e.target.value)}
                inputProps={{ min: 0, step: 0.01 }}
                sx={{ width: 80 }}
                autoFocus
                onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                        handleSave();
                    } else if (e.key === 'Escape') {
                        onCancel();
                    }
                }}
            />
            <IconButton
                size="small"
                color="success"
                onClick={handleSave}
            >
                <CheckIcon fontSize="small" />
            </IconButton>
            <IconButton
                size="small"
                color="error"
                onClick={onCancel}
            >
                <CloseIcon fontSize="small" />
            </IconButton>
        </Box>
    );
};

export default EditablePriceCell;