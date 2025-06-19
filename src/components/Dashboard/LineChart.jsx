// src/components/LineChart.jsx
import React from 'react';
import { Box } from '@mui/material';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

// สร้างข้อมูลตัวอย่างสำหรับแสดงกราฟ (ในการใช้งานจริงควรรับข้อมูลมาจาก props)
const generateSampleData = (trend = 'up') => {
    // สร้างข้อมูลตัวอย่าง 24 จุด
    const baseValue = 500;
    const multiplier = trend === 'up' ? 1 : -1;

    return Array.from({ length: 24 }, (_, i) => ({
        hour: i + 1,
        value: baseValue + Math.sin(i / 3) * 150 + (i * 10 * multiplier) + Math.random() * 50
    }));
};

const BillingLineChart = ({ data = generateSampleData(), color = '#4285F4', showAreaGradient = true }) => {
    // สร้างข้อมูลเส้นล่าง (แนวโน้มต่ำ)
    const lowerData = data.map(item => ({
        ...item,
        lowerValue: item.value * 0.7 - Math.random() * 50
    }));

    return (
        <ResponsiveContainer width="100%" height="100%">
            <LineChart data={lowerData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                {/* เส้นล่าง (แนวโน้มต่ำ) */}
                {showAreaGradient && (
                    <defs>
                        <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={color} stopOpacity={0.1} />
                            <stop offset="95%" stopColor={color} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                )}

                {/* เส้นล่าง */}
                <Line
                    type="monotone"
                    dataKey="lowerValue"
                    stroke={color}
                    strokeOpacity={0.3}
                    strokeWidth={1.5}
                    dot={false}
                    activeDot={false}
                    isAnimationActive={false}
                />

                {/* เส้นหลัก */}
                <Line
                    type="monotone"
                    dataKey="value"
                    stroke={color}
                    strokeWidth={1.5}
                    dot={{ r: 0 }}
                    activeDot={{ r: 0 }}
                    isAnimationActive={false}
                />
            </LineChart>
        </ResponsiveContainer>
    );
};

export default BillingLineChart;