import React from "react";
import {
    Card,
    CardContent,
    Typography,
    Button,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Avatar,
    Chip,
    Box,
    IconButton
} from "@mui/material";
import {
    LocalHospital as VitalsIcon,
    PersonAdd as PersonAddIcon,
    CalendarToday as CalendarIcon,
    Queue as QueueIcon,
    Refresh as RefreshIcon
} from "@mui/icons-material";

const QueueDisplayPanel = ({
    todayQueue,
    queueStats,
    mainView,
    setMainView,
    onRefresh
}) => {
    const getStatusColor = (status) => {
        switch (status) {
            case 'รอตรวจ': return 'warning';
            case 'กำลังตรวจ': return 'info';
            case 'เสร็จแล้ว': return 'success';
            default: return 'default';
        }
    };

    const formatTime = (timeString) => {
        if (!timeString) return '-';
        // แปลง timestamp หรือ time string ให้เป็นรูปแบบที่อ่านง่าย
        if (timeString.includes('T')) {
            const date = new Date(timeString);
            return date.toLocaleTimeString('th-TH', {
                hour: '2-digit',
                minute: '2-digit'
            });
        }
        return timeString;
    };

    // กรองเฉพาะคิวที่ยังไม่เสร็จ (ไม่แสดงคิวที่เสร็จแล้ว หรือชำระเงินแล้ว)
    const activeQueue = todayQueue ? todayQueue.filter(queue => {
        const status = queue.QUEUE_STATUS || queue.queueStatus || queue.status;
        console.log(`Queue ${queue.QUEUE_NUMBER || queue.queueNumber}: status = "${status}"`);
        return status !== 'เสร็จแล้ว' && status !== 'ชำระเงินแล้ว' && status !== 'สำเร็จ';
    }) : [];

    // คำนวณสถิติใหม่จากคิวที่กรองแล้ว
    const activeStats = {
        total: activeQueue.length,
        waiting: activeQueue.filter(q => {
            const status = q.QUEUE_STATUS || q.queueStatus || q.status;
            return status === 'รอตรวจ';
        }).length,
        inProgress: activeQueue.filter(q => {
            const status = q.QUEUE_STATUS || q.queueStatus || q.status;
            return status === 'กำลังตรวจ';
        }).length
    };

    return (
        <>

                    {/* Navigation Menu */}
                    <Card>
                <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, color: '#1976d2' }}>
                        เมนูหลัก
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Button
                            fullWidth
                            variant={mainView === 'reception' ? 'contained' : 'outlined'}
                            startIcon={<VitalsIcon />}
                            onClick={() => setMainView('reception')}
                            sx={{ borderRadius: '10px', py: 1.5, justifyContent: 'flex-start' }}
                        >
                            รับผู้ป่วย
                        </Button>
                        <Button
                            fullWidth
                            variant={mainView === 'newPatient' ? 'contained' : 'outlined'}
                            startIcon={<PersonAddIcon />}
                            onClick={() => setMainView('newPatient')}
                            sx={{ borderRadius: '10px', py: 1.5, justifyContent: 'flex-start' }}
                        >
                            เพิ่มผู้ป่วยใหม่
                        </Button>
                        <Button
                            fullWidth
                            variant={mainView === 'appointments' ? 'contained' : 'outlined'}
                            startIcon={<CalendarIcon />}
                            onClick={() => setMainView('appointments')}
                            sx={{ borderRadius: '10px', py: 1.5, justifyContent: 'flex-start' }}
                        >
                            จัดการนัดหมาย
                        </Button>
                    </Box>
                </CardContent>
            </Card>
            
            {/* Queue Display */}
            <Card sx={{  mt: 2, height: '60vh', overflowY: 'auto' }}>
                <CardContent>
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 2
                    }}>
                        <Typography variant="h6" sx={{
                            display: 'flex',
                            alignItems: 'center',
                            color: '#1976d2'
                        }}>
                            <QueueIcon sx={{ mr: 1 }} />
                            คิวปัจจุบัน ({activeStats.total})
                        </Typography>
                        <IconButton
                            size="small"
                            onClick={onRefresh}
                            title="รีเฟรชข้อมูล"
                        >
                            <RefreshIcon />
                        </IconButton>
                    </Box>

                    {/* Queue Statistics - แสดงเฉพาะคิวที่ยังไม่เสร็จ */}
                    <Box sx={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: 1,
                        mb: 2,
                        textAlign: 'center'
                    }}>
                        <Box sx={{ p: 1, bgcolor: '#e3f2fd', borderRadius: 1 }}>
                            <Typography variant="h6" color="primary">{activeStats.total}</Typography>
                            <Typography variant="caption">ทั้งหมด</Typography>
                        </Box>
                        <Box sx={{ p: 1, bgcolor: '#fff3e0', borderRadius: 1 }}>
                            <Typography variant="h6" color="warning.main">{activeStats.waiting}</Typography>
                            <Typography variant="caption">รอตรวจ</Typography>
                        </Box>
                        <Box sx={{ p: 1, bgcolor: '#e1f5fe', borderRadius: 1 }}>
                            <Typography variant="h6" color="info.main">{activeStats.inProgress}</Typography>
                            <Typography variant="caption">กำลังตรวจ</Typography>
                        </Box>
                    </Box>

                    <List dense>
                        {activeQueue && activeQueue.map((queue, index) => (
                            <ListItem key={queue.QUEUE_ID || queue.queueId || index} sx={{
                                border: '1px solid #e0e0e0',
                                borderRadius: 1,
                                mb: 1,
                                bgcolor: queue.QUEUE_STATUS === 'รอตรวจ' || queue.queueStatus === 'รอตรวจ' ? '#fff3e0' :
                                    queue.QUEUE_STATUS === 'กำลังตรวจ' || queue.queueStatus === 'กำลังตรวจ' ? '#e3f2fd' : '#e8f5e8'
                            }}>
                                <ListItemAvatar>
                                    <Avatar sx={{ bgcolor: '#1976d2', fontSize: '14px' }}>
                                        {queue.QUEUE_NUMBER || queue.queueNumber}
                                    </Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                    primary={
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <Typography variant="body2" fontWeight="bold">
                                                {/* รองรับทั้ง API format และ mock format */}
                                                {queue.PRENAME || queue.prename || ''}{queue.NAME1 || queue.name1 || queue.firstName} {queue.SURNAME || queue.surname || queue.lastName}
                                            </Typography>
                                            <Chip
                                                label={queue.QUEUE_STATUS || queue.queueStatus || queue.status || 'รอตรวจ'}
                                                size="small"
                                                color={getStatusColor(queue.QUEUE_STATUS || queue.queueStatus || queue.status || 'รอตรวจ')}
                                                sx={{ ml: 1 }}
                                            />
                                        </Box>
                                    }
                                    secondary={
                                        <Box>
                                            <Typography variant="caption" display="block">
                                                HN: {queue.HNCODE || queue.hnCode || 'N/A'} • VN: {queue.VN_NUMBER || queue.VNO || queue.vnNumber || 'N/A'}
                                            </Typography>
                                            <Typography variant="caption" display="block">
                                                เวลา: {formatTime(queue.QUEUE_TIME || queue.queueTime || queue.createdAt)}
                                            </Typography>
                                        </Box>
                                    }
                                />
                            </ListItem>
                        ))}
                        {(!activeQueue || activeQueue.length === 0) && (
                            <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ py: 2 }}>
                                ไม่มีคิวที่รอตรวจ
                            </Typography>
                        )}
                    </List>

                    {/* แสดงข้อมูลคิวที่เสร็จแล้วแยกต่างหาก */}
                    {queueStats?.completed > 0 && (
                        <Box sx={{ 
                            mt: 2, 
                            pt: 2, 
                            borderTop: '1px solid #e0e0e0',
                            textAlign: 'center'
                        }}>
                            <Typography variant="caption" color="text.secondary">
                                วันนี้เสร็จแล้ว: {queueStats.completed} ราย
                            </Typography>
                        </Box>
                    )}
                </CardContent>
            </Card>


        </>
    );
};

export default QueueDisplayPanel;