import { formatThaiDate, formatThaiDateShort } from '../../../utils/dateTimeUtils';

class GeneralMedicalPDF {
  static generateHTML(formData, clinicInfo, currentPatient) {
    const clinicName = clinicInfo?.CLINIC_NAME || 'สัมพันธ์คลินิก คลินิกเวชกรรม';
    const clinicAddress = clinicInfo?.ADDR1 || '280/4 ต.บ้านหลวง อ.จอมทอง จ.เชียงใหม่ 50160';
    const clinicTel = clinicInfo?.TEL1 || '053-341-723';
    
    const patientName = formData.patientName || `${currentPatient?.PRENAME || ''}${currentPatient?.NAME1 || ''} ${currentPatient?.SURNAME || ''}`.trim();
    const patientHN = currentPatient?.HNCODE || '';
    
    const doctorName = formData.doctorName || 'นายแพทย์ ภรภัทร ก๋องเงิน';
    const doctorLicense = formData.doctorLicense || ''; // ไม่ใส่ default ให้ผู้ใช้กรอกเอง
    
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
    const certDateParts = getDateParts(formData.certificateDate || formData.examinationDate);
    
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>ใบรับรองแพทย์ / Medical Certificate</title>
    <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        @page {
            size: A4;
            margin: 15mm 20mm;
        }
        
        @media print {
            body {
                padding: 0;
                margin: 0;
            }
            .container {
                page-break-inside: avoid;
            }
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Sarabun', sans-serif;
            font-size: 12px;
            line-height: 1.5;
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
            margin-right: 12px;
            flex-shrink: 0;
        }
        
        .clinic-logo img {
            width: 100%;
            height: 100%;
            object-fit: contain;
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
        
        .cert-number {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
            font-size: 12px;
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
            border-bottom: 1px dotted #000;
            flex: 1;
            margin-left: 8px;
            min-height: 18px;
            padding-bottom: 2px;
            display: inline-block;
        }
        
        .underline-inline {
            border-bottom: 1px dotted #000;
            display: inline-block;
            min-width: 50px;
            text-align: center;
            padding-bottom: 2px;
        }
        
        .text-block {
            text-align: justify;
            line-height: 1.8;
            margin: 10px 0;
            font-size: 13px;
        }
        
        .signature-line {
            border-top: 1px dotted #000;
            width: 180px;
            margin-top: 30px;
            padding-top: 3px;
            text-align: center;
            display: inline-block;
        }
        
        .separator {
            border-top: 1px dotted #000;
            margin: 15px 0;
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
            <div class="clinic-logo">
                <img src="/logo.png" alt="Logo" />
            </div>
            <div class="clinic-info">
                <div class="clinic-name">${clinicName}</div>
                <div class="clinic-address">${clinicAddress}</div>
                <div class="clinic-tel">โทร ${clinicTel}</div>
            </div>
        </div>
        
        <div class="title">ใบรับรองแพทย์ / Medical Certificate</div>
        
        <div class="cert-number">
            <span>เลขที่ <span class="underline-inline" style="min-width: 150px;">${formData.certificateNumber || ''}</span></span>
            <span>วันที่ <span class="underline-inline">${certDateParts.day}</span> / <span class="underline-inline">${certDateParts.month}</span> / <span class="underline-inline" style="min-width: 70px;">${certDateParts.year}</span></span>
        </div>
        
        <!-- Doctor's Statement -->
        <div class="text-block" style="margin-bottom: 12px;">
            ข้าพเจ้า ${doctorName} แพทย์ปริญญา ปฏิบัติงาน ณ ${clinicName} เป็นผู้ประกอบวิชาชีพเวชกรรมแผนปัจจุบันชั้นหนึ่งสาขาเวชกรรม 
            ${doctorLicense ? `ใบอนุญาตประกอบวิชาชีพเวชกรรมเลขที่ ${doctorLicense}` : 'ใบอนุญาตประกอบวิชาชีพเวชกรรมเลขที่ <span class="underline" style="width: 150px; display: inline-block;"></span>'} ได้ตรวจร่างกายผู้ป่วยชื่อ
            <span class="underline" style="width: 400px; display: inline-block; margin-left: 10px;">${patientName}</span>
        </div>
        
        <div class="form-field" style="margin-bottom: 8px;">
            <span class="form-label">ทะเบียนผู้ป่วยเลขที่</span>
            <span class="underline">${patientHN}</span>
        </div>
        
        <div class="form-field" style="margin-bottom: 8px;">
            <span class="form-label">เมื่อวันที่</span>
            <span class="underline" style="width: 200px;">${examDateParts.day} เดือน ${examDateParts.month} พ.ศ. ${examDateParts.year}</span>
            <span class="form-label" style="margin-left: 20px; min-width: 100px;">มีความเห็นว่า</span>
            <span class="underline" style="width: 300px;">${formData.conclusion || ''}</span>
        </div>
        
        <!-- Separator -->
        <div class="separator" style="margin: 12px 0;"></div>
        
        <!-- Certification Statement -->
        <div class="text-block" style="margin: 12px 0;">
            ขอรับรองว่าผู้ป่วยรายนี้ได้มารับการตรวจรักษาในวันและเวลาดังกล่าวจริง ทั้งนี้ได้ให้การรักษาพร้อมด้วยคำแนะนำไว้เรียบร้อยแล้ว
        </div>
        
        <!-- Diagnosis Details -->
        <div class="form-field" style="margin-top: 12px; margin-bottom: 8px;">
            <span class="form-label">เป็นโรค</span>
            <span class="underline">${formData.diagnosis || ''}</span>
        </div>
        
        <div class="form-field" style="margin-bottom: 8px;">
            <span class="form-label">มีอาการ</span>
            <span class="underline">${formData.symptoms || ''}</span>
        </div>
        
        <!-- Doctor Signature -->
        <div style="text-align: right; margin-top: 40px;">
            <div class="signature-line"></div>
            <div style="margin-top: 5px;">(นพ. ${doctorName})</div>
            ${doctorLicense ? `<div style="margin-top: 5px;">(${doctorLicense})</div>` : '<div style="margin-top: 5px;"><span class="underline" style="width: 150px; display: inline-block;"></span></div>'}
            <div style="margin-top: 5px;">แพทย์ผู้ตรวจ</div>
        </div>
    </div>
</body>
</html>
    `;
  }
}

export default GeneralMedicalPDF;
