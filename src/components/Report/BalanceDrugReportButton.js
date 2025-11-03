// src/components/Report/BalanceDrugReportButton.jsx
import React, { useState } from 'react';
import { Button } from '@mui/material';
import { Print as PrintIcon } from '@mui/icons-material';

const BalanceDrugReportButton = ({ reportData, summaryStats }) => {
    const [loading, setLoading] = useState(false);

    const formatNumber = (number) => {
        return Number(number).toLocaleString('th-TH', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };

    const formatDate = (dateString) => {
        if (!dateString || dateString === '-') return '-';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return '-';
            const day = date.getDate().toString().padStart(2, '0');
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const year = date.getFullYear() + 543;
            return `${day}/${month}/${year}`;
        } catch (error) {
            return '-';
        }
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

    const getStockStatus = (qty) => {
        const quantity = parseFloat(qty) || 0;
        if (quantity <= 0) return 'หมดสต็อก';
        if (quantity <= 10) return 'ใกล้หมด';
        return 'ปกติ';
    };

    const generateReport = async () => {
        try {
            setLoading(true);

            if (!reportData || reportData.length === 0) {
                alert('ไม่มีข้อมูลสำหรับสร้างรายงาน');
                return;
            }

            const currentDate = new Date();
            const thaiDate = formatThaiDate(currentDate.toISOString());
            const thaiTime = currentDate.toLocaleTimeString('th-TH', {
                hour: '2-digit',
                minute: '2-digit'
            });

            const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>รายงานสินค้าคงเหลือ</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&display=swap');
        
        * {
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Sarabun', Arial, sans-serif;
            margin: 0;
            padding: 30px;
            font-size: 10px;
            line-height: 1.2;
            color: #000000;
            background: white;
        }
        
        .page {
            max-width: 210mm;
            margin: 0 auto;
        }
        
        .header {
            display: flex;
            flex-direction: row;
            margin-bottom: 10px;
            border-bottom: 1px solid #000000;
            padding-bottom: 5px;
        }
        
        .header-left {
            width: 50%;
        }
        
        .header-right {
            width: 50%;
            text-align: right;
        }
        
        .company-name {
            font-size: 12px;
            font-weight: 700;
            margin-bottom: 5px;
        }
        
        .company-info {
            font-size: 8px;
            line-height: 1.4;
        }
        
        .report-title {
            font-size: 14px;
            font-weight: 700;
            margin-bottom: 10px;
            margin-top: 5px;
            text-align: center;
        }
        
        .info-section {
            display: flex;
            flex-direction: row;
            margin-bottom: 10px;
            border: 1px solid #000000;
        }
        
        .info-box {
            width: 50%;
            padding: 5px;
            border-right: 1px solid #000000;
        }
        
        .info-box-right {
            width: 50%;
            padding: 5px;
        }
        
        .info-row {
            display: flex;
            flex-direction: row;
            margin-bottom: 3px;
        }
        
        .info-label {
            width: 40%;
            font-weight: 700;
            font-size: 8px;
        }
        
        .info-value {
            width: 60%;
            font-size: 8px;
        }
        
        .table-container {
            margin-top: 10px;
            border: 1px solid #000000;
        }
        
        .table-header {
            display: flex;
            flex-direction: row;
            border-bottom: 1px solid #000000;
            background-color: #f2f2f2;
        }
        
        .table-row {
            display: flex;
            flex-direction: row;
            border-bottom: 1px solid #000000;
        }
        
        .table-row:last-child {
            border-bottom: none;
        }
        
        .table-header-cell {
            padding: 4px 2px;
            font-weight: 700;
            font-size: 8px;
            border-right: 1px solid #000000;
            text-align: center;
            word-wrap: break-word;
        }
        
        .table-cell {
            padding: 3px 2px;
            font-size: 8px;
            border-right: 1px solid #000000;
            word-wrap: break-word;
            overflow-wrap: break-word;
        }
        
        .table-cell-last {
            padding: 3px 2px;
            font-size: 8px;
        }
        
        /* ปรับ column width ให้เหมาะกับแนวตั้ง */
        .col-no { width: 5%; text-align: center; }
        .col-code { width: 10%; font-size: 7px; }
        .col-name { width: 25%; font-size: 7px; }
        .col-lot { width: 8%; text-align: center; font-size: 7px; }
        .col-expire { width: 10%; text-align: center; font-size: 7px; }
        .col-qty { width: 8%; text-align: right; }
        .col-unit { width: 8%; text-align: center; font-size: 7px; }
        .col-price { width: 10%; text-align: right; font-size: 7px; }
        .col-amt { width: 10%; text-align: right; }
        .col-status { width: 8%; text-align: center; font-size: 7px; }
        
        .total-section {
            margin-top: 10px;
            display: flex;
            flex-direction: row;
            justify-content: flex-end;
        }
        
        .total-table {
            width: 40%;
            border: 1px solid #000000;
        }
        
        .total-row {
            display: flex;
            flex-direction: row;
            border-bottom: 1px solid #000000;
        }
        
        .total-row:last-child {
            border-bottom: none;
        }
        
        .total-label-cell {
            width: 50%;
            padding: 4px;
            font-weight: 700;
            font-size: 8px;
            border-right: 1px solid #000000;
        }
        
        .total-value-cell {
            width: 50%;
            padding: 4px;
            font-size: 8px;
            text-align: right;
        }
        
        .grand-total-label {
            width: 50%;
            padding: 4px;
            font-weight: 700;
            font-size: 9px;
            border-right: 1px solid #000000;
            background-color: #f2f2f2;
        }
        
        .grand-total-value {
            width: 50%;
            padding: 4px;
            font-size: 9px;
            font-weight: 700;
            text-align: right;
            background-color: #f2f2f2;
        }
        
        .signature-section {
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            margin-top: 30px;
            margin-bottom: 20px;
        }
        
        .signature-box {
            width: 30%;
        }
        
        .signature-line {
            border-bottom: 1px solid #000000;
            margin-top: 25px;
            margin-bottom: 5px;
        }
        
        .signature-text {
            font-size: 8px;
            text-align: center;
        }
        
        .notes-section {
            margin-top: 10px;
            border: 1px solid #000000;
            padding: 5px;
        }
        
        .notes-title {
            font-size: 8px;
            font-weight: 700;
            margin-bottom: 3px;
        }
        
        .notes-text {
            font-size: 7px;
            margin-bottom: 2px;
        }
        
        .footer {
            margin-top: 20px;
            font-size: 7px;
            text-align: center;
            color: #666666;
            border-top: 1px solid #CCCCCC;
            padding-top: 5px;
        }
        
        @media print {
            body {
                padding: 0;
            }
            
            @page {
                size: A4 portrait;
                margin: 15mm 10mm;
            }
        }
    </style>
</head>
<body>
    <div class="page">
        <!-- Header -->
        <div class="header">
            <div class="header-left">
                <div class="company-name">ระบบคลังยา/เวชภัณฑ์</div>
                <div class="company-info">สัมพันธ์คลินิค</div>
                <div class="company-info">280 หมู่ 4 ถนน เชียงใหม่-ฮอด ต.บ้านหลวง อ.จอมทอง จ.เชียงใหม่ 50160</div>
                <div class="company-info">โทร: 053-826-524</div>
            </div>
            <div class="header-right">
                <div class="company-info">วันที่พิมพ์: ${thaiDate}</div>
                <div class="company-info">เวลา: ${thaiTime}</div>
            </div>
        </div>

        <!-- Document Title -->
        <div class="report-title">รายงานสินค้าคงเหลือ (DRUG BALANCE REPORT)</div>

        <!-- Summary Info -->
        <div class="info-section">
            <div class="info-box">
                <div class="info-row">
                    <div class="info-label">รายการทั้งหมด:</div>
                    <div class="info-value">${summaryStats.totalItems} รายการ</div>
                </div>
                <div class="info-row">
                    <div class="info-label">คงเหลือปกติ:</div>
                    <div class="info-value">${summaryStats.inStock} รายการ</div>
                </div>
            </div>
            <div class="info-box-right">
                <div class="info-row">
                    <div class="info-label">ใกล้หมด (≤10):</div>
                    <div class="info-value">${summaryStats.lowStock} รายการ</div>
                </div>
                <div class="info-row">
                    <div class="info-label">หมดสต็อก:</div>
                    <div class="info-value">${summaryStats.outOfStock} รายการ</div>
                </div>
            </div>
        </div>

        <!-- Items Table -->
        <div class="table-container">
            <!-- Table Header -->
            <div class="table-header">
                <div class="table-header-cell col-no">ลำดับ</div>
                <div class="table-header-cell col-code">รหัสยา</div>
                <div class="table-header-cell col-name">ชื่อยา</div>
                <div class="table-header-cell col-lot">Lot No.</div>
                <div class="table-header-cell col-expire">วันหมดอายุ</div>
                <div class="table-header-cell col-qty">จำนวน</div>
                <div class="table-header-cell col-unit">หน่วย</div>
                <div class="table-header-cell col-price">ราคา/หน่วย</div>
                <div class="table-header-cell col-amt">มูลค่า</div>
                <div class="table-header-cell col-status" style="border-right: none;">สถานะ</div>
            </div>

            <!-- Table Rows -->
            ${reportData.map((item, index) => {
                const status = getStockStatus(item.QTY);
                return `
                <div class="table-row">
                    <div class="table-cell col-no">${index + 1}</div>
                    <div class="table-cell col-code">${item.DRUG_CODE}</div>
                    <div class="table-cell col-name">${item.GENERIC_NAME || '-'}</div>
                    <div class="table-cell col-lot">${item.LOT_NO || '-'}</div>
                    <div class="table-cell col-expire">${formatDate(item.EXPIRE_DATE)}</div>
                    <div class="table-cell col-qty">${formatNumber(item.QTY)}</div>
                    <div class="table-cell col-unit">${item.UNIT_NAME1 || item.UNIT_CODE1 || '-'}</div>
                    <div class="table-cell col-price">${formatNumber(item.UNIT_PRICE || 0)}</div>
                    <div class="table-cell col-amt">${formatNumber(item.AMT || 0)}</div>
                    <div class="table-cell-last col-status">${status}</div>
                </div>`;
            }).join('')}
        </div>

        <!-- Totals Section -->
        <div class="total-section">
            <div class="total-table">
                <div class="total-row">
                    <div class="total-label-cell">จำนวนรวม:</div>
                    <div class="total-value-cell">${formatNumber(reportData.reduce((sum, item) => sum + (parseFloat(item.QTY) || 0), 0))}</div>
                </div>
                <div class="total-row">
                    <div class="grand-total-label">มูลค่ารวมทั้งสิ้น:</div>
                    <div class="grand-total-value">${formatNumber(reportData.reduce((sum, item) => sum + (parseFloat(item.AMT) || 0), 0))} บาท</div>
                </div>
            </div>
        </div>

        <!-- Notes Section -->
        <div class="notes-section">
            <div class="notes-title">หมายเหตุ:</div>
            <div class="notes-text">1. รายงานนี้แสดงข้อมูลสินค้าคงเหลือในระบบ ณ วันที่พิมพ์รายงาน</div>
            <div class="notes-text">2. สถานะ "ใกล้หมด" หมายถึง สินค้าที่เหลือน้อยกว่าหรือเท่ากับ 10 หน่วย</div>
            <div class="notes-text">3. สถานะ "หมดสต็อก" หมายถึง สินค้าที่คงเหลือ 0 หรือน้อยกว่า</div>
        </div>

        <!-- Signature Section -->
        <div class="signature-section">
            <div class="signature-box">
                <div class="signature-line"></div>
                <div class="signature-text">ผู้จัดทำรายงาน</div>
            </div>
            <div class="signature-box">
                <div class="signature-line"></div>
                <div class="signature-text">ผู้ตรวจสอบ</div>
            </div>
            <div class="signature-box">
                <div class="signature-line"></div>
                <div class="signature-text">ผู้อนุมัติ</div>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            รายงานสินค้าคงเหลือ - ระบบคลังยา/เวชภัณฑ์ | สร้างโดยระบบอัตโนมัติ
        </div>
    </div>
</body>
</html>`;

            // สร้าง HTML และเปิดในแท็บใหม่
            const blob = new Blob([htmlContent], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const newTab = window.open(url, '_blank');

            if (!newTab) {
                alert('กรุณาอนุญาตให้เปิดหน้าต่าง popup สำหรับการพิมพ์');
                return;
            }

            // รอให้หน้าเว็บโหลดเสร็จแล้วเรียกคำสั่งพิมพ์
            newTab.onload = function () {
                setTimeout(() => {
                    newTab.print();
                }, 1000);
            };

        } catch (error) {
            console.error('Error generating report:', error);
            alert('เกิดข้อผิดพลาดในการสร้างรายงาน: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button
            variant="contained"
            startIcon={<PrintIcon />}
            onClick={generateReport}
            disabled={!reportData || reportData.length === 0 || loading}
            sx={{
                backgroundColor: '#5686E1',
                '&:hover': {
                    backgroundColor: '#4070C0'
                }
            }}
        >
            {loading ? 'กำลังสร้างรายงาน...' : 'พิมพ์รายงาน'}
        </Button>
    );
};

export default BalanceDrugReportButton;