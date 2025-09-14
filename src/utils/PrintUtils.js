// PrintUtils.js - ฟังก์ชันสำหรับการพิมพ์
export const PrintUtils = {
    // ฟังก์ชันพิมพ์ใบเสร็จ
    printReceipt: () => {
        const originalTitle = document.title;
        document.title = `ใบเสร็จ_${new Date().toLocaleDateString('th-TH')}`;

        // สร้าง CSS สำหรับการพิมพ์ใบเสร็จ
        const printStyles = `
        <style>
          @media print {
            * {
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
            
            body {
              margin: 0 !important;
              padding: 0 !important;
              font-family: 'Sarabun', Arial, sans-serif !important;
              font-size: 12px !important;
              line-height: 1.4 !important;
            }
            
            /* ซ่อนส่วนที่ไม่ต้องพิมพ์ */
            .MuiContainer-root > *:not(#receipt-print),
            .MuiTabs-root,
            .MuiButton-root,
            .no-print {
              display: none !important;
            }
            
            /* แสดงเฉพาะส่วนใบเสร็จ */
            #receipt-print {
              display: block !important;
              margin: 0 !important;
              padding: 15px !important;
              max-width: 100% !important;
              width: 100% !important;
              box-shadow: none !important;
              border: none !important;
              background: white !important;
            }
            
            /* ปรับขนาดตาราง */
            .MuiTable-root {
              border-collapse: collapse !important;
              width: 100% !important;
            }
            
            .MuiTableCell-root {
              border: 1px solid #ddd !important;
              padding: 6px 8px !important;
              font-size: 12px !important;
              line-height: 1.2 !important;
            }
            
            .MuiTableHead-root .MuiTableCell-root {
              background-color: #f5f5f5 !important;
              font-weight: bold !important;
            }
            
            /* ปรับขนาดหัวข้อ */
            h5 {
              font-size: 18px !important;
              margin: 10px 0 !important;
            }
            
            /* ปรับระยะห่าง */
            .MuiGrid-container {
              margin: 5px 0 !important;
            }
            
            /* ปรับส่วนยอดรวม */
            .total-section {
              border-top: 2px solid #333 !important;
              margin-top: 10px !important;
              padding-top: 10px !important;
            }
          }
        </style>
      `;

        // เพิ่ม styles ลงใน head
        const styleElement = document.createElement('div');
        styleElement.innerHTML = printStyles;
        document.head.appendChild(styleElement.firstChild);

        // พิมพ์
        setTimeout(() => {
            window.print();

            // คืนค่า title เดิม
            document.title = originalTitle;

            // ลบ styles หลังพิมพ์
            setTimeout(() => {
                const printStyleElement = document.querySelector('style:last-child');
                if (printStyleElement) {
                    printStyleElement.remove();
                }
            }, 1000);
        }, 100);
    },

    // ฟังก์ชันพิมพ์ฉลากยา
    printDrugLabels: () => {
        const originalTitle = document.title;
        document.title = `ฉลากยา_${new Date().toLocaleDateString('th-TH')}`;

        // สร้าง CSS สำหรับการพิมพ์ฉลากยา
        const printStyles = `
        <style>
          @media print {
            * {
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
            
            body {
              margin: 0 !important;
              padding: 10px !important;
              font-family: 'Sarabun', Arial, sans-serif !important;
              font-size: 11px !important;
            }
            
            /* ซ่อนส่วนที่ไม่ต้องพิมพ์ */
            .MuiContainer-root > *:not(.drug-labels-container),
            .MuiTabs-root,
            .MuiButton-root,
            .no-print,
            h5 {
              display: none !important;
            }
            
            /* แสดงเฉพาะฉลากยา */
            .drug-labels-container {
              display: block !important;
            }
            
            /* จัดเรียงฉลากยา */
            .drug-label {
              width: 8cm !important;
              min-height: 11cm !important;
              margin: 0.2cm !important;
              padding: 0 !important;
              border: 2px solid #4a90e2 !important;
              background: white !important;
              box-shadow: none !important;
              page-break-inside: avoid !important;
              display: inline-block !important;
              vertical-align: top !important;
            }
            
            /* Header ของฉลาก */
            .drug-label-header {
              background: linear-gradient(135deg, #4a90e2 0%, #357abd 100%) !important;
              color: white !important;
              padding: 8px !important;
              text-align: center !important;
              position: relative !important;
            }
            
            .clinic-icon {
              position: absolute !important;
              left: 10px !important;
              top: 50% !important;
              transform: translateY(-50%) !important;
              width: 30px !important;
              height: 30px !important;
              background: white !important;
              border-radius: 50% !important;
              display: flex !important;
              align-items: center !important;
              justify-content: center !important;
              font-size: 16px !important;
              color: #4a90e2 !important;
            }
            
            .clinic-name {
              font-size: 14px !important;
              font-weight: bold !important;
              margin: 0 !important;
            }
            
            .clinic-address {
              font-size: 9px !important;
              margin: 1px 0 !important;
            }
            
            .clinic-phone {
              font-size: 10px !important;
              margin: 0 !important;
            }
            
            /* เนื้อหาฉลาก */
            .drug-label-content {
              padding: 12px !important;
            }
            
            .patient-info {
              border-bottom: 1px solid #e0e0e0 !important;
              padding-bottom: 8px !important;
              margin-bottom: 12px !important;
            }
            
            .info-row {
              display: flex !important;
              justify-content: space-between !important;
              margin: 2px 0 !important;
              font-size: 11px !important;
            }
            
            .dosage-info {
              text-align: center !important;
              font-size: 11px !important;
              font-weight: bold !important;
              color: #2c5aa0 !important;
              margin: 8px 0 !important;
            }
            
            .time-grid {
              display: grid !important;
              grid-template-columns: repeat(4, 1fr) !important;
              gap: 6px !important;
              margin: 8px 0 !important;
            }
            
            .time-slot {
              text-align: center !important;
              font-size: 9px !important;
              color: #666 !important;
            }
            
            .time-slot.active {
              background: #e8f4fd !important;
              border-radius: 3px !important;
              padding: 3px !important;
              color: #2c5aa0 !important;
              font-weight: bold !important;
            }
            
            .instructions-grid {
              display: grid !important;
              grid-template-columns: 1fr 1fr !important;
              gap: 4px !important;
              font-size: 8px !important;
              color: #555 !important;
            }
            
            .instruction-item {
              display: flex !important;
              align-items: flex-start !important;
            }
            
            .checkbox {
              width: 8px !important;
              height: 8px !important;
              border: 1px solid #4a90e2 !important;
              margin-right: 3px !important;
              border-radius: 1px !important;
              margin-top: 1px !important;
              flex-shrink: 0 !important;
            }
            
            .checkbox.checked {
              background: #2c5aa0 !important;
              position: relative !important;
            }
            
            .checkbox.checked::after {
              content: "✓" !important;
              color: white !important;
              font-size: 6px !important;
              position: absolute !important;
              top: -1px !important;
              left: 1px !important;
            }
            
            .expire-date {
              text-align: center !important;
              font-size: 9px !important;
              color: #666 !important;
              border-top: 1px solid #e0e0e0 !important;
              margin-top: 12px !important;
              padding-top: 6px !important;
            }
            
            /* จัดการการแบ่งหน้า */
            @page {
              size: A4 !important;
              margin: 1cm !important;
            }
            
            .drug-label:nth-child(2n) {
              page-break-after: always !important;
            }
          }
        </style>
      `;

        // เพิ่ม styles ลงใน head
        const styleElement = document.createElement('div');
        styleElement.innerHTML = printStyles;
        document.head.appendChild(styleElement.firstChild);

        // พิมพ์
        setTimeout(() => {
            window.print();

            // คืนค่า title เดิม
            document.title = originalTitle;

            // ลบ styles หลังพิมพ์
            setTimeout(() => {
                const printStyleElement = document.querySelector('style:last-child');
                if (printStyleElement) {
                    printStyleElement.remove();
                }
            }, 1000);
        }, 100);
    },

    // ฟังก์ชันตรวจสอบการรองรับการพิมพ์
    checkPrintSupport: () => {
        if (!window.print) {
            alert('เบราว์เซอร์ของคุณไม่รองรับการพิมพ์');
            return false;
        }
        return true;
    }
};