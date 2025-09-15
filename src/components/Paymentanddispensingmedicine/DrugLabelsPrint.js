// components/paymentanddispensingmedicine/DrugLabelsPrint.js
import React from "react";

const DrugLabelsPrint = ({ patient, drugs }) => {
    if (!patient || drugs.length === 0) return null;

    const handlePrint = () => {
        const labelWindow = window.open('', '_blank', 'width=1200,height=800');

        const labelsHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>ฉลากยา - ${patient.PRENAME}${patient.NAME1} ${patient.SURNAME}</title>
                <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&display=swap" rel="stylesheet">
                <style>
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }
                    
                    body {
                        font-family: 'Sarabun', Arial, sans-serif;
                        font-size: 13px;
                        line-height: 1.4;
                        background: #f0f2f5;
                        padding: 20px;
                    }
                    
                    .labels-container {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
                        gap: 20px;
                        max-width: 1200px;
                        margin: 0 auto;
                    }
                    
                    .drug-label {
                        width: 340px;
                        height: 480px;
                        background: white;
                        border: 2px solid #1976d2;
                        border-radius: 12px;
                        overflow: hidden;
                        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                        page-break-inside: avoid;
                        display: flex;
                        flex-direction: column;
                    }
                    
                    .label-header {
                        background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
                        color: white;
                        padding: 15px;
                        text-align: center;
                        position: relative;
                        overflow: hidden;
                    }
                    
                    .label-header::before {
                        content: '💊';
                        position: absolute;
                        left: 15px;
                        top: 50%;
                        transform: translateY(-50%);
                        font-size: 24px;
                        background: white;
                        color: #1976d2;
                        width: 40px;
                        height: 40px;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }
                    
                    .clinic-title {
                        font-size: 18px;
                        font-weight: 700;
                        margin-bottom: 2px;
                        letter-spacing: 0.5px;
                    }
                    
                    .clinic-subtitle {
                        font-size: 11px;
                        opacity: 0.95;
                        margin-bottom: 2px;
                    }
                    
                    .clinic-phone {
                        font-size: 12px;
                        font-weight: 500;
                    }
                    
                    .label-content {
                        padding: 18px;
                        flex: 1;
                        display: flex;
                        flex-direction: column;
                    }
                    
                    .patient-section {
                        background: #f8f9fa;
                        border-radius: 8px;
                        padding: 12px;
                        margin-bottom: 15px;
                        border-left: 4px solid #1976d2;
                    }
                    
                    .patient-row {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 6px;
                        font-size: 12px;
                    }
                    
                    .patient-row:last-child {
                        margin-bottom: 0;
                    }
                    
                    .patient-label {
                        color: #666;
                        font-weight: 500;
                        min-width: 60px;
                    }
                    
                    .patient-value {
                        font-weight: 600;
                        color: #333;
                        flex: 1;
                        margin: 0 8px;
                    }
                    
                    .drug-name-section {
                        text-align: center;
                        margin-bottom: 15px;
                    }
                    
                    .drug-name {
                        font-size: 16px;
                        font-weight: 700;
                        color: #1976d2;
                        background: #e3f2fd;
                        padding: 8px 12px;
                        border-radius: 6px;
                        border: 1px solid #bbdefb;
                    }
                    
                    .dosage-section {
                        background: #fff3e0;
                        border-radius: 8px;
                        padding: 12px;
                        margin-bottom: 15px;
                        border: 1px solid #ffcc02;
                    }
                    
                    .dosage-title {
                        font-size: 13px;
                        font-weight: 600;
                        color: #f57c00;
                        text-align: center;
                        margin-bottom: 8px;
                    }
                    
                    .dosage-info {
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        gap: 20px;
                        flex-wrap: wrap;
                    }
                    
                    .dosage-item {
                        text-align: center;
                    }
                    
                    .dosage-number {
                        font-size: 18px;
                        font-weight: 700;
                        color: #d32f2f;
                        display: block;
                    }
                    
                    .dosage-label {
                        font-size: 11px;
                        color: #666;
                    }
                    
                    .time-grid {
                        display: grid;
                        grid-template-columns: repeat(4, 1fr);
                        gap: 8px;
                        margin: 12px 0;
                    }
                    
                    .time-slot {
                        text-align: center;
                        padding: 6px 4px;
                        border-radius: 6px;
                        font-size: 10px;
                        border: 1px solid #e0e0e0;
                        background: white;
                    }
                    
                    .time-slot.active {
                        background: #e3f2fd;
                        border-color: #1976d2;
                        color: #1976d2;
                        font-weight: 600;
                    }
                    
                    .time-icon {
                        display: block;
                        font-size: 14px;
                        margin-bottom: 2px;
                    }
                    
                    .meal-timing {
                        margin: 12px 0;
                    }
                    
                    .meal-option {
                        display: flex;
                        align-items: center;
                        margin-bottom: 4px;
                        font-size: 11px;
                    }
                    
                    .meal-checkbox {
                        width: 12px;
                        height: 12px;
                        border: 1px solid #1976d2;
                        border-radius: 2px;
                        margin-right: 6px;
                        position: relative;
                        background: white;
                    }
                    
                    .meal-checkbox.checked {
                        background: #1976d2;
                    }
                    
                    .meal-checkbox.checked::after {
                        content: '✓';
                        position: absolute;
                        top: -2px;
                        left: 2px;
                        color: white;
                        font-size: 10px;
                        font-weight: bold;
                    }
                    
                    .meal-text {
                        flex: 1;
                    }
                    
                    .meal-english {
                        color: #666;
                        font-size: 9px;
                        margin-left: auto;
                    }
                    
                    .instructions-section {
                        background: #f1f8e9;
                        border-radius: 8px;
                        padding: 12px;
                        margin-top: auto;
                        border: 1px solid #c8e6c9;
                    }
                    
                    .instructions-title {
                        font-size: 12px;
                        font-weight: 600;
                        color: #388e3c;
                        margin-bottom: 8px;
                    }
                    
                    .instructions-grid {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 6px;
                        font-size: 9px;
                        color: #555;
                    }
                    
                    .instruction-item {
                        display: flex;
                        align-items: flex-start;
                        line-height: 1.3;
                    }
                    
                    .instruction-checkbox {
                        width: 10px;
                        height: 10px;
                        border: 1px solid #388e3c;
                        border-radius: 1px;
                        margin-right: 4px;
                        margin-top: 1px;
                        flex-shrink: 0;
                        background: white;
                    }
                    
                    .instruction-checkbox.checked {
                        background: #388e3c;
                    }
                    
                    .instruction-checkbox.checked::after {
                        content: '✓';
                        position: absolute;
                        color: white;
                        font-size: 7px;
                        font-weight: bold;
                        margin-left: -8px;
                        margin-top: -1px;
                    }
                    
                    .expiry-section {
                        text-align: center;
                        margin-top: 15px;
                        padding-top: 12px;
                        border-top: 1px solid #e0e0e0;
                    }
                    
                    .expiry-text {
                        font-size: 11px;
                        color: #666;
                    }
                    
                    .expiry-date {
                        font-weight: 600;
                        color: #d32f2f;
                        margin-left: 5px;
                    }
                    
                    .print-controls {
                        position: fixed;
                        top: 20px;
                        right: 20px;
                        z-index: 1000;
                        display: flex;
                        gap: 10px;
                    }
                    
                    .print-btn {
                        background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
                        color: white;
                        border: none;
                        padding: 10px 20px;
                        border-radius: 20px;
                        font-size: 14px;
                        font-weight: 600;
                        cursor: pointer;
                        box-shadow: 0 2px 8px rgba(25,118,210,0.3);
                        transition: all 0.3s ease;
                        font-family: 'Sarabun', Arial, sans-serif;
                    }
                    
                    .print-btn:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 4px 12px rgba(25,118,210,0.4);
                    }
                    
                    .close-btn {
                        background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
                    }
                    
                    .close-btn:hover {
                        box-shadow: 0 4px 12px rgba(244,67,54,0.4);
                    }
                    
                    @media print {
                        body {
                            background: white;
                            padding: 10px;
                        }
                        
                        .print-controls {
                            display: none !important;
                        }
                        
                        .labels-container {
                            gap: 15px;
                        }
                        
                        .drug-label {
                            box-shadow: none;
                            border-width: 1px;
                        }
                    }
                    
                    @page {
                        margin: 10mm;
                        size: A4;
                    }
                </style>
            </head>
            <body>
                <div class="print-controls">
                    <button class="print-btn" onclick="window.print()">
                        🖨️ พิมพ์ฉลากยาทั้งหมด (${drugs.length} ฉลาก)
                    </button>
                    <button class="print-btn close-btn" onclick="window.close()">
                        ❌ ปิดหน้าต่าง
                    </button>
                </div>
                
                <div class="labels-container">
                    ${drugs.map((drug, index) => {
                        const dosage = drug.DOSAGE || '1';
                        const frequency = parseInt(drug.FREQUENCY || '3');
                        const quantity = drug.QTY || 1;
                        const unit = drug.UNIT_CODE || 'เม็ด';
                        const drugName = drug.GENERIC_NAME || drug.DRUG_CODE || 'ยา';
                        const expireDate = drug.EXPIRE_DATE || '31/12/2025';

                        return `
                            <div class="drug-label">
                                <div class="label-header">
                                    <div class="clinic-title">สัมพันธ์คลินิค คลินิกเวชกรรม</div>
                                    <div class="clinic-subtitle">280/4 ต.บ้านหลวง อ.จอมทอง จ.เชียงใหม่ 50160</div>
                                    <div class="clinic-phone">โทร: 053-341-723</div>
                                </div>
                                
                                <div class="label-content">
                                    <div class="patient-section">
                                        <div class="patient-row">
                                            <span class="patient-label">ชื่อผู้ป่วย</span>
                                            <span class="patient-value">${patient.PRENAME}${patient.NAME1} ${patient.SURNAME}</span>
                                            <span class="patient-label">วันที่</span>
                                            <span class="patient-value">${new Date().toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit', year: '2-digit' })}</span>
                                        </div>
                                        <div class="patient-row">
                                            <span class="patient-label">ที่อยู่</span>
                                            <span class="patient-value">HN: ${patient.HNCODE} VN: ${patient.VNO}</span>
                                            <span class="patient-label">จำนวน</span>
                                            <span class="patient-value">${quantity} ${unit}</span>
                                        </div>
                                    </div>
                                    
                                    <div class="drug-name-section">
                                        <div class="drug-name">${drugName}</div>
                                    </div>
                                    
                                    <div class="dosage-section">
                                        <div class="dosage-title">วิธีการใช้ยา</div>
                                        <div class="dosage-info">
                                            <div class="dosage-item">
                                                <span class="dosage-number">${dosage}</span>
                                                <span class="dosage-label">เม็ด/ครั้ง</span>
                                            </div>
                                            <div class="dosage-item">
                                                <span class="dosage-number">${frequency}</span>
                                                <span class="dosage-label">ครั้ง/วัน</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div class="time-grid">
                                        <div class="time-slot ${frequency >= 1 ? 'active' : ''}">
                                            <span class="time-icon">🌅</span>
                                            <div>เช้า<br>Morning</div>
                                        </div>
                                        <div class="time-slot ${frequency >= 2 ? 'active' : ''}">
                                            <span class="time-icon">☀️</span>
                                            <div>กลางวัน<br>Noon</div>
                                        </div>
                                        <div class="time-slot ${frequency >= 3 ? 'active' : ''}">
                                            <span class="time-icon">🌆</span>
                                            <div>เย็น<br>Evening</div>
                                        </div>
                                        <div class="time-slot ${frequency >= 4 ? 'active' : ''}">
                                            <span class="time-icon">🌙</span>
                                            <div>ก่อนนอน<br>Bedtime</div>
                                        </div>
                                    </div>
                                    
                                    <div class="meal-timing">
                                        <div class="meal-option">
                                            <div class="meal-checkbox"></div>
                                            <span class="meal-text">ก่อนอาหาร</span>
                                            <span class="meal-english">Before meal</span>
                                        </div>
                                        <div class="meal-option">
                                            <div class="meal-checkbox checked"></div>
                                            <span class="meal-text">หลังอาหาร</span>
                                            <span class="meal-english">After meal</span>
                                        </div>
                                    </div>
                                    
                                    <div class="instructions-section">
                                        <div class="instructions-title">คำแนะนำในการใช้ยา</div>
                                        <div class="instructions-grid">
                                            <div class="instruction-item">
                                                <div class="instruction-checkbox"></div>
                                                <span>ก่อนอาหารครึ่ง-1 ชั่วโมง<br><em>30-60 min before meals</em></span>
                                            </div>
                                            <div class="instruction-item">
                                                <div class="instruction-checkbox checked"></div>
                                                <span>ทานยาติดต่อกันจนหมด<br><em>Take until finished</em></span>
                                            </div>
                                            <div class="instruction-item">
                                                <div class="instruction-checkbox"></div>
                                                <span>ทานหลังอาหารทันที<br><em>Immediately after meals</em></span>
                                            </div>
                                            <div class="instruction-item">
                                                <div class="instruction-checkbox checked"></div>
                                                <span>ดื่มน้ำตามมากๆ<br><em>Drink plenty of water</em></span>
                                            </div>
                                            <div class="instruction-item">
                                                <div class="instruction-checkbox"></div>
                                                <span>ยานี้อาจทำให้ง่วงซึม<br><em>May cause drowsiness</em></span>
                                            </div>
                                            <div class="instruction-item">
                                                <div class="instruction-checkbox"></div>
                                                <span>อื่นๆ<br><em>Others</em></span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div class="expiry-section">
                                        <span class="expiry-text">วันหมดอายุ (Exp.)</span>
                                        <span class="expiry-date">${expireDate}</span>
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </body>
            </html>
        `;

        labelWindow.document.write(labelsHTML);
        labelWindow.document.close();
        labelWindow.focus();
    };

    return (
        <button 
            onClick={handlePrint}
            style={{ 
                padding: "10px 20px", 
                background: "#2B69AC", 
                color: "white", 
                borderRadius: "6px",
                border: "none",
                cursor: "pointer",
                fontSize: "16px",
                fontWeight: "600"
            }}
        >
            💊 พิมพ์ฉลากยา
        </button>
    );
};

export default DrugLabelsPrint;