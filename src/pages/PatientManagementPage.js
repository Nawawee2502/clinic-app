import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Card,
    TextField,
    Button,
    Typography,
    Avatar,
    IconButton,
    Grid,
    Chip,
    Alert,
    InputAdornment,
    CircularProgress,
    Tooltip,
    Paper,
    Tabs,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    LinearProgress,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions
} from '@mui/material';
import {
    Search,
    Edit,
    Delete,
    Person,
    Phone,
    Save,
    Refresh,
    Cancel,
    Email,
    Home,
    LocalHospital,
    KeyboardArrowLeft,
    KeyboardArrowRight,
    CancelOutlined
} from '@mui/icons-material';
import PatientService from '../services/patientService';
import TreatmentService from '../services/treatmentService';

// Helper function outside component
const getAvatarColor = (sex) => {
    return sex === 'หญิง' ? '#EC7B99' : '#4A9EFF';
};

const PRENAME_OPTIONS = [
    { value: 'นาย', label: 'นาย' },
    { value: 'นาง', label: 'นาง' },
    { value: 'นางสาว', label: 'นางสาว' },
    { value: 'เด็กชาย', label: 'เด็กชาย' },
    { value: 'เด็กหญิง', label: 'เด็กหญิง' }
];

const SEX_OPTIONS = [
    { value: 'ชาย', label: 'ชาย' },
    { value: 'หญิง', label: 'หญิง' }
];

const STATUS_OPTIONS = [
    { value: 'โสด', label: 'โสด' },
    { value: 'สมรส', label: 'สมรส' },
    { value: 'หย่า', label: 'หย่า' },
    { value: 'หม้าย', label: 'หม้าย' },
    { value: 'แยกกันอยู่', label: 'แยกกันอยู่' },
    { value: 'ไม่ระบุ', label: 'ไม่ระบุ' }
];

const BOOLEAN_OPTIONS = [
    { value: 'Y', label: 'ใช่' },
    { value: 'N', label: 'ไม่ใช่' }
];

const formatBooleanFlag = (value) => (value === 'Y' ? 'ใช่' : 'ไม่ใช่');

// PatientCard component OUTSIDE main component
const PatientCard = React.memo(({ patient, isSelected, onSelect }) => (
    <Card
        onClick={() => onSelect(patient)}
        sx={{
            mb: 2,
            p: 2,
            borderRadius: 3,
            backgroundColor: isSelected ? '#E3F2FD' : '#ffffff',
            border: isSelected ? '2px solid #4A9EFF' : '1px solid #E3F2FD',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            cursor: 'pointer',
            '&:hover': {
                transform: isSelected ? 'none' : 'translateY(-2px)',
                boxShadow: '0 8px 24px rgba(74, 158, 255, 0.12)',
                borderColor: '#4A9EFF'
            }
        }}
    >
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
            <Avatar
                sx={{
                    width: 48,
                    height: 48,
                    bgcolor: getAvatarColor(patient.SEX),
                    fontSize: '18px',
                    fontWeight: 600
                }}
            >
                {patient.NAME1?.charAt(0)}
            </Avatar>

            <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                    variant="subtitle1"
                    sx={{
                        fontWeight: 600,
                        color: '#1e293b',
                        fontSize: '16px',
                        mb: 1
                    }}
                >
                    {patient.PRENAME} {patient.NAME1} {patient.SURNAME}
                </Typography>

                <Typography
                    variant="body2"
                    sx={{
                        color: '#64748b',
                        mb: 1,
                        fontSize: '13px',
                        fontWeight: 500
                    }}
                >
                    HN: {patient.HNCODE} • อายุ {patient.AGE} ปี
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Phone sx={{ fontSize: 14, color: '#64748b' }} />
                    <Typography variant="caption" sx={{ color: '#64748b' }}>
                        {patient.TEL1}
                    </Typography>
                </Box>

                {patient.DISEASE1 && (
                    <Chip
                        label={patient.DISEASE1}
                        size="small"
                        sx={{
                            backgroundColor: '#FEF3F2',
                            color: '#B91C1C',
                            fontSize: '11px',
                            height: 24,
                            '& .MuiChip-label': {
                                px: 1.5
                            }
                        }}
                    />
                )}
            </Box>
        </Box>
    </Card>
));

