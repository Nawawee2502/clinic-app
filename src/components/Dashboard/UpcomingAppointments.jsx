// src/components/UpcomingAppointments.jsx
import React from 'react';
import {
    Card,
    CardContent,
    Typography,
    Box,
    IconButton,
    Avatar,
    Grid,
    Divider
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';

// ข้อมูลการนัดหมายที่กำลังจะมาถึง
const appointmentsData = [
    {
        id: 1,
        doctor: {
            name: 'Dr. Ratul Ahamed',
            specialty: 'Dental Specialist',
            avatar: '/path-to-avatars/ratul.jpg'
        },
        date: '27 Oct 2021',
        time: '11:00 - 12:00 AM'
    },
    {
        id: 2,
        doctor: {
            name: 'Dr. Anas Toman',
            specialty: 'Dental Specialist',
            avatar: '/path-to-avatars/anas.jpg'
        },
        date: '27 Oct 2021',
        time: '11:00 - 12:00 AM'
    },
    {
        id: 3,
        doctor: {
            name: 'Dr. Nur Hasan',
            specialty: 'Dental Specialist',
            avatar: '/path-to-avatars/nur.jpg'
        },
        date: '27 Oct 2021',
        time: '11:00 - 12:00 AM'
    }
];

const AppointmentCard = ({ doctor, date, time }) => {
    return (
        <Card
            elevation={0}
            sx={{
                border: '1px solid #e0e0e0',
                borderRadius: 2,
                p: 2,
                height: '100%'
            }}
        >
            <Box sx={{ display: 'flex', gap: 2 }}>
                {/* Doctor Avatar */}
                <Avatar
                    src={doctor.avatar}
                    alt={doctor.name}
                    sx={{ width: 48, height: 48 }}
                />

                {/* Doctor Info */}
                <Box>
                    <Typography variant="subtitle1" fontWeight="bold">
                        {doctor.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {doctor.specialty}
                    </Typography>

                    <Box sx={{ display: 'flex', mt: 2, gap: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CalendarTodayIcon fontSize="small" sx={{ color: '#666' }} />
                            <Typography variant="body2">{date}</Typography>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <AccessTimeIcon fontSize="small" sx={{ color: '#666' }} />
                            <Typography variant="body2">{time}</Typography>
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Card>
    );
};

const UpcomingAppointments = () => {
    return (
        <Box sx={{ mt: 3 }}>
            {/* Header */}
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 2
                }}
            >
                <Typography variant="h6" fontWeight="medium">
                    Upcoming Appointment
                </Typography>

                <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton
                        size="small"
                        sx={{
                            bgcolor: '#f5f5f5',
                            '&:hover': { bgcolor: '#e0e0e0' }
                        }}
                    >
                        <KeyboardArrowLeftIcon />
                    </IconButton>
                    <IconButton
                        size="small"
                        sx={{
                            bgcolor: '#f5f5f5',
                            '&:hover': { bgcolor: '#e0e0e0' }
                        }}
                    >
                        <KeyboardArrowRightIcon />
                    </IconButton>
                </Box>
            </Box>

            {/* Grid of Appointment Cards */}
            <Grid container spacing={2}>
                {appointmentsData.map((appointment) => (
                    <Grid item xs={12} sm={6} md={4} key={appointment.id}>
                        <AppointmentCard
                            doctor={appointment.doctor}
                            date={appointment.date}
                            time={appointment.time}
                        />
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default UpcomingAppointments;