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
    DialogActions,
    Divider
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
    LocationOn,
    KeyboardArrowLeft,
    KeyboardArrowRight,
    CancelOutlined,
    Medication,
    MonitorHeart,
    Thermostat,
    Scale,
    Height,
    Favorite,
    Air,
    WaterDrop,
    Notes,
    CheckCircle
} from '@mui/icons-material';
// import CheckCircle from '@mui/icons-material/CheckCircle';
import PatientService from '../services/patientService';
import TreatmentService from '../services/treatmentService';
import DrugService from '../services/drugService';

// API Base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Helper function for fetch with timeout and retry
const fetchWithTimeout = async (url, options = {}, timeout = 10000, retries = 2) => {
    let lastError = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
        const controller = new AbortController();
        let timeoutId = null;

        try {
            timeoutId = setTimeout(() => {
                controller.abort();
            }, timeout);

            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            });

            if (timeoutId) {
                clearTimeout(timeoutId);
            }

            return response;
        } catch (error) {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }

            lastError = error;

            // ถ้าเป็น AbortError (timeout) และยังมี retry อยู่ ให้ retry
            if (error.name === 'AbortError' && attempt < retries) {
                // Wait before retry (exponential backoff)
                await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
                continue;
            }

            // ถ้าเป็น error อื่นๆ หรือหมด retry แล้ว ให้ throw
            if (attempt === retries) {
                throw error;
            }

            // Wait before retry (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        }
    }

    // Fallback: throw last error if somehow we got here
    throw lastError || new Error('Request failed after retries');
};

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
    // Address states for CARD (ที่อยู่ตามบัตร)
    const [cardProvinces, setCardProvinces] = React.useState([]);
    const [cardAmphers, setCardAmphers] = React.useState([]);
    const [cardTumbols, setCardTumbols] = React.useState([]);
    const [selectedCardProvince, setSelectedCardProvince] = React.useState(null);
    const [selectedCardAmpher, setSelectedCardAmpher] = React.useState(null);
    const [selectedCardTumbol, setSelectedCardTumbol] = React.useState(null);

    // Address states for CURRENT (ที่อยู่ปัจจุบัน)
    const [currentProvinces, setCurrentProvinces] = React.useState([]);
    const [currentAmphers, setCurrentAmphers] = React.useState([]);
    const [currentTumbols, setCurrentTumbols] = React.useState([]);
    const [selectedCurrentProvince, setSelectedCurrentProvince] = React.useState(null);
    const [selectedCurrentAmpher, setSelectedCurrentAmpher] = React.useState(null);
    const [selectedCurrentTumbol, setSelectedCurrentTumbol] = React.useState(null);

    // Load provinces with caching to prevent multiple simultaneous requests
    const provincesCache = React.useRef({ data: null, loading: false, timestamp: 0 });
    const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

    const loadProvinces = React.useCallback(async () => {
        // Check cache first
        const now = Date.now();
        if (provincesCache.current.data &&
            (now - provincesCache.current.timestamp) < CACHE_DURATION) {
            setCardProvinces(provincesCache.current.data);
            setCurrentProvinces(provincesCache.current.data);
            return provincesCache.current.data;
        }

        // If already loading, wait for it
        if (provincesCache.current.loading) {
            // Wait up to 10 seconds for the ongoing request
            let waitCount = 0;
            while (provincesCache.current.loading && waitCount < 20) {
                await new Promise(resolve => setTimeout(resolve, 500));
                waitCount++;
            }
            if (provincesCache.current.data) {
                setCardProvinces(provincesCache.current.data);
                setCurrentProvinces(provincesCache.current.data);
                return provincesCache.current.data;
            }
        }

        try {
            provincesCache.current.loading = true;
            const response = await fetchWithTimeout(`${API_BASE_URL}/provinces`, {}, 15000, 1);
            const result = await response.json();
            if (result.success && result.data) {
                provincesCache.current.data = result.data;
                provincesCache.current.timestamp = now;
                setCardProvinces(result.data);
                setCurrentProvinces(result.data);
                return result.data;
            }
            return [];
        } catch (error) {
            console.error('Error loading provinces:', error);
            // Return cached data if available, otherwise empty array
            if (provincesCache.current.data) {
                setCardProvinces(provincesCache.current.data);
                setCurrentProvinces(provincesCache.current.data);
                return provincesCache.current.data;
            }
            setCardProvinces([]);
            setCurrentProvinces([]);
            return [];
        } finally {
            provincesCache.current.loading = false;
        }
    }, []);

    // Load amphers by province (for CARD)
    const loadCardAmphersByProvince = React.useCallback(async (provinceCode) => {
        if (!provinceCode) {
            setCardAmphers([]);
            setCardTumbols([]);
            return;
        }
        try {
            const response = await fetchWithTimeout(`${API_BASE_URL}/amphers/province/${provinceCode}`, {}, 10000, 1);
            const result = await response.json();
            if (result.success) {
                setCardAmphers(result.data);
            }
        } catch (error) {
            console.error('Error loading card amphers:', error);
            setCardAmphers([]);
        }
    }, []);

    // Load tumbols by ampher (for CARD)
    const loadCardTumbolsByAmpher = React.useCallback(async (ampherCode) => {
        if (!ampherCode) {
            setCardTumbols([]);
            return;
        }
        try {
            const response = await fetchWithTimeout(`${API_BASE_URL}/tumbols/ampher/${ampherCode}`, {}, 10000, 1);
            const result = await response.json();
            if (result.success) {
                setCardTumbols(result.data);
            }
        } catch (error) {
            console.error('Error loading card tumbols:', error);
            setCardTumbols([]);
        }
    }, []);

    // Load amphers by province (for CURRENT)
    const loadCurrentAmphersByProvince = React.useCallback(async (provinceCode) => {
        if (!provinceCode) {
            setCurrentAmphers([]);
            setCurrentTumbols([]);
            return;
        }
        try {
            const response = await fetchWithTimeout(`${API_BASE_URL}/amphers/province/${provinceCode}`, {}, 10000, 1);
            const result = await response.json();
            if (result.success) {
                setCurrentAmphers(result.data);
            }
        } catch (error) {
            console.error('Error loading current amphers:', error);
            setCurrentAmphers([]);
        }
    }, []);

    // Load tumbols by ampher (for CURRENT)
    const loadCurrentTumbolsByAmpher = React.useCallback(async (ampherCode) => {
        if (!ampherCode) {
            setCurrentTumbols([]);
            return;
        }
        try {
            const response = await fetchWithTimeout(`${API_BASE_URL}/tumbols/ampher/${ampherCode}`, {}, 10000, 1);
            const result = await response.json();
            if (result.success) {
                setCurrentTumbols(result.data);
            }
        } catch (error) {
            console.error('Error loading current tumbols:', error);
            setCurrentTumbols([]);
        }
    }, []);

    // Initialize address data when patient is selected or editing starts
    React.useEffect(() => {
        if (selectedPatient && isEditing) {
            const initializeAddressData = async () => {
                // Load provinces first
                const provincesData = await loadProvinces();

                if (!provincesData || provincesData.length === 0) {
                    return;
                }

                // Initialize CARD address
                if (editFormData.CARD_PROVINCE_CODE || selectedPatient.CARD_PROVINCE_CODE) {
                    const cardProvinceCode = editFormData.CARD_PROVINCE_CODE || selectedPatient.CARD_PROVINCE_CODE;
                    const cardProvince = provincesData.find(p => p.PROVINCE_CODE === cardProvinceCode);
                    if (cardProvince) {
                        setSelectedCardProvince(cardProvince);
                        await loadCardAmphersByProvince(cardProvinceCode);

                        const cardAmpherCode = editFormData.CARD_AMPHER_CODE || selectedPatient.CARD_AMPHER_CODE;
                        if (cardAmpherCode) {
                            try {
                                const amphersRes = await fetchWithTimeout(`${API_BASE_URL}/amphers/province/${cardProvinceCode}`, {}, 10000, 1);
                                const amphersResult = await amphersRes.json();
                                if (amphersResult.success && amphersResult.data) {
                                    const cardAmpher = amphersResult.data.find(a => a.AMPHER_CODE === cardAmpherCode);
                                    if (cardAmpher) {
                                        setSelectedCardAmpher(cardAmpher);
                                        await loadCardTumbolsByAmpher(cardAmpherCode);

                                        const cardTumbolCode = editFormData.CARD_TUMBOL_CODE || selectedPatient.CARD_TUMBOL_CODE;
                                        if (cardTumbolCode) {
                                            try {
                                                const tumbolsRes = await fetchWithTimeout(`${API_BASE_URL}/tumbols/ampher/${cardAmpherCode}`, {}, 10000, 1);
                                                const tumbolsResult = await tumbolsRes.json();
                                                if (tumbolsResult.success && tumbolsResult.data) {
                                                    const cardTumbol = tumbolsResult.data.find(t => t.TUMBOL_CODE === cardTumbolCode);
                                                    if (cardTumbol) {
                                                        setSelectedCardTumbol(cardTumbol);
                                                    }
                                                }
                                            } catch (error) {
                                                console.error('Error loading card tumbols:', error);
                                            }
                                        }
                                    }
                                }
                            } catch (error) {
                                console.error('Error loading card amphers:', error);
                            }
                        }
                    }
                }

                // Initialize CURRENT address
                if (editFormData.PROVINCE_CODE || selectedPatient.PROVINCE_CODE) {
                    const currentProvinceCode = editFormData.PROVINCE_CODE || selectedPatient.PROVINCE_CODE;
                    const currentProvince = provincesData.find(p => p.PROVINCE_CODE === currentProvinceCode);
                    if (currentProvince) {
                        setSelectedCurrentProvince(currentProvince);
                        await loadCurrentAmphersByProvince(currentProvinceCode);

                        const currentAmpherCode = editFormData.AMPHER_CODE || selectedPatient.AMPHER_CODE;
                        if (currentAmpherCode) {
                            try {
                                const amphersRes = await fetchWithTimeout(`${API_BASE_URL}/amphers/province/${currentProvinceCode}`, {}, 10000, 1);
                                const amphersResult = await amphersRes.json();
                                if (amphersResult.success && amphersResult.data) {
                                    const currentAmpher = amphersResult.data.find(a => a.AMPHER_CODE === currentAmpherCode);
                                    if (currentAmpher) {
                                        setSelectedCurrentAmpher(currentAmpher);
                                        await loadCurrentTumbolsByAmpher(currentAmpherCode);

                                        const currentTumbolCode = editFormData.TUMBOL_CODE || selectedPatient.TUMBOL_CODE;
                                        if (currentTumbolCode) {
                                            try {
                                                const tumbolsRes = await fetchWithTimeout(`${API_BASE_URL}/tumbols/ampher/${currentAmpherCode}`, {}, 10000, 1);
                                                const tumbolsResult = await tumbolsRes.json();
                                                if (tumbolsResult.success && tumbolsResult.data) {
                                                    const currentTumbol = tumbolsResult.data.find(t => t.TUMBOL_CODE === currentTumbolCode);
                                                    if (currentTumbol) {
                                                        setSelectedCurrentTumbol(currentTumbol);
                                                    }
                                                }
                                            } catch (error) {
                                                console.error('Error loading current tumbols:', error);
                                            }
                                        }
                                    }
                                }
                            } catch (error) {
                                console.error('Error loading current amphers:', error);
                            }
                        }
                    }
                }
            };

            initializeAddressData();
        } else {
            // Reset states when not editing
            setSelectedCardProvince(null);
            setSelectedCardAmpher(null);
            setSelectedCardTumbol(null);
            setCardAmphers([]);
            setCardTumbols([]);
            setSelectedCurrentProvince(null);
            setSelectedCurrentAmpher(null);
            setSelectedCurrentTumbol(null);
            setCurrentAmphers([]);
            setCurrentTumbols([]);
        }
    }, [selectedPatient, isEditing, editFormData, loadProvinces, loadCardAmphersByProvince, loadCardTumbolsByAmpher, loadCurrentAmphersByProvince, loadCurrentTumbolsByAmpher]);

    // Handle CARD province change
    const handleCardProvinceChange = React.useCallback((event) => {
        const provinceCode = event.target.value;
        const province = cardProvinces.find(p => p.PROVINCE_CODE === provinceCode);

        setSelectedCardProvince(province || null);
        setSelectedCardAmpher(null);
        setSelectedCardTumbol(null);
        setCardAmphers([]);
        setCardTumbols([]);

        onFormChange('CARD_PROVINCE_CODE', provinceCode || '');
        onFormChange('CARD_AMPHER_CODE', '');
        onFormChange('CARD_TUMBOL_CODE', '');
        onFormChange('CARD_ZIPCODE', '');

        if (provinceCode) {
            loadCardAmphersByProvince(provinceCode);
        }
    }, [cardProvinces, loadCardAmphersByProvince, onFormChange]);

    // Handle CARD ampher change
    const handleCardAmpherChange = React.useCallback((event) => {
        const ampherCode = event.target.value;
        const ampher = cardAmphers.find(a => a.AMPHER_CODE === ampherCode);

        setSelectedCardAmpher(ampher || null);
        setSelectedCardTumbol(null);
        setCardTumbols([]);

        onFormChange('CARD_AMPHER_CODE', ampherCode || '');
        onFormChange('CARD_TUMBOL_CODE', '');
        onFormChange('CARD_ZIPCODE', '');

        if (ampherCode) {
            loadCardTumbolsByAmpher(ampherCode);
        }
    }, [cardAmphers, loadCardTumbolsByAmpher, onFormChange]);

    // Handle CARD tumbol change
    const handleCardTumbolChange = React.useCallback((event) => {
        const tumbolCode = event.target.value;
        const tumbol = cardTumbols.find(t => t.TUMBOL_CODE === tumbolCode);

        setSelectedCardTumbol(tumbol || null);

        const zipcode = tumbol ? (tumbol.zipcode || tumbol.ZIPCODE || '') : '';

        onFormChange('CARD_TUMBOL_CODE', tumbolCode || '');
        onFormChange('CARD_ZIPCODE', zipcode);
    }, [cardTumbols, onFormChange]);

    // Handle CURRENT province change
    const handleCurrentProvinceChange = React.useCallback((event) => {
        const provinceCode = event.target.value;
        const province = currentProvinces.find(p => p.PROVINCE_CODE === provinceCode);

        setSelectedCurrentProvince(province || null);
        setSelectedCurrentAmpher(null);
        setSelectedCurrentTumbol(null);
        setCurrentAmphers([]);
        setCurrentTumbols([]);

        onFormChange('PROVINCE_CODE', provinceCode || '');
        onFormChange('AMPHER_CODE', '');
        onFormChange('TUMBOL_CODE', '');
        onFormChange('ZIPCODE', '');

        if (provinceCode) {
            loadCurrentAmphersByProvince(provinceCode);
        }
    }, [currentProvinces, loadCurrentAmphersByProvince, onFormChange]);

    // Handle CURRENT ampher change
    const handleCurrentAmpherChange = React.useCallback((event) => {
        const ampherCode = event.target.value;
        const ampher = currentAmphers.find(a => a.AMPHER_CODE === ampherCode);

        setSelectedCurrentAmpher(ampher || null);
        setSelectedCurrentTumbol(null);
        setCurrentTumbols([]);

        onFormChange('AMPHER_CODE', ampherCode || '');
        onFormChange('TUMBOL_CODE', '');
        onFormChange('ZIPCODE', '');

        if (ampherCode) {
            loadCurrentTumbolsByAmpher(ampherCode);
        }
    }, [currentAmphers, loadCurrentTumbolsByAmpher, onFormChange]);

    // Handle CURRENT tumbol change
    const handleCurrentTumbolChange = React.useCallback((event) => {
        const tumbolCode = event.target.value;
        const tumbol = currentTumbols.find(t => t.TUMBOL_CODE === tumbolCode);

        setSelectedCurrentTumbol(tumbol || null);

        const zipcode = tumbol ? (tumbol.zipcode || tumbol.ZIPCODE || '') : '';

        onFormChange('TUMBOL_CODE', tumbolCode || '');
        onFormChange('ZIPCODE', zipcode);
    }, [currentTumbols, onFormChange]);
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

                            <Grid container spacing={2}>
                                {[
                                    { label: 'รหัส HN', field: 'HNCODE', readOnly: true },
                                    { label: 'เลขบัตรประชาชน', field: 'IDNO' },
                                    { label: 'วันเกิด', field: 'BDATE', type: 'date' },
                                    { label: 'คำนำหน้า', field: 'PRENAME', selectOptions: PRENAME_OPTIONS },
                                    { label: 'ชื่อ', field: 'NAME1' },
                                    { label: 'นามสกุล', field: 'SURNAME' },
                                    { label: 'เพศ', field: 'SEX', selectOptions: SEX_OPTIONS },
                                    { label: 'อายุ', field: 'AGE', type: 'number', transformDisplay: (value) => (value || value === 0 ? `${value} ปี` : '') },
                                    { label: 'กรุ๊ปเลือด', field: 'BLOOD_GROUP1' },
                                    { label: 'สถานภาพ', field: 'STATUS1', selectOptions: STATUS_OPTIONS },
                                    { label: 'สัญชาติ', field: 'NATIONAL1' },
                                    { label: 'ศาสนา', field: 'RELIGION1' },
                                    { label: 'อาชีพ', field: 'OCCUPATION1' },
                                    { label: 'เชื้อชาติ', field: 'ORIGIN1' }
                                ].map(({ label, field, type, selectOptions, readOnly, transformDisplay }) => (
                                    <Grid item xs={12} sm={6} key={field}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    color: '#64748b',
                                                    fontWeight: 600,
                                                    minWidth: 120
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
                                                        value={editFormData[field] || ''}
                                                        onChange={(e) => onFormChange(field, e.target.value)}
                                                        disabled={readOnly}
                                                        sx={{
                                                            flex: 1,
                                                            '& .MuiOutlinedInput-root': {
                                                                borderRadius: 2
                                                            }
                                                        }}
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
                                                        type={type || 'text'}
                                                        value={type === 'date' ? normalizeDateForInput(editFormData[field]) : (editFormData[field] || '')}
                                                        onChange={(e) => onFormChange(field, e.target.value)}
                                                        disabled={readOnly}
                                                        sx={{
                                                            flex: 1,
                                                            '& .MuiOutlinedInput-root': {
                                                                borderRadius: 2
                                                            }
                                                        }}
                                                    />
                                                )
                                            ) : (
                                                <Typography variant="body1" fontWeight={500} sx={{ color: '#1f2937', flex: 1 }}>
                                                    {transformDisplay
                                                        ? transformDisplay(selectedPatient[field])
                                                        : (type === 'date' && selectedPatient[field]
                                                            ? formatDateDisplay(selectedPatient[field])
                                                            : (selectedPatient[field] || 'ไม่มีข้อมูล'))}
                                                </Typography>
                                            )}
                                        </Box>
                                    </Grid>
                                ))}
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

                            <Grid container spacing={2}>
                                {[
                                    { label: 'น้ำหนัก (กก.)', field: 'WEIGHT1', type: 'number', transformDisplay: (value) => (value || value === 0 ? `${value} กก.` : '') },
                                    { label: 'ส่วนสูง (ซม.)', field: 'HIGH1', type: 'number', transformDisplay: (value) => (value || value === 0 ? `${value} ซม.` : '') },
                                    { label: 'โรคประจำตัว', field: 'DISEASE1', multiline: true, rows: 2, fullWidth: true },
                                    { label: 'แพ้ยา', field: 'DRUG_ALLERGY', multiline: true, rows: 2 },
                                    { label: 'แพ้อาหาร', field: 'FOOD_ALLERGIES', multiline: true, rows: 2 }
                                ].map(({ label, field, type, multiline, rows, transformDisplay, fullWidth }) => (
                                    <Grid item xs={12} sm={fullWidth ? 12 : 6} key={field}>
                                        <Box sx={{ display: 'flex', alignItems: multiline ? 'flex-start' : 'center', gap: 2 }}>
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    color: '#64748b',
                                                    fontWeight: 600,
                                                    minWidth: 120,
                                                    pt: multiline ? 1 : 0
                                                }}
                                            >
                                                {label}
                                            </Typography>
                                            {isEditing ? (
                                                <TextField
                                                    fullWidth
                                                    size="small"
                                                    type={type || 'text'}
                                                    multiline={multiline}
                                                    rows={rows || 1}
                                                    value={editFormData[field] || ''}
                                                    onChange={(e) => onFormChange(field, e.target.value)}
                                                    sx={{
                                                        flex: 1,
                                                        '& .MuiOutlinedInput-root': {
                                                            borderRadius: 2
                                                        }
                                                    }}
                                                />
                                            ) : (
                                                <Typography
                                                    variant="body1"
                                                    fontWeight={500}
                                                    sx={{
                                                        color: '#1f2937',
                                                        flex: 1,
                                                        whiteSpace: multiline ? 'pre-wrap' : 'normal'
                                                    }}
                                                >
                                                    {transformDisplay
                                                        ? transformDisplay(selectedPatient[field])
                                                        : (selectedPatient[field] || 'ไม่มีข้อมูล')}
                                                </Typography>
                                            )}
                                        </Box>
                                    </Grid>
                                ))}
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

                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                color: '#64748b',
                                                fontWeight: 600,
                                                minWidth: 120
                                            }}
                                        >
                                            เบอร์โทรศัพท์
                                        </Typography>
                                        {isEditing ? (
                                            <TextField
                                                fullWidth
                                                size="small"
                                                value={editFormData.TEL1 || ''}
                                                onChange={(event) => {
                                                    const value = event.target.value.replace(/\D/g, '').slice(0, 10);
                                                    onFormChange('TEL1', value);
                                                }}
                                                inputProps={{ maxLength: 10 }}
                                                placeholder="เฉพาะตัวเลข 10 หลัก"
                                                sx={{
                                                    flex: 1,
                                                    '& .MuiOutlinedInput-root': {
                                                        borderRadius: 2
                                                    }
                                                }}
                                            />
                                        ) : (
                                            <Typography variant="body1" fontWeight={500} sx={{ color: '#1f2937', flex: 1 }}>
                                                {selectedPatient.TEL1 || 'ไม่มีข้อมูล'}
                                            </Typography>
                                        )}
                                    </Box>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                color: '#64748b',
                                                fontWeight: 600,
                                                minWidth: 120
                                            }}
                                        >
                                            อีเมล
                                        </Typography>
                                        {isEditing ? (
                                            <TextField
                                                fullWidth
                                                size="small"
                                                type="email"
                                                value={editFormData.EMAIL1 || ''}
                                                onChange={(e) => onFormChange('EMAIL1', e.target.value)}
                                                sx={{
                                                    flex: 1,
                                                    '& .MuiOutlinedInput-root': {
                                                        borderRadius: 2
                                                    }
                                                }}
                                            />
                                        ) : (
                                            <Typography variant="body1" fontWeight={500} sx={{ color: '#1f2937', flex: 1 }}>
                                                {selectedPatient.EMAIL1 || 'ไม่มีข้อมูล'}
                                            </Typography>
                                        )}
                                    </Box>
                                </Grid>
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
                                <Home sx={{ color: '#4A9EFF' }} />
                                ที่อยู่ตามบัตรประชาชน
                            </Typography>
                            <Grid container spacing={2}>
                                {/* ที่อยู่ตามบัตร */}
                                <Grid item xs={12}>
                                    <Box>
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                color: '#64748b',
                                                textTransform: 'uppercase',
                                                fontWeight: 600,
                                                letterSpacing: 0.3,
                                                mb: 0.5,
                                                display: 'block'
                                            }}
                                        >
                                            ที่อยู่ตามบัตร
                                        </Typography>
                                        {isEditing ? (
                                            <TextField
                                                fullWidth
                                                size="small"
                                                multiline
                                                rows={2}
                                                value={editFormData.CARD_ADDR1 || ''}
                                                onChange={(e) => onFormChange('CARD_ADDR1', e.target.value)}
                                                sx={{
                                                    '& .MuiOutlinedInput-root': {
                                                        borderRadius: 2
                                                    }
                                                }}
                                            />
                                        ) : (
                                            <Typography variant="body1" fontWeight={500} sx={{ color: '#1f2937', mt: 0.5 }}>
                                                {selectedPatient.CARD_ADDR1 || 'ไม่มีข้อมูล'}
                                            </Typography>
                                        )}
                                    </Box>
                                </Grid>

                                {/* ตำบล */}
                                <Grid item xs={12} sm={6}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                color: '#64748b',
                                                fontWeight: 600,
                                                minWidth: 120
                                            }}
                                        >
                                            ตำบล
                                        </Typography>
                                        {isEditing ? (
                                            <TextField
                                                select
                                                fullWidth
                                                size="small"
                                                value={editFormData.CARD_TUMBOL_CODE || ''}
                                                onChange={handleCardTumbolChange}
                                                disabled={!selectedCardAmpher || cardTumbols.length === 0}
                                                sx={{
                                                    flex: 1,
                                                    '& .MuiOutlinedInput-root': {
                                                        borderRadius: 2
                                                    }
                                                }}
                                            >
                                                <MenuItem value="">
                                                    <em>-- เลือกตำบล/แขวง --</em>
                                                </MenuItem>
                                                {cardTumbols.map((tumbol) => (
                                                    <MenuItem key={tumbol.TUMBOL_CODE} value={tumbol.TUMBOL_CODE}>
                                                        {tumbol.TUMBOL_NAME}
                                                    </MenuItem>
                                                ))}
                                            </TextField>
                                        ) : (
                                            <Typography variant="body1" fontWeight={500} sx={{ color: '#1f2937', flex: 1 }}>
                                                {selectedPatient.CARD_TUMBOL_NAME || 'ไม่มีข้อมูล'}
                                            </Typography>
                                        )}
                                    </Box>
                                </Grid>

                                {/* อำเภอ */}
                                <Grid item xs={12} sm={6}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                color: '#64748b',
                                                fontWeight: 600,
                                                minWidth: 120
                                            }}
                                        >
                                            อำเภอ
                                        </Typography>
                                        {isEditing ? (
                                            <TextField
                                                select
                                                fullWidth
                                                size="small"
                                                value={editFormData.CARD_AMPHER_CODE || ''}
                                                onChange={handleCardAmpherChange}
                                                disabled={!selectedCardProvince || cardAmphers.length === 0}
                                                sx={{
                                                    flex: 1,
                                                    '& .MuiOutlinedInput-root': {
                                                        borderRadius: 2
                                                    }
                                                }}
                                            >
                                                <MenuItem value="">
                                                    <em>-- เลือกอำเภอ/เขต --</em>
                                                </MenuItem>
                                                {cardAmphers.map((ampher) => (
                                                    <MenuItem key={ampher.AMPHER_CODE} value={ampher.AMPHER_CODE}>
                                                        {ampher.AMPHER_NAME}
                                                    </MenuItem>
                                                ))}
                                            </TextField>
                                        ) : (
                                            <Typography variant="body1" fontWeight={500} sx={{ color: '#1f2937', flex: 1 }}>
                                                {selectedPatient.CARD_AMPHER_NAME || 'ไม่มีข้อมูล'}
                                            </Typography>
                                        )}
                                    </Box>
                                </Grid>

                                {/* จังหวัด */}
                                <Grid item xs={12} sm={6}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                color: '#64748b',
                                                fontWeight: 600,
                                                minWidth: 120
                                            }}
                                        >
                                            จังหวัด
                                        </Typography>
                                        {isEditing ? (
                                            <TextField
                                                select
                                                fullWidth
                                                size="small"
                                                value={editFormData.CARD_PROVINCE_CODE || ''}
                                                onChange={handleCardProvinceChange}
                                                sx={{
                                                    flex: 1,
                                                    '& .MuiOutlinedInput-root': {
                                                        borderRadius: 2
                                                    }
                                                }}
                                            >
                                                <MenuItem value="">
                                                    <em>-- เลือกจังหวัด --</em>
                                                </MenuItem>
                                                {cardProvinces.map((province) => (
                                                    <MenuItem key={province.PROVINCE_CODE} value={province.PROVINCE_CODE}>
                                                        {province.PROVINCE_NAME}
                                                    </MenuItem>
                                                ))}
                                            </TextField>
                                        ) : (
                                            <Typography variant="body1" fontWeight={500} sx={{ color: '#1f2937', flex: 1 }}>
                                                {selectedPatient.CARD_PROVINCE_NAME || 'ไม่มีข้อมูล'}
                                            </Typography>
                                        )}
                                    </Box>
                                </Grid>

                                {/* รหัสไปรษณีย์ */}
                                <Grid item xs={12} sm={6}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                color: '#64748b',
                                                fontWeight: 600,
                                                minWidth: 120
                                            }}
                                        >
                                            รหัสไปรษณีย์
                                        </Typography>
                                        {isEditing ? (
                                            <TextField
                                                fullWidth
                                                size="small"
                                                value={editFormData.CARD_ZIPCODE || ''}
                                                onChange={(e) => onFormChange('CARD_ZIPCODE', e.target.value)}
                                                placeholder="อัปเดตอัตโนมัติเมื่อเลือกตำบล"
                                                sx={{
                                                    flex: 1,
                                                    '& .MuiOutlinedInput-root': {
                                                        borderRadius: 2
                                                    }
                                                }}
                                            />
                                        ) : (
                                            <Typography variant="body1" fontWeight={500} sx={{ color: '#1f2937', flex: 1 }}>
                                                {selectedPatient.CARD_ZIPCODE || 'ไม่มีข้อมูล'}
                                            </Typography>
                                        )}
                                    </Box>
                                </Grid>
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
                                <LocationOn sx={{ color: '#4A9EFF' }} />
                                ที่อยู่ปัจจุบัน
                            </Typography>
                            <Grid container spacing={2}>
                                {/* ที่อยู่ปัจจุบัน */}
                                <Grid item xs={12}>
                                    <Box>
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                color: '#64748b',
                                                textTransform: 'uppercase',
                                                fontWeight: 600,
                                                letterSpacing: 0.3,
                                                mb: 0.5,
                                                display: 'block'
                                            }}
                                        >
                                            ที่อยู่ปัจจุบัน
                                        </Typography>
                                        {isEditing ? (
                                            <TextField
                                                fullWidth
                                                size="small"
                                                multiline
                                                rows={2}
                                                value={editFormData.ADDR1 || ''}
                                                onChange={(e) => onFormChange('ADDR1', e.target.value)}
                                                sx={{
                                                    '& .MuiOutlinedInput-root': {
                                                        borderRadius: 2
                                                    }
                                                }}
                                            />
                                        ) : (
                                            <Typography variant="body1" fontWeight={500} sx={{ color: '#1f2937', mt: 0.5 }}>
                                                {selectedPatient.ADDR1 || 'ไม่มีข้อมูล'}
                                            </Typography>
                                        )}
                                    </Box>
                                </Grid>

                                {/* ตำบล */}
                                <Grid item xs={12} sm={6}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                color: '#64748b',
                                                fontWeight: 600,
                                                minWidth: 120
                                            }}
                                        >
                                            ตำบล
                                        </Typography>
                                        {isEditing ? (
                                            <TextField
                                                select
                                                fullWidth
                                                size="small"
                                                value={editFormData.TUMBOL_CODE || ''}
                                                onChange={handleCurrentTumbolChange}
                                                disabled={!selectedCurrentAmpher || currentTumbols.length === 0}
                                                sx={{
                                                    flex: 1,
                                                    '& .MuiOutlinedInput-root': {
                                                        borderRadius: 2
                                                    }
                                                }}
                                            >
                                                <MenuItem value="">
                                                    <em>-- เลือกตำบล/แขวง --</em>
                                                </MenuItem>
                                                {currentTumbols.map((tumbol) => (
                                                    <MenuItem key={tumbol.TUMBOL_CODE} value={tumbol.TUMBOL_CODE}>
                                                        {tumbol.TUMBOL_NAME}
                                                    </MenuItem>
                                                ))}
                                            </TextField>
                                        ) : (
                                            <Typography variant="body1" fontWeight={500} sx={{ color: '#1f2937', flex: 1 }}>
                                                {selectedPatient.TUMBOL_NAME || 'ไม่มีข้อมูล'}
                                            </Typography>
                                        )}
                                    </Box>
                                </Grid>

                                {/* อำเภอ */}
                                <Grid item xs={12} sm={6}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                color: '#64748b',
                                                fontWeight: 600,
                                                minWidth: 120
                                            }}
                                        >
                                            อำเภอ
                                        </Typography>
                                        {isEditing ? (
                                            <TextField
                                                select
                                                fullWidth
                                                size="small"
                                                value={editFormData.AMPHER_CODE || ''}
                                                onChange={handleCurrentAmpherChange}
                                                disabled={!selectedCurrentProvince || currentAmphers.length === 0}
                                                sx={{
                                                    flex: 1,
                                                    '& .MuiOutlinedInput-root': {
                                                        borderRadius: 2
                                                    }
                                                }}
                                            >
                                                <MenuItem value="">
                                                    <em>-- เลือกอำเภอ/เขต --</em>
                                                </MenuItem>
                                                {currentAmphers.map((ampher) => (
                                                    <MenuItem key={ampher.AMPHER_CODE} value={ampher.AMPHER_CODE}>
                                                        {ampher.AMPHER_NAME}
                                                    </MenuItem>
                                                ))}
                                            </TextField>
                                        ) : (
                                            <Typography variant="body1" fontWeight={500} sx={{ color: '#1f2937', flex: 1 }}>
                                                {selectedPatient.AMPHER_NAME || 'ไม่มีข้อมูล'}
                                            </Typography>
                                        )}
                                    </Box>
                                </Grid>

                                {/* จังหวัด */}
                                <Grid item xs={12} sm={6}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                color: '#64748b',
                                                fontWeight: 600,
                                                minWidth: 120
                                            }}
                                        >
                                            จังหวัด
                                        </Typography>
                                        {isEditing ? (
                                            <TextField
                                                select
                                                fullWidth
                                                size="small"
                                                value={editFormData.PROVINCE_CODE || ''}
                                                onChange={handleCurrentProvinceChange}
                                                sx={{
                                                    flex: 1,
                                                    '& .MuiOutlinedInput-root': {
                                                        borderRadius: 2
                                                    }
                                                }}
                                            >
                                                <MenuItem value="">
                                                    <em>-- เลือกจังหวัด --</em>
                                                </MenuItem>
                                                {currentProvinces.map((province) => (
                                                    <MenuItem key={province.PROVINCE_CODE} value={province.PROVINCE_CODE}>
                                                        {province.PROVINCE_NAME}
                                                    </MenuItem>
                                                ))}
                                            </TextField>
                                        ) : (
                                            <Typography variant="body1" fontWeight={500} sx={{ color: '#1f2937', flex: 1 }}>
                                                {selectedPatient.PROVINCE_NAME || 'ไม่มีข้อมูล'}
                                            </Typography>
                                        )}
                                    </Box>
                                </Grid>

                                {/* รหัสไปรษณีย์ */}
                                <Grid item xs={12} sm={6}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                color: '#64748b',
                                                fontWeight: 600,
                                                minWidth: 120
                                            }}
                                        >
                                            รหัสไปรษณีย์
                                        </Typography>
                                        {isEditing ? (
                                            <TextField
                                                fullWidth
                                                size="small"
                                                value={editFormData.ZIPCODE || ''}
                                                onChange={(e) => onFormChange('ZIPCODE', e.target.value)}
                                                placeholder="อัปเดตอัตโนมัติเมื่อเลือกตำบล"
                                                sx={{
                                                    flex: 1,
                                                    '& .MuiOutlinedInput-root': {
                                                        borderRadius: 2
                                                    }
                                                }}
                                            />
                                        ) : (
                                            <Typography variant="body1" fontWeight={500} sx={{ color: '#1f2937', flex: 1 }}>
                                                {selectedPatient.ZIPCODE || 'ไม่มีข้อมูล'}
                                            </Typography>
                                        )}
                                    </Box>
                                </Grid>
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

                            <Grid container spacing={2}>
                                {[
                                    { label: 'บัตรการรักษา', field: 'TREATMENT_CARD' },
                                    { label: 'บัตรประกันสังคม', field: 'SOCIAL_CARD' },
                                    { label: 'บัตรทอง/บัตร UC', field: 'UCS_CARD' }
                                ].map(({ label, field }) => (
                                    <Grid item xs={12} sm={4} key={field}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    color: '#64748b',
                                                    fontWeight: 600,
                                                    minWidth: 120
                                                }}
                                            >
                                                {label}
                                            </Typography>
                                            {isEditing ? (
                                                <TextField
                                                    select
                                                    fullWidth
                                                    size="small"
                                                    value={editFormData[field] || ''}
                                                    onChange={(e) => onFormChange(field, e.target.value)}
                                                    sx={{
                                                        flex: 1,
                                                        '& .MuiOutlinedInput-root': {
                                                            borderRadius: 2
                                                        }
                                                    }}
                                                >
                                                    {BOOLEAN_OPTIONS.map((option) => (
                                                        <MenuItem key={option.value} value={option.value}>
                                                            {option.label}
                                                        </MenuItem>
                                                    ))}
                                                </TextField>
                                            ) : (
                                                <Typography variant="body1" fontWeight={500} sx={{ color: '#1f2937', flex: 1 }}>
                                                    {formatBooleanFlag(selectedPatient[field]) || 'ไม่มีข้อมูล'}
                                                </Typography>
                                            )}
                                        </Box>
                                    </Grid>
                                ))}
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
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [patientPage, setPatientPage] = useState(1);
    const [patientPagination, setPatientPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    });
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
    const [summaryDialogOpen, setSummaryDialogOpen] = useState(false);
    const [summaryRecord, setSummaryRecord] = useState(null);
    const [summaryDrugs, setSummaryDrugs] = useState([]);
    const [summaryLoading, setSummaryLoading] = useState(false);
    const [summaryVitals, setSummaryVitals] = useState(null);

    const handleTabChange = useCallback((event, newValue) => {
        setActiveTab(newValue);
    }, []);

    const handleHistorySearchChange = useCallback((value) => {
        setHistorySearch(value);
        setHistoryError('');
    }, []);

    // Helper function to get current month date range (ใช้เวลาไทย)
    const getCurrentMonthDateRange = useCallback(() => {
        // ✅ ใช้เวลาไทย (Asia/Bangkok timezone)
        const now = new Date();
        const thailandDateStr = new Intl.DateTimeFormat('en-CA', {
            timeZone: 'Asia/Bangkok',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).format(now);

        // thailandDateStr จะเป็นรูปแบบ YYYY-MM-DD
        const [year, month, day] = thailandDateStr.split('-').map(Number);

        // First day of current month (เวลาไทย)
        const dateFrom = `${year}-${String(month).padStart(2, '0')}-01`;

        // Last day of current month (เวลาไทย) - สร้าง Date object ใน timezone ไทย
        // ใช้วิธีสร้าง Date object สำหรับวันแรกของเดือนถัดไป แล้วลบ 1 วัน
        const nextMonth = month === 12 ? 1 : month + 1;
        const nextYear = month === 12 ? year + 1 : year;
        const firstDayNextMonth = new Date(`${nextYear}-${String(nextMonth).padStart(2, '0')}-01T00:00:00+07:00`);
        const lastDay = new Date(firstDayNextMonth);
        lastDay.setDate(lastDay.getDate() - 1);

        // Format เป็น YYYY-MM-DD จากเวลาไทย
        const dateTo = new Intl.DateTimeFormat('en-CA', {
            timeZone: 'Asia/Bangkok',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).format(lastDay);

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

    // Load patients function - ต้องประกาศก่อน useEffect ที่ใช้มัน
    const loadPatients = useCallback(async (page = 1, limit = 10) => {
        try {
            setLoading(true);
            const response = await PatientService.getAllPatients(page, limit);
            if (response.success) {
                setPatients(response.data);
                setFilteredPatients(response.data);

                // อัพเดท pagination info
                if (response.pagination) {
                    setPatientPagination(response.pagination);
                }

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
        // ถ้าไม่มีสรุปการรักษา ให้คืนค่าเป็นสตริงว่าง เพื่อไม่ให้แสดงข้อความ "ไม่มีข้อมูล"
        return '';
    }, []);

    // ฟังก์ชันเปิด Dialog สรุปการรักษาพร้อมดึงข้อมูลยา
    const handleViewSummary = useCallback(async (record) => {
        const treatment1 = getTreatmentSummary(record);
        const vno = record?.VNO || record?.VN;

        setSummaryRecord({
            ...record,
            TREATMENT1_TEXT: treatment1
        });
        setSummaryDialogOpen(true);
        setSummaryDrugs([]);
        setSummaryVitals(null);

        // ดึงข้อมูลยาพร้อม DXCODE, DXNAME_THAI และ Vital Signs ถ้ามี VNO
        if (vno) {
            try {
                setSummaryLoading(true);
                const response = await TreatmentService.getTreatmentByVNO(vno);

                if (response.success && response.data) {
                    const drugs = response.data.drugs || [];
                    
                    // Debug: เช็คว่าข้อมูลที่ได้มาจาก API มีอะไรบ้าง
                    console.log('🔍 Raw drugs from API:', drugs.length, 'items');
                    console.log('📋 Drugs data (first 10):', drugs.slice(0, 10).map(d => ({ 
                        DRUG_CODE: d.DRUG_CODE, 
                        QTY: d.QTY,
                        VNO: d.VNO 
                    })));
                    
                    // ✅ Deduplicate ตาม DRUG_CODE - เพราะ backend อาจส่ง duplicate มา
                    const drugMap = new Map();
                    drugs.forEach(drug => {
                        const drugCode = drug.DRUG_CODE;
                        if (drugCode && !drugMap.has(drugCode)) {
                            // เก็บแค่ตัวแรกที่เจอ
                            drugMap.set(drugCode, drug);
                        }
                    });
                    
                    const uniqueDrugs = Array.from(drugMap.values());
                    console.log('✅ After deduplicate by DRUG_CODE:', uniqueDrugs.length, 'unique drugs');
                    
                    // ✅ ดึงชื่อยาที่ถูกต้องจาก DrugService
                    const drugsWithCorrectNames = await Promise.all(
                        uniqueDrugs.map(async (drug) => {
                            const drugCode = drug.DRUG_CODE || '';
                            // เก็บค่าจาก drug เดิมไว้ก่อน (fallback)
                            let genericName = drug.GENERIC_NAME || '';
                            let tradeName = drug.TRADE_NAME || '';
                            
                            // ✅ ดึงชื่อยาที่ถูกต้องจาก DrugService - ดึงทุกครั้ง
                            if (drugCode) {
                                try {
                                    console.log(`🔍 Fetching drug details for ${drugCode}...`);
                                    const drugResponse = await DrugService.getDrugByCode(drugCode);
                                    console.log(`📦 DrugService response for ${drugCode}:`, drugResponse);
                                    
                                    if (drugResponse && drugResponse.success && drugResponse.data) {
                                        const fetchedDrug = drugResponse.data;
                                        console.log(`✅ Fetched drug data for ${drugCode}:`, {
                                            GENERIC_NAME: fetchedDrug.GENERIC_NAME,
                                            TRADE_NAME: fetchedDrug.TRADE_NAME,
                                            fullData: fetchedDrug
                                        });
                                        
                                        // ✅ ถ้า DrugService มีชื่อ ใช้ชื่อจาก DrugService (แม้จะเป็น empty string)
                                        // แต่ถ้าเป็น null/undefined ให้ใช้ค่าจาก drug เดิม
                                        if (fetchedDrug.GENERIC_NAME !== null && fetchedDrug.GENERIC_NAME !== undefined) {
                                            genericName = fetchedDrug.GENERIC_NAME;
                                        }
                                        if (fetchedDrug.TRADE_NAME !== null && fetchedDrug.TRADE_NAME !== undefined) {
                                            tradeName = fetchedDrug.TRADE_NAME;
                                        }
                                    } else {
                                        console.warn(`⚠️ DrugService.getDrugByCode(${drugCode}) failed:`, drugResponse);
                                        // ถ้า failed ก็ใช้ค่าจาก drug เดิม
                                    }
                                } catch (error) {
                                    console.error(`❌ Error fetching drug details for ${drugCode}:`, error);
                                    // ถ้า error ก็ใช้ค่าจาก drug เดิม
                                }
                            }
                            
                            // ✅ Final cleanup: ล้างชื่อที่เท่ากับ DRUG_CODE หรือขึ้นต้นด้วย "ยา "
                            // แต่ไม่ล้างถ้าเป็น empty string ธรรมดา (เพราะอาจจะมีใน DB แต่เป็น empty จริงๆ)
                            if (genericName && (
                                genericName.trim() === '' || 
                                genericName === drugCode || 
                                genericName.toLowerCase().startsWith('ยา '))) {
                                genericName = '';
                            }
                            if (tradeName && (
                                tradeName.trim() === '' || 
                                tradeName === drugCode || 
                                tradeName.toLowerCase().startsWith('ยา '))) {
                                tradeName = '';
                            }
                            
                            // Debug: log สำหรับ D0155
                            if (drugCode === 'D0155') {
                                console.log(`🔍 D0155 Final values:`, {
                                    genericName,
                                    tradeName,
                                    originalGeneric: drug.GENERIC_NAME,
                                    originalTrade: drug.TRADE_NAME
                                });
                            }
                            
                            return {
                                ...drug,
                                GENERIC_NAME: genericName,
                                TRADE_NAME: tradeName
                            };
                        })
                    );
                    
                    // Debug: เช็คข้อมูลก่อน set
                    console.log('✅ Final drugs before setSummaryDrugs:', drugsWithCorrectNames.length, 'items');
                    console.log('📊 Final drugs with names:', drugsWithCorrectNames.map(d => ({ 
                        DRUG_CODE: d.DRUG_CODE, 
                        GENERIC_NAME: d.GENERIC_NAME || '(empty)',
                        TRADE_NAME: d.TRADE_NAME || '(empty)',
                        QTY: d.QTY 
                    })));
                    
                    // เช็คยาที่ไม่มีชื่อ
                    const drugsWithoutNames = drugsWithCorrectNames.filter(d => 
                        (!d.GENERIC_NAME || d.GENERIC_NAME.trim() === '') && 
                        (!d.TRADE_NAME || d.TRADE_NAME.trim() === '')
                    );
                    if (drugsWithoutNames.length > 0) {
                        console.warn('⚠️ Drugs without names (will show as DRUG_CODE):', 
                            drugsWithoutNames.map(d => d.DRUG_CODE));
                    }
                    
                    setSummaryDrugs(drugsWithCorrectNames);

                    // อัพเดท DXCODE และ Vital Signs จาก treatment
                    if (response.data.treatment) {
                        const treatment = response.data.treatment;
                        setSummaryRecord(prev => ({
                            ...prev,
                            DXCODE: treatment.DXCODE || prev?.DXCODE
                        }));

                        // ดึง Vital Signs
                        const vitals = {
                            BP1: treatment.BP1,
                            BP2: treatment.BP2,
                            PR1: treatment.PR1,
                            BT1: treatment.BT1,
                            WEIGHT1: treatment.WEIGHT1,
                            HIGHT1: treatment.HIGHT1,
                            RR1: treatment.RR1,
                            SPO2: treatment.SPO2
                        };
                        setSummaryVitals(vitals);
                    }
                }
            } catch (error) {
                console.error('Error fetching treatment details:', error);
            } finally {
                setSummaryLoading(false);
            }
        }
    }, [getTreatmentSummary]);

    // ใช้ patientHistory แต่กรองเฉพาะรายการที่มีสรุปการรักษาเท่านั้น
    const filteredHistoryRecords = React.useMemo(() => {
        return patientHistory.filter((record) => {
            const summary = getTreatmentSummary(record);
            return summary && summary.toString().trim() !== '';
        });
    }, [patientHistory, getTreatmentSummary]);

    // เมื่อ patients เปลี่ยน ให้อัพเดท filteredPatients (ถ้าไม่มี search)
    useEffect(() => {
        if (!searchTerm.trim()) {
            setFilteredPatients(patients);
        }
        // ถ้ามี search term ไม่ต้องทำอะไร เพราะ handleSearch จะจัดการเอง
    }, [patients]);

    // Debounce search term
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 500); // 500ms delay

        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Auto search when debounced term changes
    useEffect(() => {
        if (debouncedSearchTerm.trim()) {
            const performSearch = async () => {
                try {
                    setLoading(true);
                    const response = await PatientService.searchPatients(debouncedSearchTerm.trim());
                    if (response.success) {
                        setFilteredPatients(response.data);
                        setPatientPagination({
                            page: 1,
                            limit: response.data.length,
                            total: response.data.length,
                            totalPages: 1
                        });
                        // Reset selected patient when searching
                        setSelectedPatient(null);
                        setEditFormData({});
                        setIsEditing(false);
                    }
                } catch (err) {
                    setError('เกิดข้อผิดพลาดในการค้นหา');
                } finally {
                    setLoading(false);
                }
            };
            performSearch();
        } else if (debouncedSearchTerm === '' && searchTerm === '') {
            // ถ้า search term เป็นค่าว่าง ให้ reset และโหลดข้อมูลใหม่
            setPatientPage(1);
            setSelectedPatient(null);
            setEditFormData({});
            setIsEditing(false);
            loadPatients(1, patientPagination.limit);
        }
    }, [debouncedSearchTerm, searchTerm, loadPatients, patientPagination.limit]);

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

    // Load patients only when manage tab is active (lazy loading for faster initial load)
    useEffect(() => {
        if (activeTab === 'manage' && !searchTerm) {
            loadPatients(patientPage, patientPagination.limit);
        }
    }, [activeTab, patientPage, searchTerm, loadPatients, patientPagination.limit]);

    const handleSearch = useCallback(async (term = null) => {
        const searchValue = term || debouncedSearchTerm || searchTerm;

        if (!searchValue || !searchValue.trim()) {
            // ถ้าไม่มี search term ให้ reset ไปหน้าแรก
            setPatientPage(1);
            setFilteredPatients(patients);
            return;
        }

        try {
            setLoading(true);
            const response = await PatientService.searchPatients(searchValue.trim());
            if (response.success) {
                setFilteredPatients(response.data);
                // เมื่อ search ไม่ใช้ pagination
                setPatientPagination({
                    page: 1,
                    limit: response.data.length,
                    total: response.data.length,
                    totalPages: 1
                });
            }
        } catch (err) {
            setError('เกิดข้อผิดพลาดในการค้นหา');
        } finally {
            setLoading(false);
        }
    }, [debouncedSearchTerm, searchTerm, patients]);

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
            setError('');
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
            } else {
                setError(response.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
            }
        } catch (err) {
            console.error('Error saving patient:', err);
            const errorMessage = err.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล';
            if (errorMessage.includes('หมดเวลา') || errorMessage.includes('timeout') || errorMessage.includes('TIMED_OUT')) {
                setError('การเชื่อมต่อหมดเวลา กรุณาลองใหม่อีกครั้ง');
            } else if (errorMessage.includes('Failed to fetch') || errorMessage.includes('network')) {
                setError('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต');
            } else {
                setError(errorMessage);
            }
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
                                            onClick={() => loadPatients(patientPage, patientPagination.limit)}
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
                                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                    <TextField
                                        placeholder="ค้นหาชื่อ, นามสกุล, HN, หรือเลขบัตรประชาชน..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        fullWidth
                                        size="small"
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <Search sx={{ color: '#64748b', fontSize: 20 }} />
                                                </InputAdornment>
                                            ),
                                            endAdornment: searchTerm && (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => {
                                                            setSearchTerm('');
                                                            setDebouncedSearchTerm('');
                                                            setPatientPage(1);
                                                            setSelectedPatient(null);
                                                            setEditFormData({});
                                                            setIsEditing(false);
                                                            // โหลดข้อมูลใหม่
                                                            loadPatients(1, patientPagination.limit);
                                                        }}
                                                        sx={{
                                                            color: '#dc2626',
                                                            '&:hover': {
                                                                backgroundColor: '#fee2e2'
                                                            }
                                                        }}
                                                    >
                                                        <CancelOutlined fontSize="small" />
                                                    </IconButton>
                                                </InputAdornment>
                                            )
                                        }}
                                        sx={{
                                            flex: 1,
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: 2,
                                                backgroundColor: '#f8fafc',
                                                '&:hover': {
                                                    backgroundColor: '#f1f5f9'
                                                },
                                                '&.Mui-focused': {
                                                    backgroundColor: '#ffffff',
                                                    boxShadow: '0 0 0 3px rgba(74, 158, 255, 0.1)'
                                                }
                                            }
                                        }}
                                    />
                                </Box>
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
                                    <>
                                        {filteredPatients.map((patient) => (
                                            <PatientCard
                                                key={patient.HNCODE}
                                                patient={patient}
                                                isSelected={selectedPatient?.HNCODE === patient.HNCODE}
                                                onSelect={handlePatientSelect}
                                            />
                                        ))}

                                        {/* Pagination Controls - แสดงเฉพาะเมื่อไม่มีการ search */}
                                        {!searchTerm && patientPagination.totalPages > 1 && (
                                            <Paper
                                                elevation={0}
                                                sx={{
                                                    mt: 2,
                                                    p: 2,
                                                    backgroundColor: '#f8fafc',
                                                    border: '1px solid #e2e8f0',
                                                    borderRadius: 3
                                                }}
                                            >
                                                <Box
                                                    sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'space-between',
                                                        flexWrap: 'wrap',
                                                        gap: 2
                                                    }}
                                                >
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Typography
                                                            variant="body2"
                                                            sx={{
                                                                color: '#64748b',
                                                                fontWeight: 500
                                                            }}
                                                        >
                                                            แสดง
                                                        </Typography>
                                                        <Chip
                                                            label={`${((patientPagination.page - 1) * patientPagination.limit) + 1}-${Math.min(patientPagination.page * patientPagination.limit, patientPagination.total)}`}
                                                            size="small"
                                                            sx={{
                                                                backgroundColor: '#e3f2fd',
                                                                color: '#1e40af',
                                                                fontWeight: 600,
                                                                height: 24
                                                            }}
                                                        />
                                                        <Typography
                                                            variant="body2"
                                                            sx={{
                                                                color: '#64748b',
                                                                fontWeight: 500
                                                            }}
                                                        >
                                                            จากทั้งหมด
                                                        </Typography>
                                                        <Chip
                                                            label={patientPagination.total.toLocaleString()}
                                                            size="small"
                                                            sx={{
                                                                backgroundColor: '#4A9EFF',
                                                                color: '#ffffff',
                                                                fontWeight: 600,
                                                                height: 24
                                                            }}
                                                        />
                                                        <Typography
                                                            variant="body2"
                                                            sx={{
                                                                color: '#64748b',
                                                                fontWeight: 500
                                                            }}
                                                        >
                                                            รายการ
                                                        </Typography>
                                                    </Box>

                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => setPatientPage(1)}
                                                            disabled={patientPagination.page <= 1 || loading}
                                                            sx={{
                                                                backgroundColor: patientPagination.page <= 1 ? 'transparent' : '#f1f5f9',
                                                                color: patientPagination.page <= 1 ? '#cbd5e1' : '#4A9EFF',
                                                                '&:hover': {
                                                                    backgroundColor: patientPagination.page <= 1 ? 'transparent' : '#e2e8f0'
                                                                },
                                                                '&:disabled': {
                                                                    backgroundColor: 'transparent',
                                                                    color: '#cbd5e1'
                                                                }
                                                            }}
                                                        >
                                                            <KeyboardArrowLeft />
                                                            <KeyboardArrowLeft sx={{ ml: -1.5 }} />
                                                        </IconButton>

                                                        <IconButton
                                                            size="small"
                                                            onClick={() => {
                                                                const newPage = patientPagination.page - 1;
                                                                setPatientPage(newPage);
                                                            }}
                                                            disabled={patientPagination.page <= 1 || loading}
                                                            sx={{
                                                                backgroundColor: patientPagination.page <= 1 ? 'transparent' : '#f1f5f9',
                                                                color: patientPagination.page <= 1 ? '#cbd5e1' : '#4A9EFF',
                                                                '&:hover': {
                                                                    backgroundColor: patientPagination.page <= 1 ? 'transparent' : '#e2e8f0'
                                                                },
                                                                '&:disabled': {
                                                                    backgroundColor: 'transparent',
                                                                    color: '#cbd5e1'
                                                                }
                                                            }}
                                                        >
                                                            <KeyboardArrowLeft />
                                                        </IconButton>

                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mx: 1 }}>
                                                            <TextField
                                                                size="small"
                                                                value={patientPagination.page}
                                                                onChange={(e) => {
                                                                    const page = parseInt(e.target.value);
                                                                    if (page >= 1 && page <= patientPagination.totalPages) {
                                                                        setPatientPage(page);
                                                                    }
                                                                }}
                                                                inputProps={{
                                                                    style: {
                                                                        textAlign: 'center',
                                                                        padding: '4px 8px',
                                                                        width: '50px',
                                                                        fontWeight: 600
                                                                    },
                                                                    min: 1,
                                                                    max: patientPagination.totalPages
                                                                }}
                                                                sx={{
                                                                    '& .MuiOutlinedInput-root': {
                                                                        borderRadius: 2,
                                                                        backgroundColor: '#ffffff',
                                                                        '& fieldset': {
                                                                            borderColor: '#e2e8f0'
                                                                        },
                                                                        '&:hover fieldset': {
                                                                            borderColor: '#4A9EFF'
                                                                        },
                                                                        '&.Mui-focused fieldset': {
                                                                            borderColor: '#4A9EFF',
                                                                            borderWidth: 2
                                                                        }
                                                                    }
                                                                }}
                                                            />
                                                            <Typography variant="body2" sx={{ color: '#64748b', mx: 0.5 }}>
                                                                /
                                                            </Typography>
                                                            <Typography
                                                                variant="body2"
                                                                sx={{
                                                                    color: '#1e293b',
                                                                    fontWeight: 600,
                                                                    minWidth: '30px',
                                                                    textAlign: 'center'
                                                                }}
                                                            >
                                                                {patientPagination.totalPages}
                                                            </Typography>
                                                        </Box>

                                                        <IconButton
                                                            size="small"
                                                            onClick={() => {
                                                                const newPage = patientPagination.page + 1;
                                                                setPatientPage(newPage);
                                                            }}
                                                            disabled={patientPagination.page >= patientPagination.totalPages || loading}
                                                            sx={{
                                                                backgroundColor: patientPagination.page >= patientPagination.totalPages ? 'transparent' : '#f1f5f9',
                                                                color: patientPagination.page >= patientPagination.totalPages ? '#cbd5e1' : '#4A9EFF',
                                                                '&:hover': {
                                                                    backgroundColor: patientPagination.page >= patientPagination.totalPages ? 'transparent' : '#e2e8f0'
                                                                },
                                                                '&:disabled': {
                                                                    backgroundColor: 'transparent',
                                                                    color: '#cbd5e1'
                                                                }
                                                            }}
                                                        >
                                                            <KeyboardArrowRight />
                                                        </IconButton>

                                                        <IconButton
                                                            size="small"
                                                            onClick={() => setPatientPage(patientPagination.totalPages)}
                                                            disabled={patientPagination.page >= patientPagination.totalPages || loading}
                                                            sx={{
                                                                backgroundColor: patientPagination.page >= patientPagination.totalPages ? 'transparent' : '#f1f5f9',
                                                                color: patientPagination.page >= patientPagination.totalPages ? '#cbd5e1' : '#4A9EFF',
                                                                '&:hover': {
                                                                    backgroundColor: patientPagination.page >= patientPagination.totalPages ? 'transparent' : '#e2e8f0'
                                                                },
                                                                '&:disabled': {
                                                                    backgroundColor: 'transparent',
                                                                    color: '#cbd5e1'
                                                                }
                                                            }}
                                                        >
                                                            <KeyboardArrowRight />
                                                            <KeyboardArrowRight sx={{ ml: -1.5 }} />
                                                        </IconButton>
                                                    </Box>
                                                </Box>
                                            </Paper>
                                        )}
                                    </>
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
                                                            <TableCell sx={{ maxWidth: 220 }}>
                                                                {treatment1 ? (
                                                                    <Button
                                                                        variant="outlined"
                                                                        size="small"
                                                                        onClick={() => handleViewSummary(record)}
                                                                        sx={{ borderRadius: 2, textTransform: 'none', fontSize: 12 }}
                                                                    >
                                                                        ดูสรุปการรักษา
                                                                    </Button>
                                                                ) : (
                                                                    <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                                                                        -
                                                                    </Typography>
                                                                )}
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
                                                sx={{ borderRadius: 2 }} ก
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

            {/* Treatment Summary Dialog */}
            <Dialog
                open={summaryDialogOpen}
                onClose={() => {
                    setSummaryDialogOpen(false);
                    setSummaryDrugs([]);
                    setSummaryVitals(null);
                }}
                maxWidth="lg"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        backgroundColor: '#F8FAFC',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                    }
                }}
            >
                <DialogTitle sx={{
                    backgroundColor: '#fff',
                    borderBottom: '1px solid #E2E8F0',
                    py: 2,
                    px: 3
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{
                                width: 48, height: 48, borderRadius: '12px',
                                backgroundColor: '#EFF6FF', color: '#3B82F6',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                flexShrink: 0
                            }}>
                                <LocalHospital fontSize="medium" />
                            </Box>
                            <Box>
                                <Typography variant="h6" sx={{ fontWeight: 700, color: '#0F172A', lineHeight: 1.2 }}>
                                    สรุปการรักษา
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#64748B' }}>
                                    Medical Treatment Summary
                                </Typography>
                            </Box>
                        </Box>

                        {summaryRecord && (
                            <Chip
                                label={`VN: ${summaryRecord?.VNO || summaryRecord?.VN || '-'}`}
                                size="small"
                                sx={{
                                    borderRadius: 2,
                                    fontWeight: 600,
                                    bgcolor: '#F1F5F9',
                                    color: '#64748B',
                                    border: '1px solid #E2E8F0'
                                }}
                            />
                        )}
                    </Box>
                </DialogTitle>

                <DialogContent sx={{ p: 3, backgroundColor: '#F8FAFC' }}>
                    {summaryRecord && (
                        <Box>
                            {summaryLoading ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                                    <CircularProgress size={40} thickness={4} sx={{ color: '#3B82F6' }} />
                                </Box>
                            ) : (
                                <Grid container spacing={3}>

                                    {/* --- ZONE 1: Patient Information --- */}
                                    <Grid item xs={12}>
                                        <Paper elevation={0} sx={{
                                            p: 3,
                                            borderRadius: 3,
                                            border: '1px solid #E2E8F0',
                                            bgcolor: '#FFFFFF',
                                            display: 'flex',
                                            flexDirection: { xs: 'column', sm: 'row' },
                                            justifyContent: 'space-between',
                                            alignItems: { xs: 'flex-start', sm: 'center' },
                                            gap: 2,
                                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                                        }}>
                                            <Box>
                                                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, letterSpacing: 0.5 }}>
                                                    ข้อมูลผู้ป่วย (PATIENT INFO)
                                                </Typography>
                                                <Typography variant="h5" sx={{ fontWeight: 700, color: '#1E293B', mt: 0.5 }}>
                                                    {[summaryRecord?.PRENAME, summaryRecord?.NAME1, summaryRecord?.SURNAME]
                                                        .filter(Boolean)
                                                        .join(' ')}
                                                </Typography>
                                                <Box sx={{ display: 'flex', gap: 3, mt: 1.5, flexWrap: 'wrap' }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#94A3B8' }}>HN:</Typography>
                                                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155' }}>
                                                            {summaryRecord?.HNNO || summaryRecord?.HNCODE || '-'}
                                                        </Typography>
                                                    </Box>
                                                    <Box sx={{ width: 1, height: 20, bgcolor: '#E2E8F0', display: { xs: 'none', sm: 'block' } }} />
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#94A3B8' }}>วันที่:</Typography>
                                                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155' }}>
                                                            {formatHistoryDate(summaryRecord)}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </Box>
                                            <Chip
                                                label={summaryRecord?.STATUS1 || 'สถานะปกติ'}
                                                sx={{
                                                    borderRadius: '8px',
                                                    backgroundColor: '#DCFCE7',
                                                    color: '#166534',
                                                    fontWeight: 700,
                                                    height: 32,
                                                    px: 1
                                                }}
                                            />
                                        </Paper>
                                    </Grid>

                                    {/* --- ZONE 2: Vital Signs --- */}
                                    {summaryVitals && (
                                        <Grid item xs={12}>
                                            <Typography variant="subtitle2" sx={{ mb: 1.5, color: '#64748B', fontWeight: 700, ml: 0.5, mt: 1 }}>
                                                สัญญาณชีพ (VITAL SIGNS)
                                            </Typography>
                                            <Grid container spacing={2}>
                                                {/* BP */}
                                                <Grid item xs={6} sm={4} md={2}>
                                                    <Paper sx={{ p: 2, borderRadius: 3, border: '1px solid #E2E8F0', bgcolor: '#fff', height: '100%', minHeight: 100 }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                            <MonitorHeart sx={{ fontSize: 18, color: '#EF4444' }} />
                                                            <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748B' }}>ความดัน (BP)</Typography>
                                                        </Box>
                                                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#0F172A' }}>
                                                            {summaryVitals.BP1 && summaryVitals.BP2 ? `${summaryVitals.BP1}/${summaryVitals.BP2}` : summaryVitals.BP1 || '-'}
                                                        </Typography>
                                                        <Typography variant="caption" sx={{ color: '#94A3B8' }}>mmHg</Typography>
                                                    </Paper>
                                                </Grid>
                                                {/* Pulse */}
                                                <Grid item xs={6} sm={4} md={2}>
                                                    <Paper sx={{ p: 2, borderRadius: 3, border: '1px solid #E2E8F0', bgcolor: '#fff', height: '100%', minHeight: 100 }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                            <Favorite sx={{ fontSize: 18, color: '#F43F5E' }} />
                                                            <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748B' }}>ชีพจร (Pulse)</Typography>
                                                        </Box>
                                                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#0F172A' }}>
                                                            {summaryVitals.PR1 || '-'}
                                                        </Typography>
                                                        <Typography variant="caption" sx={{ color: '#94A3B8' }}>ครั้ง/นาที</Typography>
                                                    </Paper>
                                                </Grid>
                                                {/* Temp */}
                                                <Grid item xs={6} sm={4} md={2}>
                                                    <Paper sx={{ p: 2, borderRadius: 3, border: '1px solid #E2E8F0', bgcolor: '#fff', height: '100%', minHeight: 100 }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                            <Thermostat sx={{ fontSize: 18, color: '#F59E0B' }} />
                                                            <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748B' }}>อุณหภูมิ (Temp)</Typography>
                                                        </Box>
                                                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#0F172A' }}>
                                                            {summaryVitals.BT1 || '-'}
                                                        </Typography>
                                                        <Typography variant="caption" sx={{ color: '#94A3B8' }}>°C</Typography>
                                                    </Paper>
                                                </Grid>
                                                {/* SpO2 */}
                                                <Grid item xs={6} sm={4} md={2}>
                                                    <Paper sx={{ p: 2, borderRadius: 3, border: '1px solid #E2E8F0', bgcolor: '#fff', height: '100%', minHeight: 100 }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                            <Air sx={{ fontSize: 18, color: '#3B82F6' }} />
                                                            <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748B' }}>ออกซิเจน (SpO2)</Typography>
                                                        </Box>
                                                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#0F172A' }}>
                                                            {summaryVitals.SPO2 || '-'}
                                                        </Typography>
                                                        <Typography variant="caption" sx={{ color: '#94A3B8' }}>%</Typography>
                                                    </Paper>
                                                </Grid>
                                                {/* Body Stats */}
                                                <Grid item xs={12} sm={8} md={4}>
                                                    <Paper sx={{ p: 2, borderRadius: 3, border: '1px solid #E2E8F0', bgcolor: '#fff', height: '100%', minHeight: 100, display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
                                                        <Box>
                                                            <Typography variant="caption" sx={{ display: 'block', color: '#64748B', fontWeight: 600 }}>น้ำหนัก</Typography>
                                                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#0F172A', display: 'inline' }}>{summaryVitals.WEIGHT1 || '-'}</Typography>
                                                            <Typography variant="caption" sx={{ color: '#94A3B8', ml: 0.5 }}>กก.</Typography>
                                                        </Box>
                                                        <Divider orientation="vertical" flexItem sx={{ height: 40, alignSelf: 'center' }} />
                                                        <Box>
                                                            <Typography variant="caption" sx={{ display: 'block', color: '#64748B', fontWeight: 600 }}>ส่วนสูง</Typography>
                                                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#0F172A', display: 'inline' }}>{summaryVitals.HIGHT1 || '-'}</Typography>
                                                            <Typography variant="caption" sx={{ color: '#94A3B8', ml: 0.5 }}>ซม.</Typography>
                                                        </Box>
                                                    </Paper>
                                                </Grid>
                                            </Grid>
                                        </Grid>
                                    )}

                                    {/* --- ZONE 3: Diagnosis & Treatment --- */}
                                    <Grid item xs={12}>
                                        <Typography variant="subtitle2" sx={{ mb: 1.5, color: '#64748B', fontWeight: 700, ml: 0.5, mt: 4 }}>
                                            การวินิจฉัยและการรักษา
                                        </Typography>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12} md={4}>
                                                <Paper sx={{
                                                    p: 3,
                                                    borderRadius: 3,
                                                    border: '1px solid #DBEAFE',
                                                    bgcolor: '#EFF6FF',
                                                    height: '100%',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    // justifyContent: 'center'
                                                }}>
                                                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#3B82F6', mb: 1, letterSpacing: 1 }}>
                                                        DX
                                                    </Typography>
                                                    <Typography variant="h3" sx={{ fontWeight: 800, color: '#1E40AF', mb: 0.5 }}>
                                                        {summaryRecord?.DXCODE || '-'}
                                                    </Typography>
                                                </Paper>
                                            </Grid>
                                            <Grid item xs={12} md={8}>
                                                <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid #E2E8F0', bgcolor: '#fff', height: '100%' }}>
                                                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A', mb: 2 }}>
                                                        บันทึกการรักษา
                                                    </Typography>
                                                    <Box sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: 2, border: '1px dashed #CBD5E1' }}>
                                                        <Typography variant="body1" sx={{ color: '#334155', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                                                            {summaryRecord.TREATMENT1_TEXT || 'ไม่มีบันทึกการรักษา'}
                                                        </Typography>
                                                    </Box>
                                                </Paper>
                                            </Grid>
                                        </Grid>
                                    </Grid>

                                    {/* --- ZONE 4: Prescriptions --- */}
                                    <Grid item xs={12}>
                                        <Typography variant="subtitle2" sx={{ mb: 1.5, color: '#64748B', fontWeight: 700, ml: 0.5, mt: 6 }}>
                                            รายการยาเวชภัณฑ์
                                        </Typography>
                                        <Paper sx={{ borderRadius: 3, border: '1px solid #E2E8F0', overflow: 'hidden', bgcolor: '#fff' }}>
                                            {summaryDrugs.length === 0 ? (
                                                <Box sx={{ p: 4, textAlign: 'center' }}>
                                                    <Typography variant="body2" color="text.secondary">ไม่มีรายการยา (No Prescriptions)</Typography>
                                                </Box>
                                            ) : (
                                                <>
                                                    <TableContainer>
                                                        <Table size="small">
                                                            <TableHead>
                                                                <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                                                                    <TableCell sx={{ color: '#64748B', fontWeight: 600, py: 2, width: '50px' }}>ลำดับ</TableCell>
                                                                    <TableCell sx={{ color: '#64748B', fontWeight: 600 }}>ชื่อยา</TableCell>
                                                                    <TableCell align="right" sx={{ color: '#64748B', fontWeight: 600, width: '100px' }}>จำนวน</TableCell>
                                                                    <TableCell sx={{ color: '#64748B', fontWeight: 600 }}>วิธีการใช้</TableCell>
                                                                </TableRow>
                                                            </TableHead>
                                                            <TableBody>
                                                                {summaryDrugs.map((drug, index) => {
                                                                    const genericName = drug.GENERIC_NAME || '';
                                                                    const tradeName = drug.TRADE_NAME || '';
                                                                    const drugCode = drug.DRUG_CODE || '';
                                                                    
                                                                    // สร้าง array ของชื่อยาที่จะแสดง โดยกรองค่าที่ไม่ถูกต้อง
                                                                    const displayParts = [];
                                                                    if (genericName && 
                                                                        genericName.trim() !== '' &&
                                                                        genericName !== drugCode && 
                                                                        !genericName.toLowerCase().startsWith('ยา ')) {
                                                                        displayParts.push(genericName.trim());
                                                                    }
                                                                    if (tradeName && 
                                                                        tradeName.trim() !== '' &&
                                                                        tradeName !== drugCode && 
                                                                        !tradeName.toLowerCase().startsWith('ยา ')) {
                                                                        displayParts.push(tradeName.trim());
                                                                    }
                                                                    // เพิ่ม DRUG_CODE เสมอ (เป็น fallback)
                                                                    if (drugCode && !displayParts.includes(drugCode)) {
                                                                        displayParts.push(drugCode);
                                                                    }
                                                                    
                                                                    const displayName = displayParts.length > 0 
                                                                        ? displayParts.join(' / ') 
                                                                        : drugCode || '-';
                                                                    
                                                                    // แสดง QTY อย่างง่าย
                                                                    const qtyValue = drug.QTY || '0';
                                                                    const displayQty = typeof qtyValue === 'string' 
                                                                        ? qtyValue.trim().split(/\s+/)[0] 
                                                                        : qtyValue.toString();
                                                                    const unitName = drug.UNIT_NAME || '';
                                                                    const qtyDisplay = unitName ? `${displayQty} ${unitName}` : displayQty;
                                                                    
                                                                    return (
                                                                    <TableRow key={`${drugCode}-${index}`} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                                                        <TableCell sx={{ color: '#94A3B8' }}>{index + 1}</TableCell>
                                                                        <TableCell>
                                                                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155' }}>
                                                                                {displayName}
                                                                            </Typography>
                                                                        </TableCell>
                                                                        <TableCell align="right" sx={{ color: '#334155' }}>
                                                                            {qtyDisplay}
                                                                        </TableCell>
                                                                        <TableCell sx={{ color: '#475569', maxWidth: 200 }}>
                                                                            {drug.eat1 || drug.NOTE1 || drug.TIME1 || '-'}
                                                                        </TableCell>
                                                                    </TableRow>
                                                                    );
                                                                })}
                                                            </TableBody>
                                                        </Table>
                                                    </TableContainer>
                                                </>
                                            )}
                                        </Paper>
                                    </Grid>

                                </Grid>
                            )}
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 3, bgcolor: '#F8FAFC', borderTop: '1px solid #F1F5F9' }}>
                    <Button
                        onClick={() => {
                            setSummaryDialogOpen(false);
                            setSummaryDrugs([]);
                            setSummaryVitals(null);
                        }}
                        variant="outlined"
                        sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 600,
                            color: '#64748B',
                            borderColor: '#CBD5E1',
                            '&:hover': {
                                borderColor: '#94A3B8',
                                bgcolor: '#F1F5F9'
                            }
                        }}
                    >
                        ปิดหน้าต่าง
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default PatientManagement;