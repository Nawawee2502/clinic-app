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
        <title>ฉลากยา - ${patient.PRENAME}${patient.NAME1} ${patient.SURNAME}</title>
        <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600&display=swap" rel="stylesheet">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Sarabun', sans-serif; background: white; padding: 12px; }
          .labels-container { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 14px; }

          .drug-label {
            width: 260px;
            border: 1px solid #999;
            padding: 8px;
            display: flex; flex-direction: column;
          }

          .header {
            background: #64b5f6;
            color: white;
            text-align: center;
            padding: 6px;
            border-radius: 3px;
            margin-bottom: 6px;
          }
          .header .title { font-size: 13px; font-weight: 700; }
          .header .subtitle { font-size: 9px; margin-top: 2px; }
          .header .phone { font-size: 9px; margin-top: 1px; }

          .line-field {
            font-size: 9px;
            margin-bottom: 4px;
            display: flex;
          }
          .line-field span { min-width: 60px; }
          .dots {
            border-bottom: 1px dotted #000;
            flex: 1; margin-left: 3px;
          }

          .checkbox-row { display: flex; align-items: center; margin-bottom: 3px; font-size: 8px; }
          .checkbox { 
            width: 9px; 
            height: 9px; 
            border: 1px solid #000; 
            margin-right: 4px; 
            position: relative;
            display: inline-block;
          }
          .checkbox.checked {
            background: #2c5aa0;
            border-color: #2c5aa0;
          }
          .checkbox.checked::after {
            content: "✓";
            color: white;
            font-size: 7px;
            position: absolute;
            top: -1px;
            left: 1px;
            font-weight: bold;
          }

          .expiry { font-size: 8px; margin-top: 8px; }
        </style>
      </head>
      <body>
        <div class="labels-container">
          ${drugs.map(drug => {
            const qty = drug.QTY || 1;
            const unit = drug.DISPLAY_UNIT_NAME || drug.UNIT_NAME || drug.UNIT_CODE || "เม็ด";
            const name = drug.GENERIC_NAME || drug.DRUG_CODE || "ยา";
            const expire = drug.EXPIRE_DATE || "...............";

            return `
              <div class="drug-label">
                <div class="header">
                  <div class="title">สัมพันธ์คลินิค คลินิกเวชกรรม</div>
                  <div class="subtitle">280/4 ต.บ้านหลวง อ.จอมทอง จ.เชียงใหม่ 50160</div>
                  <div class="phone">โทร : 053-341-723</div>
                </div>

                <div class="line-field"><span>ชื่อผู้ป่วย</span> ${patient.PRENAME}${patient.NAME1} ${patient.SURNAME} <span style="margin-left:4px;">วันที่</span> ${formatThaiDateShort(new Date().toISOString().split('T')[0])}</div>
                <div class="line-field"><span>HN</span> ${patient.HNCODE}</div>
                <div class="line-field"><span>ชื่อยา</span> ${name}</div>
                <div class="line-field"><span>จำนวน</span> ${qty} ${unit}</div>
                <div class="line-field"><span>ข้อบ่งใช้</span> ${drug.TIME1 || drug.eat1 || drug.EAT1 || ''}</div>

                <div class="expiry">วันหมดอายุ (Exp.) ${expire}</div>
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
