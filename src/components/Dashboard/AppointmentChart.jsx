// src/components/AppointmentCard.jsx
import React from 'react';
import { Card, CardContent, Typography, Box, MenuItem, Select } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell } from 'recharts';

// สร้างข้อมูลตัวอย่างสำหรับแผนภูมิแท่ง
const barData = [
    { month: 'Jan', value: 800, series1: 300, series2: 200, series3: 300 },
    { month: 'Feb', value: 900, series1: 400, series2: 300, series3: 200 },
    { month: 'Mar', value: 600, series1: 200, series2: 200, series3: 200 },
    { month: 'Apr', value: 800, series1: 300, series2: 250, series3: 250 },
    { month: 'May', value: 900, series1: 400, series2: 300, series3: 200 },
    { month: 'Jun', value: 900, series1: 350, series2: 300, series3: 250 },
    { month: 'Jul', value: 950, series1: 400, series2: 300, series3: 250 },
    { month: 'Aug', value: 800, series1: 350, series2: 250, series3: 200 },
];

const DoctorAppointmentChart = () => {
    const [timeFrame, setTimeFrame] = React.useState('Month');

    const handleTimeFrameChange = (event) => {
        setTimeFrame(event.target.value);
    };

    // กำหนดสีสำหรับแต่ละชุดข้อมูล
    const colors = ['#4285F4', '#5C9CE5', '#80B4F0'];

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
                        Doctor Appointment
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

                {/* แผนภูมิแท่ง */}
                <ResponsiveContainer width="100%" height={240}>
                    <BarChart
                        data={barData}
                        margin={{ top: 20, right: 0, left: 0, bottom: 5 }}
                        barSize={20}
                        barGap={2}
                        barCategoryGap={16}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis
                            dataKey="month"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12 }}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12 }}
                            tickFormatter={(value) => value === 0 ? '0' : `${value}`}
                        />

                        <Bar dataKey="series1" stackId="a" radius={[4, 4, 0, 0]}>
                            {barData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={colors[0]} />
                            ))}
                        </Bar>
                        <Bar dataKey="series2" stackId="a" radius={[0, 0, 0, 0]}>
                            {barData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={colors[1]} />
                            ))}
                        </Bar>
                        <Bar dataKey="series3" stackId="a" radius={[0, 0, 0, 0]}>
                            {barData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={colors[2]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>

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
                                bgcolor: colors[0],
                                mr: 1
                            }}
                        />
                        <Typography variant="caption">Series 1</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box
                            sx={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                bgcolor: colors[1],
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
                                bgcolor: colors[2],
                                mr: 1
                            }}
                        />
                        <Typography variant="caption">Series 3</Typography>
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
};

export default DoctorAppointmentChart;