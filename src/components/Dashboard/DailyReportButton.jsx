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

            // ดึงข้อมูลจาก API
            const response = await TreatmentService.getRevenueStats({
                date_from: selectedDate,
                date_to: selectedDate
            });

            if (!response.success) {
                alert('ไม่สามารถดึงข้อมูลได้: ' + response.message);
                return;
            }

            const reportData = response.data;

            // สร้าง HTML สำหรับรายงาน
            const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>รายงานประจำวัน - ${formatThaiDate(selectedDate)}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700&display=swap');
        
        * {
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Prompt', 'Sarabun', 'TH Sarabun New', Arial, sans-serif;
            margin: 0;
            padding: 15mm;
            font-size: 14px;
            line-height: 1.3;
            color: #000000;
            background: white;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }
        
        .header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 2px solid #2B69AC;
            padding-bottom: 15px;
        }
        
        .clinic-name {
            font-size: 28px;
            font-weight: 700;
            color: #2B69AC !important;
            margin-bottom: 8px;
        }
        
        .clinic-subtitle {
            font-size: 14px;
            color: #333333 !important;
            margin-bottom: 4px;
            font-weight: 400;
        }
        
        .report-title {
            font-size: 22px;
            font-weight: 700;
            margin: 20px 0 10px 0;
            color: #2B69AC !important;
            text-decoration: underline;
        }
        
        .report-date {
            font-size: 18px;
            color: #000000 !important;
            margin-bottom: 15px;
            font-weight: 600;
        }
        
        .summary-section {
            margin: 15px 0;
            padding: 15px;
            background-color: #f8f9fa !important;
            border-radius: 8px;
            border: 1px solid #2B69AC;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            page-break-inside: avoid;
        }
        
        .summary-title {
            font-size: 16px;
            font-weight: 700;
            color: #2B69AC !important;
            margin-bottom: 15px;
            border-bottom: 2px solid #2B69AC;
            padding-bottom: 5px;
        }
        
        .summary-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 10px;
            margin-bottom: 15px;
        }
        
        .summary-item {
            background: white !important;
            padding: 12px;
            border-radius: 6px;
            border: 1px solid #2B69AC;
            text-align: center;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }
        
        .summary-label {
            font-size: 11px;
            color: #000000 !important;
            margin-bottom: 6px;
            font-weight: 500;
        }
        
        .summary-value {
            font-size: 18px;
            font-weight: 700;
            color: #2B69AC !important;
            margin: 4px 0;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
            background: white !important;
            border: 1px solid #2B69AC;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            page-break-inside: avoid;
        }
        
        th, td {
            border: 1px solid #2B69AC !important;
            padding: 8px;
            text-align: left;
            color: #000000 !important;
            font-size: 13px;
        }
        
        th {
            background-color: #2B69AC !important;
            color: white !important;
            font-weight: 700;
            text-align: center;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }
        
        .text-center { 
            text-align: center !important; 
        }
        .text-right { 
            text-align: right !important; 
        }
        
        .total-row {
            background-color: #e3f2fd !important;
            font-weight: 700;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }
        
        .total-row td {
            color: #000000 !important;
            font-weight: 700;
        }
        
        .footer {
            margin-top: 25px;
            padding-top: 15px;
            border-top: 2px solid #2B69AC;
            text-align: center;
            color: #000000 !important;
            font-size: 12px;
            font-weight: 500;
        }
        
        .info-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
            margin: 15px 0;
        }
        
        .info-grid p {
            margin: 8px 0;
            font-size: 13px;
            color: #000000 !important;
            font-weight: 500;
        }
        
        .info-grid strong {
            font-weight: 700;
            color: #2B69AC !important;
        }
        
        @media print {
            body { 
                margin: 0;
                padding: 10mm;
                font-size: 12px;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
            
            .header {
                margin-bottom: 15px;
                padding-bottom: 10px;
            }
            
            .clinic-name {
                font-size: 24px;
                margin-bottom: 6px;
            }
            
            .clinic-subtitle {
                font-size: 12px;
                margin-bottom: 3px;
            }
            
            .report-title {
                font-size: 18px;
                margin: 15px 0 8px 0;
            }
            
            .report-date {
                font-size: 16px;
                margin-bottom: 12px;
            }
            
            .summary-section {
                margin: 10px 0;
                padding: 10px;
            }
            
            .summary-title {
                font-size: 14px;
                margin-bottom: 10px;
            }
            
            .summary-grid { 
                grid-template-columns: repeat(4, 1fr);
                gap: 8px;
            }
            
            .summary-item {
                padding: 8px;
            }
            
            .summary-value {
                font-size: 16px;
            }
            
            table {
                margin: 10px 0;
            }
            
            th, td {
                padding: 6px;
                font-size: 11px;
            }
            
            .footer {
                margin-top: 20px;
                padding-top: 10px;
                font-size: 10px;
            }
            
            .info-grid {
                gap: 10px;
                margin: 10px 0;
            }
            
            .info-grid p {
                margin: 6px 0;
                font-size: 11px;
            }
            
            * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }
        }
        
        @page {
            margin: 15mm;
            size: A4 portrait;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="clinic-name">สัมพันธ์คลินิค</div>
        <div class="clinic-subtitle">SAMPAN CLINIC</div>
        <div class="clinic-subtitle">280 หมู่ 4 ถนน เชียงใหม่-ฮอด ต.บ้านหลวง อ.จอมทอง จ.เชียงใหม่ 50160</div>
        <div class="clinic-subtitle">โทรศัพท์: 053-826-524</div>
        
        <div class="report-title">รายงานรายรับประจำวัน</div>
        <div class="report-date">วันที่ ${formatThaiDate(selectedDate)}</div>
    </div>

    <div class="summary-section">
        <div class="summary-title">สรุปรายรับ</div>
        <div class="summary-grid">
            <div class="summary-item">
                <div class="summary-label">จำนวนผู้ป่วยทั้งหมด</div>
                <div class="summary-value">${reportData.summary?.total_treatments || 0}</div>
                <div class="summary-label">คน</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">ผู้ป่วยที่ชำระเงิน</div>
                <div class="summary-value">${reportData.summary?.paid_treatments || 0}</div>
                <div class="summary-label">คน</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">รายรับเฉลี่ย/คน</div>
                <div class="summary-value" style="font-size: 20px;">${formatCurrency(reportData.summary?.avg_revenue_per_patient || 0)}</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">รายรับรวมทั้งหมด</div>
                <div class="summary-value">${formatCurrency(reportData.summary?.total_revenue || 0)}</div>
            </div>
        </div>
    </div>

    ${reportData.paymentMethods && reportData.paymentMethods.length > 0 ? `
    <div class="summary-section">
        <div class="summary-title">รายละเอียดการชำระเงิน</div>
        <table>
            <thead>
                <tr>
                    <th>วิธีการชำระเงิน</th>
                    <th>จำนวนรายการ</th>
                    <th>ยอดเงิน</th>
                    <th>เปอร์เซ็นต์</th>
                </tr>
            </thead>
            <tbody>
                ${reportData.paymentMethods.map(method => {
                const percentage = ((method.total_amount / reportData.summary.total_revenue) * 100).toFixed(1);
                return `
                    <tr>
                        <td>${method.PAYMENT_METHOD}</td>
                        <td class="text-center">${method.count}</td>
                        <td class="text-right">${formatCurrency(method.total_amount)}</td>
                        <td class="text-right">${percentage}%</td>
                    </tr>`;
            }).join('')}
                <tr class="total-row">
                    <td><strong>รวมทั้งหมด</strong></td>
                    <td class="text-center"><strong>${reportData.paymentMethods.reduce((sum, m) => sum + m.count, 0)}</strong></td>
                    <td class="text-right"><strong>${formatCurrency(reportData.summary.total_revenue)}</strong></td>
                    <td class="text-right"><strong>100.0%</strong></td>
                </tr>
            </tbody>
        </table>
    </div>
    ` : ''}

    <div class="summary-section">
        <div class="summary-title">ข้อมูลเพิ่มเติม</div>
        <div class="info-grid">
            <div>
                <p><strong>ส่วนลดรวม:</strong> ${formatCurrency(reportData.summary?.total_discounts || 0)}</p>
                <p><strong>อัตราการชำระเงิน:</strong> ${reportData.summary?.total_treatments > 0
                    ? ((reportData.summary.paid_treatments / reportData.summary.total_treatments) * 100).toFixed(1)
                    : 0
                }%</p>
            </div>
            <div>
                <p><strong>ผู้จัดทำรายงาน:</strong> ระบบคลินิก</p>
                <p><strong>หมายเหตุ:</strong> รายงานนี้สร้างอัตโนมัติจากระบบ</p>
            </div>
        </div>
    </div>

    <div class="footer">
        <div><strong>สัมพันธ์คลินิค - ระบบจัดการคลินิก</strong></div>
        <div>รายงานนี้สร้างโดยระบบอัตโนมัติ | วันที่พิมพ์: ${formatThaiDate(new Date().toISOString())} เวลา: ${new Date().toLocaleTimeString('th-TH')}</div>
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
                backgroundColor: loading ? '#ccc' : '#2e7d32',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: loading ? 'none' : '0 4px 12px rgba(46, 125, 50, 0.3)',
                transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
                if (!loading) {
                    e.target.style.backgroundColor = '#1b5e20';
                    e.target.style.transform = 'translateY(-2px)';
                }
            }}
            onMouseLeave={(e) => {
                if (!loading) {
                    e.target.style.backgroundColor = '#2e7d32';
                    e.target.style.transform = 'translateY(0)';
                }
            }}
        >
            {loading ? (
                <>
                    <div style={{
                        width: '20px',
                        height: '20px',
                        border: '2px solid transparent',
                        borderTop: '2px solid white',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                    }}></div>
                    กำลังสร้างรายงาน...
                </>
            ) : (
                <>
                    📊 รายงานประจำวัน
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