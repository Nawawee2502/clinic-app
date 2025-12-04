import { formatThaiDate, formatThaiDateShort } from '../../../utils/dateTimeUtils';

class SickLeavePDF {
  static generateHTML(formData, clinicInfo, currentPatient) {
    const clinicName = clinicInfo?.CLINIC_NAME || 'สัมพันธ์คลินิก คลินิกเวชกรรม';
    const clinicAddress = clinicInfo?.ADDR1 || '280/4 ต.บ้านหลวง อ.จอมทอง จ.เชียงใหม่ 50160';
    const clinicTel = clinicInfo?.TEL1 || '053-341-723';
    
    const patientName = formData.patientName || `${currentPatient?.PRENAME || ''}${currentPatient?.NAME1 || ''} ${currentPatient?.SURNAME || ''}`.trim();
    
    const doctorName = formData.doctorName || 'นายแพทย์ ภรภัทร ก๋องเงิน';
    const doctorLicense = formData.doctorLicense || 'ว.78503';
    
    // Format dates
    const getDateParts = (dateString) => {
      if (!dateString) {
        const now = new Date();
        return {
          day: now.getDate(),
          month: now.getMonth() + 1,
          year: now.getFullYear() + 543
        };
      }
      const date = new Date(dateString);
      return {
        day: date.getDate(),
        month: date.getMonth() + 1,
        year: date.getFullYear() + 543
      };
    };
    
    const examDateParts = getDateParts(formData.examinationDate);
    const fromDateParts = getDateParts(formData.sickLeaveFrom);
    const toDateParts = getDateParts(formData.sickLeaveTo);
    
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>ใบรับรองแพทย์ (สำหรับลางาน)</title>
    <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        @page {
            size: A4;
            margin: 15mm 20mm;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Sarabun', sans-serif;
            font-size: 13px;
            line-height: 1.6;
            color: #000;
            padding: 0;
        }
        
        .container {
            width: 100%;
        }
        
        .header {
            margin-bottom: 15px;
            display: flex;
            align-items: flex-start;
        }
        
        .clinic-logo {
            width: 55px;
            height: 55px;
            background: #3B82F6;
            color: white;
            display: inline-block;
            text-align: center;
            line-height: 55px;
            font-size: 22px;
            border-radius: 4px;
            margin-right: 12px;
            flex-shrink: 0;
        }
        
        .clinic-info {
            flex: 1;
        }
        
        .clinic-name {
            font-size: 18px;
            font-weight: 700;
            color: #5BA9FF;
            margin-bottom: 3px;
        }
        
        .clinic-address {
            font-size: 11px;
            margin-bottom: 2px;
        }
        
        .clinic-tel {
            font-size: 11px;
        }
        
        .title {
            text-align: center;
            font-size: 17px;
            font-weight: 700;
            margin: 15px 0;
        }
        
        .form-field {
            margin-bottom: 10px;
            display: flex;
            align-items: baseline;
            font-size: 13px;
        }
        
        .form-label {
            min-width: 200px;
            font-weight: 500;
            flex-shrink: 0;
        }
        
        .underline {
            border-bottom: 1px solid #000;
            flex: 1;
            margin-left: 8px;
            min-height: 18px;
            padding-bottom: 1px;
            display: inline-block;
        }
        
        .underline-inline {
            border-bottom: 1px solid #000;
            display: inline-block;
            min-width: 50px;
            text-align: center;
            padding-bottom: 1px;
        }
        
        .text-block {
            text-align: justify;
            line-height: 1.8;
            margin: 10px 0;
            font-size: 13px;
        }
        
        .signature-line {
            border-top: 1px solid #000;
            width: 180px;
            margin-top: 30px;
            padding-top: 3px;
            text-align: center;
            display: inline-block;
        }
        
        .signature-section {
            display: flex;
            justify-content: space-between;
            margin-top: 60px;
        }
        
        @media print {
            body {
                padding: 0;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <div class="clinic-logo">S</div>
            <div class="clinic-info">
                <div class="clinic-name">${clinicName}</div>
                <div class="clinic-address">${clinicAddress}</div>
                <div class="clinic-tel">โทร ${clinicTel}</div>
            </div>
        </div>
        
        <div class="title">ใบรับรองแพทย์ (สำหรับลางาน)</div>
        
        <!-- Doctor's Statement -->
        <div class="text-block">
            ข้าพเจ้า ${doctorName} แพทย์ปริญญา ปฏิบัติงาน ณ ${clinicName} เป็นผู้ประกอบวิชาชีพเวชกรรมแผนปัจจุบันชั้นหนึ่งสาขาเวชกรรม 
            ใบอนุญาตประกอบวิชาชีพเวชกรรมเลขที่ ${doctorLicense} ได้ตรวจร่างกายผู้ป่วยชื่อ
            <span class="underline" style="width: 400px; display: inline-block; margin-left: 10px;">${patientName}</span>
        </div>
        
        <div class="form-field">
            <span class="form-label">เมื่อวันที่</span>
            <span class="underline" style="width: 200px;">${examDateParts.day} เดือน ${examDateParts.month} พ.ศ. ${examDateParts.year}</span>
        </div>
        
        <div class="form-field">
            <span class="form-label">เป็นโรค</span>
            <span class="underline">${formData.diagnosis || ''}</span>
        </div>
        
        <div class="form-field">
            <span class="form-label">มีอาการ</span>
            <span class="underline">${formData.symptoms || ''}</span>
        </div>
        
        <div class="form-field">
            <span class="form-label">สรุปความเห็น</span>
            <span class="underline">${formData.conclusion || ''}</span>
        </div>
        
        <div class="text-block">
            ได้เข้ามารับการรักษาในสถานพยาบาล วันที่
            <span class="underline-inline" style="margin: 0 5px;">${examDateParts.day}</span>
            เดือน
            <span class="underline-inline" style="margin: 0 5px;">${examDateParts.month}</span>
            พ.ศ.
            <span class="underline-inline" style="margin: 0 5px; min-width: 70px;">${examDateParts.year}</span>
        </div>
        
        <div class="text-block">
            เห็นสมควรให้พักรักษาตัว
            <span class="underline-inline" style="margin: 0 5px;">${formData.sickLeaveDays || ''}</span>
            วัน ตั้งแต่วันที่
            <span class="underline-inline" style="margin: 0 5px;">${fromDateParts.day}</span>
            เดือน
            <span class="underline-inline" style="margin: 0 5px;">${fromDateParts.month}</span>
            พ.ศ.
            <span class="underline-inline" style="margin: 0 5px; min-width: 70px;">${fromDateParts.year}</span>
            ถึง วันที่
            <span class="underline-inline" style="margin: 0 5px;">${toDateParts.day}</span>
            เดือน
            <span class="underline-inline" style="margin: 0 5px;">${toDateParts.month}</span>
            พ.ศ.
            <span class="underline-inline" style="margin: 0 5px; min-width: 70px;">${toDateParts.year}</span>
        </div>
        
        <!-- Signatures -->
        <div class="signature-section">
            <div>
                <div class="signature-line"></div>
                <div style="margin-top: 5px; text-align: center;">ลงชื่อ ........................</div>
                <div style="margin-top: 5px; text-align: center;">ผู้รับการตรวจ</div>
            </div>
            
            <div>
                <div class="signature-line"></div>
                <div style="margin-top: 5px; text-align: center;">(นพ. ${doctorName})</div>
                <div style="margin-top: 5px; text-align: center;">(${doctorLicense})</div>
                <div style="margin-top: 5px; text-align: center;">แพทย์ผู้ตรวจ</div>
            </div>
        </div>
    </div>
</body>
</html>
    `;
  }
}

export default SickLeavePDF;
