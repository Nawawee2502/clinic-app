import { formatThaiDate, formatThaiDateShort } from '../../../utils/dateTimeUtils';

class DrivingLicensePDF {
  static generateHTML(formData, clinicInfo, currentPatient) {
    const clinicName = clinicInfo?.CLINIC_NAME || 'สัมพันธ์คลินิก คลินิกเวชกรรม';
    const clinicAddress = clinicInfo?.ADDR1 || '280/4 ต.บ้านหลวง อ.จอมทอง จ.เชียงใหม่ 50160';
    const clinicTel = clinicInfo?.TEL1 || '053-341-723';
    
    const patientName = formData.patientName || `${currentPatient?.PRENAME || ''}${currentPatient?.NAME1 || ''} ${currentPatient?.SURNAME || ''}`.trim();
    const patientID = formData.patientID || currentPatient?.IDNO || '';
    const patientAddress = formData.patientAddress || currentPatient?.ADDR1 || '';
    
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
    const certDateParts = getDateParts(formData.certificateDate || formData.examinationDate);
    
    // Vital signs
    const weight = formData.weight || '';
    const height = formData.height || '';
    const bp = formData.bp1 && formData.bp2 ? `${formData.bp1}/${formData.bp2}` : (formData.bp1 || '');
    const pulse = formData.pulse || '';
    
    // Health history
    const history = {
      congenitalDisease: formData.congenitalDisease || { has: false, detail: '' },
      accidentSurgery: formData.accidentSurgery || { has: false, detail: '' },
      hospitalization: formData.hospitalization || { has: false, detail: '' },
      epilepsy: formData.epilepsy || { has: false, detail: '' },
      otherHistory: formData.otherHistory || { has: false, detail: '' }
    };
    
    // Format ID card with dashes
    const formatIDCard = (id) => {
      if (!id || id.length !== 13) return '_-_ _ _ _-_ _ _ _ _-_ _-_';
      return `${id[0]}-${id.substring(1, 5)}-${id.substring(5, 10)}-${id.substring(10, 12)}-${id.substring(12)}`;
    };
    
    const formattedID = formatIDCard(patientID);
    
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>ใบรับรองแพทย์ (สำหรับใบอนุญาตขับรถ)</title>
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
            line-height: 1.5;
            color: #000;
            padding: 0;
        }
        
        .container {
            width: 100%;
        }
        
        .header {
            text-align: center;
            margin-bottom: 15px;
        }
        
        .title {
            font-size: 16px;
            font-weight: 700;
            margin-bottom: 8px;
            letter-spacing: 0.5px;
        }
        
