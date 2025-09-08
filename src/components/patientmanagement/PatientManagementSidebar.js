import React, { useState, useEffect } from 'react';
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
    Divider,
    InputAdornment,
    CircularProgress,
    Tooltip,
    Paper
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
    LocalHospital
} from '@mui/icons-material';
import PatientService from '../../services/patientService';

const PatientManagementComponent = () => {
    const [patients, setPatients] = useState([]);
    const [filteredPatients, setFilteredPatients] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [editFormData, setEditFormData] = useState({});

    useEffect(() => {
        loadPatients();
    }, []);

    useEffect(() => {
        if (searchTerm) {
            handleSearch();
        } else {
            setFilteredPatients(patients);
        }
    }, [searchTerm, patients]);

    const loadPatients = async () => {
        try {
            setLoading(true);
            const response = await PatientService.getAllPatients();
            if (response.success) {
                setPatients(response.data);
                setFilteredPatients(response.data);
            }
        } catch (err) {
            setError('ไม่สามารถโหลดข้อมูลผู้ป่วยได้');
        } finally {
            setLoading(false);
        }
    };

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

    const handlePatientSelect = (patient) => {
        setSelectedPatient(patient);
        setIsEditing(false);
        setEditFormData(patient);
    };

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditFormData(selectedPatient);
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            const response = await PatientService.updatePatient(selectedPatient.HNCODE, editFormData);
            
            if (response.success) {
                await loadPatients();
                setSelectedPatient(editFormData);
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
        if (!window.confirm(`คุณต้องการลบข้อมูลผู้ป่วย ${selectedPatient.PRENAME} ${selectedPatient.NAME1} ${selectedPatient.SURNAME} หรือไม่?`)) {
            return;
        }

        try {
            setLoading(true);
            const response = await PatientService.deletePatient(selectedPatient.HNCODE);
            
            if (response.success) {
                await loadPatients();
                setSelectedPatient(null);
                setError('');
            }
        } catch (err) {
            setError('เกิดข้อผิดพลาดในการลบข้อมูล');
        } finally {
            setLoading(false);
        }
    };

    const getAvatarColor = (sex) => {
        return sex === 'หญิง' ? '#EC7B99' : '#4A9EFF';
    };

    const PatientCard = ({ patient, isSelected }) => (
        <Card
            onClick={() => handlePatientSelect(patient)}
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
    );

    const PatientDetailPanel = () => {
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
                            เลือกผู้ป่วยเพื่อดูข้อมูล
                        </Typography>
                    </Box>
                </Box>
            );
        }

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
                                        onClick={handleEdit}
                                        sx={{ borderRadius: 2 }}
                                    >
                                        แก้ไข
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        color="error"
                                        startIcon={<Delete />}
                                        onClick={handleDelete}
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
                                        onClick={handleCancelEdit}
                                        sx={{ borderRadius: 2 }}
                                    >
                                        ยกเลิก
                                    </Button>
                                    <Button
                                        variant="contained"
                                        startIcon={<Save />}
                                        onClick={handleSave}
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
                        {/* Basic Information */}
                        <Grid item xs={12}>
                            <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0' }}>
                                <Typography variant="h6" fontWeight={600} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Person sx={{ color: '#4A9EFF' }} />
                                    ข้อมูลพื้นฐาน
                                </Typography>
                                
                                <Grid container spacing={3}>
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="caption" color="textSecondary">เลขบัตรประชาชน</Typography>
                                        {isEditing ? (
                                            <TextField
                                                fullWidth
                                                size="small"
                                                value={editFormData.IDNO || ''}
                                                onChange={(e) => setEditFormData(prev => ({ ...prev, IDNO: e.target.value }))}
                                                sx={{ mt: 1 }}
                                            />
                                        ) : (
                                            <Typography variant="body1" fontWeight={500}>{selectedPatient.IDNO}</Typography>
                                        )}
                                    </Grid>
                                    
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="caption" color="textSecondary">คำนำหน้า</Typography>
                                        {isEditing ? (
                                            <TextField
                                                select
                                                fullWidth
                                                size="small"
                                                value={editFormData.PRENAME || 'นาย'}
                                                onChange={(e) => setEditFormData(prev => ({ ...prev, PRENAME: e.target.value }))}
                                                sx={{ mt: 1 }}
                                                SelectProps={{ native: true }}
                                            >
                                                <option value="นาย">นาย</option>
                                                <option value="นาง">นาง</option>
                                                <option value="นางสาว">นางสาว</option>
                                            </TextField>
                                        ) : (
                                            <Typography variant="body1" fontWeight={500}>{selectedPatient.PRENAME}</Typography>
                                        )}
                                    </Grid>

                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="caption" color="textSecondary">ชื่อ</Typography>
                                        {isEditing ? (
                                            <TextField
                                                fullWidth
                                                size="small"
                                                value={editFormData.NAME1 || ''}
                                                onChange={(e) => setEditFormData(prev => ({ ...prev, NAME1: e.target.value }))}
                                                sx={{ mt: 1 }}
                                            />
                                        ) : (
                                            <Typography variant="body1" fontWeight={500}>{selectedPatient.NAME1}</Typography>
                                        )}
                                    </Grid>

                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="caption" color="textSecondary">นามสกุล</Typography>
                                        {isEditing ? (
                                            <TextField
                                                fullWidth
                                                size="small"
                                                value={editFormData.SURNAME || ''}
                                                onChange={(e) => setEditFormData(prev => ({ ...prev, SURNAME: e.target.value }))}
                                                sx={{ mt: 1 }}
                                            />
                                        ) : (
                                            <Typography variant="body1" fontWeight={500}>{selectedPatient.SURNAME}</Typography>
                                        )}
                                    </Grid>

                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="caption" color="textSecondary">เพศ</Typography>
                                        {isEditing ? (
                                            <TextField
                                                select
                                                fullWidth
                                                size="small"
                                                value={editFormData.SEX || 'ชาย'}
                                                onChange={(e) => setEditFormData(prev => ({ ...prev, SEX: e.target.value }))}
                                                sx={{ mt: 1 }}
                                                SelectProps={{ native: true }}
                                            >
                                                <option value="ชาย">ชาย</option>
                                                <option value="หญิง">หญิง</option>
                                            </TextField>
                                        ) : (
                                            <Typography variant="body1" fontWeight={500}>{selectedPatient.SEX}</Typography>
                                        )}
                                    </Grid>

                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="caption" color="textSecondary">อายุ</Typography>
                                        {isEditing ? (
                                            <TextField
                                                fullWidth
                                                size="small"
                                                type="number"
                                                value={editFormData.AGE || ''}
                                                onChange={(e) => setEditFormData(prev => ({ ...prev, AGE: e.target.value }))}
                                                sx={{ mt: 1 }}
                                            />
                                        ) : (
                                            <Typography variant="body1" fontWeight={500}>{selectedPatient.AGE} ปี</Typography>
                                        )}
                                    </Grid>
                                </Grid>
                            </Paper>
                        </Grid>

                        {/* Contact Information */}
                        <Grid item xs={12}>
                            <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0' }}>
                                <Typography variant="h6" fontWeight={600} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Phone sx={{ color: '#4A9EFF' }} />
                                    ข้อมูลติดต่อ
                                </Typography>
                                
                                <Grid container spacing={3}>
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="caption" color="textSecondary">เบอร์โทรศัพท์</Typography>
                                        {isEditing ? (
                                            <TextField
                                                fullWidth
                                                size="small"
                                                value={editFormData.TEL1 || ''}
                                                onChange={(e) => setEditFormData(prev => ({ ...prev, TEL1: e.target.value }))}
                                                sx={{ mt: 1 }}
                                            />
                                        ) : (
                                            <Typography variant="body1" fontWeight={500}>{selectedPatient.TEL1}</Typography>
                                        )}
                                    </Grid>

                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="caption" color="textSecondary">อีเมล</Typography>
                                        {isEditing ? (
                                            <TextField
                                                fullWidth
                                                size="small"
                                                type="email"
                                                value={editFormData.EMAIL1 || ''}
                                                onChange={(e) => setEditFormData(prev => ({ ...prev, EMAIL1: e.target.value }))}
                                                sx={{ mt: 1 }}
                                            />
                                        ) : (
                                            <Typography variant="body1" fontWeight={500}>{selectedPatient.EMAIL1}</Typography>
                                        )}
                                    </Grid>

                                    <Grid item xs={12}>
                                        <Typography variant="caption" color="textSecondary">ที่อยู่</Typography>
                                        {isEditing ? (
                                            <TextField
                                                fullWidth
                                                size="small"
                                                multiline
                                                rows={3}
                                                value={editFormData.ADDR1 || ''}
                                                onChange={(e) => setEditFormData(prev => ({ ...prev, ADDR1: e.target.value }))}
                                                sx={{ mt: 1 }}
                                            />
                                        ) : (
                                            <Typography variant="body1" fontWeight={500}>{selectedPatient.ADDR1}</Typography>
                                        )}
                                    </Grid>
                                </Grid>
                            </Paper>
                        </Grid>

                        {/* Medical Information */}
                        <Grid item xs={12}>
                            <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0' }}>
                                <Typography variant="h6" fontWeight={600} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <LocalHospital sx={{ color: '#4A9EFF' }} />
                                    ข้อมูลทางการแพทย์
                                </Typography>
                                
                                <Grid container spacing={3}>
                                    <Grid item xs={12}>
                                        <Typography variant="caption" color="textSecondary">โรคประจำตัว/อาการแพ้</Typography>
                                        {isEditing ? (
                                            <TextField
                                                fullWidth
                                                size="small"
                                                multiline
                                                rows={3}
                                                value={editFormData.DISEASE1 || ''}
                                                onChange={(e) => setEditFormData(prev => ({ ...prev, DISEASE1: e.target.value }))}
                                                sx={{ mt: 1 }}
                                            />
                                        ) : (
                                            <Typography variant="body1" fontWeight={500}>{selectedPatient.DISEASE1 || 'ไม่มีข้อมูล'}</Typography>
                                        )}
                                    </Grid>
                                </Grid>
                            </Paper>
                        </Grid>
                    </Grid>
                </Box>
            </Box>
        );
    };

    return (
        <Box sx={{ display: 'flex', height: '100vh', backgroundColor: '#f8fafc' }}>
            {/* Left Sidebar */}
            <Box
                sx={{
                    width: '380px',
                    backgroundColor: '#f8fafc',
                    borderRight: '1px solid #e2e8f0',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden'
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
                            />
                        ))
                    )}
                </Box>
            </Box>

            {/* Right Panel */}
            <Box sx={{ flex: 1, backgroundColor: '#ffffff' }}>
                <PatientDetailPanel />
            </Box>
        </Box>
    );
};

export default PatientManagementComponent;