// src/components/PatientsTable.jsx
import React from 'react';
import {
    Card,
    CardContent,
    Typography,
    Box,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Checkbox,
    Avatar,
    Chip
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditIcon from '@mui/icons-material/Edit';

// ข้อมูลตัวอย่างสำหรับตาราง
const patientsData = [
    {
        id: '#85736733',
        name: 'Olivia Rhye',
        username: '@olivia',
        age: 70,
        sex: 'Male',
        status: 'Active',
        price: 644.00,
        avatar: '/path-to-avatars/olivia.jpg'
    },
    {
        id: '#85736733',
        name: 'Phoenix Baker',
        username: '@phoenix',
        age: 13,
        sex: 'Female',
        status: 'Pending',
        price: 644.00,
        avatar: '/path-to-avatars/phoenix.jpg'
    },
    {
        id: '#85736733',
        name: 'Lara Steiner',
        username: '@lana',
        age: 39,
        sex: 'Male',
        status: 'Pending',
        price: 644.00,
        avatar: '/path-to-avatars/lara.jpg'
    },
    {
        id: '#85736733',
        name: 'Demi Wilkinson',
        username: '@demi',
        age: 36,
        sex: 'Male',
        status: 'Pending',
        price: 644.00,
        avatar: '/path-to-avatars/demi.jpg'
    }
];

const PatientsTable = () => {
    return (
        <Card
            elevation={0}
            sx={{
                bgcolor: 'white',
                border: '1px solid #e0e0e0',
                borderRadius: 2,
                mt: 3
            }}
        >
            <CardContent sx={{ p: 0 }}>
                {/* หัวข้อและจำนวนผู้ป่วย */}
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        p: 2,
                        borderBottom: '1px solid #f0f0f0'
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="h6" fontWeight="medium">
                            Patients List
                        </Typography>
                        <Chip
                            label="363 member"
                            size="small"
                            sx={{
                                bgcolor: '#E1EFFE',
                                color: '#4285F4',
                                fontWeight: 'medium',
                                fontSize: '0.75rem',
                                height: 24
                            }}
                        />
                    </Box>

                    <IconButton size="small">
                        <MoreVertIcon fontSize="small" />
                    </IconButton>
                </Box>

                {/* ตารางรายการผู้ป่วย */}
                <TableContainer>
                    <Table sx={{ minWidth: 650 }}>
                        <TableHead>
                            <TableRow sx={{ bgcolor: '#f9fafb' }}>
                                <TableCell padding="checkbox">
                                    <Checkbox size="small" />
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2" fontWeight="medium">
                                        Patients name
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 0.5
                                        }}
                                    >
                                        <Typography variant="body2" fontWeight="medium">
                                            Patient ID
                                        </Typography>
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 0.5
                                        }}
                                    >
                                        <Typography variant="body2" fontWeight="medium">
                                            Age
                                        </Typography>
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                fontSize: 10
                                            }}
                                        >
                                            ▲
                                            ▼
                                        </Box>
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2" fontWeight="medium">
                                        Sex
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 0.5
                                        }}
                                    >
                                        <Typography variant="body2" fontWeight="medium">
                                            Status
                                        </Typography>
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                fontSize: 10
                                            }}
                                        >
                                            ▲
                                            ▼
                                        </Box>
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 0.5
                                        }}
                                    >
                                        <Typography variant="body2" fontWeight="medium">
                                            Price
                                        </Typography>
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                fontSize: 10
                                            }}
                                        >
                                            ▲
                                            ▼
                                        </Box>
                                    </Box>
                                </TableCell>
                                <TableCell align="right"></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {patientsData.map((patient, index) => (
                                <TableRow
                                    key={index}
                                    sx={{
                                        '&:last-child td, &:last-child th': { border: 0 },
                                        '&:hover': { bgcolor: '#f5f5f5' }
                                    }}
                                >
                                    <TableCell padding="checkbox">
                                        <Checkbox size="small" />
                                    </TableCell>
                                    <TableCell component="th" scope="row">
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Avatar
                                                src={patient.avatar}
                                                alt={patient.name}
                                                sx={{ width: 32, height: 32 }}
                                            />
                                            <Box>
                                                <Typography variant="body2" fontWeight="medium">
                                                    {patient.name}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {patient.username}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell>{patient.id}</TableCell>
                                    <TableCell>{patient.age}</TableCell>
                                    <TableCell>{patient.sex}</TableCell>
                                    <TableCell>
                                        <Box
                                            component="span"
                                            sx={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                px: 1,
                                                py: 0.5,
                                                borderRadius: 1,
                                                bgcolor: patient.status === 'Active' ? 'rgba(0, 128, 0, 0.1)' : 'rgba(255, 165, 0, 0.1)',
                                                color: patient.status === 'Active' ? 'green' : 'orange',
                                                '&::before': {
                                                    content: '""',
                                                    display: 'inline-block',
                                                    width: 6,
                                                    height: 6,
                                                    borderRadius: '50%',
                                                    bgcolor: patient.status === 'Active' ? 'green' : 'orange',
                                                    mr: 1
                                                }
                                            }}
                                        >
                                            {patient.status}
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        ${patient.price.toFixed(2)}
                                    </TableCell>
                                    <TableCell align="right">
                                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                                            <IconButton size="small" sx={{ color: '#666' }}>
                                                <DeleteOutlineIcon fontSize="small" />
                                            </IconButton>
                                            <IconButton size="small" sx={{ color: '#666' }}>
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Pagination */}
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        p: 2,
                        borderTop: '1px solid #f0f0f0'
                    }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            color: '#666'
                        }}
                    >
                        <IconButton
                            size="small"
                            sx={{
                                border: '1px solid #e0e0e0',
                                borderRadius: 1
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', px: 0.5 }}>
                                <Typography variant="body2">Previous</Typography>
                            </Box>
                        </IconButton>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box
                            sx={{
                                width: 28,
                                height: 28,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '1px solid #e0e0e0',
                                borderRadius: 1,
                                bgcolor: '#4285F4',
                                color: 'white'
                            }}
                        >
                            1
                        </Box>
                        <Box
                            sx={{
                                width: 28,
                                height: 28,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '1px solid #e0e0e0',
                                borderRadius: 1
                            }}
                        >
                            2
                        </Box>
                        <Box
                            sx={{
                                width: 28,
                                height: 28,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '1px solid #e0e0e0',
                                borderRadius: 1
                            }}
                        >
                            3
                        </Box>
                        <Box sx={{ mx: 0.5 }}>...</Box>
                        <Box
                            sx={{
                                width: 28,
                                height: 28,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '1px solid #e0e0e0',
                                borderRadius: 1
                            }}
                        >
                            8
                        </Box>
                        <Box
                            sx={{
                                width: 28,
                                height: 28,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '1px solid #e0e0e0',
                                borderRadius: 1
                            }}
                        >
                            9
                        </Box>
                        <Box
                            sx={{
                                width: 28,
                                height: 28,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '1px solid #e0e0e0',
                                borderRadius: 1
                            }}
                        >
                            10
                        </Box>
                    </Box>

                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            color: '#666'
                        }}
                    >
                        <IconButton
                            size="small"
                            sx={{
                                border: '1px solid #e0e0e0',
                                borderRadius: 1
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', px: 0.5 }}>
                                <Typography variant="body2">Next</Typography>
                            </Box>
                        </IconButton>
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
};

export default PatientsTable;