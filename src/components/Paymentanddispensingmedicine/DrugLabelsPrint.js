import React from "react";

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
            width: 260px; height: 360px;
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
          .checkbox { width: 9px; height: 9px; border: 1px solid #000; margin-right: 4px; }

          .time-grid {
            display: grid; grid-template-columns: repeat(4, 1fr); gap: 2px;
            margin: 4px 0;
          }
          .time-cell {
            text-align: center; font-size: 8px;
            border: 1px solid #90caf9; border-radius: 2px;
            padding: 2px 0;
          }

          .instructions {
            border-top: 1px solid #000;
            margin-top: 4px; padding-top: 4px;
            font-size: 8px;
          }
          .instructions .title { 
            font-weight: 600; 
            margin-bottom: 3px; 
            font-size: 9px;
            text-align: center;
          }
          .meal-row {
            display: flex;
            align-items: center;
            font-size: 8px;
            margin-bottom: 4px;
          }
          .instructions .grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 3px 8px;
          }
          .instructions .item { display: flex; align-items: center; }
          .instructions .item .checkbox { flex-shrink: 0; }

          .expiry { font-size: 8px; margin-top: auto; }
        </style>
      </head>
      <body>
        <div class="labels-container">
          ${drugs.map(drug => {
            const dosage = drug.DOSAGE || "1";
            const freq = parseInt(drug.FREQUENCY || "3");
            const qty = drug.QTY || 1;
            const unit = drug.UNIT_CODE || "เม็ด";
            const name = drug.GENERIC_NAME || drug.DRUG_CODE || "ยา";
            const expire = drug.EXPIRE_DATE || "...............";

            return `
              <div class="drug-label">
                <div class="header">
                  <div class="title">สัมพันธ์คลินิค คลินิกเวชกรรม</div>
                  <div class="subtitle">280/4 ต.บ้านหลวง อ.จอมทอง จ.เชียงใหม่ 50160</div>
                  <div class="phone">โทร : 053-341-723</div>
                </div>

                <div class="line-field"><span>ชื่อผู้ป่วย</span> ${patient.PRENAME}${patient.NAME1} ${patient.SURNAME} <span style="margin-left:4px;">วันที่</span> ${new Date().toLocaleDateString("th-TH")}</div>
                <div class="line-field"><span>HN</span> ${patient.HNCODE}</div>
                <div class="line-field"><span>ชื่อยา</span> ${name}</div>
                <div class="line-field"><span>จำนวน</span> ${qty} ${unit}</div>
                <div class="line-field"><span>ข้อบ่งใช้</span> ........................................</div>
                <div class="line-field">รับประทานครั้งละ ${dosage} เม็ด วันละ ${freq} ครั้ง</div>

                <div class="meal-row">
                    <div class="checkbox"></div> ก่อนอาหาร (Before meal)
                    <div class="checkbox" style="margin-left:12px;"></div> หลังอาหาร (After meal)
                </div>

                <div class="time-grid">
                  <div class="time-cell ${freq >= 1 ? "active" : ""}">🌅 เช้า<br>Breakfast</div>
                  <div class="time-cell ${freq >= 2 ? "active" : ""}">☀️ กลางวัน<br>Lunch</div>
                  <div class="time-cell ${freq >= 3 ? "active" : ""}">🌆 เย็น<br>Dinner</div>
                  <div class="time-cell ${freq >= 4 ? "active" : ""}">🌙 ก่อนนอน<br>Bedtime</div>
                </div>

                <div class="instructions">
                  <div class="title">คำแนะนำ</div>
                  <div class="grid">
                    <div class="item"><div class="checkbox"></div> ก่อนอาหารครึ่ง-หนึ่งชั่วโมง</div>
                    <div class="item"><div class="checkbox"></div> ทานยาติดต่อกันจนหมด</div>
                    <div class="item"><div class="checkbox"></div> ทานหลังอาหารทันที</div>
                    <div class="item"><div class="checkbox"></div> ดื่มน้ำตามมากๆ</div>
                    <div class="item"><div class="checkbox"></div> ยานี้อาจทำให้ง่วงซึม</div>
                    <div class="item"><div class="checkbox"></div> อื่นๆ...........................</div>
                  </div>
                </div>

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
