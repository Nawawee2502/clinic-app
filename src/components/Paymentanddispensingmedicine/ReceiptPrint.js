// components/paymentanddispensingmedicine/ReceiptPrint.js
import React from "react";

const ReceiptPrint = ({ patient, items, paymentData }) => {
    if (!patient) return null;

    const totalAmount = items.reduce((sum, i) => sum + i.price, 0);
    const finalAmount = totalAmount - (paymentData.discount || 0);

    const handlePrint = () => {
        const receiptWindow = window.open('', '_blank', 'width=800,height=900');

        const receiptHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>ใบเสร็จรับเงิน - ${patient.VNO}</title>
                <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&display=swap" rel="stylesheet">
                <style>
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }
                    
                    body {
                        font-family: 'Sarabun', Arial, sans-serif;
                        font-size: 14px;
                        line-height: 1.6;
                        color: #333;
                        background: #f5f5f5;
                        padding: 20px;
                    }
                    
                    .receipt-container {
                        max-width: 700px;
                        margin: 0 auto;
                        background: white;
                        box-shadow: 0 0 20px rgba(0,0,0,0.1);
                        border-radius: 10px;
                        overflow: hidden;
                    }
                    
                    .header {
                        background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
                        color: white;
                        text-align: center;
                        padding: 30px 20px;
                        position: relative;
                    }
                    
                    .header::before {
                        content: '';
                        position: absolute;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="20" cy="20" r="2" fill="white" opacity="0.1"/><circle cx="80" cy="80" r="2" fill="white" opacity="0.1"/><circle cx="40" cy="60" r="1" fill="white" opacity="0.1"/></svg>');
                    }
                    
                    .clinic-name {
                        font-size: 28px;
                        font-weight: 700;
                        margin-bottom: 8px;
                        position: relative;
                        z-index: 1;
                    }
                    
                    .clinic-address {
                        font-size: 14px;
                        opacity: 0.9;
                        margin-bottom: 4px;
                        position: relative;
                        z-index: 1;
                    }
                    
                    .receipt-title {
                        font-size: 20px;
                        font-weight: 600;
                        margin-top: 15px;
                        padding: 10px 30px;
                        background: rgba(255,255,255,0.2);
                        border-radius: 20px;
                        display: inline-block;
                        position: relative;
                        z-index: 1;
                    }
                    
                    .content {
                        padding: 30px;
                    }
                    
                    .patient-info {
                        background: #f8f9fa;
                        border-radius: 10px;
                        padding: 20px;
                        margin-bottom: 25px;
                        border-left: 4px solid #1976d2;
                    }
                    
                    .info-row {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 10px;
                        flex-wrap: wrap;
                        gap: 10px;
                    }
                    
                    .info-row:last-child {
                        margin-bottom: 0;
                    }
                    
                    .info-label {
                        font-weight: 600;
                        color: #555;
                        min-width: 80px;
                    }
                    
                    .info-value {
                        font-weight: 500;
                        color: #1976d2;
                    }
                    
                    .items-section {
                        margin-bottom: 25px;
                    }
                    
                    .section-title {
                        font-size: 18px;
                        font-weight: 600;
                        color: #1976d2;
                        margin-bottom: 15px;
                        padding-bottom: 5px;
                        border-bottom: 2px solid #e3f2fd;
                    }
                    
                    .items-table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-bottom: 20px;
                        border-radius: 8px;
                        overflow: hidden;
                        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    }
                    
                    .items-table th {
                        background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
                        color: white;
                        font-weight: 600;
                        padding: 15px 10px;
                        text-align: left;
                        font-size: 14px;
                    }
                    
                    .items-table th:nth-child(1) { width: 50%; }
                    .items-table th:nth-child(2) { width: 20%; text-align: center; }
                    .items-table th:nth-child(3) { width: 30%; text-align: right; }
                    
                    .items-table td {
                        padding: 12px 10px;
                        border-bottom: 1px solid #eee;
                        font-size: 13px;
                    }
                    
                    .items-table tbody tr:nth-child(even) {
                        background: #f8f9fa;
                    }
                    
                    .items-table tbody tr:hover {
                        background: #e3f2fd;
                    }
                    
                    .item-name {
                        font-weight: 500;
                        color: #333;
                    }
                    
                    .item-quantity {
                        text-align: center;
                        font-weight: 500;
                    }
                    
                    .item-price {
                        text-align: right;
                        font-weight: 600;
                        color: #1976d2;
                    }
                    
                    .summary-section {
                        background: #f8f9fa;
                        border-radius: 10px;
                        padding: 20px;
                        border-top: 3px solid #1976d2;
                    }
                    
                    .summary-row {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 10px;
                        font-size: 15px;
                    }
                    
                    .summary-row:last-child {
                        margin-bottom: 0;
                    }
                    
                    .summary-label {
                        font-weight: 500;
                    }
                    
                    .summary-value {
                        font-weight: 600;
                    }
                    
                    .total-row {
                        background: white;
                        margin: 15px -10px -10px;
                        padding: 15px 10px;
                        border-radius: 8px;
                        border: 2px solid #1976d2;
                        font-size: 18px;
                        font-weight: 700;
                        color: #1976d2;
                    }
                    
                    .footer {
                        background: #f8f9fa;
                        text-align: center;
                        padding: 20px;
                        color: #666;
                        font-size: 12px;
                    }
                    
                    .thank-you {
                        font-size: 16px;
                        font-weight: 600;
                        color: #1976d2;
                        margin-bottom: 10px;
                    }
                    
                    .print-section {
                        text-align: center;
                        padding: 20px;
                        background: white;
                    }
                    
                    .print-btn {
                        background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
                        color: white;
                        border: none;
                        padding: 12px 30px;
                        font-size: 16px;
                        font-weight: 600;
                        border-radius: 25px;
                        cursor: pointer;
                        margin: 0 10px;
                        transition: all 0.3s ease;
                        font-family: 'Sarabun', Arial, sans-serif;
                    }
                    
                    .print-btn:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 5px 15px rgba(25,118,210,0.4);
                    }
                    
                    .close-btn {
                        background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
                    }
                    
                    .close-btn:hover {
                        box-shadow: 0 5px 15px rgba(244,67,54,0.4);
                    }
                    
                    .empty-state {
                        text-align: center;
                        padding: 40px;
                        color: #999;
                        font-style: italic;
                    }
                    
                    @media print {
                        body {
                            background: white;
                            padding: 0;
                        }
                        .receipt-container {
                            box-shadow: none;
                            border-radius: 0;
                        }
                        .print-section {
                            display: none !important;
                        }
                    }
                    
                    @media (max-width: 600px) {
                        .receipt-container {
                            margin: 0;
                            border-radius: 0;
                        }
                        
                        .content {
                            padding: 20px;
                        }
                        
                        .items-table th,
                        .items-table td {
                            padding: 8px 5px;
                            font-size: 12px;
                        }
                        
                        .info-row {
                            flex-direction: column;
                            align-items: flex-start;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="receipt-container">
                    <!-- Header -->
                    <div class="header">
                        <div class="clinic-name">สัมพันธ์คลินิค</div>
                        <div class="clinic-address">280 หมู่ 4 ถนน เชียงใหม่-ฮอด ต.บ้านหลวง อ.จอมทอง จ.เชียงใหม่ 50160</div>
                        <div class="clinic-address">โทรศัพท์: 053-826-524</div>
                        <div class="receipt-title">ใบเสร็จรับเงิน</div>
                    </div>
                    
                    <!-- Content -->
                    <div class="content">
                        <!-- Patient Information -->
                        <div class="patient-info">
                            <div class="info-row">
                                <span class="info-label">เลขที่ VN:</span>
                                <span class="info-value">${patient.VNO}</span>
                                <span class="info-label">เลขที่ HN:</span>
                                <span class="info-value">${patient.HNCODE}</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">ชื่อผู้ป่วย:</span>
                                <span class="info-value">${patient.PRENAME}${patient.NAME1} ${patient.SURNAME}</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">วันที่:</span>
                                <span class="info-value">${new Date().toLocaleDateString('th-TH', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}</span>
                                <span class="info-label">เวลา:</span>
                                <span class="info-value">${new Date().toLocaleTimeString('th-TH', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}</span>
                            </div>
                        </div>
                        
                        <!-- Items Section -->
                        <div class="items-section">
                            <div class="section-title">รายการค่าใช้จ่าย</div>
                            
                            ${items.length > 0 ? `
                            <table class="items-table">
                                <thead>
                                    <tr>
                                        <th>รายการ</th>
                                        <th>จำนวน</th>
                                        <th>ราคา (บาท)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${items.map(item => `
                                        <tr>
                                            <td class="item-name">${item.name}</td>
                                            <td class="item-quantity">${item.quantity} ${item.unit}</td>
                                            <td class="item-price">${item.price.toFixed(2)}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                            ` : '<div class="empty-state">ไม่มีรายการค่าใช้จ่าย</div>'}
                        </div>
                        
                        <!-- Summary Section -->
                        <div class="summary-section">
                            <div class="summary-row">
                                <span class="summary-label">รวมค่ารักษาทั้งหมด:</span>
                                <span class="summary-value">${totalAmount.toFixed(2)} บาท</span>
                            </div>
                            
                            ${paymentData.discount > 0 ? `
                            <div class="summary-row">
                                <span class="summary-label">หักส่วนลด:</span>
                                <span class="summary-value">-${paymentData.discount.toFixed(2)} บาท</span>
                            </div>
                            ` : ''}
                            
                            <div class="summary-row total-row">
                                <span class="summary-label">ยอดชำระสุทธิ:</span>
                                <span class="summary-value">${finalAmount.toFixed(2)} บาท</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Footer -->
                    <div class="footer">
                        <div class="thank-you">ขอบคุณที่ใช้บริการ</div>
                        <div>พิมพ์เมื่อ: ${new Date().toLocaleString('th-TH')}</div>
                    </div>
                </div>
                
                <!-- Print Section -->
                <div class="print-section">
                    <button class="print-btn" onclick="window.print()">
                        🖨️ พิมพ์ใบเสร็จ
                    </button>
                    <button class="print-btn close-btn" onclick="window.close()">
                        ❌ ปิดหน้าต่าง
                    </button>
                </div>
            </body>
            </html>
        `;

        receiptWindow.document.write(receiptHTML);
        receiptWindow.document.close();
        receiptWindow.focus();
    };

    return (
        <button 
            onClick={handlePrint}
            style={{ 
                padding: "10px 20px", 
                background: "#1976d2", 
                color: "white", 
                borderRadius: "6px",
                border: "none",
                cursor: "pointer",
                fontSize: "16px",
                fontWeight: "600"
            }}
        >
            🧾 พิมพ์ใบเสร็จ
        </button>
    );
};

export default ReceiptPrint;