// PatientDetailPanel component OUTSIDE main component
const PatientDetailPanel = React.memo(({ 
    selectedPatient, 
    isEditing, 
    editFormData, 
    loading,
    onEdit, 
    onCancelEdit, 
    onSave, 
    onDelete, 
    onFormChange 
}) => {
    if (!selectedPatient) {
        return (
            <Box 
                sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    height: '100%',
                    color: '#64748b'
                }}
            >
                <Box sx={{ textAlign: 'center' }}>
                    <Person sx={{ fontSize: 80, mb: 2, opacity: 0.3 }} />
                    <Typography variant="h6" sx={{ opacity: 0.7 }}>
                        เลือกผู้ป่วยจากรายการด้านซ้ายเพื่อดูข้อมูล
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.5, mt: 1 }}>
                        คลิกที่ชื่อผู้ป่วยเพื่อดู แก้ไข หรือลบข้อมูล
                    </Typography>
                </Box>
            </Box>
        );
    }

    const formatDateDisplay = (value) => {
        if (!value) {
            return '';
        }

        try {
            const date = new Date(value);
            if (!Number.isNaN(date.getTime())) {
                return date.toLocaleDateString('th-TH', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                });
            }
        } catch (error) {
            // ignore
        }

        return value;
    };

    const normalizeDateForInput = (value) => {
        if (!value) {
            return '';
        }

        if (typeof value === 'string') {
            if (value.includes('T')) {
                return value.split('T')[0];
            }

            if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
                return value;
            }
        }

        try {
            const date = new Date(value);
            if (!Number.isNaN(date.getTime())) {
                return date.toISOString().split('T')[0];
            }
        } catch (error) {
            // ignore
        }

        return typeof value === 'string' ? value : '';
    };

    const renderField = (
        label,
        fieldName,
        {
            type = 'text',
            selectOptions,
            multiline = false,
            rows = 1,
            xs = 12,
            sm = 6,
            placeholder,
            onChange,
            readOnly = false,
            inputProps,
            helperText,
            transformDisplay
        } = {}
    ) => {
        const rawValue = editFormData[fieldName];
        const inputValue = type === 'date' ? normalizeDateForInput(rawValue) : rawValue ?? '';
        const handleChange = onChange
            ? (event) => onChange(event, fieldName)
            : (event) => onFormChange(fieldName, event.target.value);
        const displayRaw = transformDisplay
            ? transformDisplay(selectedPatient[fieldName], selectedPatient)
            : selectedPatient[fieldName];
        const displayValue = displayRaw || displayRaw === 0 ? displayRaw : 'ไม่มีข้อมูล';
        const resolvedHelperText =
            typeof helperText === 'function' ? helperText(selectedPatient, editFormData) : helperText;

        return (
            <Grid item xs={xs} sm={sm}>
                <Typography
                    variant="caption"
                    sx={{
                        color: '#64748b',
                        textTransform: 'uppercase',
                        fontWeight: 600,
                        letterSpacing: 0.3
                    }}
                >
                    {label}
                </Typography>
                {isEditing ? (
                    selectOptions ? (
                        <TextField
                            select
                            fullWidth
                            size="small"
                            value={inputValue}
                            onChange={handleChange}
                            sx={{
                                mt: 1,
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2
                                }
                            }}
                            disabled={readOnly}
                        >
                            {selectOptions.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </TextField>
                    ) : (
                        <TextField
                            fullWidth
                            size="small"
                            type={type}
                            value={inputValue}
                            onChange={handleChange}
                            sx={{
                                mt: 1,
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2
                                }
                            }}
                            multiline={multiline}
                            rows={rows}
                            placeholder={placeholder}
                            inputProps={inputProps}
                            helperText={resolvedHelperText}
                            disabled={readOnly}
                        />
                    )
                ) : (
                    <Typography
                        variant="body1"
                        fontWeight={500}
                        sx={{
                            mt: 1,
                            color: '#1f2937',
                            lineHeight: 1.5
                        }}
                    >
                        {type === 'date' && displayValue !== 'ไม่มีข้อมูล'
                            ? formatDateDisplay(displayValue)
                            : displayValue}
                    </Typography>
                )}
            </Grid>
        );
    };

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <Box sx={{ p: 3, borderBottom: '1px solid #e2e8f0', backgroundColor: '#ffffff' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar
                            sx={{
                                width: 60,
                                height: 60,
                                bgcolor: getAvatarColor(selectedPatient.SEX),
                                fontSize: '24px',
                                fontWeight: 600
                            }}
                        >
                            {selectedPatient.NAME1?.charAt(0)}
                        </Avatar>
                        <Box>
                            <Typography variant="h5" fontWeight={600}>
                                {selectedPatient.PRENAME} {selectedPatient.NAME1} {selectedPatient.SURNAME}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                HN: {selectedPatient.HNCODE} • {selectedPatient.SEX} • อายุ {selectedPatient.AGE} ปี
                            </Typography>
                        </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        {!isEditing ? (
                            <>
                                <Button
                                    variant="outlined"
                                    startIcon={<Edit />}
                                    onClick={onEdit}
                                    sx={{ borderRadius: 2 }}
                                >
                                    แก้ไข
                                </Button>
                                <Button
                                    variant="outlined"
                                    color="error"
                                    startIcon={<Delete />}
                                    onClick={onDelete}
                                    sx={{ borderRadius: 2 }}
                                >
                                    ลบ
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button
                                    variant="outlined"
                                    startIcon={<Cancel />}
                                    onClick={onCancelEdit}
                                    sx={{ borderRadius: 2 }}
                                >
                                    ยกเลิก
                                </Button>
                                <Button
                                    variant="contained"
                                    startIcon={<Save />}
                                    onClick={onSave}
                                    disabled={loading}
                                    sx={{ 
                                        borderRadius: 2,
                                        backgroundColor: '#4A9EFF'
                                    }}
                                >
                                    บันทึก
                                </Button>
                            </>
                        )}
                    </Box>
                </Box>
            </Box>

            {/* Content */}
            <Box sx={{ flex: 1, p: 3, overflow: 'auto' }}>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0' }}>
                            <Typography
                                variant="h6"
                                fontWeight={600}
                                sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}
                            >
                                <Person sx={{ color: '#4A9EFF' }} />
                                ข้อมูลส่วนบุคคล
                            </Typography>

                            <Grid container spacing={3}>
                                {renderField('รหัส HN', 'HNCODE', { sm: 4, readOnly: true })}
                                {renderField('เลขบัตรประชาชน', 'IDNO', { sm: 4 })}
                                {renderField('วันเกิด', 'BDATE', { sm: 4, type: 'date' })}
                                {renderField('คำนำหน้า', 'PRENAME', { sm: 4, selectOptions: PRENAME_OPTIONS })}
                                {renderField('ชื่อ', 'NAME1', { sm: 4 })}
                                {renderField('นามสกุล', 'SURNAME', { sm: 4 })}
                                {renderField('เพศ', 'SEX', { sm: 4, selectOptions: SEX_OPTIONS })}
                                {renderField('อายุ', 'AGE', {
                                    sm: 4,
                                    type: 'number',
                                    transformDisplay: (value) => (value || value === 0 ? `${value} ปี` : '')
                                })}
                                {renderField('กรุ๊ปเลือด', 'BLOOD_GROUP1', { sm: 4 })}
                                {renderField('สถานภาพ', 'STATUS1', { sm: 4, selectOptions: STATUS_OPTIONS })}
                                {renderField('สัญชาติ', 'NATIONAL1', { sm: 4 })}
                                {renderField('ศาสนา', 'RELIGION1', { sm: 4 })}
                                {renderField('อาชีพ', 'OCCUPATION1', { sm: 6 })}
                                {renderField('เชื้อชาติ', 'ORIGIN1', { sm: 6 })}
                            </Grid>
                        </Paper>
                    </Grid>

                    <Grid item xs={12}>
                        <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0' }}>
                            <Typography
                                variant="h6"
                                fontWeight={600}
                                sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}
                            >
                                <LocalHospital sx={{ color: '#4A9EFF' }} />
                                ข้อมูลสุขภาพ
                            </Typography>

                            <Grid container spacing={3}>
                                {renderField('น้ำหนัก (กก.)', 'WEIGHT1', {
                                    sm: 4,
                                    type: 'number',
                                    transformDisplay: (value) => (value || value === 0 ? `${value} กก.` : '')
                                })}
                                {renderField('ส่วนสูง (ซม.)', 'HIGH1', {
                                    sm: 4,
                                    type: 'number',
                                    transformDisplay: (value) => (value || value === 0 ? `${value} ซม.` : '')
                                })}
                                {renderField('โรคประจำตัว', 'DISEASE1', { xs: 12, sm: 12, multiline: true, rows: 3 })}
                                {renderField('แพ้ยา', 'DRUG_ALLERGY', { xs: 12, sm: 6, multiline: true, rows: 2 })}
                                {renderField('แพ้อาหาร', 'FOOD_ALLERGIES', { xs: 12, sm: 6, multiline: true, rows: 2 })}
                            </Grid>
                        </Paper>
                    </Grid>

                    <Grid item xs={12}>
                        <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0' }}>
                            <Typography
                                variant="h6"
                                fontWeight={600}
                                sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}
                            >
                                <Phone sx={{ color: '#4A9EFF' }} />
                                ข้อมูลติดต่อ
                            </Typography>

                            <Grid container spacing={3}>
                                {renderField('เบอร์โทรศัพท์', 'TEL1', {
                                    sm: 6,
                                    onChange: (event) => {
                                        const value = event.target.value.replace(/\D/g, '').slice(0, 10);
                                        onFormChange('TEL1', value);
                                    },
                                    inputProps: { maxLength: 10 },
                                    placeholder: 'เฉพาะตัวเลข 10 หลัก'
                                })}
                                {renderField('อีเมล', 'EMAIL1', { sm: 6, type: 'email' })}
                            </Grid>
                        </Paper>
                    </Grid>

                    <Grid item xs={12}>
                        <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0' }}>
                            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                                ที่อยู่ตามบัตรประชาชน
                            </Typography>
                            <Grid container spacing={3}>
                                {renderField('ที่อยู่ตามบัตร', 'CARD_ADDR1', { xs: 12, multiline: true, rows: 3 })}
                                {renderField('ตำบล', 'CARD_TUMBOL_CODE', {
                                    sm: 4,
                                    transformDisplay: (_, patient) => patient.CARD_TUMBOL_NAME || 'ไม่มีข้อมูล'
                                })}
                                {renderField('อำเภอ', 'CARD_AMPHER_CODE', {
                                    sm: 4,
                                    transformDisplay: (_, patient) => patient.CARD_AMPHER_NAME || 'ไม่มีข้อมูล'
                                })}
                                {renderField('จังหวัด', 'CARD_PROVINCE_CODE', {
                                    sm: 4,
                                    transformDisplay: (_, patient) => patient.CARD_PROVINCE_NAME || 'ไม่มีข้อมูล'
                                })}
                            </Grid>
                        </Paper>
                    </Grid>

                    <Grid item xs={12}>
                        <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0' }}>
                            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                                ที่อยู่ปัจจุบัน
                            </Typography>
                            <Grid container spacing={3}>
                                {renderField('ที่อยู่ปัจจุบัน', 'ADDR1', { xs: 12, multiline: true, rows: 3 })}
                                {renderField('ตำบล', 'TUMBOL_CODE', {
                                    sm: 4,
                                    transformDisplay: (_, patient) => patient.TUMBOL_NAME || 'ไม่มีข้อมูล'
                                })}
                                {renderField('อำเภอ', 'AMPHER_CODE', {
                                    sm: 4,
                                    transformDisplay: (_, patient) => patient.AMPHER_NAME || 'ไม่มีข้อมูล'
                                })}
                                {renderField('จังหวัด', 'PROVINCE_CODE', {
                                    sm: 4,
                                    transformDisplay: (_, patient) => patient.PROVINCE_NAME || 'ไม่มีข้อมูล'
                                })}
                                {renderField('รหัสไปรษณีย์', 'ZIPCODE', { sm: 4 })}
                            </Grid>
                        </Paper>
                    </Grid>

                    <Grid item xs={12}>
                        <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0' }}>
                            <Typography
                                variant="h6"
                                fontWeight={600}
                                sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}
                            >
                                <LocalHospital sx={{ color: '#4A9EFF' }} />
                                สิทธิการรักษา
                            </Typography>

                            <Grid container spacing={3}>
                                {renderField('บัตรการรักษา', 'TREATMENT_CARD', {
                                    sm: 4,
                                    selectOptions: BOOLEAN_OPTIONS,
                                    transformDisplay: (value) => formatBooleanFlag(value)
                                })}
                                {renderField('บัตรประกันสังคม', 'SOCIAL_CARD', {
                                    sm: 4,
                                    selectOptions: BOOLEAN_OPTIONS,
                                    transformDisplay: (value) => formatBooleanFlag(value)
                                })}
                                {renderField('บัตรทอง/บัตร UC', 'UCS_CARD', {
                                    sm: 4,
                                    selectOptions: BOOLEAN_OPTIONS,
                                    transformDisplay: (value) => formatBooleanFlag(value)
                                })}
                            </Grid>
                        </Paper>
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
});

