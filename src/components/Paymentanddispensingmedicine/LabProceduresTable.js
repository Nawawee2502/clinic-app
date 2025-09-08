import React from 'react';
import {
    Card,
    CardContent,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Box,
    Grid,
    IconButton,
    TextField
} from "@mui/material";
import {
    Edit as EditIcon,
    Check as CheckIcon,
    Close as CloseIcon
} from "@mui/icons-material";

const LabProceduresTable = ({
    editablePrices,
    editingItem,
    onEditPrice,
    onSavePrice,
    onCancelEdit
}) => {
    const [tempPrice, setTempPrice] = React.useState('');

    // Component สำหรับแก้ไขราคาในตาราง
    const EditablePriceCell = ({ type, index, currentPrice }) => {
        const isEditing = editingItem.type === type && editingItem.index === index;

        const handleEdit = () => {
            setTempPrice(currentPrice.toString());
            onEditPrice(type, index);
        };

        const handleSave = () => {
            onSavePrice(type, index, tempPrice);
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
                            onCancelEdit();
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
                    onClick={onCancelEdit}
                >
                    <CloseIcon fontSize="small" />
                </IconButton>
            </Box>
        );
    };

    return (
        <Grid container spacing={3} sx={{ mb: 4 }}>
            {/* LAB/X-ray Card */}
            <Grid item xs={12} lg={6}>
                <Card elevation={2} sx={{ height: '100%', borderRadius: '12px' }}>
                    <Box sx={{
                        bgcolor: '#5698E0',
                        color: 'white',
                        p: 2,
                        textAlign: 'center',
                        borderTopLeftRadius: '12px',
                        borderTopRightRadius: '12px'
                    }}>
                        <Typography variant="h6" fontWeight="bold">
                            🧪 ค่า LAB / X-ray ({editablePrices.labs.length} รายการ)
                        </Typography>
                    </Box>
                    <CardContent sx={{ p: 2 }}>
                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f8f9fa' }}>รายการ</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 'bold', bgcolor: '#f8f9fa' }}>ราคา</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {editablePrices.labs.length > 0 ? (
                                        editablePrices.labs.map((lab, index) => (
                                            <TableRow key={index} hover>
                                                <TableCell>
                                                    <Typography variant="body2" fontWeight="600">
                                                        {/* แสดงชื่อ Lab/X-ray */}
                                                        {lab.LABNAME || lab.RLNAME || lab.LABCODE || 'ไม่ระบุรายการ'}
                                                    </Typography>

                                                    {/* แสดง Type badge ถ้าเป็นข้อมูลจาก Investigation Notes */}
                                                    {lab.LABCODE === 'LAB_FROM_NOTE' && (
                                                        <Typography variant="caption" sx={{
                                                            bgcolor: '#e3f2fd',
                                                            color: '#1976d2',
                                                            px: 1,
                                                            py: 0.25,
                                                            borderRadius: 1,
                                                            mr: 1,
                                                            display: 'inline-block',
                                                            mt: 0.5
                                                        }}>
                                                            🧪 Laboratory
                                                        </Typography>
                                                    )}

                                                    {lab.LABCODE === 'XRAY_FROM_NOTE' && (
                                                        <Typography variant="caption" sx={{
                                                            bgcolor: '#fff3e0',
                                                            color: '#f57c00',
                                                            px: 1,
                                                            py: 0.25,
                                                            borderRadius: 1,
                                                            mr: 1,
                                                            display: 'inline-block',
                                                            mt: 0.5
                                                        }}>
                                                            📷 X-ray/Imaging
                                                        </Typography>
                                                    )}

                                                    {/* แสดงหมายเหตุ */}
                                                    {lab.NOTE1 && lab.NOTE1 !== lab.LABNAME && (
                                                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                                                            หมายเหตุ: {lab.NOTE1}
                                                        </Typography>
                                                    )}
                                                </TableCell>
                                                <TableCell align="right">
                                                    <EditablePriceCell
                                                        type="labs"
                                                        index={index}
                                                        currentPrice={lab.editablePrice}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={2} align="center" sx={{ py: 3 }}>
                                                <Typography color="text.secondary">ไม่มีรายการ Lab/X-ray</Typography>
                                            </TableCell>
                                        </TableRow>
                                    )}

                                    {/* แถวยอดรวม Lab - เพิ่มการแยกประเภท */}
                                    {editablePrices.labs.length > 0 && (
                                        <>
                                            <TableRow sx={{ bgcolor: '#e3f2fd' }}>
                                                <TableCell sx={{ fontWeight: 'bold' }}>รวม Lab/X-ray</TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                                                    ฿{editablePrices.labs.reduce((sum, item) => sum + item.editablePrice, 0).toFixed(2)}
                                                </TableCell>
                                            </TableRow>

                                            {/* แสดงรายละเอียดแยกตามประเภท */}
                                            {editablePrices.labs.filter(lab => lab.LABCODE === 'LAB_FROM_NOTE').length > 0 && (
                                                <TableRow sx={{ bgcolor: '#f8f9fa' }}>
                                                    <TableCell sx={{ fontSize: '0.875rem', pl: 3 }}>
                                                        - Laboratory ({editablePrices.labs.filter(lab => lab.LABCODE === 'LAB_FROM_NOTE').length} รายการ)
                                                    </TableCell>
                                                    <TableCell align="right" sx={{ fontSize: '0.875rem' }}>
                                                        ฿{editablePrices.labs
                                                            .filter(lab => lab.LABCODE === 'LAB_FROM_NOTE')
                                                            .reduce((sum, item) => sum + item.editablePrice, 0)
                                                            .toFixed(2)}
                                                    </TableCell>
                                                </TableRow>
                                            )}

                                            {editablePrices.labs.filter(lab => lab.LABCODE === 'XRAY_FROM_NOTE').length > 0 && (
                                                <TableRow sx={{ bgcolor: '#f8f9fa' }}>
                                                    <TableCell sx={{ fontSize: '0.875rem', pl: 3 }}>
                                                        - X-ray/Imaging ({editablePrices.labs.filter(lab => lab.LABCODE === 'XRAY_FROM_NOTE').length} รายการ)
                                                    </TableCell>
                                                    <TableCell align="right" sx={{ fontSize: '0.875rem' }}>
                                                        ฿{editablePrices.labs
                                                            .filter(lab => lab.LABCODE === 'XRAY_FROM_NOTE')
                                                            .reduce((sum, item) => sum + item.editablePrice, 0)
                                                            .toFixed(2)}
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </CardContent>
                </Card>
            </Grid>

            {/* Procedures Card */}
            <Grid item xs={12} lg={6}>
                <Card elevation={2} sx={{ height: '100%', borderRadius: '12px' }}>
                    <Box sx={{
                        bgcolor: '#2B69AC',
                        color: 'white',
                        p: 2,
                        textAlign: 'center',
                        borderTopLeftRadius: '12px',
                        borderTopRightRadius: '12px'
                    }}>
                        <Typography variant="h6" fontWeight="bold">
                            ⚕️ ค่าหัตถการ ({editablePrices.procedures.length} รายการ)
                        </Typography>
                    </Box>
                    <CardContent sx={{ p: 2 }}>
                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f8f9fa' }}>รายการ</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 'bold', bgcolor: '#f8f9fa' }}>ราคา</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {editablePrices.procedures.length > 0 ? (
                                        editablePrices.procedures.map((proc, index) => (
                                            <TableRow key={index} hover>
                                                <TableCell>
                                                    <Typography variant="body2" fontWeight="600">
                                                        {proc.MED_PRO_NAME_THAI || proc.PROCEDURE_NAME || proc.MEDICAL_PROCEDURE_CODE}
                                                    </Typography>
                                                    {proc.NOTE1 && (
                                                        <Typography variant="caption" color="text.secondary">
                                                            หมายเหตุ: {proc.NOTE1}
                                                        </Typography>
                                                    )}
                                                </TableCell>
                                                <TableCell align="right">
                                                    <EditablePriceCell
                                                        type="procedures"
                                                        index={index}
                                                        currentPrice={proc.editablePrice}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={2} align="center" sx={{ py: 3 }}>
                                                <Typography color="text.secondary">ไม่มีรายการหัตถการ</Typography>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                    {/* แถวยอดรวม Procedures */}
                                    {editablePrices.procedures.length > 0 && (
                                        <TableRow sx={{ bgcolor: '#e8f5e8' }}>
                                            <TableCell sx={{ fontWeight: 'bold' }}>รวมหัตถการ</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
                                                ฿{editablePrices.procedures.reduce((sum, item) => sum + item.editablePrice, 0).toFixed(2)}
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );
};

export default LabProceduresTable;