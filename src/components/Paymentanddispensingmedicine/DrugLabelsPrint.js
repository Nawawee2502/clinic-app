import React from "react";
import { formatThaiDateShort } from "../../utils/dateTimeUtils";

const DrugLabelsPrint = ({ patient, drugs }) => {
  if (!patient || drugs.length === 0) return null;

  const handlePrint = () => {
    const labelWindow = window.open("", "_blank", "width=1200,height=800");

    const labelsHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>ฉลากยา</title>
        <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600;700&display=swap" rel="stylesheet">
        <style>
          @page { 
            size: 80mm 50mm; 
            margin: 0; 
          }
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Sarabun', sans-serif; 
            background: white; 
            margin: 0;
            padding: 0;
            overflow: hidden; 
          }
          .labels-container { 
            width: 100%;
          }

          .drug-label {
            width: 80mm;
            height: 50mm;
            padding: 0 4mm;
            padding-bottom: 2mm;
            position: relative;
            page-break-after: always;
            break-inside: avoid;
            border: none;
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
            overflow: hidden; 
            transform: rotate(180deg); /* หมุนกระดาษ 180 องศาเพื่อแก้ปัญหาพิมพ์กลับหัว */
          }
          
          /* Spacer สำหรับเว้นหัวกระดาษ 0.9cm (เผื่อเป็น 1.2cm/12mm ให้ปลอดภัย) */
          .header-spacer {
            width: 100%;
            height: 12mm;
            flex-shrink: 0;
          }

          /* Layout: ชื่อยา */
          .top-row {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 2px;
            margin-top: 2px;
          }
          .drug-name {
            font-size: 14px; 
            font-weight: 700;
            line-height: 1.1;
            flex: 1;
          }
          .drug-qty {
             font-size: 13px;
             font-weight: 700;
             white-space: nowrap;
             margin-left: 6px;
             color: #000;
          }

          .line-field {
            font-size: 11px;
            margin-bottom: 1px;
            display: flex;
            align-items: baseline;
            line-height: 1.3;
          }

          .line-field .label { 
            font-weight: 600; 
            min-width: 75px; 
          }
          
          .line-field .value {
            flex: 1;
            word-wrap: break-word; 
          }

          .usage-line {
             margin-top: 1px;
          }

          .footer-expiry { 
            font-size: 9px; 
            position: absolute;
            bottom: 3px;
            right: 10px;
            color: #444;
          }
          
          .divider {
            border-bottom: 1px dotted #ccc;
            margin: 2px 0 3px 0;
          }

        </style>
      </head>
      <body>
        <div class="labels-container">
          ${drugs.map(drug => {
      const qty = drug.QTY || 1;
      const unit = drug.DISPLAY_UNIT_NAME || drug.UNIT_NAME || drug.UNIT_CODE || "";
      const name = drug.GENERIC_NAME || drug.DRUG_CODE || "ยา";
      const expire = drug.EXPIRE_DATE ? (drug.EXPIRE_DATE.includes('T') ? formatThaiDateShort(drug.EXPIRE_DATE.split('T')[0]) : drug.EXPIRE_DATE) : "";

      // แปลงข้อมูลให้ตรงกับ Label
      const patientName = `${patient.PRENAME}${patient.NAME1} ${patient.SURNAME}`;
      const indication = drug.Indication1 || drug.PROPERTIES || '-';
      const usage = drug.TIME1 || drug.eat1 || drug.EAT1 || '-';
      const advice = drug.ADVICE || ''; // ถ้ามีคำเตือน

      return `
              <div class="drug-label">
                
                <!-- Spacer ดันเนื้อหาลงมาให้พ้นหัวกระดาษ -->
                <div class="header-spacer"></div>

                <!-- บรรทัด 1: ชื่อยา + จำนวน -->
                <div class="top-row">
                  <div class="drug-name">${name}</div>
                  <div class="drug-qty"># ${qty} ${unit}</div>
                </div>

                <div class="divider"></div>

                <!-- บรรทัด 2: ชื่อ-นามสกุล -->
                <div class="line-field">
                   <span class="label">ชื่อ-นามสกุล :</span> 
                   <span class="value">${patientName}</span>
                </div>

                <!-- บรรทัด 3: ข้อบ่งใช้ (สรรพคุณ) -->
                 ${indication && indication !== '-' ? `
                <div class="line-field">
                   <span class="label">ข้อบ่งใช้ :</span> 
                   <span class="value" style="font-weight: bold;">${indication}</span>
                </div>` : ''}

                <!-- บรรทัด 4: วิธีรับประทาน -->
                <div class="line-field usage-line">
                   <span class="label">วิธีรับประทาน :</span> 
                   <span class="value" style="font-weight: bold;">${usage}</span>
                </div>

                <!-- บรรทัด 5: คำเตือน (ถ้ามี) -->
                ${advice ? `
                <div class="line-field">
                   <span class="label">ข้อควรระวัง :</span> 
                   <span class="value" style="font-weight: bold;">${advice}</span>
                </div>` : ''}

                <!-- วันหมดอายุ -->
                ${expire ? `<div class="footer-expiry">Exp. ${expire}</div>` : ''}
              </div>
            `;
    }).join("")}
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
        fontWeight: "600",
      }}
    >
      💊 พิมพ์ฉลากยา
    </button>
  );
};

export default DrugLabelsPrint;