const PatientManagement = () => {
    const [activeTab, setActiveTab] = useState('manage');
    const [patients, setPatients] = useState([]);
    const [filteredPatients, setFilteredPatients] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [editFormData, setEditFormData] = useState({});
    const [historySearch, setHistorySearch] = useState('');
    const [patientHistory, setPatientHistory] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [historyError, setHistoryError] = useState('');
    const [historyPage, setHistoryPage] = useState(1);
    const [historyLimit] = useState(20);
    const [historyPagination, setHistoryPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0
    });
    const [isSearchingHistory, setIsSearchingHistory] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    const handleTabChange = useCallback((event, newValue) => {
        setActiveTab(newValue);
    }, []);

    const handleHistorySearchChange = useCallback((value) => {
        setHistorySearch(value);
        setHistoryError('');
    }, []);

    // Helper function to get current month date range
    const getCurrentMonthDateRange = useCallback(() => {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        
        // First day of current month
        const firstDay = new Date(year, month, 1);
        const dateFrom = firstDay.toISOString().split('T')[0];
        
        // Last day of current month
        const lastDay = new Date(year, month + 1, 0);
        const dateTo = lastDay.toISOString().split('T')[0];
        
        return { dateFrom, dateTo };
    }, []);

    const fetchPatientHistory = useCallback(async (page = 1, searchTerm = '') => {
        try {
            setHistoryLoading(true);
            setHistoryError('');

            const hasSearchTerm = searchTerm.trim().length > 0;
            setIsSearchingHistory(hasSearchTerm);

            let historyData = [];

            if (hasSearchTerm) {
                // เมื่อมี search term: ดึงข้อมูลทั้งหมด (ไม่ filter ตามเดือน) แล้ว filter ฝั่ง client
                // ดึงข้อมูลทั้งหมดโดยวนหลายหน้า (จำกัดจำนวนหน้าที่ดึงเพื่อป้องกันการโหลดช้า)
                let allData = [];
                let currentPage = 1;
                let hasMore = true;
                const fetchLimit = 100; // ดึงทีละ 100 รายการ
                const maxPages = 50; // จำกัดสูงสุด 50 หน้า (5000 รายการ)

                while (hasMore && currentPage <= maxPages) {
                    const params = {
                        page: currentPage,
                        limit: fetchLimit
                    };

                    const response = await TreatmentService.getAllTreatments(params);

                    if (response.success && Array.isArray(response.data)) {
                        if (response.data.length > 0) {
                            allData = [...allData, ...response.data];
                            currentPage++;
                            
                            // ตรวจสอบว่ามีข้อมูลเพิ่มเติมหรือไม่
                            if (response.pagination) {
                                hasMore = currentPage <= response.pagination.totalPages;
                            } else {
                                // ถ้าไม่มี pagination info ให้ตรวจสอบว่าได้ข้อมูลครบหรือไม่
                                hasMore = response.data.length === fetchLimit;
                            }
                        } else {
                            hasMore = false;
                        }
                    } else {
                        hasMore = false;
                    }
                }

                // Filter ตาม search term
                const term = searchTerm.trim().toLowerCase();
                historyData = allData.filter((record) => {
                    const valuesToCheck = [
                        record?.HNNO,
                        record?.HNCODE,
                        record?.HN,
                        record?.VNO,
                        record?.VN,
                        record?.PRENAME,
                        record?.NAME1,
                        record?.SURNAME
                    ].filter(Boolean);

                    return valuesToCheck.some((value) =>
                        value.toString().toLowerCase().includes(term)
                    );
                });

                // Sort by date (newest first)
                historyData.sort((a, b) => {
                    const dateA = new Date(a?.RDATE || a?.TRDATE || a?.created_at || 0);
                    const dateB = new Date(b?.RDATE || b?.TRDATE || b?.created_at || 0);
                    return dateB - dateA;
                });

                // Paginate ฝั่ง client
                const startIndex = (page - 1) * historyLimit;
                const endIndex = startIndex + historyLimit;
                const paginatedData = historyData.slice(startIndex, endIndex);

                setPatientHistory(paginatedData);
                setHistoryPagination({
                    page: page,
                    limit: historyLimit,
                    total: historyData.length,
                    totalPages: Math.ceil(historyData.length / historyLimit)
                });
            } else {
                // เมื่อไม่มี search term: ดึงแค่เดือนนี้ + ใช้ pagination ที่ server
                const { dateFrom, dateTo } = getCurrentMonthDateRange();
                const params = {
                    page: page,
                    limit: historyLimit,
                    date_from: dateFrom,
                    date_to: dateTo
                };

                const response = await TreatmentService.getAllTreatments(params);

                if (response.success) {
                    historyData = Array.isArray(response.data) ? response.data : [];
                    
                    // Sort by date (newest first)
                    historyData.sort((a, b) => {
                        const dateA = new Date(a?.RDATE || a?.TRDATE || a?.created_at || 0);
                        const dateB = new Date(b?.RDATE || b?.TRDATE || b?.created_at || 0);
                        return dateB - dateA;
                    });

                    setPatientHistory(historyData);
                    
                    // Update pagination จาก API
                    if (response.pagination) {
                        setHistoryPagination(response.pagination);
                    } else {
                        setHistoryPagination({
                            page: page,
                            limit: historyLimit,
                            total: historyData.length,
                            totalPages: Math.ceil(historyData.length / historyLimit)
                        });
                    }
                } else {
                    setPatientHistory([]);
                    setHistoryError(response.message || 'ไม่พบข้อมูลประวัติผู้ป่วย');
                }
            }
        } catch (err) {
            setPatientHistory([]);
            setHistoryError('เกิดข้อผิดพลาดในการโหลดประวัติผู้ป่วย');
            console.error('Error fetching patient history:', err);
        } finally {
            setHistoryLoading(false);
        }
    }, [historyLimit, getCurrentMonthDateRange]);

    // เมื่อมีการค้นหา ให้ fetch ข้อมูลใหม่
    const handleHistorySearch = useCallback(() => {
        setHistoryPage(1);
        fetchPatientHistory(1, historySearch);
    }, [historySearch, fetchPatientHistory]);

    // เมื่อกด Enter ใน search box
    const handleHistorySearchKeyDown = useCallback((e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleHistorySearch();
        }
    }, [handleHistorySearch]);

    // เมื่อเปลี่ยนหน้า pagination
    const handleHistoryPageChange = useCallback((newPage) => {
        setHistoryPage(newPage);
        fetchPatientHistory(newPage, historySearch);
    }, [historySearch, fetchPatientHistory]);

    // ใช้ patientHistory โดยตรง (ไม่ต้อง filter อีกเพราะ filter ใน fetch แล้ว)
    const filteredHistoryRecords = React.useMemo(() => {
        return patientHistory;
    }, [patientHistory]);

    const formatHistoryDate = useCallback((record) => {
        const dateString = record?.RDATE || record?.TRDATE || record?.created_at;
        if (!dateString) {
            return '-';
        }

        try {
            return TreatmentService.formatThaiDate(dateString);
        } catch (error) {
            try {
                return new Date(dateString).toLocaleDateString('th-TH');
            } catch (err) {
                return dateString;
            }
        }
    }, []);

    const getTreatmentSummary = useCallback((record) => {
        // ดึง TREATMENT1 จาก table TREATMENT1 โดยตรง
        if (record?.TREATMENT1) {
            return record.TREATMENT1;
        }
        // Fallback ไปหาใน nested object
        if (record?.treatment?.TREATMENT1) {
            return record.treatment.TREATMENT1;
        }
        // Fallback อื่นๆ
        if (record?.TREATMENT_SUMMARY) {
            return record.TREATMENT_SUMMARY;
        }
        if (record?.summary) {
            return record.summary;
        }
        return 'ไม่มีข้อมูล';
    }, []);

    useEffect(() => {
        if (searchTerm) {
            handleSearch();
        } else {
            setFilteredPatients(patients);
        }
    }, [searchTerm, patients]);

    useEffect(() => {
        if (activeTab === 'history') {
            // เมื่อเปิด tab history ให้ดึงข้อมูลเดือนนี้ (ไม่มี search term)
            setHistoryPage(1);
            setHistorySearch('');
            fetchPatientHistory(1, '');
        }
    }, [activeTab, fetchPatientHistory]);

    // ฟังก์ชันลบประวัติผู้ป่วย
    const handleDeleteTreatment = async () => {
        if (!selectedRecord) return;

        try {
            setActionLoading(true);
            const vno = selectedRecord?.VNO || selectedRecord?.VN;
            
            if (!vno) {
                setHistoryError('ไม่พบ VN สำหรับลบข้อมูล');
                setDeleteDialogOpen(false);
                return;
            }

            const response = await TreatmentService.deleteTreatment(vno);

            if (response.success) {
                setDeleteDialogOpen(false);
                setSelectedRecord(null);
                
                // Refresh ข้อมูล
                await fetchPatientHistory(historyPage, historySearch);
                setHistoryError('');
            } else {
                setHistoryError(response.message || 'เกิดข้อผิดพลาดในการลบข้อมูล');
            }
        } catch (err) {
            setHistoryError('เกิดข้อผิดพลาดในการลบข้อมูล: ' + (err.message || 'ไม่ทราบสาเหตุ'));
            console.error('Error deleting treatment:', err);
        } finally {
            setActionLoading(false);
        }
    };

    // ฟังก์ชันยกเลิกประวัติผู้ป่วย
    const handleCancelTreatment = async () => {
        if (!selectedRecord) return;

        try {
            setActionLoading(true);
            const vno = selectedRecord?.VNO || selectedRecord?.VN;
            
            if (!vno) {
                setHistoryError('ไม่พบ VN สำหรับยกเลิก');
                setCancelDialogOpen(false);
                return;
            }

            const response = await TreatmentService.cancelTreatment(vno);

            if (response.success) {
                setCancelDialogOpen(false);
                setSelectedRecord(null);
                
                // Refresh ข้อมูล
                await fetchPatientHistory(historyPage, historySearch);
                setHistoryError('');
            } else {
                setHistoryError(response.message || 'เกิดข้อผิดพลาดในการยกเลิก');
            }
        } catch (err) {
            setHistoryError('เกิดข้อผิดพลาดในการยกเลิก: ' + (err.message || 'ไม่ทราบสาเหตุ'));
            console.error('Error canceling treatment:', err);
        } finally {
            setActionLoading(false);
        }
    };

    const loadPatients = useCallback(async () => {
        try {
            setLoading(true);
            const response = await PatientService.getAllPatients();
            if (response.success) {
                setPatients(response.data);
                setFilteredPatients(response.data);
                return response.data;
            }
            return [];
        } catch (err) {
            setError('ไม่สามารถโหลดข้อมูลผู้ป่วยได้');
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadPatients();
    }, [loadPatients]);

    const handleSearch = async () => {
        if (!searchTerm.trim()) {
            setFilteredPatients(patients);
            return;
        }

        try {
            setLoading(true);
            const response = await PatientService.searchPatients(searchTerm);
            if (response.success) {
                setFilteredPatients(response.data);
            }
        } catch (err) {
            setError('เกิดข้อผิดพลาดในการค้นหา');
        } finally {
            setLoading(false);
        }
    };

    const handlePatientSelect = useCallback((patient) => {
        setSelectedPatient(patient);
        setIsEditing(false);
        setEditFormData(patient);
    }, []);

    const handleEdit = useCallback(() => {
        setIsEditing(true);
    }, []);

    const handleCancelEdit = useCallback(() => {
        setIsEditing(false);
        setEditFormData(selectedPatient);
    }, [selectedPatient]);

    const handleFormChange = useCallback((field, value) => {
        setEditFormData(prev => ({ ...prev, [field]: value }));
    }, []);

    const handleSave = async () => {
        if (!selectedPatient) {
            return;
        }

        try {
            setLoading(true);
            const response = await PatientService.updatePatient(selectedPatient.HNCODE, editFormData);

            if (response.success) {
                const updatedList = await loadPatients();
                const updatedPatient = Array.isArray(updatedList)
                    ? updatedList.find((patient) => patient.HNCODE === selectedPatient.HNCODE)
                    : null;

                if (updatedPatient) {
                    setSelectedPatient(updatedPatient);
                    setEditFormData(updatedPatient);
                } else {
                    setSelectedPatient(null);
                }

                setIsEditing(false);
                setError('');
            }
        } catch (err) {
            setError('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedPatient) {
            return;
        }

        if (!window.confirm(`คุณต้องการลบข้อมูลผู้ป่วย ${selectedPatient.PRENAME} ${selectedPatient.NAME1} ${selectedPatient.SURNAME} หรือไม่?`)) {
            return;
        }

        try {
            setLoading(true);
            const response = await PatientService.deletePatient(selectedPatient.HNCODE);
            
            if (response.success) {
                await loadPatients();
                setSelectedPatient(null);
                setEditFormData({});
                setIsEditing(false);
                setError('');
            }
        } catch (err) {
            setError('เกิดข้อผิดพลาดในการลบข้อมูล');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column' }}>
            <Box
                sx={{
                    backgroundColor: '#ffffff',
                    borderBottom: '1px solid #e2e8f0'
                }}
            >
                <Tabs
                    value={activeTab}
                    onChange={handleTabChange}
                    indicatorColor="primary"
                    textColor="primary"
                    sx={{
                        px: 3,
                        '& .MuiTab-root': {
                            fontWeight: 600,
                            minHeight: 0,
                            py: 2
                        }
                    }}
                >
                    <Tab label="จัดการผู้ป่วย" value="manage" />
                    <Tab label="ประวัติผู้ป่วย" value="history" />
                </Tabs>
            </Box>

            <Box sx={{ flex: 1, overflow: 'hidden', minHeight: 0 }}>
                {activeTab === 'manage' ? (
                    <Box sx={{ display: 'flex', height: '100%', overflow: 'hidden', minHeight: 0 }}>
                        {/* Left Sidebar */}
                        <Box
                            sx={{
                                width: '380px',
                                backgroundColor: '#f8fafc',
                                borderRight: '1px solid #e2e8f0',
                                display: 'flex',
                                flexDirection: 'column',
                                overflow: 'hidden',
                                minHeight: 0
                            }}
                        >
                            {/* Header */}
                            <Box
                                sx={{
                                    p: 3,
                                    backgroundColor: '#ffffff',
                                    borderBottom: '1px solid #e2e8f0'
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                                    <Typography
                                        variant="h6"
                                        sx={{
                                            fontWeight: 700,
                                            color: '#1e293b',
                                            fontSize: '18px'
                                        }}
                                    >
                                        รายชื่อผู้ป่วย
                                    </Typography>

                                    <Tooltip title="รีเฟรช">
                                        <IconButton
                                            onClick={loadPatients}
                                            size="small"
                                            disabled={loading}
                                            sx={{
                                                backgroundColor: '#f1f5f9',
                                                color: '#4A9EFF',
                                                '&:hover': { backgroundColor: '#e2e8f0' }
                                            }}
                                        >
                                            <Refresh fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </Box>

                                {/* Search */}
                                <TextField
                                    placeholder="ค้นหาผู้ป่วย..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    fullWidth
                                    size="small"
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Search sx={{ color: '#64748b', fontSize: 20 }} />
                                            </InputAdornment>
                                        )
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 3,
                                            backgroundColor: '#f8fafc',
                                            '&:hover': {
                                                backgroundColor: '#f1f5f9'
                                            }
                                        }
                                    }}
                                />
                            </Box>

                            {/* Error Alert */}
                            {error && (
                                <Box sx={{ p: 2 }}>
                                    <Alert
                                        severity="error"
                                        onClose={() => setError('')}
                                        sx={{ borderRadius: 2 }}
                                    >
                                        {error}
                                    </Alert>
                                </Box>
                            )}

                            {/* Patient List */}
                            <Box
                                sx={{
                                    flex: 1,
                                    overflow: 'auto',
                                    p: 2
                                }}
                            >
                                {loading ? (
                                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                                        <CircularProgress size={40} sx={{ color: '#4A9EFF' }} />
                                    </Box>
                                ) : filteredPatients.length === 0 ? (
                                    <Box sx={{ textAlign: 'center', py: 4 }}>
                                        <Person sx={{ fontSize: 48, color: '#cbd5e1', mb: 2 }} />
                                        <Typography variant="body2" color="textSecondary">
                                            {searchTerm ? 'ไม่พบผู้ป่วยที่ค้นหา' : 'ยังไม่มีข้อมูลผู้ป่วย'}
                                        </Typography>
                                    </Box>
                                ) : (
                                    filteredPatients.map((patient) => (
                                        <PatientCard 
                                            key={patient.HNCODE} 
                                            patient={patient} 
                                            isSelected={selectedPatient?.HNCODE === patient.HNCODE}
                                            onSelect={handlePatientSelect}
                                        />
                                    ))
                                )}
                            </Box>
                        </Box>

                        {/* Right Panel - Patient Details */}
                        <Box sx={{ flex: 1, backgroundColor: '#ffffff' }}>
                            <PatientDetailPanel 
                                selectedPatient={selectedPatient}
                                isEditing={isEditing}
                                editFormData={editFormData}
                                loading={loading}
                                onEdit={handleEdit}
                                onCancelEdit={handleCancelEdit}
                                onSave={handleSave}
                                onDelete={handleDelete}
                                onFormChange={handleFormChange}
                            />
                        </Box>
                    </Box>
                ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#f8fafc', overflow: 'hidden', minHeight: 0 }}>
                        <Box sx={{ p: 3, pb: 2, flexShrink: 0 }}>
                            <Grid container spacing={2} alignItems="center">
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        label="ค้นหาผู้ป่วย / HN / VN"
                                        value={historySearch}
                                        onChange={(e) => handleHistorySearchChange(e.target.value)}
                                        onKeyDown={handleHistorySearchKeyDown}
                                        fullWidth
                                        size="small"
                                        placeholder={isSearchingHistory ? "ค้นหาทั้งหมด" : "ค้นหาเพื่อดึงข้อมูลทั้งหมด"}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        startIcon={<Search />}
                                        onClick={handleHistorySearch}
                                        disabled={historyLoading}
                                        fullWidth
                                        sx={{ height: '100%', minHeight: 40, borderRadius: 2 }}
                                    >
                                        {isSearchingHistory ? "ค้นหา" : "ค้นหา"}
                                    </Button>
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <Button
                                        variant="outlined"
                                        color="primary"
                                        startIcon={<Refresh />}
                                        onClick={() => {
                                            setHistorySearch('');
                                            setHistoryPage(1);
                                            fetchPatientHistory(1, '');
                                        }}
                                        disabled={historyLoading}
                                        fullWidth
                                        sx={{ height: '100%', minHeight: 40, borderRadius: 2 }}
                                    >
                                        รีเซ็ต 
                                    </Button>
                                </Grid>
                            </Grid>
                        </Box>

                        <Box sx={{ flex: 1, px: 3, pb: 3, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
                            {historyError && (
                                <Alert
                                    severity="error"
                                    onClose={() => setHistoryError('')}
                                    sx={{ mb: 2, borderRadius: 2, flexShrink: 0 }}
                                >
                                    {historyError}
                                </Alert>
                            )}

                            <Paper sx={{ flex: 1, borderRadius: 3, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
                                {historyLoading && <LinearProgress sx={{ flexShrink: 0 }} />}
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        px: 3,
                                        py: 2,
                                        borderBottom: '1px solid #e2e8f0',
                                        backgroundColor: '#ffffff',
                                        flexShrink: 0
                                    }}
                                >
                                    <Typography variant="h6" fontWeight={600}>
                                        ประวัติผู้ป่วย
                                        {!isSearchingHistory && (
                                            <Typography component="span" variant="body2" sx={{ ml: 1, color: 'text.secondary', fontWeight: 400 }}>
                                                (เดือนนี้)
                                            </Typography>
                                        )}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {isSearchingHistory 
                                            ? `ทั้งหมด ${historyPagination.total || filteredHistoryRecords.length} รายการ`
                                            : `เดือนนี้ ${historyPagination.total || filteredHistoryRecords.length} รายการ`
                                        }
                                    </Typography>
                                </Box>

                                <TableContainer sx={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
                                    <Table stickyHeader size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: 600, minWidth: 120 }}>วันที่</TableCell>
                                                <TableCell sx={{ fontWeight: 600, minWidth: 100 }}>HN</TableCell>
                                                <TableCell sx={{ fontWeight: 600, minWidth: 120 }}>VN</TableCell>
                                                <TableCell sx={{ fontWeight: 600, minWidth: 150 }}>
                                                    ชื่อ-นามสกุล
                                                </TableCell>
                                                <TableCell sx={{ fontWeight: 600 }}>สถานะ</TableCell>
                                                <TableCell sx={{ fontWeight: 600 }}>สรุปการรักษา (TREATMENT1)</TableCell>
                                                <TableCell sx={{ fontWeight: 600, minWidth: 150 }} align="center">จัดการ</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {filteredHistoryRecords.length === 0 && !historyLoading ? (
                                                <TableRow>
                                                    <TableCell colSpan={7}>
                                                        <Box sx={{ textAlign: 'center', py: 6, color: '#64748b' }}>
                                                            <Typography variant="body2">
                                                                ไม่พบข้อมูลประวัติผู้ป่วยในช่วงที่เลือก
                                                            </Typography>
                                                        </Box>
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                filteredHistoryRecords.map((record, index) => {
                                                    const rowKey =
                                                        record?.VNO ||
                                                        record?.VN ||
                                                        `${record?.HNNO || record?.HNCODE || 'record'}-${index}`;
                                                    const patientName = [record?.PRENAME, record?.NAME1, record?.SURNAME]
                                                        .filter(Boolean)
                                                        .join(' ');
                                                    const treatment1 = getTreatmentSummary(record);
                                                    const status = record?.STATUS1 || 'ทำงานอยู่';
                                                    const isCanceled = status === 'ยกเลิก';
                                                    
                                                    return (
                                                        <TableRow key={rowKey} hover>
                                                            <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                                                {formatHistoryDate(record)}
                                                            </TableCell>
                                                            <TableCell sx={{ whiteSpace: 'nowrap', fontWeight: 500 }}>
                                                                {record?.HNNO || record?.HNCODE || '-'}
                                                            </TableCell>
                                                            <TableCell sx={{ whiteSpace: 'nowrap', fontWeight: 500 }}>
                                                                {record?.VNO || record?.VN || '-'}
                                                            </TableCell>
                                                            <TableCell sx={{ minWidth: 150 }}>
                                                                <Typography
                                                                    variant="body2"
                                                                    sx={{
                                                                        fontWeight: 500,
                                                                        color: '#1f2937',
                                                                        lineHeight: 1.5
                                                                    }}
                                                                >
                                                                    {patientName || '-'}
                                                                </Typography>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Chip
                                                                    label={status}
                                                                    size="small"
                                                                    sx={{
                                                                        backgroundColor: isCanceled ? '#fee2e2' : status === 'ปิดแล้ว' ? '#dcfce7' : '#dbeafe',
                                                                        color: isCanceled ? '#991b1b' : status === 'ปิดแล้ว' ? '#166534' : '#1e40af',
                                                                        fontWeight: 500,
                                                                        fontSize: '11px'
                                                                    }}
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                <Typography
                                                                    variant="body2"
                                                                    sx={{
                                                                        color: '#475569',
                                                                        whiteSpace: 'pre-wrap',
                                                                        lineHeight: 1.7,
                                                                        wordBreak: 'break-word'
                                                                    }}
                                                                >
                                                                    {treatment1}
                                                                </Typography>
                                                            </TableCell>
                                                            <TableCell align="center">
                                                                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                                                                    {!isCanceled && (
                                                                        <Tooltip title="ยกเลิก">
                                                                            <IconButton
                                                                                size="small"
                                                                                color="warning"
                                                                                onClick={() => {
                                                                                    setSelectedRecord(record);
                                                                                    setCancelDialogOpen(true);
                                                                                }}
                                                                                disabled={actionLoading}
                                                                                sx={{
                                                                                    '&:hover': {
                                                                                        backgroundColor: '#fef3c7'
                                                                                    }
                                                                                }}
                                                                            >
                                                                                <CancelOutlined fontSize="small" />
                                                                            </IconButton>
                                                                        </Tooltip>
                                                                    )}
                                                                    <Tooltip title="ลบ">
                                                                        <IconButton
                                                                            size="small"
                                                                            color="error"
                                                                            onClick={() => {
                                                                                setSelectedRecord(record);
                                                                                setDeleteDialogOpen(true);
                                                                            }}
                                                                            disabled={actionLoading}
                                                                            sx={{
                                                                                '&:hover': {
                                                                                    backgroundColor: '#fee2e2'
                                                                                }
                                                                            }}
                                                                        >
                                                                            <Delete fontSize="small" />
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                </Box>
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })
                                            )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>

                                {/* Pagination Controls */}
                                {historyPagination.totalPages > 1 && (
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            px: 3,
                                            py: 2,
                                            borderTop: '1px solid #e2e8f0',
                                            backgroundColor: '#ffffff',
                                            flexShrink: 0
                                        }}
                                    >
                                        <Typography variant="body2" color="text.secondary">
                                            หน้า {historyPagination.page} จาก {historyPagination.totalPages} 
                                            {' '}(ทั้งหมด {historyPagination.total} รายการ)
                                        </Typography>
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                startIcon={<KeyboardArrowLeft />}
                                                onClick={() => handleHistoryPageChange(historyPagination.page - 1)}
                                                disabled={historyPagination.page <= 1 || historyLoading}
                                                sx={{ borderRadius: 2 }}
                                            >
                                                ก่อนหน้า
                                            </Button>
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                endIcon={<KeyboardArrowRight />}
                                                onClick={() => handleHistoryPageChange(historyPagination.page + 1)}
                                                disabled={historyPagination.page >= historyPagination.totalPages || historyLoading}
                                                sx={{ borderRadius: 2 }}
                                            >
                                                ถัดไป
                                            </Button>
                                        </Box>
                                    </Box>
                                )}
                            </Paper>
                        </Box>
                    </Box>
                )}
            </Box>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={() => !actionLoading && setDeleteDialogOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>ยืนยันการลบข้อมูล</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลประวัติผู้ป่วยนี้?
                        <br />
                        <strong>VN: {selectedRecord?.VNO || selectedRecord?.VN || '-'}</strong>
                        <br />
                        <strong>HN: {selectedRecord?.HNNO || selectedRecord?.HNCODE || '-'}</strong>
                        <br />
                        <strong>ชื่อ: {[selectedRecord?.PRENAME, selectedRecord?.NAME1, selectedRecord?.SURNAME].filter(Boolean).join(' ')}</strong>
                        <br />
                        <br />
                        <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                            ⚠️ การลบข้อมูลนี้ไม่สามารถกู้คืนได้
                        </Typography>
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setDeleteDialogOpen(false)}
                        disabled={actionLoading}
                        color="inherit"
                    >
                        ยกเลิก
                    </Button>
                    <Button
                        onClick={handleDeleteTreatment}
                        disabled={actionLoading}
                        color="error"
                        variant="contained"
                        startIcon={actionLoading ? <CircularProgress size={16} /> : <Delete />}
                    >
                        {actionLoading ? 'กำลังลบ...' : 'ลบ'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Cancel Confirmation Dialog */}
            <Dialog
                open={cancelDialogOpen}
                onClose={() => !actionLoading && setCancelDialogOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>ยืนยันการยกเลิกประวัติผู้ป่วย</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        คุณแน่ใจหรือไม่ว่าต้องการยกเลิกประวัติผู้ป่วยนี้?
                        <br />
                        <strong>VN: {selectedRecord?.VNO || selectedRecord?.VN || '-'}</strong>
                        <br />
                        <strong>HN: {selectedRecord?.HNNO || selectedRecord?.HNCODE || '-'}</strong>
                        <br />
                        <strong>ชื่อ: {[selectedRecord?.PRENAME, selectedRecord?.NAME1, selectedRecord?.SURNAME].filter(Boolean).join(' ')}</strong>
                        <br />
                        <br />
                        <Typography variant="body2" color="warning.main" sx={{ mt: 1 }}>
                            ⚠️ สถานะจะถูกเปลี่ยนเป็น "ยกเลิก"
                        </Typography>
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setCancelDialogOpen(false)}
                        disabled={actionLoading}
                        color="inherit"
                    >
                        ยกเลิก
                    </Button>
                    <Button
                        onClick={handleCancelTreatment}
                        disabled={actionLoading}
                        color="warning"
                        variant="contained"
                        startIcon={actionLoading ? <CircularProgress size={16} /> : <CancelOutlined />}
                    >
                        {actionLoading ? 'กำลังยกเลิก...' : 'ยกเลิก'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default PatientManagement;