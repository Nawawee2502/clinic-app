// src/components/LabAppointmentChart.jsx
import React from 'react';
import { Card, CardContent, Typography, Box, MenuItem, Select } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

// ข้อมูลตัวอย่างสำหรับแผนภูมิวงกลม
const labData = [
    { name: 'Completed', value: 12, color: '#4285F4' },
    { name: 'Series 2', value: 60, color: '#E1EFFE' },
    { name: 'Pending', value: 60, color: '#FFA500' },
];

const LabAppointmentChart = () => {
    const [timeFrame, setTimeFrame] = React.useState('Month');

    const handleTimeFrameChange = (event) => {
        setTimeFrame(event.target.value);
    };

    // คำนวณยอดรวมสำหรับแสดงตรงกลาง
    const total = labData.reduce((sum, item) => sum + item.value, 0);

    return (
        <Card
            elevation={0}
            sx={{
                bgcolor: 'white',
                border: '1px solid #e0e0e0',
                borderRadius: 2,
                height: '100%'
            }}
        >
            <CardContent>
                {/* หัวข้อและตัวเลือกเวลา */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" fontWeight="medium">
                        Lab Appointment
                    </Typography>

                    <Select
                        value={timeFrame}
                        onChange={handleTimeFrameChange}
                        size="small"
                        sx={{ minWidth: 100, height: 36 }}
                    >
                        <MenuItem value="Month">Month</MenuItem>
                        <MenuItem value="Quarter">Quarter</MenuItem>
                        <MenuItem value="Year">Year</MenuItem>
                    </Select>
                </Box>

                {/* แผนภูมิวงกลม */}
                <Box
                    sx={{
                        height: 240,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        position: 'relative'
                    }}
                >
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={labData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={90}
                                paddingAngle={2}
                                dataKey="value"
                                startAngle={90}
                                endAngle={-270}
                            >
                                {labData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={entry.color}
                                        strokeWidth={0}
                                    />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>

                    {/* ข้อมูลตรงกลาง */}
                    <Box
                        sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            textAlign: 'center'
                        }}
                    >
                        <Typography variant="caption" color="text.secondary">
                            Appointment
                        </Typography>
                        <Typography variant="h4" fontWeight="bold">
                            2,350
                        </Typography>
                    </Box>
                </Box>

                {/* คำอธิบาย (legend) */}
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: 3,
                        mt: 1
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box
                            sx={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                bgcolor: '#4285F4',
                                mr: 1
                            }}
                        />
                        <Typography variant="caption">12 Completed</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box
                            sx={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                bgcolor: '#E1EFFE',
                                mr: 1
                            }}
                        />
                        <Typography variant="caption">Series 2</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box
                            sx={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                bgcolor: '#FFA500',
                                mr: 1
                            }}
                        />
                        <Typography variant="caption">60 Completed</Typography>
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
};

export default LabAppointmentChart;