        .header-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 15px;
            font-size: 12px;
        }
        
        .section-title {
            font-size: 13px;
            font-weight: 600;
            margin-top: 15px;
            margin-bottom: 8px;
            text-decoration: underline;
        }
        
        .form-field {
            margin-bottom: 6px;
            display: flex;
            align-items: baseline;
            font-size: 13px;
        }
        
        .form-label {
            min-width: 180px;
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
            min-width: 60px;
            text-align: center;
            padding-bottom: 1px;
        }
        
        .checkbox-container {
            display: inline-flex;
            align-items: center;
            margin-right: 15px;
            margin-left: 5px;
        }
        
        .checkbox {
            width: 11px;
            height: 11px;
            border: 1.5px solid #000;
            display: inline-block;
            margin-right: 4px;
            position: relative;
        }
        
        .checkbox.checked {
            background-color: #000;
        }
        
        .checkbox.checked::after {
            content: "✓";
            color: white;
            font-size: 9px;
            position: absolute;
            top: -1px;
            left: 1px;
            font-weight: bold;
        }
        
        .id-boxes {
            display: inline-flex;
            gap: 3px;
            margin-left: 8px;
            align-items: center;
        }
        
        .id-box {
            width: 14px;
            height: 18px;
            border: 1px solid #000;
            display: inline-block;
            text-align: center;
            font-size: 11px;
            line-height: 18px;
            padding: 0 2px;
        }
        
        .id-separator {
            margin: 0 3px;
            font-weight: bold;
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
        
        .note {
            font-size: 10px;
            color: #333;
            margin-top: 5px;
            line-height: 1.4;
        }
        
        .disease-list {
            margin: 8px 0;
        }
        
        .disease-item {
            margin-bottom: 4px;
            font-size: 13px;
        }
        
        .recommendation-box {
            border: 1px solid #000;
            min-height: 50px;
            padding: 5px;
            margin-top: 5px;
            font-size: 13px;
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
            <div class="title">ใบรับรองแพทย์ (สำหรับใบอนุญาตขับรถ)</div>
            <div class="header-info">
                <span>เล่มที่ <span class="underline-inline" style="min-width: 80px;">${formData.bookNumber || ''}</span></span>
                <span>เลขที่ <span class="underline-inline" style="min-width: 80px;">${formData.certificateNumber || ''}</span></span>
            </div>
        </div>
        
        <!-- Section 1: ของผู้ขอรับใบรับรองสุขภาพ -->
        <div class="section-title">ส่วนที่ 1 ของผู้ขอรับใบรับรองสุขภาพ</div>
        
        <div class="form-field">
            <span class="form-label">ข้าพเจ้า นาย/นาง/นางสาว..</span>
            <span class="underline">${patientName}</span>
        </div>
        
        <div class="form-field">
            <span class="form-label">สถานที่อยู่ (ที่สามารถติดต่อได้)..</span>
            <span class="underline">${patientAddress}</span>
        </div>
        
        <div class="form-field">
            <span class="form-label">หมายเลขบัตรประจำตัวประชาชน</span>
            <div class="id-boxes">
                ${formattedID.split('').map(char => {
                  if (char === '-') return '<span class="id-separator">-</span>';
                  return `<span class="id-box">${char === '_' ? '' : char}</span>`;
                }).join('')}
            </div>
        </div>
        
        <div class="form-field" style="margin-top: 10px;">
            <span class="form-label">ข้าพเจ้าขอใบรับรองสุขภาพ โดยมีประวัติสุขภาพดังนี้</span>
        </div>
        
        <!-- Health History -->
        <div class="form-field">
            <span class="form-label">1. โรคประจำตัว</span>
            <span class="checkbox-container">
                <span class="checkbox ${!history.congenitalDisease?.has ? 'checked' : ''}"></span>
                <span>ไม่มี</span>
            </span>
            <span class="checkbox-container">
                <span class="checkbox ${history.congenitalDisease?.has ? 'checked' : ''}"></span>
                <span>มี</span>
            </span>
            ${history.congenitalDisease?.has ? `<span class="underline" style="margin-left: 8px;">${history.congenitalDisease.detail || ''}</span>` : '<span class="underline" style="margin-left: 8px;"></span>'}
        </div>
        
        <div class="form-field">
            <span class="form-label">2. อุบัติเหตุ และ ผ่าตัด</span>
            <span class="checkbox-container">
                <span class="checkbox ${!history.accidentSurgery?.has ? 'checked' : ''}"></span>
                <span>ไม่มี</span>
            </span>
            <span class="checkbox-container">
                <span class="checkbox ${history.accidentSurgery?.has ? 'checked' : ''}"></span>
                <span>มี</span>
            </span>
            ${history.accidentSurgery?.has ? `<span class="underline" style="margin-left: 8px;">${history.accidentSurgery.detail || ''}</span>` : '<span class="underline" style="margin-left: 8px;"></span>'}
        </div>
        
        <div class="form-field">
            <span class="form-label">3. เคยเข้ารับการรักษาในโรงพยาบาล</span>
            <span class="checkbox-container">
                <span class="checkbox ${!history.hospitalization?.has ? 'checked' : ''}"></span>
                <span>ไม่มี</span>
            </span>
            <span class="checkbox-container">
                <span class="checkbox ${history.hospitalization?.has ? 'checked' : ''}"></span>
                <span>มี</span>
            </span>
            ${history.hospitalization?.has ? `<span class="underline" style="margin-left: 8px;">${history.hospitalization.detail || ''}</span>` : '<span class="underline" style="margin-left: 8px;"></span>'}
        </div>
        
        <div class="form-field">
            <span class="form-label">4. โรคลมชัก *</span>
            <span class="checkbox-container">
                <span class="checkbox ${!history.epilepsy?.has ? 'checked' : ''}"></span>
                <span>ไม่มี</span>
            </span>
            <span class="checkbox-container">
                <span class="checkbox ${history.epilepsy?.has ? 'checked' : ''}"></span>
                <span>มี</span>
            </span>
            ${history.epilepsy?.has ? `<span class="underline" style="margin-left: 8px;">${history.epilepsy.detail || ''}</span>` : '<span class="underline" style="margin-left: 8px;"></span>'}
        </div>
        
        <div class="form-field">
            <span class="form-label">5. ประวัติอื่นที่สำคัญ</span>
            <span class="checkbox-container">
                <span class="checkbox ${!history.otherHistory?.has ? 'checked' : ''}"></span>
                <span>ไม่มี</span>
            </span>
            <span class="checkbox-container">
                <span class="checkbox ${history.otherHistory?.has ? 'checked' : ''}"></span>
                <span>มี</span>
            </span>
            ${history.otherHistory?.has ? `<span class="underline" style="margin-left: 8px;">${history.otherHistory.detail || ''}</span>` : '<span class="underline" style="margin-left: 8px;"></span>'}
        </div>
        
        <div class="note" style="margin-left: 180px; margin-top: 5px;">
            * ในกรณีมีโรคลมชัก ให้แนบประวัติการรักษาจากแพทย์ผู้รักษาว่าท่านปลอดจากอาการชักมากกว่า 1 ปี เพื่ออนุญาตให้ขับรถได้
        </div>
        
        <!-- Applicant Signature -->
        <div class="form-field" style="margin-top: 15px;">
            <span class="form-label">ลงชื่อ</span>
            <span class="underline" style="width: 200px;"></span>
            <span class="form-label" style="margin-left: 15px; min-width: 50px;">วันที่</span>
            <span class="underline-inline">${certDateParts.day}</span>
            <span class="form-label" style="margin-left: 5px; min-width: 50px;">เดือน</span>
            <span class="underline-inline">${certDateParts.month}</span>
            <span class="form-label" style="margin-left: 5px; min-width: 50px;">พ.ศ.</span>
            <span class="underline-inline" style="min-width: 70px;">${certDateParts.year}</span>
        </div>
        
        <!-- Section 2: ของแพทย์ -->
        <div class="section-title">ส่วนที่ 2 ของแพทย์</div>
        
        <div class="form-field">
            <span class="form-label">สถานที่ตรวจ</span>
            <span class="underline">${clinicName}</span>
        </div>
        
        <div class="form-field">
            <span class="form-label">วันที่</span>
            <span class="underline-inline">${examDateParts.day}</span>
            <span class="form-label" style="margin-left: 5px; min-width: 50px;">เดือน</span>
            <span class="underline-inline">${examDateParts.month}</span>
            <span class="form-label" style="margin-left: 5px; min-width: 50px;">พ.ศ.</span>
            <span class="underline-inline" style="min-width: 70px;">${examDateParts.year}</span>
        </div>
        
        <div class="form-field">
            <span class="form-label">(1) ข้าพเจ้า ${doctorName}</span>
        </div>
        
        <div class="form-field">
            <span class="form-label">ใบอนุญาตประกอบวิชาชีพเวชกรรมเลขที่</span>
            <span class="underline">${doctorLicense}</span>
        </div>
        
        <div class="form-field">
            <span class="form-label">สถานพยาบาลชื่อ ${clinicName}</span>
        </div>
        
        <div class="form-field">
            <span class="form-label">ที่อยู่...</span>
            <span class="underline">${clinicAddress}</span>
        </div>
        
        <div class="form-field">
            <span class="form-label">ได้ตรวจร่างกาย นาย/นาง/นางสาว</span>
            <span class="underline">${patientName}</span>
        </div>
        
        <div class="form-field">
            <span class="form-label">แล้วเมื่อวันที่</span>
            <span class="underline-inline">${examDateParts.day}</span>
            <span class="form-label" style="margin-left: 5px; min-width: 50px;">เดือน</span>
            <span class="underline-inline">${examDateParts.month}</span>
            <span class="form-label" style="margin-left: 5px; min-width: 50px;">พ.ศ.</span>
            <span class="underline-inline" style="min-width: 70px;">${examDateParts.year}</span>
        </div>
        
        <div class="form-field">
            <span class="form-label">มีรายละเอียดดังนี้</span>
        </div>
        
        <!-- Vital Signs -->
        <div class="form-field">
            <span class="form-label">น้ำหนักตัว</span>
            <span class="underline-inline" style="min-width: 80px;">${weight}</span>
            <span style="margin-left: 5px;">กก.</span>
        </div>
        
        <div class="form-field">
            <span class="form-label">ความสูง</span>
            <span class="underline-inline" style="min-width: 80px;">${height}</span>
            <span style="margin-left: 5px;">เซนติเมตร</span>
        </div>
        
        <div class="form-field">
            <span class="form-label">ความดันโลหิต</span>
            <span class="underline-inline" style="min-width: 80px;">${bp}</span>
            <span style="margin-left: 5px;">มม.ปรอท</span>
        </div>
        
        <div class="form-field">
            <span class="form-label">ชีพจร</span>
            <span class="underline-inline" style="min-width: 80px;">${pulse}</span>
            <span style="margin-left: 5px;">ครั้ง/นาที</span>
        </div>
        
        <div class="form-field">
            <span class="form-label">สภาพร่างกายทั่วไปอยู่ในเกณฑ์</span>
            <span class="checkbox-container">
                <span class="checkbox ${formData.generalCondition === 'normal' ? 'checked' : ''}"></span>
                <span>ปกติ</span>
            </span>
            <span class="checkbox-container">
                <span class="checkbox ${formData.generalCondition === 'abnormal' ? 'checked' : ''}"></span>
                <span>ผิดปกติ (ระบุ)</span>
            </span>
            ${formData.generalCondition === 'abnormal' ? `<span class="underline" style="margin-left: 8px;">${formData.generalConditionNote || ''}</span>` : '<span class="underline" style="margin-left: 8px;"></span>'}
        </div>
        
        <!-- Doctor's Certification -->
        <div class="text-block" style="margin-top: 12px;">
            ข้าพเจ้าได้ตรวจร่างกายผู้ป่วยแล้ว พบว่าไม่เป็นผู้มีความพิการทางกาย ไม่เป็นผู้มีอาการของโรคจิต 
            ไม่เป็นผู้มีความบกพร่องทางสติปัญญา ไม่เป็นผู้ติดยาเสพติดหรือเสพติดสุราเรื้อรัง และไม่เป็นโรคต่อไปนี้
        </div>
        
        <div class="disease-list">
            <div class="disease-item">
                <span class="checkbox ${!formData.leprosy ? 'checked' : ''}"></span>
                <span style="margin-left: 5px;">1. โรคเรื้อนในระยะติดต่อ หรือในระยะที่ปรากฏอาการเป็นที่รังเกียจแก่สังคม</span>
            </div>
            <div class="disease-item">
                <span class="checkbox ${!formData.tuberculosis ? 'checked' : ''}"></span>
                <span style="margin-left: 5px;">2. วัณโรคในระยะอันตราย</span>
            </div>
            <div class="disease-item">
                <span class="checkbox ${!formData.filariasis ? 'checked' : ''}"></span>
                <span style="margin-left: 5px;">3. โรคเท้าช้างในระยะที่ปรากฏอาการเป็นที่รังเกียจแก่สังคม</span>
            </div>
            <div class="disease-item">
                <span class="checkbox ${!formData.otherDisease ? 'checked' : ''}"></span>
                <span style="margin-left: 5px;">4. อื่น ๆ (ถ้ามี)</span>
                ${formData.otherDisease ? `<span class="underline" style="margin-left: 8px; min-width: 200px;">${formData.otherDisease}</span>` : '<span class="underline" style="margin-left: 8px; min-width: 200px;"></span>'}
            </div>
        </div>
        
        <div class="form-field" style="margin-top: 12px;">
            <span class="form-label">(2) สรุปความเห็นและข้อแนะนำของแพทย์</span>
        </div>
        
        <div class="recommendation-box">
            ${formData.recommendation || ''}
        </div>
        
        <!-- Doctor Signature -->
        <div class="form-field" style="margin-top: 20px;">
            <span class="form-label">ลงชื่อ</span>
            <span class="signature-line"></span>
        </div>
        
        <div class="form-field">
            <span class="form-label">แพทย์ผู้ตรวจร่างกาย</span>
        </div>
        
        <div class="form-field">
            <span class="underline" style="width: 300px;">(${doctorName} ${doctorLicense})</span>
        </div>
        
        <!-- Footer Notes -->
        <div class="note" style="margin-top: 20px; padding-top: 10px; border-top: 1px solid #ddd;">
            <div style="margin-bottom: 3px;"><strong>หมายเหตุ</strong></div>
            <div style="margin-bottom: 3px;">(1) ต้องเป็นแพทย์ซึ่งได้ขึ้นทะเบียนรับใบอนุญาตประกอบวิชาชีพเวชกรรม</div>
            <div style="margin-bottom: 3px;">(2) ให้แสดงว่าเป็นผู้มีร่างกายสมบูรณ์เพียงใด ใบรับรองแพทย์ฉบับนี้ให้ใช้ได้ 1 เดือนนับแต่วันที่ตรวจร่างกาย</div>
            <div style="margin-bottom: 3px;">(3) คำรับรองนี้เป็นการตรวจวินิจฉัยเบื้องต้น และใบรับรองแพทย์นี้ ใช้สำหรับใบอนุญาตขับรถและปฏิบัติหน้าที่เป็นผู้ประจำรถ</div>
            <div>แบบฟอร์มนี้ได้รับการรับรองจากมติคณะกรรมการแพทยสภาในการประชุมครั้งที่ 2/2564 วันที่ 4 กุมภาพันธ์ 2564</div>
        </div>
    </div>
</body>
</html>
    `;
  }
}

export default DrivingLicensePDF;
