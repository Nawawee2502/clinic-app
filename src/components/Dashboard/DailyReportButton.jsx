import React, { useState } from 'react';
import TreatmentService from '../../services/treatmentService';

const DailyReportButton = ({ selectedDate, revenueData }) => {
    const [loading, setLoading] = useState(false);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('th-TH', {
            style: 'currency',
            currency: 'THB',
            minimumFractionDigits: 0
        }).format(amount || 0);
    };

    const formatThaiDate = (dateString) => {
        const date = new Date(dateString);
        const thaiMonths = [
            'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
            'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
        ];

        const day = date.getDate();
        const month = thaiMonths[date.getMonth()];
        const year = date.getFullYear() + 543;

        return `${day} ${month} ${year}`;
    };

    const generatePDF = async () => {
        try {
            setLoading(true);

            // ดึงข้อมูลผู้ป่วยที่ชำระเงินแล้วในวันที่เลือก
            const treatmentsResponse = await TreatmentService.getPaidTreatments({
                date_from: selectedDate,
                date_to: selectedDate,
                limit: 1000
            });

            if (!treatmentsResponse.success) {
                alert('ไม่สามารถดึงข้อมูลได้: ' + treatmentsResponse.message);
                return;
            }

            const treatments = treatmentsResponse.data || [];
            console.log('Paid treatments:', treatments);

            // คำนวณสถิติ
            const totalTreatments = treatments.length;
            const totalRevenue = treatments.reduce((sum, t) => sum + (parseFloat(t.NET_AMOUNT) || parseFloat(t.TOTAL_AMOUNT) || 0), 0);
            const averagePerPatient = totalTreatments > 0 ? totalRevenue / totalTreatments : 0;
            const totalDiscount = treatments.reduce((sum, t) => sum + (parseFloat(t.DISCOUNT_AMOUNT) || 0), 0);

            // จัดกลุ่มตามวิธีการชำระเงิน
            const paymentMethods = {};
            treatments.forEach(t => {
                const method = t.PAYMENT_METHOD || 'เงินสด';
                const amount = parseFloat(t.NET_AMOUNT) || parseFloat(t.TOTAL_AMOUNT) || 0;

                if (!paymentMethods[method]) {
                    paymentMethods[method] = { count: 0, total: 0 };
                }
                paymentMethods[method].count += 1;
                paymentMethods[method].total += amount;
            });

            // สร้าง HTML สำหรับรายงาน
            const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>รายงานรายรับประจำวัน - ${formatThaiDate(selectedDate)}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&display=swap');
        
        * {
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Sarabun', 'TH Sarabun New', Arial, sans-serif;
            margin: 0;
            padding: 20mm 15mm;
            font-size: 14px;
            line-height: 1.4;
            color: #000000;
            background: white;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }
        
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 3px double #1a1a1a;
        }
        
        .clinic-name {
            font-size: 24px;
            font-weight: 700;
            color: #000000;
            margin-bottom: 5px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .clinic-address {
            font-size: 12px;
            color: #000000;
            margin-bottom: 3px;
            font-weight: 400;
        }
        
        .report-title {
            font-size: 20px;
            font-weight: 700;
            margin: 25px 0 15px 0;
            color: #000000;
            text-decoration: underline;
            text-underline-offset: 3px;
        }
        
        .report-period {
            font-size: 16px;
            color: #000000;
            margin-bottom: 25px;
            font-weight: 500;
        }
        
        .summary-section {
            margin: 20px 0;
            padding: 0;
        }
        
        .summary-title {
            font-size: 16px;
            font-weight: 700;
            color: #000000;
            margin-bottom: 15px;
            text-align: left;
        }
        
        .summary-stats {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 15px;
            margin-bottom: 25px;
        }
        
        .stat-box {
            text-align: center;
            padding: 15px;
            border: 2px solid #000000;
            background: #f8f8f8;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }
        
        .stat-label {
            font-size: 11px;
            color: #000000;
            margin-bottom: 8px;
            font-weight: 500;
            text-transform: uppercase;
        }
        
        .stat-value {
            font-size: 18px;
            font-weight: 700;
            color: #000000;
        }
        
        .main-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            background: white;
            border: 2px solid #000000;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }
        
        .main-table th {
            background: #e0e0e0;
            color: #000000;
            font-weight: 700;
            text-align: center;
            padding: 12px 6px;
            font-size: 12px;
            border: 1px solid #000000;
            vertical-align: middle;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }
        
        .main-table td {
            border: 1px solid #000000;
            padding: 8px 6px;
            font-size: 11px;
            color: #000000;
            vertical-align: middle;
        }
        
        .main-table tbody tr:nth-child(even) {
            background: #f9f9f9;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }
        
        .text-center { 
            text-align: center; 
        }
        .text-right { 
            text-align: right; 
        }
        .text-left { 
            text-align: left; 
        }
        
        .total-row {
            background: #d0d0d0;
            font-weight: 700;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }
        
        .total-row td {
            color: #000000;
            font-weight: 700;
            font-size: 12px;
        }
        
        .summary-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            border: 2px solid #000000;
        }
        
        .summary-table th,
        .summary-table td {
            border: 1px solid #000000;
            padding: 10px;
            font-size: 13px;
            color: #000000;
        }
        
        .summary-table th {
            background: #e0e0e0;
            font-weight: 700;
            text-align: center;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }
        
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #000000;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 50px;
        }
        
        .signature-box {
            text-align: center;
        }
        
        .signature-line {
            border-top: 1px solid #000000;
            margin-top: 60px;
            padding-top: 10px;
            font-size: 12px;
            color: #000000;
            font-weight: 500;
        }
        
        .print-info {
            text-align: center;
            margin-top: 30px;
            font-size: 10px;
            color: #666666;
            font-style: italic;
        }
        
        .col-no { width: 4%; }
        .col-vn { width: 8%; }
        .col-hn { width: 7%; }
        .col-name { width: 15%; }
        .col-treatment { width: 12%; }
        .col-lab { width: 7%; }
        .col-proc { width: 7%; }
        .col-drug { width: 7%; }
        .col-total { width: 8%; }
        .col-doctor { width: 10%; }
        .col-cash { width: 7%; }
        .col-transfer { width: 7%; }
        .col-other { width: 7%; }
        .col-datetime { width: 10%; }
        
        @media print {
            body { 
                margin: 0;
                padding: 15mm 10mm;
                font-size: 12px;
            }
            
            .clinic-name { font-size: 20px; }
            .clinic-address { font-size: 10px; }
            .report-title { font-size: 16px; }
            .report-period { font-size: 14px; }
            .summary-stats { gap: 10px; }
            .stat-box { padding: 10px; }
            .stat-value { font-size: 14px; }
            .main-table th { padding: 8px 4px; font-size: 10px; }
            .main-table td { padding: 6px 4px; font-size: 9px; }
            .summary-table th, .summary-table td { padding: 8px; font-size: 11px; }
            .footer { margin-top: 30px; gap: 30px; }
            .signature-line { margin-top: 40px; font-size: 10px; }
            .print-info { margin-top: 20px; font-size: 8px; }
        }
        
        @page {
            margin: 15mm 10mm;
            size: A4 portrait;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="clinic-name">สัมพันธ์คลินิค</div>
        <div class="clinic-address">280 หมู่ 4 ถนน เชียงใหม่-ฮอด ต.บ้านหลวง อ.จอมทอง จ.เชียงใหม่ 50160</div>
        <div class="clinic-address">โทรศัพท์: 053-826-524</div>
        
        <div class="report-title">รายงานรายรับประจำวัน</div>
        <div class="report-period">ตั้งแต่วันที่ ${formatThaiDate(selectedDate)} ถึงวันที่ ${formatThaiDate(selectedDate)}</div>
    </div>

    <table class="main-table">
        <thead>
            <tr>
                <th class="col-no">ที่</th>
                <th class="col-vn">VN No</th>
                <th class="col-hn">HN No</th>
                <th class="col-name">ชื่อ นามสกุล</th>
                <th class="col-treatment">Treatment</th>
                <th class="col-lab">ค่า<br>Lab</th>
                <th class="col-proc">ค่า<br>หัตถการ</th>
                <th class="col-drug">ค่า<br>ยา</th>
                <th class="col-total">รวมเงิน</th>
                <th class="col-doctor">หมอ</th>
                <th class="col-cash">เงินสด</th>
                <th class="col-transfer">เงินโอน</th>
                <th class="col-other">อื่นๆ</th>
                <th class="col-datetime">วัน เวลาบันทึก</th>
            </tr>
        </thead>
        <tbody>
            ${treatments.length > 0 ? treatments.map((treatment, index) => {
                // ใช้ข้อมูลจาก TREATMENT1 โดยตรง
                const totalCost = parseFloat(treatment.NET_AMOUNT) || parseFloat(treatment.TOTAL_AMOUNT) || 0;
                const discountAmount = parseFloat(treatment.DISCOUNT_AMOUNT) || 0;
                const beforeDiscount = totalCost + discountAmount;

                // แยกตามประเภทการชำระเงิน
                const paymentMethod = treatment.PAYMENT_METHOD || 'เงินสด';
                let cashAmount = 0, transferAmount = 0, otherAmount = 0;

                if (paymentMethod === 'เงินสด') {
                    cashAmount = totalCost;
                } else if (paymentMethod === 'โอน' || paymentMethod === 'ประมาณโอน') {
                    transferAmount = totalCost;
                } else {
                    otherAmount = totalCost;
                }

                // จัดรูปแบบวันที่
                const paymentDate = treatment.PAYMENT_DATE ?
                    new Date(treatment.PAYMENT_DATE).toLocaleDateString('th-TH', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit'
                    }) : '';
                const paymentTime = treatment.PAYMENT_TIME ?
                    treatment.PAYMENT_TIME.substring(0, 5) : '';

                return `
                    <tr>
                        <td class="text-center">${index + 1}</td>
                        <td class="text-center">${treatment.VNO || ''}</td>
                        <td class="text-center">${treatment.HNNO || ''}</td>
                        <td class="text-left">${(treatment.PRENAME || '') + (treatment.NAME1 || '') + ' ' + (treatment.SURNAME || '')}</td>
                        <td class="text-left">${(treatment.TREATMENT1 || '').substring(0, 30)}${treatment.TREATMENT1 && treatment.TREATMENT1.length > 30 ? '...' : ''}</td>
                        <td class="text-right">-</td>
                        <td class="text-right">-</td>
                        <td class="text-right">-</td>
                        <td class="text-right">${formatCurrency(totalCost)}</td>
                        <td class="text-left">${treatment.EMP_NAME || 'พ.ปวีณา'}</td>
                        <td class="text-right">${cashAmount > 0 ? formatCurrency(cashAmount) : '-'}</td>
                        <td class="text-right">${transferAmount > 0 ? formatCurrency(transferAmount) : '-'}</td>
                        <td class="text-right">${otherAmount > 0 ? formatCurrency(otherAmount) : '-'}</td>
                        <td class="text-center">${paymentDate}<br>${paymentTime}</td>
                    </tr>`;
            }).join('') : `
                <tr>
                    <td colspan="14" class="text-center" style="padding: 30px;">ไม่มีข้อมูลการรักษาที่ชำระเงินในวันที่เลือก</td>
                </tr>
            `}
            
            ${treatments.length > 0 ? `
            <tr class="total-row">
                <td colspan="5" class="text-center">รวมทั้งหมด</td>
                <td class="text-right">-</td>
                <td class="text-right">-</td>
                <td class="text-right">-</td>
                <td class="text-right">${formatCurrency(totalRevenue)}</td>
                <td></td>
                <td class="text-right">${formatCurrency(paymentMethods['เงินสด']?.total || 0)}</td>
                <td class="text-right">${formatCurrency((paymentMethods['โอน']?.total || 0) + (paymentMethods['ประมาณโอน']?.total || 0))}</td>
                <td class="text-right">${formatCurrency(Object.entries(paymentMethods).reduce((sum, [method, data]) => {
                return method !== 'เงินสด' && method !== 'โอน' && method !== 'ประมาณโอน' ? sum + data.total : sum;
            }, 0))}</td>
                <td></td>
            </tr>
            ` : ''}
        </tbody>
    </table>

    ${Object.keys(paymentMethods).length > 0 ? `
    <table class="summary-table">
        <thead>
            <tr>
                <th>วิธีการชำระเงิน</th>
                <th>จำนวนรายการ</th>
                <th>ยอดเงิน</th>
                <th>เปอร์เซ็นต์</th>
            </tr>
        </thead>
        <tbody>
            ${Object.entries(paymentMethods).map(([method, data]) => {
                const percentage = totalRevenue > 0 ? ((data.total / totalRevenue) * 100).toFixed(1) : '0.0';
                return `
                    <tr>
                        <td class="text-left">${method}</td>
                        <td class="text-center">${data.count}</td>
                        <td class="text-right">${formatCurrency(data.total)}</td>
                        <td class="text-right">${percentage}%</td>
                    </tr>`;
            }).join('')}
            <tr class="total-row">
                <td class="text-center">รวมทั้งหมด</td>
                <td class="text-center">${Object.values(paymentMethods).reduce((sum, data) => sum + data.count, 0)}</td>
                <td class="text-right">${formatCurrency(totalRevenue)}</td>
                <td class="text-right">100.0%</td>
            </tr>
        </tbody>
    </table>
    ` : ''}

        <div class="summary-section">
        <div class="summary-title">สรุปรายรับ</div>
        <div class="summary-stats">
            <div class="stat-box">
                <div class="stat-label">ผู้ป่วยที่ชำระ</div>
                <div class="stat-value">${totalTreatments} คน</div>
            </div>
            <div class="stat-box">
                <div class="stat-label">ส่วนลดรวม</div>
                <div class="stat-value">${formatCurrency(totalDiscount)}</div>
            </div>
            <div class="stat-box">
                <div class="stat-label">เฉลี่ย/คน</div>
                <div class="stat-value">${formatCurrency(averagePerPatient)}</div>
            </div>
            <div class="stat-box">
                <div class="stat-label">รายรับรวม</div>
                <div class="stat-value">${formatCurrency(totalRevenue)}</div>
            </div>
        </div>
    </div>

    <div class="footer">
        <div class="signature-box">
            <div>ผู้จัดทำรายงาน</div>
            <div class="signature-line">
                (....................................)
            </div>
        </div>
        <div class="signature-box">
            <div>ผู้อนุมัติ</div>
            <div class="signature-line">
                (....................................)
            </div>
        </div>
    </div>

    <div class="print-info">
        รายงานนี้สร้างโดยระบบอัตโนมัติ | วันที่พิมพ์: ${formatThaiDate(new Date().toISOString())} เวลา: ${new Date().toLocaleTimeString('th-TH')}
    </div>
</body>
</html>`;

            // สร้าง Blob และ URL สำหรับ PDF
            const blob = new Blob([htmlContent], { type: 'text/html' });
            const url = URL.createObjectURL(blob);

            // เปิดในแท็บใหม่
            const newTab = window.open(url, '_blank');

            if (!newTab) {
                alert('กรุณาอนุญาตให้เปิดหน้าต่าง popup สำหรับการพิมพ์');
                return;
            }

            // รอให้โหลดเสร็จแล้วพิมพ์
            newTab.onload = function () {
                setTimeout(() => {
                    newTab.print();
                }, 1000);
            };

        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('เกิดข้อผิดพลาดในการสร้างรายงาน: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={generatePDF}
            disabled={loading}
            style={{
                padding: '12px 24px',
                backgroundColor: loading ? '#ccc' : '#1976d2',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: loading ? 'none' : '0 2px 8px rgba(25, 118, 210, 0.3)',
                transition: 'all 0.2s ease'
            }}
        >
            {loading ? (
                <>
                    <div style={{
                        width: '16px',
                        height: '16px',
                        border: '2px solid transparent',
                        borderTop: '2px solid white',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                    }}></div>
                    กำลังสร้างรายงาน...
                </>
            ) : (
                <>
                    รายงานประจำวัน
                </>
            )}

            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </button>
    );
};

export default DailyReportButton;