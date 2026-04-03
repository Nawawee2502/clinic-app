import { formatThaiDateShort } from '../../utils/dateTimeUtils';
import ClinicOrgService from '../../services/clinicOrgService';

const thaiMonths = [
    "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
    "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
];

export const printPsychotropicFormRY8 = async (records, month, year) => {
    if (!records || records.length === 0) {
        alert("ไม่มีข้อมูลสำหรับพิมพ์");
        return;
    }

    const monthName = thaiMonths[parseInt(month, 10) - 1] || "";
    const yearBE = (parseInt(year, 10) + (parseInt(year, 10) < 2500 ? 543 : 0)).toString();

    const printWindow = window.open("", "_blank", "width=1200,height=800");
    if (!printWindow) {
        alert("เบราว์เซอร์ของคุณบล็อกหน้าต่าง Popup กรุณาอนุญาตให้แสดง Popup ก่อนพิมพ์");
        return;
    }
    
    let clinicName = "สัมพันธ์คลินิก คลินิกเวชกรรม";
    
    try {
        const orgRes = await ClinicOrgService.getClinicOrg();
        if (orgRes && orgRes.success && orgRes.data) {
            clinicName = orgRes.data.CLINIC_NAME || clinicName;
        }
    } catch (e) {
        console.warn("Could not fetch clinic org:", e);
    }

    const html = `<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <title>แบบ ร.ย.-๘ ประจำเดือน ${monthName} ${yearBE}</title>
    <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600;700&display=swap" rel="stylesheet">
    <style>
        @page { size: A4 portrait; margin: 10mm; }
        body { font-family: 'Sarabun', sans-serif; background: white; margin: 0; padding: 0; font-size: 13px; line-height: 1.3; color: black; }
        .form-header { text-align: center; margin-bottom: 5px; }
        .form-title { font-weight: 700; font-size: 15px; }
        .form-id-label { font-weight: 700; font-size: 15px; margin-bottom: 5px; }
        
        .header-info-line { display: flex; justify-content: flex-start; align-items: center; margin-top: 8px; font-size: 13px; }
        .data-value { 
            border-bottom: 1px dotted #000; 
            display: inline-block; 
            text-align: center; 
            font-weight: bold;
            color: #000;
        }

        table { width: 100%; border-collapse: collapse; margin-top: 5px; table-layout: fixed; }
        th, td { border: 1px solid #000; padding: 4px; text-align: center; vertical-align: middle; font-size: 11px; word-wrap: break-word; }
        th { font-weight: bold; background-color: transparent !important; }
        
        /* Column Widths (Adjusted for Portrait A4) */
        th:nth-child(1) { width: 7%; } /* วันเดือนปี */
        th:nth-child(2) { width: 15%; } /* ชื่อส่วนผสม */
        th:nth-child(3) { width: 12%; } /* ชื่อการค้า */
        th:nth-child(4) { width: 10%; } /* เลขผลิต */
        th:nth-child(5) { width: 8%; } /* ได้มาจาก */
        th:nth-child(6) { width: 15%; } /* จำหน่ายให้ */
        
        /* Nested headers widths */
        .col-qty { width: 6%; } /* 4 columns of qty = 24% */
        .col-note { width: 9%; } /* หมายเหตุ */

        thead { display: table-header-group; }
        tr { page-break-inside: avoid; }
        
        .footer-section { margin-top: 20px; display: flex; justify-content: space-between; page-break-inside: avoid; }
        .footer-left { width: 50%; font-size: 11px; }
        .footer-right { width: 45%; text-align: center; font-size: 12px; }
        
        .checkbox-wrapper { display: inline-flex; align-items: center; margin-right: 15px; }
        .checkbox-box { width: 12px; height: 12px; border: 1px solid #000; display: inline-block; margin-right: 5px; text-align: center; line-height: 12px; font-size: 10px; }
        
        @media print { * { -webkit-print-color-adjust: exact !important; color-adjust: exact !important; } body { margin: 0; } }
    </style>
</head>
<body>
    <div class="form-id-label">แบบ ร.ย.-๘ / เดือน</div>
    <div class="form-header">
        <div class="form-title">
            รายงานเกี่ยวกับการดำเนินการของการมีไว้ในครอบครองวัตถุออกฤทธิ์ในประเภท ๓ หรือประเภท ๔<br>
            เพื่อการรักษาหรือป้องกันโรคให้แก่ผู้ป่วยหรือสัตว์ป่วยในทางการแพทย์
        </div>
        <div style="margin-top: 5px;">
            <b>ประจำเดือน</b> <span class="data-value" style="width: 100px;">${monthName}</span> <b>พ.ศ.</b> <span class="data-value" style="width: 80px;">${yearBE}</span>
        </div>
    </div>
    
    <div style="padding-left: 20px;">
        <div class="header-info-line">
            ชื่อผู้รับอนุญาต <span class="data-value" style="width: 50%; margin: 0 10px;">${clinicName}</span> 
            ใบอนุญาตเลขที่ <span class="data-value" style="width: 25%; margin-left: 10px;">-</span>
        </div>
        <div class="header-info-line" style="margin-top: 10px;">
            <strong style="margin-right: 20px;">ชนิด (เลือกได้หนึ่งชนิด)</strong>
            <span class="checkbox-wrapper"><span class="checkbox-box"></span> วัตถุออกฤทธิ์ในประเภท ๓</span>
            <span class="checkbox-wrapper" style="margin-left: 20px;"><span class="checkbox-box"></span> วัตถุออกฤทธิ์ในประเภท ๔</span>
        </div>
    </div>
    
    <div style="margin-top: 10px; font-weight: bold; font-size: 13px;">
        ขอรายงานผลการดำเนินการ ดังนี้
    </div>

    <table>
        <thead>
            <tr>
                <th rowspan="2">วัน<br>เดือน ปี</th>
                <th rowspan="2">ชื่อและอัตราส่วนผสม<br>ของวัตถุออกฤทธิ์ใน<br>ประเภท ๓ หรือประเภท ๔</th>
                <th rowspan="2">ชื่อการค้า<br>(ถ้ามี)</th>
                <th rowspan="2">เลขที่/รุ่น<br>ที่ผลิต/<br>ครั้งที่<br>ผลิต</th>
                <th rowspan="2">ได้มา<br>จาก</th>
                <th rowspan="2">จำหน่าย<br>ให้</th>
                <th colspan="4" style="border-bottom: 1px solid #000;">จำนวนวัตถุออกฤทธิ์ในประเภท ๓<br>หรือประเภท ๔ (หน่วย.............)*</th>
                <th rowspan="2" class="col-note">หมายเหตุ</th>
            </tr>
            <tr>
                <th class="col-qty">ยอด<br>ยกมา</th>
                <th class="col-qty">รับ</th>
                <th class="col-qty">จ่าย</th>
                <th class="col-qty">คง<br>เหลือ</th>
            </tr>
        </thead>
        <tbody>
            ${records.map(row => {
                const dateFormatted = row.RDATE ? formatThaiDateShort(row.RDATE) : "";
                const patientName = row.PATIENT_NAME || "";
                const genericName = row.GENERIC_NAME || "";
                const tradeName = row.TRADE_NAME || "-";
                const qty = row.QTY ? parseFloat(row.QTY).toLocaleString('th-TH') : "-";
                return `
                    <tr>
                        <td>${dateFormatted}</td>
                        <td>${genericName}</td>
                        <td>${tradeName}</td>
                        <td>-</td> <!-- เลขที่ผลิต -->
                        <td>-</td> <!-- ได้มาจาก -->
                        <td style="text-align: left; padding-left: 5px;">${patientName}</td> <!-- จำหน่ายให้ -->
                        <td>-</td> <!-- ยอดยกมา -->
                        <td>-</td> <!-- รับ -->
                        <td>${qty}</td> <!-- จ่าย -->
                        <td>-</td> <!-- คงเหลือ -->
                        <td></td> <!-- หมายเหตุ -->
                    </tr>
                `;
            }).join('')}
        </tbody>
    </table>
    
    <div class="footer-section">
        <div class="footer-left">
            <b>หมายเหตุ :</b> (๑) *ระบุหน่วยเป็นหน่วยย่อย เช่น ขวด กล่อง ampule vial เม็ด แคปซูล แผ่น ฯลฯ<br>
            <span style="visibility: hidden;"><b>หมายเหตุ :</b></span> (๒) ให้ขีดฆ่าข้อความที่ไม่ต้องการออก
        </div>
        <div class="footer-right">
            <br>
            (ลงชื่อ) <span class="data-value" style="width: 200px;"></span> ผู้รับอนุญาต/ผู้ดำเนินการในใบอนุญาต
            <br><br>
            (<span class="data-value" style="width: 220px; border-bottom: none; display: inline-block;">....................................................................</span>)
        </div>
    </div>
</body>
</html>`;

    printWindow.document.write(html);
    printWindow.document.close();
    
    setTimeout(() => {
        printWindow.focus();
        printWindow.print();
    }, 500);
};
