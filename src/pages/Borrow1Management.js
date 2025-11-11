import React, { useState, useEffect } from "react";
import {
    Container, Grid, TextField, Button, Card, CardContent, Typography,
    InputAdornment, IconButton, Stack, Pagination, Dialog,
    DialogTitle, DialogContent, DialogActions, Alert, Snackbar, Box,
    Select, MenuItem, FormControl, InputLabel, Divider, Chip, Autocomplete,
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
import Borrow1Service from "../services/borrow1Service";
import DrugService from "../services/drugService";
import EmployeeService from "../services/employeeService";
import BalDrugService from "../services/balDrugService";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

const Borrow1Management = () => {
    // Helper functions สำหรับจัดการปี พ.ศ.
    const toBuddhistYear = (gregorianYear) => {
        return parseInt(gregorianYear) + 543;
    };

    const toGregorianYear = (buddhistYear) => {
        return parseInt(buddhistYear) - 543;
    };

    const getYearOptionsBE = (yearsBack = 5) => {
        const currentYear = new Date().getFullYear() + 543;
        const options = [];
        for (let i = 0; i <= yearsBack; i++) {
            const year = currentYear - i;
            options.push({ value: year.toString(), label: year.toString() });
        }
        return options;
    };

    const monthOptions = [
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
    const [borrow1List, setBorrow1List] = useState([]);
    const [filteredList, setFilteredList] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterYear, setFilterYear] = useState((new Date().getFullYear() + 543).toString());
    const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [deleteDialog, setDeleteDialog] = useState({ open: false, refno: null });
    const [alert, setAlert] = useState({ open: false, message: '', severity: 'info' });

    const [drugList, setDrugList] = useState([]);
    const [employeeList, setEmployeeList] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState(null);

    // State สำหรับ LOT
    const [lotList, setLotList] = useState([]);
    const [selectedLot, setSelectedLot] = useState(null);

    const [headerData, setHeaderData] = useState({
        REFNO: '',
        RDATE: new Date().toISOString().slice(0, 10),
        TRDATE: new Date().toISOString().slice(0, 10),
        MYEAR: (new Date().getFullYear() + 543).toString(), // เปลี่ยนเป็น พ.ศ.
        MONTHH: new Date().getMonth() + 1,
        EMP_CODE: '',
        STATUS: 'ทำงานอยู่'
    });

    // State สำหรับเก็บ runno ที่สร้างไว้แล้ว
    const [generatedRefno, setGeneratedRefno] = useState('');

    const [details, setDetails] = useState([]);

    const [openModal, setOpenModal] = useState(false);
    const [editingIndex, setEditingIndex] = useState(null);
    const [modalData, setModalData] = useState({
        DRUG_CODE: '',
        QTY: '',
        UNIT_COST: '',
        UNIT_CODE1: '',
        UNIT_NAME1: '',
        GENERIC_NAME: '',
        AMT: '',
        LOT_NO: '',
        EXPIRE_DATE: ''
    });
    const [modalErrors, setModalErrors] = useState({});

    const itemsPerPage = 10;

    const getCurrentLotInfo = () => {
        if (selectedLot) return selectedLot;
        if (modalData.LOT_NO) {
            return lotList.find(lot => lot.LOT_NO === modalData.LOT_NO) || null;
        }
        return null;
    };

    const getRemainingQtyForLot = (lot, excludeIndex = null, drugCode = modalData.DRUG_CODE) => {
        if (!lot || !drugCode) return null;
        const lotQty = parseFloat(lot.QTY) || 0;
        const usedQty = details.reduce((sum, detail, index) => {
            if (excludeIndex !== null && index === excludeIndex) {
                return sum;
            }
            if (detail.DRUG_CODE === drugCode && detail.LOT_NO === lot.LOT_NO) {
                return sum + (parseFloat(detail.QTY) || 0);
            }
            return sum;
        }, 0);
        return Math.max(lotQty - usedQty, 0);
    };

    const formatQty = (qty) => {
        const numeric = parseFloat(qty);
        if (!Number.isFinite(numeric)) {
            return '0.00';
        }
        return numeric.toLocaleString('th-TH', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };

    const calculateAmount = (qty, unitCost) => {
        const numericQty = parseFloat(qty) || 0;
        const numericUnitCost = parseFloat(unitCost) || 0;
        const amount = Borrow1Service.calculateLineAmount(numericQty, numericUnitCost);
        return Number.isFinite(amount) ? amount.toFixed(2) : '0.00';
    };

    useEffect(() => {
        loadData();
        loadDrugs();
        loadEmployees();
    }, []);

    useEffect(() => {
        filterData();
    }, [borrow1List, searchTerm, filterYear, filterMonth]);

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

            // สร้าง runno ในรูปแบบ REQ6810001
            const yearShort = (year + 543).toString().slice(-2); // เอา 2 ตัวท้ายของปี พ.ศ.
            const monthStr = month.toString().padStart(2, '0');
            const prefix = `REQ${yearShort}${monthStr}`;

            // หาเลข running ล่าสุด
            const existingDocs = borrow1List.filter(item =>
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

    const loadEmployees = async () => {
        try {
            const response = await EmployeeService.getAllEmployees();
            if (response.success && response.data) {
                setEmployeeList(response.data);
            }
        } catch (error) {
            console.error('Error loading employees:', error);
        }
    };

    const loadData = async () => {
        setLoading(true);
        try {
            const response = await Borrow1Service.getAllBorrow1();
            if (response.success && response.data) {
                console.log(`✅ โหลดข้อมูลใบเบิกสินค้า ${response.data.length} รายการ`);
                setBorrow1List(response.data);
                setFilteredList(response.data);
                showAlert(`โหลดข้อมูลสำเร็จ ${response.data.length} รายการ`, 'success');
            }
        } catch (error) {
            console.error('❌ Error loading data:', error);
            showAlert('ไม่สามารถโหลดข้อมูลได้', 'error');
            setBorrow1List([]);
            setFilteredList([]);
        }
        setLoading(false);
    };

    const filterData = () => {
        let filtered = borrow1List;

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(item =>
                item.REFNO?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.EMP_CODE?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filter by month/year
        if (filterYear && filterMonth) {
            const targetYear = toGregorianYear(filterYear);
            const targetMonth = Number(filterMonth);

            filtered = filtered.filter(item => {
                if (!item.RDATE) return false;
                const date = new Date(item.RDATE);
                return (
                    date.getFullYear() === targetYear &&
                    date.getMonth() + 1 === targetMonth
                );
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

    const showAlert = (message, severity = 'info') => {
        setAlert({ open: true, message, severity });
    };

    const handleEmployeeChange = (event, newValue) => {
        setSelectedEmployee(newValue);
        if (newValue) {
            setHeaderData(prev => ({
                ...prev,
                EMP_CODE: newValue.EMP_CODE
            }));
        } else {
            setHeaderData(prev => ({
                ...prev,
                EMP_CODE: ''
            }));
        }
    };

    const clearModalError = (field) => {
        setModalErrors(prev => {
            if (!prev[field]) return prev;
            const updated = { ...prev };
            delete updated[field];
            return updated;
        });
    };

    const validateModalData = (data) => {
        const errors = {};

        if (!data.DRUG_CODE?.trim()) {
            errors.DRUG_CODE = 'กรุณาเลือกรายการยา';
        }

        if (!data.LOT_NO?.trim()) {
            errors.LOT_NO = 'กรุณาเลือก LOT NO';
        }

        const qty = parseFloat(data.QTY);
        if (data.QTY === '' || data.QTY === null) {
            errors.QTY = 'กรุณาระบุจำนวน';
        } else if (isNaN(qty) || qty <= 0) {
            errors.QTY = 'จำนวนต้องมากกว่า 0';
        }

        const unitCost = parseFloat(data.UNIT_COST);
        if (data.UNIT_COST === '' || data.UNIT_COST === null) {
            errors.UNIT_COST = 'กรุณาระบุราคา/หน่วย';
        } else if (isNaN(unitCost) || unitCost < 0) {
            errors.UNIT_COST = 'ราคา/หน่วยต้องไม่ติดลบ';
        }

        return errors;
    };

    const handleOpenModal = () => {
        setModalData({
            DRUG_CODE: '',
            QTY: '',
            UNIT_COST: '',
            UNIT_CODE1: '',
            UNIT_NAME1: '',
            GENERIC_NAME: '',
            AMT: '0.00',
            LOT_NO: '',
            EXPIRE_DATE: ''
        });
        setEditingIndex(null);
        setLotList([]);
        setSelectedLot(null);
        setModalErrors({});
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
                const matchedLot = lotsResponse.data.find(lot =>
                    lot.LOT_NO === detail.LOT_NO
                );
                setSelectedLot(matchedLot || null);
            }
        } catch (error) {
            console.error('Error loading lots:', error);
            setLotList([]);
            setSelectedLot(null);
        }

        // หา GENERIC_NAME จาก drugList โดยใช้ DRUG_CODE
        const drug = drugList.find(d => d.DRUG_CODE === detail.DRUG_CODE);
        const genericName = drug ? drug.GENERIC_NAME : (detail.GENERIC_NAME || '');
        
        setModalData({
            ...detail,
            GENERIC_NAME: genericName, // ตั้งค่า GENERIC_NAME จาก drugList
            EXPIRE_DATE: detail.EXPIRE_DATE || '',
            UNIT_NAME1: detail.UNIT_NAME1 || ''
        });
        setEditingIndex(index);
        setModalErrors({});
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setEditingIndex(null);
        setLotList([]);
        setSelectedLot(null);
        setModalErrors({});
    };

    const handleModalChange = (field, value) => {
        let newValue = value;

        if (field === 'QTY') {
            const lotInfo = getCurrentLotInfo();
            if (lotInfo) {
                const remainingQty = getRemainingQtyForLot(lotInfo, editingIndex);
                const requestedQty = parseFloat(value) || 0;

                if (Number.isFinite(remainingQty) && requestedQty > remainingQty) {
                    const unitLabel = modalData.UNIT_NAME1 || lotInfo.UNIT_CODE1 || '';
                    showAlert(`จำนวนคงเหลือสำหรับ LOT นี้มีเพียง ${formatQty(remainingQty)} ${unitLabel}`, 'warning');
                    newValue = remainingQty > 0 ? remainingQty.toString() : '';
                }
            }
        }

        clearModalError(field);
        setModalData(prev => {
            const updated = { ...prev, [field]: newValue };

            if (field === 'QTY' || field === 'UNIT_COST') {
                const qty = parseFloat(field === 'QTY' ? newValue : updated.QTY) || 0;
                const unitCost = parseFloat(field === 'UNIT_COST' ? newValue : updated.UNIT_COST) || 0;
                updated.AMT = calculateAmount(qty, unitCost);
            }

            return updated;
        });
    };

    const handleModalDrugChange = async (event, value) => {
        if (value) {
            try {
                const response = await DrugService.getDrugByCode(value.DRUG_CODE);

                let drug = null;
                if (response.success && response.data) {
                    drug = response.data;
                } else if (response.DRUG_CODE) {
                    drug = response;
                }

                if (drug) {
                    // ดึงรายการ LOT_NO จาก bal_drug
                    const lotsResponse = await BalDrugService.getLotsByDrugCode(drug.DRUG_CODE);

                    if (lotsResponse.success && lotsResponse.data) {
                        setLotList(lotsResponse.data);
                    } else {
                        setLotList([]);
                    }

                    setModalData(prev => ({
                        ...prev,
                        DRUG_CODE: drug.DRUG_CODE,
                        UNIT_COST: '',
                        GENERIC_NAME: drug.GENERIC_NAME || '',
                        UNIT_CODE1: drug.UNIT_CODE1 || '', // ⭐ บันทึก CODE
                        UNIT_NAME1: drug.UNIT_NAME1 || '',  // ⭐ เพิ่ม NAME สำหรับแสดงผล
                        LOT_NO: '',
                        EXPIRE_DATE: '',
                        AMT: '0.00'
                    }));
                    setSelectedLot(null);
                    clearModalError('DRUG_CODE');
                    clearModalError('LOT_NO');
                }
            } catch (error) {
                console.error('❌ Error loading drug details:', error);
            }
        } else {
            setModalData(prev => ({
                ...prev,
                DRUG_CODE: '',
                UNIT_COST: '',
                GENERIC_NAME: '',
                UNIT_CODE1: '',
                UNIT_NAME1: '',
                LOT_NO: '',
                EXPIRE_DATE: ''
            }));
            setLotList([]);
            setSelectedLot(null);
            setModalErrors(prev => ({ ...prev, DRUG_CODE: 'กรุณาเลือกรายการยา' }));
        }
    };

    // จัดการเลือก LOT_NO
    const handleLotChange = (event, value) => {
        if (value) {
            clearModalError('LOT_NO');
        }
        setSelectedLot(value);
        if (value) {
            const unitPrice = parseFloat(value.UNIT_PRICE) || 0;
            const currentQty = parseFloat(modalData.QTY) || 0;
            const amount = calculateAmount(currentQty, unitPrice);

            setModalData(prev => ({
                ...prev,
                LOT_NO: value.LOT_NO,
                EXPIRE_DATE: Borrow1Service.formatDateForInput(value.EXPIRE_DATE),
                UNIT_COST: unitPrice ? unitPrice.toFixed(2) : '',
                AMT: amount
            }));
        } else {
            setModalData(prev => ({
                ...prev,
                LOT_NO: '',
                EXPIRE_DATE: '',
                UNIT_COST: '',
                AMT: calculateAmount(prev.QTY, 0)
            }));
            setModalErrors(prev => ({ ...prev, LOT_NO: 'กรุณาเลือก LOT NO' }));
        }
    };

    const handleAddDetail = () => {
        const errors = validateModalData(modalData);

        if (Object.keys(errors).length > 0) {
            setModalErrors(errors);
            const firstError = Object.values(errors)[0];
            showAlert(firstError, 'warning');
            return;
        }

        const lotInfo = getCurrentLotInfo();
        if (!lotInfo) {
            showAlert('ไม่พบข้อมูลสต็อคสำหรับ LOT นี้', 'error');
            setModalErrors(prev => ({ ...prev, LOT_NO: 'ไม่พบข้อมูลสต็อคสำหรับ LOT นี้' }));
            return;
        }

        const requestedQty = parseFloat(modalData.QTY) || 0;
        const remainingQty = getRemainingQtyForLot(lotInfo, editingIndex);

        if (Number.isFinite(remainingQty) && requestedQty > remainingQty) {
            const unitLabel = modalData.UNIT_NAME1 || lotInfo.UNIT_CODE1 || '';
            setModalErrors(prev => ({ ...prev, QTY: `จำนวนคงเหลือของ LOT ${lotInfo.LOT_NO} มีเพียง ${formatQty(remainingQty)} ${unitLabel}` }));
            showAlert(`จำนวนคงเหลือของ LOT ${lotInfo.LOT_NO} มีเพียง ${formatQty(remainingQty)} ${unitLabel}`, 'error');
            return;
        }

        const newDetail = {
            DRUG_CODE: modalData.DRUG_CODE,
            QTY: parseFloat(modalData.QTY),
            UNIT_COST: parseFloat(modalData.UNIT_COST),
            UNIT_CODE1: modalData.UNIT_CODE1, // ⭐ บันทึก CODE
            UNIT_NAME1: modalData.UNIT_NAME1, // ⭐ เก็บ NAME ไว้แสดงผล
            GENERIC_NAME: modalData.GENERIC_NAME,
            AMT: parseFloat(modalData.AMT),
            LOT_NO: modalData.LOT_NO,
            EXPIRE_DATE: modalData.EXPIRE_DATE
        };

        if (editingIndex !== null) {
            const updatedDetails = [...details];
            updatedDetails[editingIndex] = newDetail;
            setDetails(updatedDetails);
            showAlert('แก้ไขรายการสำเร็จ', 'success');
        } else {
            setDetails([...details, newDetail]);
            showAlert('เพิ่มรายการสำเร็จ', 'success');
        }

        setModalErrors({});
        handleCloseModal();
    };

    const handleRemoveDetail = (index) => {
        setDetails(details.filter((_, i) => i !== index));
        showAlert('ลบรายการสำเร็จ', 'success');
    };

    const resetForm = () => {
        setHeaderData({
            REFNO: '',
            RDATE: new Date().toISOString().slice(0, 10),
            TRDATE: new Date().toISOString().slice(0, 10),
            MYEAR: (new Date().getFullYear() + 543).toString(), // เปลี่ยนเป็น พ.ศ.
            MONTHH: new Date().getMonth() + 1,
            EMP_CODE: '',
            STATUS: 'ทำงานอยู่'
        });
        setDetails([]); // เปลี่ยนเป็น array ว่าง
        setEditingItem(null);
        setSelectedEmployee(null);
        setGeneratedRefno('');
        setLotList([]);
        setSelectedLot(null);
    };

    const handleSave = async () => {
        console.log('🔵 handleSave called');

        if (details.length === 0) {
            showAlert('กรุณาเพิ่มรายการสินค้าอย่างน้อย 1 รายการ', 'warning');
            return;
        }

        const headerErrors = Borrow1Service.validateHeaderData(headerData, !!editingItem);
        const detailErrors = Borrow1Service.validateDetailData(details);
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
                const isDuplicate = borrow1List.some(item => item.REFNO === headerData.REFNO);

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

            // แปลงปี พ.ศ. เป็น ค.ศ. ก่อนบันทึก
            const dataToSaveWithCE = {
                ...dataToSave,
                MYEAR: toGregorianYear(dataToSave.MYEAR).toString()
            };

            const formattedData = Borrow1Service.formatBorrow1Data(dataToSaveWithCE, details);
            console.log('📝 Formatted data:', formattedData);

            let result;
            if (!editingItem) {
                result = await Borrow1Service.createBorrow1(formattedData);
                console.log('✅ CREATE response:', result);
                showAlert('สร้างใบเบิกสินค้าสำเร็จ', 'success');
            } else {
                result = await Borrow1Service.updateBorrow1(editingItem.REFNO, formattedData);
                console.log('✅ UPDATE response:', result);
                showAlert('แก้ไขใบเบิกสินค้าสำเร็จ', 'success');
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
            const response = await Borrow1Service.getBorrow1ByRefno(item.REFNO);

            if (response.success && response.data) {
                const { header, details: detailsData } = response.data;

                setHeaderData({
                    REFNO: header.REFNO,
                    RDATE: Borrow1Service.formatDateForInput(header.RDATE),
                    TRDATE: Borrow1Service.formatDateForInput(header.TRDATE),
                    MYEAR: toBuddhistYear(header.MYEAR).toString(), // แปลงเป็น พ.ศ.
                    MONTHH: header.MONTHH,
                    EMP_CODE: header.EMP_CODE,
                    STATUS: header.STATUS
                });

                // Set selected employee
                const employee = employeeList.find(e => e.EMP_CODE === header.EMP_CODE);
                setSelectedEmployee(employee || null);

                setDetails(detailsData.length > 0 ? detailsData : []);
                setEditingItem(header);
                setCurrentView("edit");
            }
        } catch (error) {
            console.error('Error loading borrow1 for edit:', error);
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
            await Borrow1Service.deleteBorrow1(refno);
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
            const response = await Borrow1Service.getBorrow1ByRefno(item.REFNO);
            if (response.success && response.data) {
                Borrow1Service.printBorrow1(response.data.header, response.data.details);
            }
        } catch (error) {
            console.error('Error printing:', error);
            showAlert('ไม่สามารถพิมพ์ได้', 'error');
        }
    };

    const calculateTotal = () => {
        return Borrow1Service.calculateTotal(details);
    };

    if (currentView === "add" || currentView === "edit") {
        const totals = calculateTotal();
        const currentLotInfo = getCurrentLotInfo();
        const lotTotalQty = currentLotInfo ? parseFloat(currentLotInfo.QTY) || 0 : null;
        const lotRemainingQty = currentLotInfo ? getRemainingQtyForLot(currentLotInfo, editingIndex) : null;
        const unitLabel = modalData.UNIT_NAME1 || currentLotInfo?.UNIT_CODE1 || '';

        return (
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Container maxWidth="lg" sx={{ mt: 2 }}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                <Typography variant="h6" fontWeight="bold">
                                    {editingItem ? 'แก้ไขใบเบิกสินค้า' : 'สร้างใบเบิกสินค้า'}
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
                                    <Autocomplete
                                        fullWidth
                                        options={employeeList}
                                        getOptionLabel={(option) => option.EMP_NAME || `${option.EMP_CODE}`}
                                        value={selectedEmployee}
                                        onChange={handleEmployeeChange}
                                        size="small"
                                        renderInput={(params) => (
                                            <TextField {...params} label="พนักงาน" sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }} />
                                        )}
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
                                            <TableCell align="right">จำนวน</TableCell>
                                            <TableCell>หน่วย</TableCell>
                                            <TableCell align="right">ราคา/หน่วย</TableCell>
                                            <TableCell align="right">รวม</TableCell>
                                            <TableCell>LOT NO</TableCell>
                                            <TableCell>วันหมดอายุ</TableCell>
                                            <TableCell align="center">จัดการ</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {details.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={8} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                                                    ยังไม่มีรายการสินค้า กรุณาเพิ่มรายการ
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            details.map((detail, index) => {
                                                // หา GENERIC_NAME จาก drugList โดยใช้ DRUG_CODE
                                                const drug = drugList.find(d => d.DRUG_CODE === detail.DRUG_CODE);
                                                const genericName = drug ? drug.GENERIC_NAME : (detail.GENERIC_NAME || '-');
                                                
                                                return (
                                                    <TableRow key={index}>
                                                        <TableCell>{genericName}</TableCell>
                                                        <TableCell align="right">{detail.QTY}</TableCell>
                                                        <TableCell>{detail.UNIT_NAME1 || '-'}</TableCell>
                                                        <TableCell align="right">{Borrow1Service.formatCurrency(detail.UNIT_COST)}</TableCell>
                                                        <TableCell align="right">{Borrow1Service.formatCurrency(detail.AMT)}</TableCell>
                                                        <TableCell>{detail.LOT_NO || '-'}</TableCell>
                                                        <TableCell>{formatDateBE(detail.EXPIRE_DATE)}</TableCell>
                                                        <TableCell align="center">
                                                            <IconButton size="small" onClick={() => handleEditDetail(index)} sx={{ color: '#5698E0' }}>
                                                                <EditIcon fontSize="small" />
                                                            </IconButton>
                                                            <IconButton size="small" onClick={() => handleRemoveDetail(index)} sx={{ color: '#F62626' }}>
                                                                <DeleteIcon fontSize="small" />
                                                            </IconButton>
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
                                    รวมทั้งสิ้น: {Borrow1Service.formatCurrency(calculateTotal())} บาท
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
                                            <TextField
                                                {...params}
                                                label="รหัสยา *"
                                                error={!!modalErrors.DRUG_CODE}
                                                helperText={modalErrors.DRUG_CODE}
                                                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
                                            />
                                        )}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Autocomplete
                                        fullWidth
                                        options={lotList}
                                        getOptionLabel={(option) => option.LOT_NO || ''}
                                        value={selectedLot}
                                        onChange={handleLotChange}
                                        disabled={!modalData.DRUG_CODE || lotList.length === 0}
                                        size="small"
                                        renderInput={(params) => {
                                            const helperMessage = !modalData.DRUG_CODE
                                                ? "เลือกยาก่อน"
                                                : lotList.length === 0
                                                    ? "ไม่มี LOT"
                                                    : '';
                                            return (
                                                <TextField
                                                    {...params}
                                                    label="LOT NO *"
                                                    error={!!modalErrors.LOT_NO}
                                                    helperText={modalErrors.LOT_NO || helperMessage}
                                                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
                                                />
                                            );
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <DatePicker
                                        label="วันหมดอายุ"
                                        value={modalData.EXPIRE_DATE ? dayjs(modalData.EXPIRE_DATE) : null}
                                        onChange={(newValue) => handleModalChange('EXPIRE_DATE', newValue ? newValue.format('YYYY-MM-DD') : '')}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            fullWidth
                                            size="small"
                                            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
                                        />
                                    )}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="จำนวน *"
                                        type="number"
                                        value={modalData.QTY}
                                        onChange={(e) => handleModalChange('QTY', e.target.value)}
                                        inputProps={{
                                            step: "0.01",
                                            min: "0",
                                            ...(Number.isFinite(lotRemainingQty) ? { max: lotRemainingQty } : {})
                                        }}
                                        error={!!modalErrors.QTY}
                                        helperText={
                                            modalErrors.QTY ||
                                            (currentLotInfo
                                                ? `สต็อคใน LOT ${currentLotInfo.LOT_NO}: ${formatQty(lotTotalQty)} ${unitLabel || ''}${Number.isFinite(lotRemainingQty) ? ` | เบิกได้สูงสุด: ${formatQty(lotRemainingQty)} ${unitLabel || ''}` : ''}`
                                                : '')
                                        }
                                        size="small"
                                        sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
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
                                        error={!!modalErrors.UNIT_COST}
                                        helperText={modalErrors.UNIT_COST || (currentLotInfo ? 'ราคาดึงจากคลัง (BAL_DRUG)' : '')}
                                        size="small"
                                        sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="รวม"
                                        value={modalData.AMT}
                                        disabled
                                        size="small"
                                        sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
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
            </LocalizationProvider>
        );
    }

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Container maxWidth="lg" sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6" fontWeight="bold">ใบเบิกสินค้า ({filteredList.length} รายการ)</Typography>
                    <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCurrentView("add")} sx={{ backgroundColor: '#5698E0' }}>
                        สร้างใบเบิกสินค้า
                    </Button>
                </Box>

                <Card sx={{ mb: 2 }}>
                    <CardContent>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <TextField size="small" placeholder="ค้นหา (เลขที่, รหัสพนักงาน)" value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)} fullWidth
                                    InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon color="action" /></InputAdornment> }}
                                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }} />
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <FormControl fullWidth size="small">
                                    <InputLabel id="borrow-year-filter-label">ปี (พ.ศ.)</InputLabel>
                                    <Select
                                        labelId="borrow-year-filter-label"
                                        value={filterYear}
                                        onChange={(e) => setFilterYear(e.target.value)}
                                        sx={{ borderRadius: "10px" }}
                                        label="ปี (พ.ศ.)"
                                    >
                                        {getYearOptionsBE().map(option => (
                                            <MenuItem key={option.value} value={option.value}>
                                                {option.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <FormControl fullWidth size="small">
                                    <InputLabel id="borrow-month-filter-label">เดือน</InputLabel>
                                    <Select
                                        labelId="borrow-month-filter-label"
                                        value={filterMonth}
                                        onChange={(e) => setFilterMonth(Number(e.target.value))}
                                        sx={{ borderRadius: "10px" }}
                                        label="เดือน"
                                    >
                                        {monthOptions.map(option => (
                                            <MenuItem key={option.value} value={option.value}>
                                                {option.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent>
                        {filteredList.length === 0 ? (
                            <Box sx={{ textAlign: 'center', py: 4 }}>
                                <Typography variant="h6" color="text.secondary">
                                    {searchTerm ? 'ไม่พบข้อมูลตามคำค้นหา' : 'ไม่พบข้อมูลสำหรับเดือนที่เลือก'}
                                </Typography>
                            </Box>
                        ) : (
                            <>
                                <Box sx={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1000px' }}>
                                        <thead style={{ backgroundColor: "#F0F5FF" }}>
                                            <tr>
                                                <th style={{ padding: '12px 8px', textAlign: 'left', color: '#696969' }}>ลำดับ</th>
                                                <th style={{ padding: '12px 8px', textAlign: 'left', color: '#696969' }}>เลขที่</th>
                                                <th style={{ padding: '12px 8px', textAlign: 'left', color: '#696969' }}>วันที่</th>
                                                <th style={{ padding: '12px 8px', textAlign: 'left', color: '#696969' }}>ชื่อพนักงาน</th>
                                                <th style={{ padding: '12px 8px', textAlign: 'right', color: '#696969' }}>จำนวนเงินรวม</th>
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
                                                    <td style={{ padding: '12px 8px' }}>{item.EMP_NAME}</td>
                                                    <td style={{ padding: '12px 8px', textAlign: 'right', fontWeight: 500 }}>
                                                        {Borrow1Service.formatCurrency(item.TOTAL)}
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
                        <Typography>คุณแน่ใจหรือไม่ที่ต้องการลบใบเบิกสินค้า "{deleteDialog.refno}"?</Typography>
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
        </LocalizationProvider>
    );
};

export default Borrow1Management;