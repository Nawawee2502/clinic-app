// components/patientregistration/AppointmentPrint.js
import React from "react";
import { formatThaiDate, formatThaiTime } from "../../utils/dateTimeUtils";

const AppointmentPrint = ({ appointment, patient }) => {
  if (!appointment) return null;

  // รวบรวมข้อมูลผู้ป่วยจาก patient prop หรือ appointment object
  const patientData = patient || {
    HNCODE: appointment.HNCODE,
    PRENAME: appointment.PRENAME,
    NAME1: appointment.NAME1,
    SURNAME: appointment.SURNAME,
    AGE: appointment.AGE,
    TEL1: appointment.PHONE || appointment.TEL1
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank', 'width=800,height=900');

    // แปลงวันที่และเวลา
    const appointmentDate = appointment.APPOINTMENT_DATE 
      ? formatThaiDate(appointment.APPOINTMENT_DATE) 
      : '-';
    const appointmentTime = appointment.APPOINTMENT_TIME || '-';

    const printHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>ใบนัดหมาย - ${patientData?.HNCODE || appointment.HNCODE || ''}</title>
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
          
          .appointment-container {
            max-width: 700px;
            margin: 0 auto;
            background: white;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
            border-radius: 10px;
            overflow: hidden;
          }
          
          .header {
            background: linear-gradient(135deg, #10B981 0%, #059669 100%);
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
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="20" cy="20" r="2" fill="white" opacity="0.1"/><circle cx="80" cy="80" r="2" fill="white" opacity="0.1"/></svg>');
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
          
          .appointment-title {
            font-size: 24px;
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
            background: #f0fdf4;
            border-radius: 10px;
            padding: 20px;
            margin-bottom: 25px;
            border-left: 4px solid #10B981;
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
            min-width: 120px;
          }
          
          .info-value {
            font-weight: 500;
            color: #059669;
            font-size: 15px;
          }
          
          .appointment-details {
            background: #ffffff;
            border: 2px solid #10B981;
            border-radius: 10px;
            padding: 25px;
            margin-bottom: 25px;
          }
          
          .detail-row {
            display: flex;
            align-items: center;
            margin-bottom: 15px;
            padding-bottom: 15px;
            border-bottom: 1px dashed #d1fae5;
          }
          
          .detail-row:last-child {
            margin-bottom: 0;
            padding-bottom: 0;
            border-bottom: none;
          }
          
          .detail-icon {
            width: 40px;
            height: 40px;
            background: #10B981;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 20px;
            margin-right: 15px;
            flex-shrink: 0;
          }
          
          .detail-content {
            flex: 1;
          }
          
          .detail-label {
            font-size: 12px;
            color: #666;
            margin-bottom: 3px;
          }
          
          .detail-value {
            font-size: 16px;
            font-weight: 600;
            color: #059669;
          }
          
          .reason-section {
            background: #fffbeb;
            border-left: 4px solid #f59e0b;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 25px;
          }
          
          .reason-label {
            font-size: 12px;
            color: #92400e;
            margin-bottom: 8px;
            font-weight: 600;
          }
          
          .reason-text {
            font-size: 15px;
            color: #78350f;
            line-height: 1.8;
          }
          
          .notes-section {
            background: #f0f9ff;
            border-left: 4px solid #3b82f6;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 25px;
          }
          
          .notes-label {
            font-size: 12px;
            color: #1e40af;
            margin-bottom: 5px;
            font-weight: 600;
          }
          
          .notes-text {
            font-size: 14px;
            color: #1e3a8a;
            line-height: 1.6;
            white-space: pre-wrap;
          }
          
          .footer {
            background: #f8f9fa;
            text-align: center;
            padding: 20px;
            color: #666;
            font-size: 12px;
          }
          
          .footer-note {
            font-size: 13px;
            color: #dc2626;
            font-weight: 600;
            margin-top: 10px;
          }
          
          .print-section {
            text-align: center;
            padding: 20px;
            background: white;
          }
          
          .print-btn {
            background: linear-gradient(135deg, #10B981 0%, #059669 100%);
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
            box-shadow: 0 5px 15px rgba(16,185,129,0.4);
          }
          
          .close-btn {
            background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
          }
          
          .close-btn:hover {
            box-shadow: 0 5px 15px rgba(244,67,54,0.4);
          }
          
          @media print {
            body {
              background: white;
              padding: 0;
            }
            .appointment-container {
              box-shadow: none;
              border-radius: 0;
            }
            .print-section {
              display: none !important;
            }
            @page {
              size: A4;
              margin: 1cm;
            }
          }
          
          @media (max-width: 600px) {
            .appointment-container {
              margin: 0;
              border-radius: 0;
            }
            
            .content {
              padding: 20px;
            }
            
            .info-row {
              flex-direction: column;
              align-items: flex-start;
            }
          }
        </style>
      </head>
      <body>
        <div class="appointment-container">
          <!-- Header -->
          <div class="header">
            <div class="clinic-name">สัมพันธ์คลินิค</div>
            <div class="clinic-address">280 หมู่ 4 ถนน เชียงใหม่-ฮอด ต.บ้านหลวง อ.จอมทอง จ.เชียงใหม่ 50160</div>
            <div class="clinic-address">โทรศัพท์: 053-826-524</div>
            <div class="appointment-title">📅 ใบนัดหมาย</div>
          </div>
          
          <!-- Content -->
          <div class="content">
            <!-- Patient Information -->
            <div class="patient-info">
              <div class="info-row">
                <span class="info-label">ชื่อผู้ป่วย:</span>
                <span class="info-value">${patientData?.PRENAME || appointment.PRENAME || ''}${patientData?.NAME1 || appointment.NAME1 || ''} ${patientData?.SURNAME || appointment.SURNAME || ''}</span>
              </div>
              <div class="info-row">
                <span class="info-label">HN:</span>
                <span class="info-value">${patientData?.HNCODE || appointment.HNCODE || '-'}</span>
              </div>
              ${patientData?.AGE || appointment.AGE ? `
              <div class="info-row">
                <span class="info-label">อายุ:</span>
                <span class="info-value">${patientData?.AGE || appointment.AGE || ''} ปี</span>
              </div>
              ` : ''}
              ${patientData?.TEL1 || appointment.PHONE ? `
              <div class="info-row">
                <span class="info-label">เบอร์โทรศัพท์:</span>
                <span class="info-value">${patientData?.TEL1 || appointment.PHONE || '-'}</span>
              </div>
              ` : ''}
            </div>
            
            <!-- Appointment Details -->
            <div class="appointment-details">
              <div class="detail-row">
                <div class="detail-icon">📅</div>
                <div class="detail-content">
                  <div class="detail-label">วันที่นัดหมาย</div>
                  <div class="detail-value">${appointmentDate}</div>
                </div>
              </div>
              
              <div class="detail-row">
                <div class="detail-icon">⏰</div>
                <div class="detail-content">
                  <div class="detail-label">เวลานัดหมาย</div>
                  <div class="detail-value">${appointmentTime}</div>
                </div>
              </div>
              
              ${appointment.DOCTOR_NAME || appointment.doctorName ? `
              <div class="detail-row">
                <div class="detail-icon">👨‍⚕️</div>
                <div class="detail-content">
                  <div class="detail-label">แพทย์ผู้รักษา</div>
                  <div class="detail-value">${appointment.DOCTOR_NAME || appointment.doctorName || '-'}</div>
                </div>
              </div>
              ` : ''}
            </div>
            
            ${appointment.REASON || appointment.reason ? `
            <!-- Reason -->
            <div class="reason-section">
              <div class="reason-label">💊 เหตุผลการนัดหมาย</div>
              <div class="reason-text">${appointment.REASON || appointment.reason || ''}</div>
            </div>
            ` : ''}
            
            ${appointment.NOTES || appointment.notes ? `
            <!-- Notes -->
            <div class="notes-section">
              <div class="notes-label">📝 หมายเหตุ</div>
              <div class="notes-text">${appointment.NOTES || appointment.notes || ''}</div>
            </div>
            ` : ''}
          </div>
          
          <!-- Footer -->
          <div class="footer">
            <div>กรุณามาตามวันและเวลาที่นัดหมาย</div>
            <div class="footer-note">⚠️ กรุณามาก่อนเวลา 10-15 นาที เพื่อเตรียมเอกสารและดำเนินการ</div>
            <div style="margin-top: 15px; font-size: 11px; color: #999;">
              ใบนัดหมายนี้พิมพ์เมื่อ ${formatThaiDate(new Date().toISOString().split('T')[0])} เวลา ${formatThaiTime(new Date())}
            </div>
          </div>
        </div>
        
        <!-- Print Section -->
        <div class="print-section">
          <button class="print-btn" onclick="window.print()">🖨️ พิมพ์ใบนัดหมาย</button>
          <button class="print-btn close-btn" onclick="window.close()">ปิดหน้าต่าง</button>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(printHTML);
    printWindow.document.close();
    printWindow.focus();
    
    // Auto print after a short delay
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  return (
    <button
      onClick={handlePrint}
      style={{
        background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
        color: 'white',
        border: 'none',
        padding: '8px 16px',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        transition: 'all 0.3s ease'
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(16,185,129,0.4)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      🖨️ พิมพ์ใบนัด
    </button>
  );
};

export default AppointmentPrint;

