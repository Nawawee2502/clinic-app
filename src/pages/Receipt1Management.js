import React, { useState, useEffect } from "react";
import {
    Container, Grid, TextField, Button, Card, CardContent, Typography,
    InputAdornment, IconButton, Stack, Pagination, Dialog,
    DialogTitle, DialogContent, DialogActions, Alert, Snackbar, Box,
    Select, MenuItem, FormControl, InputLabel, Divider, Chip, Autocomplete,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, RadioGroup, FormControlLabel, Radio, FormLabel, CircularProgress
} from "@mui/material";
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import 'dayjs/locale/en-gb';

import Receipt1Service from "../services/receipt1Service";
import SupplierService from "../services/supplierService";
import DrugService from "../services/drugService";
import BookBankService from "../services/bookBankService";
import Swal from "sweetalert2";

// ✅ Import Reusable Components
import MonthYearFilter from "../components/common/MonthYearFilter";

const Receipt1Management = () => {
    // Helper functions สำหรับจัดการปี พ.ศ.
    const toBuddhistYear = (gregorianYear) => {
        return parseInt(gregorianYear) + 543;
    };

    const toGregorianYear = (buddhistYear) => {
        return parseInt(buddhistYear) - 543;
    };


    const [currentView, setCurrentView] = useState("list");
    const [receipt1List, setReceipt1List] = useState([]);
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

    const [supplierList, setSupplierList] = useState([]);
    const [drugList, setDrugList] = useState([]);
    const [selectedSupplier, setSelectedSupplier] = useState(null);
    const [bookBankList, setBookBankList] = useState([]);

    const [refnoError, setRefnoError] = useState('');
    const [checkingRefno, setCheckingRefno] = useState(false);

    const [headerData, setHeaderData] = useState({
        REFNO: '',
        RDATE: new Date().toISOString().slice(0, 10),
        TRDATE: new Date().toISOString().slice(0, 10),
        MYEAR: (new Date().getFullYear() + 543).toString(),
        MONTHH: new Date().getMonth() + 1,
        SUPPLIER_CODE: '',
        DUEDATE: new Date().toISOString().slice(0, 10),
        STATUS: 'ทำงานอยู่',
        VAT1: 7,
        TYPE_PAY: 'เงินสด',
        BANK_NO: '-',
        TYPE_VAT: 'exclude'
    });

    const [details, setDetails] = useState([]);
    const [manualVAMT, setManualVAMT] = useState(null); // สำหรับเก็บยอด VAT ที่กรอกเอง

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
        EXPIRE_DATE: new Date().toISOString().slice(0, 10)
    });
    const [modalErrors, setModalErrors] = useState({});


    const itemsPerPage = 10;

    // สำหรับ debounce ตรวจสอบ REFNO
    const refnoCheckTimeout = React.useRef(null);


    useEffect(() => {
        loadData();
        loadSuppliers();
        loadDrugs();
        loadBookBanks();
    }, []);

    useEffect(() => {
        filterData();
    }, [receipt1List, searchTerm, filterYear, filterMonth]);

    useEffect(() => {
        setTotalPages(Math.ceil(filteredList.length / itemsPerPage));
    }, [filteredList]);

    useEffect(() => {
        // อัพเดท SUPPLIER_NAME ทุกครั้งที่ supplierList เปลี่ยน
        if (supplierList.length > 0 && receipt1List.length > 0) {
            const updatedList = receipt1List.map(item => {
                const supplier = supplierList.find(s => s.SUPPLIER_CODE === item.SUPPLIER_CODE);
                return {
                    ...item,
                    SUPPLIER_NAME: supplier ? supplier.SUPPLIER_NAME : '-'
                };
            });
            setReceipt1List(updatedList);
            setFilteredList(updatedList);
        }
    }, [supplierList]);

    useEffect(() => {
        return () => {
            if (refnoCheckTimeout.current) {
                clearTimeout(refnoCheckTimeout.current);
            }
        };
    }, []);



    const loadData = async () => {
        setLoading(true);
        try {
            console.log('🔄 Loading receipt1 data...');
            const response = await Receipt1Service.getAllReceipt1();

            if (response.success && response.data) {
                console.log(`✅ โหลดข้อมูลใบรับสินค้า ${response.data.length} รายการ`);

                // ✅ รวมชื่อผู้จำหน่ายจาก supplierList เข้ามาในแต่ละรายการ
                let data = response.data || [];
                data = data.map(item => {
                    const supplier = supplierList.find(s => s.SUPPLIER_CODE === item.SUPPLIER_CODE);
                    return {
                        ...item,
                        SUPPLIER_NAME: supplier ? supplier.SUPPLIER_NAME : '-'
                    };
                });

                console.log(response.data)
                setReceipt1List(data);
                setFilteredList(data);
                showAlert(`โหลดข้อมูลสำเร็จ ${data.length} รายการ`, 'success');
            } else {
                console.warn('⚠️ No data returned from API');
                setReceipt1List([]);
                setFilteredList([]);
            }
        } catch (error) {
            console.error('❌ Error loading data:', error);
            showAlert('ไม่สามารถโหลดข้อมูลได้', 'error');
            setReceipt1List([]);
            setFilteredList([]);
        }
        setLoading(false);
    };

    const loadSuppliers = async () => {
        try {
            console.log('🔄 Loading suppliers...');
            const response = await SupplierService.getAllSuppliers();
            console.log('📦 Supplier response:', response);

            let suppliers = [];
            if (response.success && response.data) {
                suppliers = Array.isArray(response.data) ? response.data : [];
            } else if (Array.isArray(response)) {
                suppliers = response;
            }

            console.log('✅ Loaded suppliers:', suppliers.length, 'items');
            if (suppliers.length > 0) {
                console.log('📋 Sample supplier:', suppliers[0]);
            }
            setSupplierList(suppliers);
        } catch (error) {
            console.error('❌ Error loading suppliers:', error);
            setSupplierList([]);
        }
    };

    const loadDrugs = async () => {
        try {
            console.log('🔄 Loading drugs...');
            const response = await DrugService.getAllDrugs();
            console.log('📦 Drug response:', response);

            let drugs = [];
            if (response.success && response.data) {
                drugs = Array.isArray(response.data) ? response.data : [];
            } else if (Array.isArray(response)) {
                drugs = response;
            }

            console.log('✅ Loaded drugs:', drugs.length, 'items');
            setDrugList(drugs);
        } catch (error) {
            console.error('❌ Error loading drugs:', error);
            setDrugList([]);
        }
    };

    const loadBookBanks = async () => {
        try {
            console.log('🔄 Loading book banks...');
            const response = await BookBankService.getAllBookBanks();
            console.log('📦 BookBank response:', response);

            let bookBanks = [];
            if (response.success && response.data) {
                bookBanks = Array.isArray(response.data) ? response.data : [];
            } else if (Array.isArray(response)) {
                bookBanks = response;
            }

            console.log('✅ Loaded book banks:', bookBanks.length, 'items');
            setBookBankList(bookBanks);
        } catch (error) {
            console.error('❌ Error loading book banks:', error);
            setBookBankList([]);
        }
    };

    const filterData = () => {
        let filtered = receipt1List;

        if (searchTerm) {
            filtered = filtered.filter(item =>
                item.REFNO?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.SUPPLIER_CODE?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.SUPPLIER_NAME?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

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

    const showAlert = (message, severity = 'info') => {
        setAlert({ open: true, message, severity });
    };

    const resetForm = () => {
        setHeaderData({
            REFNO: '',
            RDATE: new Date().toISOString().slice(0, 10),
            TRDATE: new Date().toISOString().slice(0, 10),
            MYEAR: (new Date().getFullYear() + 543).toString(),
            MONTHH: new Date().getMonth() + 1,
            SUPPLIER_CODE: '',
            DUEDATE: new Date().toISOString().slice(0, 10),
            STATUS: 'ทำงานอยู่',
            VAT1: 7,
            TYPE_PAY: 'เงินสด',
            BANK_NO: '-',
            TYPE_VAT: 'exclude'
        });
        setDetails([]);
        setSelectedSupplier(null);
        setEditingItem(null);
        setManualVAMT(null);
        setRefnoError('');
        setCheckingRefno(false);
    };

    const handleEdit = async (item) => {
        try {
            setLoading(true);
            const response = await Receipt1Service.getReceipt1ByRefno(item.REFNO);

            if (response.success && response.data) {
                const { header, details: detailsData } = response.data;

                setHeaderData({
                    REFNO: header.REFNO,
                    RDATE: Receipt1Service.formatDateForInput(header.RDATE),
                    TRDATE: Receipt1Service.formatDateForInput(header.TRDATE),
                    MYEAR: toBuddhistYear(header.MYEAR).toString(),
                    MONTHH: header.MONTHH,
                    SUPPLIER_CODE: header.SUPPLIER_CODE,
                    DUEDATE: Receipt1Service.formatDateForInput(header.DUEDATE),
                    STATUS: header.STATUS,
                    VAT1: (header.VAT1 !== null && header.VAT1 !== undefined) ? header.VAT1 : 7,
                    TYPE_PAY: header.TYPE_PAY,
                    BANK_NO: header.BANK_NO || '-',
                    TYPE_VAT: header.TYPE_VAT || 'exclude'
                });

                const supplier = supplierList.find(s => s.SUPPLIER_CODE === header.SUPPLIER_CODE);
                setSelectedSupplier(supplier || null);

                // แปลง EXPIRE_DATE ให้เป็น format ที่ถูกต้องก่อนเซ็ตเข้า details
                const formattedDetails = detailsData.map(detail => ({
                    ...detail,
                    EXPIRE_DATE: detail.EXPIRE_DATE
                        ? Receipt1Service.formatDateForInput(detail.EXPIRE_DATE)
                        : ''
                }));

                setDetails(formattedDetails.length > 0 ? formattedDetails : []);
                setEditingItem(header);
                setCurrentView("edit");
            }
        } catch (error) {
            console.error('Error loading receipt1 for edit:', error);
            showAlert('ไม่สามารถโหลดข้อมูลสำหรับแก้ไขได้', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (refno) => {
        setDeleteDialog({ open: true, refno });
    };

    const handleDeleteConfirm = async () => {
        try {
            const refno = deleteDialog.refno;
            console.log('🗑️ Deleting:', refno);

            const response = await Receipt1Service.deleteReceipt1(refno);
            console.log('📦 Delete response:', response);

            if (response.success) {
                showAlert('ลบข้อมูลสำเร็จ', 'success');
                loadData();
            } else {
                showAlert(response.message || 'ไม่สามารถลบข้อมูลได้', 'error');
            }
        } catch (error) {
            console.error('❌ Error deleting:', error);
            showAlert('เกิดข้อผิดพลาดในการลบข้อมูล', 'error');
        }
        setDeleteDialog({ open: false, refno: null });
    };

    const handleHeaderChange = (field, value) => {
        if (field === 'REFNO') {
            // อัพเดท state
            setHeaderData(prev => ({ ...prev, [field]: value }));

            if (refnoCheckTimeout.current) {
                clearTimeout(refnoCheckTimeout.current);
            }

            if (!editingItem && value.trim()) {
                refnoCheckTimeout.current = setTimeout(() => {
                    checkRefnoAvailability(value.trim());
                }, 500);
            } else {
                setRefnoError('');
                setCheckingRefno(false);
            }

        } else if (field === 'TYPE_PAY') {
            setHeaderData(prev => ({
                ...prev,
                [field]: value,
                BANK_NO: value === 'เงินสด' ? '-' : prev.BANK_NO
            }));
        } else if (field === 'RDATE') {
            const date = new Date(value);
            setHeaderData(prev => {
                const newData = {
                    ...prev,
                    [field]: value,
                    MYEAR: (date.getFullYear() + 543).toString(), // แปลงเป็น พ.ศ.
                    MONTHH: date.getMonth() + 1,
                    TRDATE: value
                };

                if (selectedSupplier && selectedSupplier.DAY1) {
                    newData.DUEDATE = calculateDueDate(value, selectedSupplier.DAY1);
                }

                return newData;
            });
        } else {
            setHeaderData(prev => ({ ...prev, [field]: value }));
        }
    };


    const calculateDueDate = (startDate, creditDays) => {
        if (!startDate || !creditDays) return startDate;
        const date = new Date(startDate);
        date.setDate(date.getDate() + parseInt(creditDays));
        return date.toISOString().slice(0, 10);
    };

    const handleSupplierChange = (event, value) => {
        console.log('✅ Supplier selected:', value);
        setSelectedSupplier(value);

        if (value) {
            const dueDate = calculateDueDate(headerData.RDATE, value.DAY1 || 0);

            setHeaderData(prev => ({
                ...prev,
                SUPPLIER_CODE: value.SUPPLIER_CODE,
                DUEDATE: dueDate
            }));

            console.log('📅 Due date calculated:', dueDate, '(RDATE + DAY1:', value.DAY1, 'days)');
        } else {
            setHeaderData(prev => ({
                ...prev,
                SUPPLIER_CODE: '',
                DUEDATE: prev.RDATE
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

        const qty = parseFloat(data.QTY);
        if (data.QTY === '' || data.QTY === null) {
            errors.QTY = 'กรุณาระบุจำนวน';
        } else if (isNaN(qty) || qty <= 0) {
            errors.QTY = 'จำนวนต้องมากกว่า 0';
        }

        const unitCost = parseFloat(data.UNIT_COST);
        if (data.UNIT_COST === '' || data.UNIT_COST === null) {
            errors.UNIT_COST = 'กรุณาระบุราคาต่อหน่วย';
        } else if (isNaN(unitCost) || unitCost < 0) {
            errors.UNIT_COST = 'ราคาต่อหน่วยต้องมากกว่าหรือเท่ากับ 0';
        }

        if (!data.LOT_NO?.trim()) {
            errors.LOT_NO = 'กรุณาระบุ LOT NO';
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
            AMT: '',
            LOT_NO: '',
            EXPIRE_DATE: new Date().toISOString().slice(0, 10)
        });
        setEditingIndex(null);
        setModalErrors({});
        setOpenModal(true);
    };

    const handleEditDetail = (index) => {
        const detail = details[index];

        // หา GENERIC_NAME จาก drugList โดยใช้ DRUG_CODE
        const drug = drugList.find(d => d.DRUG_CODE === detail.DRUG_CODE);
        const genericName = drug ? drug.GENERIC_NAME : (detail.GENERIC_NAME || '');

        setModalData({
            ...detail,
            GENERIC_NAME: genericName, // ตั้งค่า GENERIC_NAME จาก drugList
            EXPIRE_DATE: detail.EXPIRE_DATE || new Date().toISOString().slice(0, 10),
            UNIT_NAME1: detail.UNIT_NAME1 || ''
        });
        setEditingIndex(index);
        setModalErrors({});
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setEditingIndex(null);
        setModalErrors({});
    };

    const handleModalChange = (field, value) => {
        clearModalError(field);
        setModalData(prev => {
            const updated = { ...prev, [field]: value };
            if (field === 'QTY' || field === 'UNIT_COST') {
                const qty = parseFloat(field === 'QTY' ? value : updated.QTY) || 0;
                const unitCost = parseFloat(field === 'UNIT_COST' ? value : updated.UNIT_COST) || 0;
                updated.AMT = (qty * unitCost).toFixed(2);
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
                    setModalData(prev => ({
                        ...prev,
                        DRUG_CODE: drug.DRUG_CODE,
                        UNIT_COST: '', // ไม่ดึงราคามา ให้กรอกเอง
                        GENERIC_NAME: drug.GENERIC_NAME || '',
                        UNIT_CODE1: drug.UNIT_CODE1 || '', // ⭐ บันทึก CODE
                        UNIT_NAME1: drug.UNIT_NAME1 || ''  // ⭐ เพิ่ม NAME สำหรับแสดงผล
                    }));
                    clearModalError('DRUG_CODE');
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
                UNIT_NAME1: ''
            }));
            setModalErrors(prev => ({ ...prev, DRUG_CODE: 'กรุณาเลือกรายการยา' }));
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

    const calculateTotals = () => {
        const total = details.reduce((sum, item) => sum + (parseFloat(item.AMT) || 0), 0);
        const vatRate = parseFloat(headerData.VAT1) || 0;
        const vatRateDecimal = vatRate / 100;

        let vamt, gtotal, displayTotal;

        // ✅ ถ้า VAT1 เป็น 0% ให้ไม่คำนวณ VAT
        if (vatRate === 0) {
            vamt = 0;
            displayTotal = total;
            gtotal = total;
        } else {
            // ถ้ามีการกรอกยอด VAT เอง ให้ใช้ค่านั้น
            if (manualVAMT !== null && manualVAMT !== '') {
                vamt = parseFloat(manualVAMT) || 0;
                gtotal = total + vamt;
                displayTotal = total;
            } else {
                // คำนวณอัตโนมัติ
                if (headerData.TYPE_VAT === 'include') {
                    // VAT ใน: รวมทั้งสิ้น = total, คำนวณ vamt และ displayTotal
                    gtotal = total; // รวมทั้งสิ้น (รวม VAT แล้ว)
                    vamt = total * (vatRateDecimal / (1 + vatRateDecimal)); // VAT
                    displayTotal = gtotal - vamt; // รวมเป็นเงิน (ก่อน VAT)
                } else {
                    // VAT นอก: รวมเป็นเงิน = total
                    displayTotal = total;
                    vamt = total * vatRateDecimal; // VAT
                    gtotal = total + vamt; // รวมทั้งสิ้น
                }
            }
        }

        return {
            total: displayTotal.toFixed(2),
            vamt: vamt.toFixed(2),
            gtotal: gtotal.toFixed(2)
        };
    };

    const handleSave = async () => {
        if (!headerData.SUPPLIER_CODE) {
            showAlert('กรุณาเลือกผู้จำหน่าย', 'warning');
            return;
        }

        if (details.length === 0) {
            showAlert('กรุณาเพิ่มรายการสินค้าอย่างน้อย 1 รายการ', 'warning');
            return;
        }

        const headerErrors = Receipt1Service.validateHeaderData(headerData, !!editingItem);
        const detailErrors = Receipt1Service.validateDetailData(details);
        const errors = [...headerErrors, ...detailErrors];

        if (errors.length > 0) {
            Swal.fire({
                icon: 'error',
                title: 'กรุณากรอกข้อมูลให้ครบถ้วน',
                text: errors[0],
                confirmButtonText: 'ตกลง'
            });
            return;
        }

        // ⭐ เพิ่มการตรวจสอบ REFNO ก่อนบันทึก (เฉพาะตอนสร้างใหม่)
        if (!editingItem) {
            try {
                const checkResult = await Receipt1Service.checkRefnoExists(headerData.REFNO);

                if (checkResult.exists) {
                    showAlert(`เลขที่ใบรับสินค้า "${headerData.REFNO}" มีอยู่ในระบบแล้ว กรุณาใช้เลขที่อื่น`, 'error');
                    return;
                }
            } catch (error) {
                console.error('❌ Error checking REFNO:', error);
                showAlert('ไม่สามารถตรวจสอบเลขที่ใบรับสินค้าได้', 'error');
                return;
            }
        }

        setLoading(true);

        try {
            // แปลงปี พ.ศ. เป็น ค.ศ. ก่อนบันทึก
            const dataToSave = {
                ...headerData,
                MYEAR: toGregorianYear(headerData.MYEAR).toString()
            };

            const formattedData = Receipt1Service.formatReceipt1Data(dataToSave, details);
            console.log('📝 Formatted data:', formattedData);

            let result;
            if (!editingItem) {
                result = await Receipt1Service.createReceipt1(formattedData);
                console.log('✅ CREATE response:', result);
                showAlert('สร้างใบรับสินค้าสำเร็จ', 'success');
            } else {
                result = await Receipt1Service.updateReceipt1(editingItem.REFNO, formattedData);
                console.log('✅ UPDATE response:', result);
                showAlert('แก้ไขใบรับสินค้าสำเร็จ', 'success');
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

    const checkRefnoAvailability = async (refno) => {
        if (!refno || editingItem) {
            setRefnoError('');
            return;
        }

        setCheckingRefno(true);
        try {
            const result = await Receipt1Service.checkRefnoExists(refno);

            if (result.exists) {
                setRefnoError('เลขที่นี้มีอยู่ในระบบแล้ว');
            } else {
                setRefnoError('');
            }
        } catch (error) {
            console.error('Error checking REFNO:', error);
            setRefnoError('');
        } finally {
            setCheckingRefno(false);
        }
    };


    if (currentView === "add" || currentView === "edit") {
        const totals = calculateTotals();

        return (
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en-gb">
                <Container maxWidth="lg" sx={{ mt: 2 }}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                <Typography variant="h6" fontWeight="bold">
                                    {editingItem ? 'แก้ไขใบรับสินค้า' : 'สร้างใบรับสินค้า'}
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
                                        value={headerData.REFNO}
                                        onChange={(e) => handleHeaderChange('REFNO', e.target.value)}
                                        disabled={!!editingItem}
                                        size="small"
                                        error={!!refnoError}
                                        helperText={
                                            refnoError
                                                ? refnoError
                                                : checkingRefno
                                                    ? 'กำลังตรวจสอบ...'
                                                    : ''
                                        }
                                        sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
                                        InputProps={{
                                            endAdornment: checkingRefno && (
                                                <InputAdornment position="end">
                                                    <CircularProgress size={20} />
                                                </InputAdornment>
                                            )
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en-gb">
                                        <DatePicker
                                            label="วันที่"
                                            format="DD/MM/YYYY"
                                            value={headerData.RDATE ? dayjs(headerData.RDATE) : null}
                                            onChange={(newValue) => handleHeaderChange('RDATE', newValue ? newValue.format('YYYY-MM-DD') : '')}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    fullWidth
                                                    size="small"
                                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                                                />
                                            )}
                                            slotProps={{
                                                textField: {
                                                    fullWidth: true,
                                                    size: "small",
                                                    sx: { '& .MuiOutlinedInput-root': { borderRadius: '10px' } }
                                                }
                                            }}
                                        />
                                    </LocalizationProvider>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Autocomplete
                                        fullWidth
                                        options={supplierList}
                                        getOptionLabel={(option) => option.SUPPLIER_NAME || `${option.SUPPLIER_CODE}`}
                                        value={selectedSupplier}
                                        onChange={handleSupplierChange}
                                        size="small"
                                        renderInput={(params) => (
                                            <TextField {...params} label="ผู้จำหน่าย" sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }} />
                                        )}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en-gb">
                                        <DatePicker
                                            label="วันครบกำหนด"
                                            format="DD/MM/YYYY"
                                            value={headerData.DUEDATE ? dayjs(headerData.DUEDATE) : null}
                                            onChange={(newValue) => handleHeaderChange('DUEDATE', newValue ? newValue.format('YYYY-MM-DD') : '')}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    fullWidth
                                                    size="small"
                                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                                                />
                                            )}
                                            slotProps={{
                                                textField: {
                                                    fullWidth: true,
                                                    size: "small",
                                                    sx: { '& .MuiOutlinedInput-root': { borderRadius: '10px' } }
                                                }
                                            }}
                                        />
                                    </LocalizationProvider>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <FormControl fullWidth size="small">
                                        <Select
                                            value={headerData.TYPE_PAY}
                                            onChange={(e) => handleHeaderChange('TYPE_PAY', e.target.value)}
                                            sx={{ borderRadius: "10px" }}
                                        >
                                            <MenuItem value="เงินสด">เงินสด</MenuItem>
                                            <MenuItem value="เงินโอน">เงินโอน</MenuItem>
                                            <MenuItem value="ค้างชำระ">ค้างชำระ</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Autocomplete
                                        fullWidth
                                        options={bookBankList}
                                        getOptionLabel={(option) => {
                                            const bankName = option.bank_name || 'ธนาคาร';
                                            return `${bankName} - ${option.bank_no}`;
                                        }}
                                        value={bookBankList.find(b => b.bank_no === headerData.BANK_NO) || null}
                                        onChange={(event, value) => {
                                            handleHeaderChange('BANK_NO', value ? value.bank_no : '-');
                                        }}
                                        disabled={headerData.TYPE_PAY === 'เงินสด' || headerData.TYPE_PAY === 'ค้างชำระ'}
                                        size="small"
                                        renderInput={(params) => (
                                            <TextField {...params} label="เลขบัญชี" sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }} />
                                        )}
                                    />
                                </Grid>
                            </Grid>

                            <Divider sx={{ my: 2 }} />

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
                                            <TableCell>จำนวน</TableCell>
                                            <TableCell>ราคา/หน่วย</TableCell>
                                            <TableCell>หน่วย</TableCell>
                                            <TableCell>รวม</TableCell>
                                            <TableCell>LOT NO</TableCell>
                                            <TableCell>วันหมดอายุ</TableCell>
                                            <TableCell align="center">จัดการ</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {details.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={8} align="center">
                                                    <Typography color="text.secondary">ยังไม่มีรายการ</Typography>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            details.map((detail, index) => {
                                                // หา GENERIC_NAME จาก drugList โดยใช้ DRUG_CODE
                                                const drug = drugList.find(d => d.DRUG_CODE === detail.DRUG_CODE);
                                                const genericName = drug?.GENERIC_NAME || detail.GENERIC_NAME || '';
                                                const tradeName = drug?.TRADE_NAME || '';
                                                const drugCode = drug?.DRUG_CODE || detail.DRUG_CODE || '';
                                                const drugDisplay = drug ? `${genericName}-${tradeName}-${drugCode}` : (detail.GENERIC_NAME || '-');

                                                return (
                                                    <TableRow key={index}>
                                                        <TableCell>{drugDisplay}</TableCell>
                                                        <TableCell>{detail.QTY}</TableCell>
                                                        <TableCell>{Receipt1Service.formatCurrency(detail.UNIT_COST)}</TableCell>
                                                        <TableCell>{detail.UNIT_NAME1 || detail.UNIT_CODE1 || '-'}</TableCell>
                                                        <TableCell>{Receipt1Service.formatCurrency(detail.AMT)}</TableCell>
                                                        <TableCell>{detail.LOT_NO}</TableCell>
                                                        <TableCell>{Receipt1Service.formatDateCE(detail.EXPIRE_DATE)} </TableCell>
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

                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1, mb: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Typography variant="body1">รวมเป็นเงิน:</Typography>
                                    <Typography variant="body1" fontWeight="bold">{Receipt1Service.formatCurrency(totals.total)} บาท</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <FormControl component="fieldset">
                                        <RadioGroup
                                            row
                                            value={headerData.TYPE_VAT}
                                            onChange={(e) => {
                                                handleHeaderChange('TYPE_VAT', e.target.value);
                                                setManualVAMT(null); // reset manual VAT เมื่อเปลี่ยน type
                                            }}
                                        >
                                            <FormControlLabel value="include" control={<Radio />} label="Include" />
                                            <FormControlLabel value="exclude" control={<Radio />} label="Exclude" />
                                        </RadioGroup>
                                    </FormControl>
                                    <TextField
                                        type="number"
                                        size="small"
                                        value={headerData.VAT1}
                                        onChange={(e) => {
                                            handleHeaderChange('VAT1', e.target.value);
                                            setManualVAMT(null); // reset manual VAT เมื่อเปลี่ยน %
                                        }}
                                        inputProps={{ step: "0.01", min: "0", max: "100" }}
                                        sx={{ width: '80px', "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
                                    />
                                    <Typography variant="body1">%</Typography>
                                    <TextField
                                        type="number"
                                        size="small"
                                        value={manualVAMT !== null ? manualVAMT : totals.vamt}
                                        onChange={(e) => setManualVAMT(e.target.value)}
                                        inputProps={{ step: "0.01", min: "0" }}
                                        sx={{ width: '120px', "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
                                    />
                                    <Typography variant="body1">บาท</Typography>
                                </Box>
                                <Typography variant="h6" fontWeight="bold" sx={{ color: '#5698E0' }}>
                                    รวมทั้งสิ้น: {Receipt1Service.formatCurrency(totals.gtotal)} บาท
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

                    <Dialog open={openModal} onClose={handleCloseModal} maxWidth="md" fullWidth>
                        <DialogTitle>{editingIndex !== null ? 'แก้ไขรายการ' : 'เพิ่มรายการ'}</DialogTitle>
                        <DialogContent>
                            <Grid container spacing={2} sx={{ mt: 1 }}>
                                <Grid item xs={12}>
                                    <Autocomplete
                                        fullWidth
                                        options={drugList}
                                        getOptionLabel={(option) => {
                                            const genericName = option.GENERIC_NAME || '';
                                            const tradeName = option.TRADE_NAME || '';
                                            const drugCode = option.DRUG_CODE || '';
                                            return `${genericName}-${tradeName}-${drugCode}`;
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
                                                label="รหัสยา"
                                                error={!!modalErrors.DRUG_CODE}
                                                helperText={modalErrors.DRUG_CODE}
                                                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
                                            />
                                        )}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="จำนวน"
                                        type="number"
                                        value={modalData.QTY}
                                        onChange={(e) => handleModalChange('QTY', e.target.value)}
                                        size="small"
                                        error={!!modalErrors.QTY}
                                        helperText={modalErrors.QTY}
                                        sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="ราคา/หน่วย"
                                        type="number"
                                        value={modalData.UNIT_COST}
                                        onChange={(e) => handleModalChange('UNIT_COST', e.target.value)}
                                        size="small"
                                        error={!!modalErrors.UNIT_COST}
                                        helperText={modalErrors.UNIT_COST}
                                        inputProps={{ step: "0.01", min: "0" }}
                                        sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="หน่วยนับ"
                                        value={modalData.UNIT_NAME1}
                                        disabled
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
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="LOT NO"
                                        value={modalData.LOT_NO}
                                        onChange={(e) => handleModalChange('LOT_NO', e.target.value)}
                                        size="small"
                                        error={!!modalErrors.LOT_NO}
                                        helperText={modalErrors.LOT_NO}
                                        sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en-gb">
                                        <DatePicker
                                            label="วันหมดอายุ"
                                            format="DD/MM/YYYY"
                                            value={modalData.EXPIRE_DATE ? dayjs(modalData.EXPIRE_DATE) : null}
                                            onChange={(newValue) => handleModalChange('EXPIRE_DATE', newValue ? newValue.format('YYYY-MM-DD') : '')}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    fullWidth
                                                    size="small"
                                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                                                />
                                            )}
                                            slotProps={{
                                                textField: {
                                                    fullWidth: true,
                                                    size: "small",
                                                    sx: { '& .MuiOutlinedInput-root': { borderRadius: '10px' } }
                                                }
                                            }}
                                        />
                                    </LocalizationProvider>
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
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en-gb">
            <Container maxWidth="lg" sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6" fontWeight="bold">ใบรับสินค้า ({filteredList.length} รายการ)</Typography>
                    <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCurrentView("add")} sx={{ backgroundColor: '#5698E0' }}>
                        สร้างใบรับสินค้า
                    </Button>
                </Box>

                <Card sx={{ mb: 2 }}>
                    <CardContent>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <TextField size="small" placeholder="ค้นหา (เลขที่, รหัสผู้จำหน่าย, ชื่อผู้จำหน่าย)" value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)} fullWidth
                                    InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon color="action" /></InputAdornment> }}
                                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }} />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <MonthYearFilter
                                    year={filterYear}
                                    setYear={setFilterYear}
                                    month={filterMonth}
                                    setMonth={setFilterMonth}
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
                                                <th style={{ padding: '12px 8px', textAlign: 'left', color: '#696969' }}>ชื่อผู้จำหน่าย</th>
                                                <th style={{ padding: '12px 8px', textAlign: 'left', color: '#696969' }}>วันครบกำหนด</th>
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
                                                    <td style={{ padding: '12px 8px' }}>{Receipt1Service.formatDate(item.RDATE)}</td>
                                                    <td style={{ padding: '12px 8px' }}>{item.SUPPLIER_NAME}</td>
                                                    <td style={{ padding: '12px 8px' }}>{Receipt1Service.formatDate(item.DUEDATE)}</td>
                                                    <td style={{ padding: '12px 8px', textAlign: 'right', fontWeight: 500 }}>
                                                        {Receipt1Service.formatCurrency(item.GTOTAL)}
                                                    </td>
                                                    <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                                                        <Chip label={item.STATUS} color={item.STATUS === 'ทำงานอยู่' ? 'success' : 'error'} size="small" />
                                                    </td>
                                                    <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                                                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
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
                        <Typography>คุณแน่ใจหรือไม่ที่ต้องการลบใบรับสินค้า "{deleteDialog.refno}"?</Typography>
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

export default Receipt1Management;