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
    Chip,
    IconButton,
    TextField
} from "@mui/material";
import {
    Edit as EditIcon,
    Check as CheckIcon,
    Close as CloseIcon
} from "@mui/icons-material";

const ucsLabel = (ucs) =>
    ucs === 'Y' ? 'บัตรทอง (สปสช.)' : 'เก็บเงิน';

const DrugsTable = ({
    editablePrices,
    editingItem,
    onEditPrice,
    onSavePrice,
    onCancelEdit,
    /** ยอดยาที่ใช้ในยอดชำระ (ตามสิทธิ์บัตรทอง + ราคาที่แก้) — ต้องตรงกับการ์ดสรุป */
    payableDrugTotal
}) => {
    const [tempPrice, setTempPrice] = React.useState('');

    // Component สำหรับแก้ไขราคาในตาราง (แก้ไข layout ให้ราคากับ icon อยู่ใกล้กันและชิดขวา)
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
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'flex-end' }}>
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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'flex-end' }}>
                <TextField
                    size="small"
                    type="text"
                    value={tempPrice}
                    onChange={(e) => {
                        const val = e.target.value;
                        // Allow only numbers and one decimal point
                        if (val === '' || /^\d*\.?\d*$/.test(val)) {
                            setTempPrice(val);
                        }
                    }}
                    sx={{ width: 80 }}
                    autoFocus
                    onKeyDown={(e) => {
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
        <Card elevation={2} sx={{ borderRadius: '12px', mb: 3 }}>
            <Box sx={{
                bgcolor: '#5698E0',
                color: 'white',
                p: 2,
                textAlign: 'center',
                borderTopLeftRadius: '12px',
                borderTopRightRadius: '12px'
            }}>
                <Typography variant="h6" fontWeight="bold">
                    💊 รายการยา/เวชภัณฑ์ ({editablePrices.drugs.length} รายการ)
                </Typography>
            </Box>
            <CardContent sx={{ p: 0 }}>
                <TableContainer>
                    <Table>
                        <TableHead sx={{ bgcolor: '#f8f9fa' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold' }}>ลำดับ</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>ชื่อยา/รายละเอียด</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>ประเภท</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 'bold' }}>สิทธิ์ยา</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 'bold' }}>จำนวน</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 'bold' }}>ราคา/หน่วย</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 'bold' }}>ราคารวม</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {editablePrices.drugs.length > 0 ? (
                                editablePrices.drugs.map((drug, index) => (
                                    <TableRow key={index} hover sx={{ '&:nth-of-type(odd)': { bgcolor: '#fafafa' } }}>
                                        <TableCell>
                                            <Box sx={{
                                                bgcolor: '#5698E0',
                                                color: 'white',
                                                borderRadius: '50%',
                                                width: 32,
                                                height: 32,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontWeight: 'bold'
                                            }}>
                                                {index + 1}
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Box>
                                                <Typography variant="body1" fontWeight="bold" sx={{ color: '#2B69AC' }}>
                                                    {[
                                                        drug.GENERIC_NAME,
                                                        drug.TRADE_NAME
                                                    ].filter(Boolean).join(' / ') || drug.GENERIC_NAME || drug.TRADE_NAME || drug.DRUG_CODE || '-'}
                                                </Typography>
                                                {(drug.NOTE1 || drug.TIME1) && (
                                                    <Typography variant="caption" color="text.secondary">
                                                        {drug.NOTE1 && `📋 ${drug.NOTE1}`}
                                                        {drug.NOTE1 && drug.TIME1 && ' • '}
                                                        {drug.TIME1 && `⏰ ${drug.TIME1}`}
                                                    </Typography>
                                                )}
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" color="text.secondary">
                                                {drug.TYPE_DRUG_NAME || '-'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Chip
                                                size="small"
                                                label={ucsLabel(drug.DRUG_UCS_CARD)}
                                                color={drug.DRUG_UCS_CARD === 'Y' ? 'success' : 'default'}
                                                variant={drug.DRUG_UCS_CARD === 'Y' ? 'filled' : 'outlined'}
                                                sx={{ fontWeight: 600, maxWidth: '100%' }}
                                            />
                                        </TableCell>
                                        <TableCell align="center">
                                            <Box sx={{
                                                bgcolor: '#E3F2FD',
                                                color: '#2B69AC',
                                                px: 2,
                                                py: 0.5,
                                                borderRadius: 2,
                                                fontWeight: 'bold'
                                            }}>
                                                {drug.QTY || 0}{' '}
                                                {drug.DISPLAY_UNIT_NAME || drug.UNIT_NAME || drug.UNIT_CODE || ''}
                                            </Box>
                                        </TableCell>
                                        <TableCell align="right">
                                            <Typography variant="body2" fontWeight="bold">
                                                ฿{parseFloat(drug.UNIT_PRICE || (drug.editablePrice / (drug.QTY || 1))).toFixed(2)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="right">
                                            <EditablePriceCell
                                                type="drugs"
                                                index={index}
                                                currentPrice={drug.editablePrice}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                                        <Box sx={{ textAlign: 'center' }}>
                                            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                                                ไม่มีรายการยา
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                ยังไม่มีการจ่ายยาสำหรับผู้ป่วยรายนี้
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            )}
                            {/* แถวยอดรวมยา */}
                            {editablePrices.drugs.length > 0 && (
                                <TableRow sx={{ bgcolor: '#fff3e0' }}>
                                    <TableCell colSpan={6} sx={{ fontWeight: 'bold', textAlign: 'right' }}>
                                        รวมค่ายา (นับในยอดชำระ):
                                    </TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 'bold', color: '#f57c00', fontSize: '1.1rem' }}>
                                        ฿{(typeof payableDrugTotal === 'number' ? payableDrugTotal : editablePrices.drugs.reduce((sum, item) => sum + (Number(item.editablePrice) || 0), 0)).toFixed(2)}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </CardContent>
        </Card>
    );
};

export default DrugsTable;