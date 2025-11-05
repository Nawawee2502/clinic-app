import React, { useState, useEffect } from "react";
import {
    Container, Grid, TextField, Button, Card, CardContent, Typography,
    InputAdornment, IconButton, Stack, Pagination, Dialog,
    DialogTitle, DialogContent, DialogActions, Alert, Snackbar, Box,
    Select, MenuItem, FormControl, Divider, Chip, Autocomplete,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper
} from "@mui/material";
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import PrintIcon from '@mui/icons-material/Print';
import CheckStockService from "../services/checkStockService";
import DrugService from "../services/drugService";
import BalDrugService from "../services/balDrugService";

const CheckStockManagement = () => {
    // Helper functions สำหรับจัดการปี พ.ศ.
    const toBuddhistYear = (gregorianYear) => {
        return parseInt(gregorianYear) + 543;
    };

    const toGregorianYear = (buddhistYear) => {
        return parseInt(buddhistYear) - 543;
    };

    const formatDateBE = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear() + 543; // แปลงเป็น พ.ศ.
        return `${day}/${month}/${year}`;
    };

    // แปลงวันที่จาก input (ค.ศ.) เป็น พ.ศ. สำหรับแสดงผล
    const convertDateCEToBE = (ceDate) => {
        if (!ceDate) return '';
        const [year, month, day] = ceDate.split('-');
        const beYear = parseInt(year) + 543;
        return `${beYear}-${month}-${day}`;
    };

    // แปลงวันที่จาก พ.ศ. กลับเป็น ค.ศ. สำหรับเก็บใน state
    const convertDateBEToCE = (beDate) => {
        if (!beDate) return '';
        const [year, month, day] = beDate.split('-');
        const ceYear = parseInt(year) - 543;
        return `${ceYear}-${month}-${day}`;
    };

    // Component สำหรับ Date Input ที่แสดงเป็น พ.ศ.
    const DateInputBE = ({ label, value, onChange, disabled, ...props }) => {
        const displayValue = value ? convertDateCEToBE(value) : '';

        const handleChange = (e) => {
            const beValue = e.target.value;
            const ceValue = beValue ? convertDateBEToCE(beValue) : '';
            onChange(ceValue);
        };

        return (
            <TextField
                {...props}
                fullWidth
                label={label}
                type="date"
                value={displayValue}
                onChange={handleChange}
                disabled={disabled}
                size="small"
                InputLabelProps={{ shrink: true }}
                inputProps={{
                    max: convertDateCEToBE('9999-12-31') // ปี พ.ศ. สูงสุด
                }}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
            />
        );
    };

    const [currentView, setCurrentView] = useState("list");
    const [checkStockList, setCheckStockList] = useState([]);
    const [filteredList, setFilteredList] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchDate, setSearchDate] = useState(new Date().toISOString().slice(0, 10));
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [deleteDialog, setDeleteDialog] = useState({ open: false, refno: null });
    const [alert, setAlert] = useState({ open: false, message: '', severity: 'info' });

    const [drugList, setDrugList] = useState([]);
    const [lotList, setLotList] = useState([]);
    const [selectedLot, setSelectedLot] = useState(null);

    const [headerData, setHeaderData] = useState({
        REFNO: '',
        RDATE: new Date().toISOString().slice(0, 10),
        TRDATE: new Date().toISOString().slice(0, 10),
        MYEAR: (new Date().getFullYear() + 543).toString(), // เปลี่ยนเป็น พ.ศ.
        MONTHH: new Date().getMonth() + 1,
        STATUS: 'ทำงานอยู่'
    });

    // State สำหรับเก็บ runno ที่สร้างไว้แล้ว
    const [generatedRefno, setGeneratedRefno] = useState('');

    const [details, setDetails] = useState([]);

    const [openModal, setOpenModal] = useState(false);
    const [editingIndex, setEditingIndex] = useState(null);
    const [modalData, setModalData] = useState({
        DRUG_CODE: '',
        QTY_PROGRAM: 0,  // จำนวนในโปรแกรม (จาก BAL_DRUG)
        QTY_BAL: '',     // จำนวนคงเหลือ (ผู้ใช้กรอก)
        QTY: 0,          // จำนวนปรับปรุง (คำนวณอัตโนมัติ)
        UNIT_COST: '',
        UNIT_CODE1: '',
        UNIT_NAME1: '',
        GENERIC_NAME: '',
        AMT: '',
        LOT_NO: '',
        EXPIRE_DATE: ''
    });

    const itemsPerPage = 10;

    useEffect(() => {
        loadData();
        loadDrugs();
    }, []);

    useEffect(() => {
        filterData();
    }, [checkStockList, searchTerm, searchDate]);

    useEffect(() => {
        setTotalPages(Math.ceil(filteredList.length / itemsPerPage));
    }, [filteredList]);

    // สร้าง runno เมื่อเปิดหน้าเพิ่มใหม่
    useEffect(() => {
        if (currentView === "add" && !editingItem) {
            generateAndSetRefno();
        }
    }, [currentView, editingItem]);

    // สร้าง runno อัตโนมัติ
    const generateAndSetRefno = async () => {
        try {
            const date = new Date(headerData.RDATE);
            const year = date.getFullYear();
            const month = date.getMonth() + 1;

            // สร้าง runno ในรูปแบบ CST6810001
            const yearShort = (year + 543).toString().slice(-2); // เอา 2 ตัวท้ายของปี พ.ศ.
            const monthStr = month.toString().padStart(2, '0');
            const prefix = `CST${yearShort}${monthStr}`;

            // หาเลข running ล่าสุด
            const existingDocs = checkStockList.filter(item =>
                item.REFNO && item.REFNO.startsWith(prefix)
            );

            let maxRunning = 0;
            existingDocs.forEach(item => {
                const running = parseInt(item.REFNO.slice(-3));
                if (!isNaN(running) && running > maxRunning) {
                    maxRunning = running;
                }
            });

            const newRunning = (maxRunning + 1).toString().padStart(3, '0');
            const newRefno = `${prefix}${newRunning}`;

            setGeneratedRefno(newRefno);
            setHeaderData(prev => ({ ...prev, REFNO: newRefno }));
        } catch (error) {
            console.error('Error generating refno:', error);
            showAlert('ไม่สามารถสร้างเลขที่อัตโนมัติได้', 'error');
        }
    };

    const loadData = async () => {
        setLoading(true);
        try {
            const response = await CheckStockService.getAllCheckStock();
            if (response.success && response.data) {
                console.log(`✅ โหลดข้อมูลใบตรวจนับสต๊อก ${response.data.length} รายการ`);
                setCheckStockList(response.data);
                setFilteredList(response.data);
                showAlert(`โหลดข้อมูลสำเร็จ ${response.data.length} รายการ`, 'success');
            }
        } catch (error) {
            console.error('❌ Error loading data:', error);
            showAlert('ไม่สามารถโหลดข้อมูลได้', 'error');
            setCheckStockList([]);
            setFilteredList([]);
        }
        setLoading(false);
    };

    const loadDrugs = async () => {
        try {
            const response = await DrugService.getAllDrugs();
            if (response.success && response.data) {
                setDrugList(response.data);
            }
        } catch (error) {
            console.error('Error loading drugs:', error);
        }
    };

    const filterData = () => {
        let filtered = checkStockList;

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(item =>
                item.REFNO?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filter by date
        if (searchDate) {
            filtered = filtered.filter(item => {
                if (!item.RDATE) return false;
                const itemDate = new Date(item.RDATE).toISOString().slice(0, 10);
                return itemDate === searchDate;
            });
        }

        setFilteredList(filtered);
        setPage(1);
    };

    const getPaginatedData = () => {
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredList.slice(startIndex, endIndex);
    };

    const handleHeaderChange = (field, value) => {
        setHeaderData(prev => {
            const newData = { ...prev, [field]: value };
            if (field === 'RDATE') {
                const date = new Date(value);
                newData.MYEAR = toBuddhistYear(date.getFullYear()).toString(); // แปลงเป็น พ.ศ.
                newData.MONTHH = date.getMonth() + 1;
                newData.TRDATE = value;

                // สร้าง refno ใหม่เมื่อเปลี่ยนวันที่ (เฉพาะโหมดเพิ่มใหม่)
                if (!editingItem) {
                    setTimeout(() => generateAndSetRefno(), 100);
                }
            }
            return newData;
        });
    };

    const handleOpenModal = () => {
        setModalData({
            DRUG_CODE: '',
            QTY_PROGRAM: 0,
            QTY_BAL: '',
            QTY: 0,
            UNIT_COST: '',
            UNIT_CODE1: '',
            UNIT_NAME1: '',
            GENERIC_NAME: '',
            AMT: '',
            LOT_NO: '',
            EXPIRE_DATE: ''
        });
        setEditingIndex(null);
        setLotList([]);
        setSelectedLot(null);
        setOpenModal(true);
    };

    const handleEditDetail = async (index) => {
        const detail = details[index];
        
        // โหลด LOT list ของยานี้
        try {
            const lotsResponse = await BalDrugService.getLotsByDrugCode(detail.DRUG_CODE);
            if (lotsResponse.success && lotsResponse.data) {
                setLotList(lotsResponse.data);
                
                // หา lot ที่ตรงกับที่บันทึกไว้
                const savedLot = lotsResponse.data.find(lot => lot.LOT_NO === detail.LOT_NO);
                setSelectedLot(savedLot || null);
            } else {
                setLotList([]);
                setSelectedLot(null);
            }
        } catch (error) {
            console.error('Error loading lots:', error);
            setLotList([]);
            setSelectedLot(null);
        }
        
        setModalData({
            ...detail,
            UNIT_NAME1: detail.UNIT_NAME1 || '',
            LOT_NO: detail.LOT_NO || '',
            EXPIRE_DATE: detail.EXPIRE_DATE || ''
        });
        setEditingIndex(index);
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setEditingIndex(null);
        setLotList([]);
        setSelectedLot(null);
    };

    const handleModalChange = (field, value) => {
        setModalData(prev => {
            const updated = { ...prev, [field]: value };

            // คำนวณจำนวนปรับปรุง เมื่อ QTY_BAL เปลี่ยน
            if (field === 'QTY_BAL') {
                const qtyBal = parseFloat(value) || 0;
                const qtyProgram = parseFloat(updated.QTY_PROGRAM) || 0;
                updated.QTY = qtyBal - qtyProgram;

                // ✅ เอา Math.abs() ออก
                const unitCost = parseFloat(updated.UNIT_COST) || 0;
                updated.AMT = (updated.QTY * unitCost).toFixed(2);
            }

            // คำนวณจำนวนเงิน เมื่อ UNIT_COST เปลี่ยน
            if (field === 'UNIT_COST') {
                const qtyAdjust = parseFloat(updated.QTY) || 0;
                const unitCost = parseFloat(value) || 0;
                // ✅ เอา Math.abs() ออก
                updated.AMT = (qtyAdjust * unitCost).toFixed(2);
            }

            return updated;
        });
    };

    const handleModalDrugChange = async (event, newValue) => {
        if (newValue) {
            try {
                const response = await DrugService.getDrugByCode(newValue.DRUG_CODE);

                let drug = null;
                if (response.success && response.data) {
                    drug = response.data;
                } else if (response.DRUG_CODE) {
                    drug = response;
                }

                if (drug) {
                    // ดึงรายการ LOT_NO จาก bal_drug
                    const lotsResponse = await BalDrugService.getLotsByDrugCode(drug.DRUG_CODE);
                    
                    console.log('🔍 CheckStockManagement - lotsResponse:', lotsResponse);
                    console.log('🔍 CheckStockManagement - lotsResponse.data:', lotsResponse.data);
                    
                    if (lotsResponse.success && lotsResponse.data) {
                        console.log('🔍 CheckStockManagement - lotList before setting:', lotsResponse.data);
                        // Debug: ดูว่าแต่ละ lot มี QTY เป็นเท่าไหร่
                        lotsResponse.data.forEach((lot, index) => {
                            console.log(`🔍 Lot ${index}:`, {
                                LOT_NO: lot.LOT_NO,
                                QTY: lot.QTY,
                                EXPIRE_DATE: lot.EXPIRE_DATE,
                                UNIT_CODE1: lot.UNIT_CODE1,
                                UNIT_PRICE: lot.UNIT_PRICE,
                                AMT: lot.AMT,
                                allFields: Object.keys(lot)
                            });
                        });
                        setLotList(lotsResponse.data);
                    } else {
                        console.warn('⚠️ CheckStockManagement - No lots data or response not success');
                        setLotList([]);
                    }

                    setModalData(prev => ({
                        ...prev,
                        DRUG_CODE: drug.DRUG_CODE,
                        GENERIC_NAME: drug.GENERIC_NAME || '',
                        UNIT_CODE1: drug.UNIT_CODE1 || '',
                        UNIT_NAME1: drug.UNIT_NAME1 || '',
                        QTY_PROGRAM: 0, // จะถูกอัปเดตเมื่อเลือก LOT
                        LOT_NO: '',
                        EXPIRE_DATE: '',
                        QTY: 0, // รีเซ็ตเมื่อเปลี่ยนยา
                        AMT: '' // รีเซ็ตเมื่อเปลี่ยนยา
                    }));
                    setSelectedLot(null);
                }
            } catch (error) {
                console.error('❌ Error loading drug details:', error);
                showAlert('ไม่สามารถโหลดข้อมูลยาได้', 'error');
            }
        } else {
            setModalData(prev => ({
                ...prev,
                DRUG_CODE: '',
                GENERIC_NAME: '',
                UNIT_CODE1: '',
                UNIT_NAME1: '',
                QTY_PROGRAM: 0,
                QTY: 0,
                AMT: '',
                LOT_NO: '',
                EXPIRE_DATE: ''
            }));
            setLotList([]);
            setSelectedLot(null);
        }
    };

    const handleLotChange = (event, value) => {
        setSelectedLot(value);
        if (value) {
            const lotQty = parseFloat(value.QTY) || 0;
            setModalData(prev => {
                const updated = {
                    ...prev,
                    LOT_NO: value.LOT_NO,
                    EXPIRE_DATE: CheckStockService.formatDateForInput(value.EXPIRE_DATE),
                    QTY_PROGRAM: lotQty // อัปเดต QTY_PROGRAM ตาม LOT ที่เลือก
                };
                
                // คำนวณจำนวนปรับปรุงใหม่ (ถ้ามี QTY_BAL)
                if (prev.QTY_BAL) {
                    const qtyBal = parseFloat(prev.QTY_BAL) || 0;
                    updated.QTY = qtyBal - lotQty;
                    
                    // คำนวณจำนวนเงินใหม่
                    const unitCost = parseFloat(prev.UNIT_COST) || 0;
                    updated.AMT = (updated.QTY * unitCost).toFixed(2);
                }
                
                return updated;
            });
        } else {
            setModalData(prev => ({
                ...prev,
                LOT_NO: '',
                EXPIRE_DATE: '',
                QTY_PROGRAM: 0
            }));
        }
    };

    const handleAddDetail = () => {
        if (!modalData.DRUG_CODE || modalData.QTY_BAL === '' || modalData.QTY_BAL === undefined) {
            showAlert('กรุณากรอกรหัสยาและจำนวนคงเหลือ', 'warning');
            return;
        }

        if (!modalData.LOT_NO) {
            showAlert('กรุณาเลือก LOT NO', 'warning');
            return;
        }

        const newDetail = {
            ...modalData,
            UNIT_CODE1: modalData.UNIT_CODE1,
            UNIT_NAME1: modalData.UNIT_NAME1,
            LOT_NO: modalData.LOT_NO,
            EXPIRE_DATE: modalData.EXPIRE_DATE
        };

        if (editingIndex !== null) {
            const newDetails = [...details];
            newDetails[editingIndex] = newDetail;
            setDetails(newDetails);
            showAlert('แก้ไขรายการสำเร็จ', 'success');
        } else {
            setDetails([...details, newDetail]);
            showAlert('เพิ่มรายการสำเร็จ', 'success');
        }
        handleCloseModal();
    };

    const handleRemoveDetail = (index) => {
        const newDetails = details.filter((_, i) => i !== index);
        setDetails(newDetails);
        showAlert('ลบรายการสำเร็จ', 'success');
    };

    const resetForm = () => {
        setHeaderData({
            REFNO: '',
            RDATE: new Date().toISOString().slice(0, 10),
            TRDATE: new Date().toISOString().slice(0, 10),
            MYEAR: (new Date().getFullYear() + 543).toString(), // เปลี่ยนเป็น พ.ศ.
            MONTHH: new Date().getMonth() + 1,
            STATUS: 'ทำงานอยู่'
        });
        setDetails([]);
        setEditingItem(null);
        setGeneratedRefno('');
    };

    const handleSave = async () => {
        console.log('🔵 handleSave called');

        const headerErrors = CheckStockService.validateHeaderData(headerData, !!editingItem);
        const detailErrors = CheckStockService.validateDetailData(details);
        const errors = [...headerErrors, ...detailErrors];

        if (errors.length > 0) {
            console.log('❌ Validation failed:', errors[0]);
            showAlert(errors[0], 'error');
            return;
        }

        setLoading(true);

        try {
            let dataToSave = headerData;

            if (!editingItem) {
                // เช็คว่า REFNO ซ้ำหรือไม่
                const isDuplicate = checkStockList.some(item => item.REFNO === headerData.REFNO);

                if (isDuplicate) {
                    // ถ้าซ้ำ ให้สร้าง runno ใหม่โดยบวก 1
                    const prefix = headerData.REFNO.slice(0, -3);
                    const currentRunning = parseInt(headerData.REFNO.slice(-3));
                    const newRunning = (currentRunning + 1).toString().padStart(3, '0');
                    const newRefno = `${prefix}${newRunning}`;

                    dataToSave = { ...headerData, REFNO: newRefno };
                    setGeneratedRefno(newRefno);
                    console.log('⚠️ REFNO ซ้ำ, สร้างใหม่:', newRefno);
                } else {
                    dataToSave = { ...headerData };
                    console.log('➕ CREATE mode - REFNO:', headerData.REFNO);
                }
            } else {
                console.log('✏️ UPDATE mode - REFNO:', editingItem.REFNO);
                dataToSave = { ...headerData, REFNO: editingItem.REFNO };
            }

            const formattedData = CheckStockService.formatCheckStockData(dataToSave, details);
            console.log('📝 Formatted data:', formattedData);

            let result;
            if (!editingItem) {
                result = await CheckStockService.createCheckStock(formattedData);
                console.log('✅ CREATE response:', result);
                showAlert('สร้างใบตรวจนับสต๊อกสำเร็จ', 'success');
            } else {
                result = await CheckStockService.updateCheckStock(editingItem.REFNO, formattedData);
                console.log('✅ UPDATE response:', result);
                showAlert('แก้ไขใบตรวจนับสต๊อกสำเร็จ', 'success');
            }

            await loadData();
            resetForm();
            setCurrentView("list");
        } catch (error) {
            console.error('❌ Error in handleSave:', error);
            showAlert(error.message || 'เกิดข้อผิดพลาดในการบันทึก', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = async (item) => {
        try {
            setLoading(true);
            const response = await CheckStockService.getCheckStockByRefno(item.REFNO);

            if (response.success && response.data) {
                const { header, details: detailsData } = response.data;

                setHeaderData({
                    REFNO: header.REFNO,
                    RDATE: CheckStockService.formatDateForInput(header.RDATE),
                    TRDATE: CheckStockService.formatDateForInput(header.TRDATE),
                    MYEAR: header.MYEAR,
                    MONTHH: header.MONTHH,
                    STATUS: header.STATUS
                });

                setDetails(detailsData.length > 0 ? detailsData : [CheckStockService.createEmptyDetail()]);
                setEditingItem(header);
                setCurrentView("edit");
            }
        } catch (error) {
            console.error('Error loading check stock for edit:', error);
            showAlert('ไม่สามารถโหลดข้อมูลสำหรับแก้ไขได้', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (refno) => {
        setDeleteDialog({ open: true, refno });
    };

    const handleDeleteConfirm = async () => {
        const { refno } = deleteDialog;

        try {
            await CheckStockService.deleteCheckStock(refno);
            showAlert('ลบข้อมูลสำเร็จ', 'success');
            await loadData();
        } catch (error) {
            console.error('Error deleting:', error);
            showAlert(error.message || 'เกิดข้อผิดพลาดในการลบ', 'error');
        }

        setDeleteDialog({ open: false, refno: null });
    };

    const handlePrint = async (item) => {
        try {
            const response = await CheckStockService.getCheckStockByRefno(item.REFNO);
            if (response.success && response.data) {
                CheckStockService.printCheckStock(response.data.header, response.data.details);
            }
        } catch (error) {
            console.error('Error printing:', error);
            showAlert('ไม่สามารถพิมพ์ได้', 'error');
        }
    };

    const showAlert = (message, severity) => {
        setAlert({ open: true, message, severity });
    };

    const calculateTotal = () => {
        return CheckStockService.calculateTotal(details);
    };

    if (currentView === "add" || currentView === "edit") {
        return (
            <Container maxWidth="lg" sx={{ mt: 2 }}>
                <Card>
                    <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                            <Typography variant="h6" fontWeight="bold">
                                {editingItem ? 'แก้ไขใบตรวจนับสต๊อก' : 'สร้างใบตรวจนับสต๊อก'}
                            </Typography>
                            <IconButton onClick={() => { resetForm(); setCurrentView("list"); }}>
                                <CloseIcon />
                            </IconButton>
                        </Box>

                        <Grid container spacing={2} sx={{ mb: 3 }}>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="เลขที่เอกสาร"
                                    value={editingItem ? headerData.REFNO : generatedRefno}
                                    disabled
                                    size="small"
                                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <DateInputBE
                                    label="วันที่"
                                    value={headerData.RDATE}
                                    onChange={(value) => handleHeaderChange('RDATE', value)}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <FormControl fullWidth size="small">
                                    <Select
                                        value={headerData.STATUS}
                                        onChange={(e) => handleHeaderChange('STATUS', e.target.value)}
                                        sx={{ borderRadius: "10px" }}
                                    >
                                        <MenuItem value="ทำงานอยู่">ทำงานอยู่</MenuItem>
                                        <MenuItem value="ยกเลิก">ยกเลิก</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>

                        <Divider sx={{ my: 3 }} />

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6" fontWeight="bold">รายการสินค้า</Typography>
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={handleOpenModal}
                                sx={{ backgroundColor: '#5698E0' }}
                            >
                                เพิ่มรายการ
                            </Button>
                        </Box>

                        <TableContainer component={Paper} sx={{ mb: 3 }}>
                            <Table size="small">
                                <TableHead sx={{ backgroundColor: "#F0F5FF" }}>
                                    <TableRow>
                                        <TableCell>ชื่อยา</TableCell>
                                        <TableCell>LOT NO</TableCell>
                                        <TableCell>วันหมดอายุ</TableCell>
                                        <TableCell align="right">จน.ในโปรแกรม</TableCell>
                                        <TableCell align="right">จน.คงเหลือ</TableCell>
                                        <TableCell align="right">จน.ปรับปรุง</TableCell>
                                        <TableCell>หน่วย</TableCell>
                                        <TableCell align="right">ราคา/หน่วย</TableCell>
                                        <TableCell align="right">รวม</TableCell>
                                        <TableCell align="center">จัดการ</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {details.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={10} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                                                ยังไม่มีรายการ กรุณาเพิ่มรายการสินค้า
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        details.map((detail, index) => {
                                            const qtyAdjust = CheckStockService.calculateAdjustment(detail.QTY_BAL, detail.QTY_PROGRAM);
                                            return (
                                                <TableRow key={index}>
                                                    <TableCell>{detail.GENERIC_NAME}</TableCell>
                                                    <TableCell>{detail.LOT_NO || '-'}</TableCell>
                                                    <TableCell>{detail.EXPIRE_DATE ? formatDateBE(detail.EXPIRE_DATE) : '-'}</TableCell>
                                                    <TableCell align="right">{detail.QTY_PROGRAM || 0}</TableCell>
                                                    <TableCell align="right">{detail.QTY_BAL || 0}</TableCell>
                                                    <TableCell align="right" sx={{
                                                        color: qtyAdjust < 0 ? 'error.main' : qtyAdjust > 0 ? 'success.main' : 'inherit',
                                                        fontWeight: 500
                                                    }}>
                                                        {qtyAdjust}
                                                    </TableCell>
                                                    <TableCell>{detail.UNIT_NAME1 || '-'}</TableCell>
                                                    <TableCell align="right">{CheckStockService.formatCurrency(detail.UNIT_COST)}</TableCell>
                                                    <TableCell align="right">{CheckStockService.formatCurrency(detail.AMT)}</TableCell>
                                                    <TableCell align="center">
                                                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                                                            <IconButton size="small" onClick={() => handleEditDetail(index)}
                                                                sx={{ border: '1px solid #5698E0', borderRadius: '7px' }}>
                                                                <EditIcon sx={{ color: '#5698E0' }} />
                                                            </IconButton>
                                                            <IconButton size="small" onClick={() => handleRemoveDetail(index)}
                                                                sx={{ border: '1px solid #F62626', borderRadius: '7px' }}>
                                                                <DeleteIcon sx={{ color: '#F62626' }} />
                                                            </IconButton>
                                                        </Box>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        <Divider sx={{ my: 2 }} />

                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                            <Typography variant="h6" fontWeight="bold">
                                รวมทั้งสิ้น: {CheckStockService.formatCurrency(calculateTotal())} บาท
                            </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                            <Button variant="outlined" onClick={() => { resetForm(); setCurrentView("list"); }}>ยกเลิก</Button>
                            <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave} disabled={loading}
                                sx={{ backgroundColor: "#5698E0", minWidth: 150 }}>
                                {loading ? 'กำลังบันทึก...' : 'บันทึก'}
                            </Button>
                        </Box>
                    </CardContent>
                </Card>

                {/* Modal สำหรับเพิ่ม/แก้ไขรายการ */}
                <Dialog open={openModal} onClose={handleCloseModal} maxWidth="md" fullWidth>
                    <DialogTitle>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="h6">
                                {editingIndex !== null ? 'แก้ไขรายการสินค้า' : 'เพิ่มรายการสินค้า'}
                            </Typography>
                            <IconButton onClick={handleCloseModal} size="small">
                                <CloseIcon />
                            </IconButton>
                        </Box>
                    </DialogTitle>
                    <DialogContent>
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                            <Grid item xs={12}>
                                <Autocomplete
                                    fullWidth
                                    options={drugList}
                                    getOptionLabel={(option) => {
                                        return option.GENERIC_NAME || '';
                                    }}
                                    filterOptions={(options, { inputValue }) => {
                                        const searchTerm = inputValue.toLowerCase();
                                        return options.filter(option => 
                                            (option.GENERIC_NAME || '').toLowerCase().includes(searchTerm) ||
                                            (option.TRADE_NAME || '').toLowerCase().includes(searchTerm) ||
                                            (option.DRUG_CODE || '').toLowerCase().includes(searchTerm)
                                        );
                                    }}
                                    value={drugList.find(d => d.DRUG_CODE === modalData.DRUG_CODE) || null}
                                    onChange={handleModalDrugChange}
                                    size="small"
                                    renderInput={(params) => (
                                        <TextField {...params} label="รหัสยา *" sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }} />
                                    )}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Autocomplete
                                    fullWidth
                                    options={lotList}
                                    getOptionLabel={(option) => `${option.LOT_NO || ''} (QTY: ${option.QTY || 0})`}
                                    value={selectedLot}
                                    onChange={handleLotChange}
                                    disabled={!modalData.DRUG_CODE || lotList.length === 0}
                                    size="small"
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="LOT NO *"
                                            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
                                            helperText={!modalData.DRUG_CODE ? "เลือกยาก่อน" : lotList.length === 0 ? "ไม่มี LOT" : ""}
                                        />
                                    )}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <DateInputBE
                                    label="วันหมดอายุ"
                                    value={modalData.EXPIRE_DATE}
                                    onChange={(value) => { }} // ไม่ให้แก้ไข
                                    disabled={true}
                                />
                            </Grid>

                            <Grid item xs={12} md={4}>
                                <TextField
                                    fullWidth
                                    label="จำนวนในโปรแกรม"
                                    value={modalData.QTY_PROGRAM || 0}
                                    disabled
                                    size="small"
                                    sx={{
                                        "& .MuiOutlinedInput-root": { borderRadius: "10px" },
                                        "& .MuiInputBase-input.Mui-disabled": {
                                            WebkitTextFillColor: "#1976d2",
                                            fontWeight: 600
                                        }
                                    }}
                                    helperText="ดึงจาก BAL_DRUG"
                                />
                            </Grid>

                            <Grid item xs={12} md={4}>
                                <TextField
                                    fullWidth
                                    label="จำนวนคงเหลือ *"
                                    type="number"
                                    value={modalData.QTY_BAL}
                                    onChange={(e) => handleModalChange('QTY_BAL', e.target.value)}
                                    inputProps={{ step: "1", min: "0" }}
                                    size="small"
                                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
                                    helperText="ผู้ใช้กรอก"
                                />
                            </Grid>

                            <Grid item xs={12} md={4}>
                                <TextField
                                    fullWidth
                                    label="จำนวนปรับปรุง"
                                    value={modalData.QTY || 0}
                                    disabled
                                    size="small"
                                    sx={{
                                        "& .MuiOutlinedInput-root": { borderRadius: "10px" },
                                        "& .MuiInputBase-input.Mui-disabled": {
                                            WebkitTextFillColor: modalData.QTY < 0 ? "#d32f2f" : modalData.QTY > 0 ? "#2e7d32" : "#000",
                                            fontWeight: 600
                                        }
                                    }}
                                    helperText="คงเหลือ - ในโปรแกรม"
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="หน่วย"
                                    value={modalData.UNIT_NAME1}
                                    disabled
                                    size="small"
                                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="ราคา/หน่วย *"
                                    type="number"
                                    value={modalData.UNIT_COST}
                                    onChange={(e) => handleModalChange('UNIT_COST', e.target.value)}
                                    inputProps={{ step: "0.01", min: "0" }}
                                    size="small"
                                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="จำนวนเงิน"
                                    value={modalData.AMT}
                                    disabled
                                    size="small"
                                    sx={{
                                        "& .MuiOutlinedInput-root": { borderRadius: "10px" },
                                        "& .MuiInputBase-input.Mui-disabled": {
                                            WebkitTextFillColor: "#1976d2",
                                            fontWeight: 600
                                        }
                                    }}
                                    helperText="คำนวณอัตโนมัติ"
                                />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseModal}>ยกเลิก</Button>
                        <Button variant="contained" onClick={handleAddDetail} sx={{ backgroundColor: '#5698E0' }}>
                            {editingIndex !== null ? 'บันทึก' : 'เพิ่ม'}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" fontWeight="bold">ใบตรวจนับสต๊อก ({filteredList.length} รายการ)</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCurrentView("add")} sx={{ backgroundColor: '#5698E0' }}>
                    สร้างใบตรวจนับสต๊อก
                </Button>
            </Box>

            <Card sx={{ mb: 2 }}>
                <CardContent>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={8}>
                            <TextField size="small" placeholder="ค้นหา (เลขที่)" value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)} fullWidth
                                InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon color="action" /></InputAdornment> }}
                                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }} />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <DateInputBE
                                label="วันที่"
                                value={searchDate}
                                onChange={(value) => setSearchDate(value)}
                            />
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            <Card>
                <CardContent>
                    {filteredList.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                            <Typography variant="h6" color="text.secondary">
                                {searchTerm || searchDate ? 'ไม่พบข้อมูลที่ค้นหา' : 'ยังไม่มีข้อมูล'}
                            </Typography>
                        </Box>
                    ) : (
                        <>
                            <Box sx={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                                    <thead style={{ backgroundColor: "#F0F5FF" }}>
                                        <tr>
                                            <th style={{ padding: '12px 8px', textAlign: 'left', color: '#696969' }}>ลำดับ</th>
                                            <th style={{ padding: '12px 8px', textAlign: 'left', color: '#696969' }}>เลขที่</th>
                                            <th style={{ padding: '12px 8px', textAlign: 'left', color: '#696969' }}>วันที่</th>
                                            <th style={{ padding: '12px 8px', textAlign: 'right', color: '#696969' }}>จำนวนเงิน</th>
                                            <th style={{ padding: '12px 8px', textAlign: 'center', color: '#696969' }}>สถานะ</th>
                                            <th style={{ padding: '12px 8px', textAlign: 'center', color: '#696969' }}>จัดการ</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {getPaginatedData().map((item, index) => (
                                            <tr key={item.REFNO} style={{ borderTop: '1px solid #e0e0e0' }}>
                                                <td style={{ padding: '12px 8px' }}>{(page - 1) * itemsPerPage + index + 1}</td>
                                                <td style={{ padding: '12px 8px', fontWeight: 500 }}>{item.REFNO}</td>
                                                <td style={{ padding: '12px 8px' }}>{formatDateBE(item.RDATE)}</td>
                                                <td style={{ padding: '12px 8px', textAlign: 'right', fontWeight: 500 }}>
                                                    {CheckStockService.formatCurrency(item.TOTAL)}
                                                </td>
                                                <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                                                    <Chip label={item.STATUS} color={item.STATUS === 'ทำงานอยู่' ? 'success' : 'error'} size="small" />
                                                </td>
                                                <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                                                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                                                        <IconButton size="small" onClick={() => handlePrint(item)}
                                                            sx={{ border: '1px solid #9C27B0', borderRadius: '7px' }}>
                                                            <PrintIcon sx={{ color: '#9C27B0' }} />
                                                        </IconButton>
                                                        <IconButton size="small" onClick={() => handleEdit(item)}
                                                            sx={{ border: '1px solid #5698E0', borderRadius: '7px' }}>
                                                            <EditIcon sx={{ color: '#5698E0' }} />
                                                        </IconButton>
                                                        <IconButton size="small" onClick={() => handleDeleteClick(item.REFNO)}
                                                            sx={{ border: '1px solid #F62626', borderRadius: '7px' }}>
                                                            <DeleteIcon sx={{ color: '#F62626' }} />
                                                        </IconButton>
                                                    </Box>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </Box>

                            <Stack spacing={2} direction="row" justifyContent="center" sx={{ mt: 3 }}>
                                <Pagination count={totalPages} page={page} onChange={(event, value) => setPage(value)} shape="rounded" color="primary" />
                            </Stack>
                        </>
                    )}
                </CardContent>
            </Card>

            <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, refno: null })}>
                <DialogTitle>ยืนยันการลบข้อมูล</DialogTitle>
                <DialogContent>
                    <Typography>คุณแน่ใจหรือไม่ที่ต้องการลบใบตรวจนับสต๊อก "{deleteDialog.refno}"?</Typography>
                    <Typography color="error" sx={{ mt: 1, fontSize: 14 }}>
                        การลบจะลบทั้งข้อมูลหัวและรายละเอียดทั้งหมด
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialog({ open: false, refno: null })}>ยกเลิก</Button>
                    <Button onClick={handleDeleteConfirm} variant="contained" color="error" startIcon={<DeleteIcon />}>ลบ</Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={alert.open} autoHideDuration={4000} onClose={() => setAlert({ ...alert, open: false })}>
                <Alert onClose={() => setAlert({ ...alert, open: false })} severity={alert.severity} sx={{ width: '100%' }}>
                    {alert.message}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default CheckStockManagement;