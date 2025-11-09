import React, { useState } from "react";
import { Button } from "@mui/material";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    minimumFractionDigits: 2,
  }).format(amount || 0);

const formatThaiDate = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  const months = [
    "มกราคม",
    "กุมภาพันธ์",
    "มีนาคม",
    "เมษายน",
    "พฤษภาคม",
    "มิถุนายน",
    "กรกฎาคม",
    "สิงหาคม",
    "กันยายน",
    "ตุลาคม",
    "พฤศจิกายน",
    "ธันวาคม",
  ];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear() + 543}`;
};

const formatThaiShort = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString("th-TH", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const ExpensePdfButton = ({ startDate, endDate, records = [], summary }) => {
  const [loading, setLoading] = useState(false);

  const generate = () => {
    setLoading(true);
    try {
      const htmlRows = records
        .map((item, idx) => {
          const amount = parseFloat(item.TOTAL) || 0;
          const cash = item.TYPE_PAY === "เงินสด" ? amount : 0;
          const transfer = item.TYPE_PAY === "เงินโอน" ? amount : 0;
          const bank = item.BANK_NO || "-";
          return `
            <tr>
              <td class="text-center">${idx + 1}</td>
              <td class="text-center">${formatThaiShort(item.RDATE)}</td>
              <td class="text-center">${item.REFNO || ""}</td>
              <td class="text-center">${item.STATUS || "-"}</td>
              <td class="text-left">${item.NAME1 || "-"}</td>
              <td class="text-left">${item.DESCM1 || "-"}</td>
              <td class="text-right">${formatCurrency(amount)}</td>
              <td class="text-right">${formatCurrency(amount)}</td>
              <td class="text-right">${cash ? formatCurrency(cash) : "-"}</td>
              <td class="text-right">${transfer ? formatCurrency(transfer) : "-"}</td>
              <td class="text-center">${bank}</td>
            </tr>`;
        })
        .join("");

      const cashTotal = summary?.cash || 0;
      const transferTotal = summary?.transfer || 0;
      const totalAmount = summary?.totalAmount || 0;

      const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>รายงานรายจ่ายประจำวัน</title>
  <style>
    body {
      font-family: 'Sarabun', 'TH Sarabun New', sans-serif;
      padding: 24mm 18mm;
      color: #000;
      font-size: 14px;
    }
    h1, h2, h3, h4, h5 { margin: 0; }
    .header { text-align: center; margin-bottom: 24px; }
    .title { font-size: 22px; font-weight: 700; margin-bottom: 4px; }
    .subtitle { font-size: 18px; margin-bottom: 12px; }
    .period { margin-bottom: 16px; }
    table { width: 100%; border-collapse: collapse; }
    th, td { border: 1px solid #000; padding: 6px 8px; }
    th { background: #f1f5f9; font-weight: 600; }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .text-left { text-align: left; }
    .totals-row { font-weight: 700; background: #e2e8f0; }
    .footer { margin-top: 32px; display: flex; justify-content: space-between; }
    .signature { width: 40%; text-align: center; }
    .signature-line { border-top: 1px solid #000; margin-top: 60px; padding-top: 4px; }
    @page { size: A4 portrait; margin: 20mm 15mm; }
  </style>
</head>
<body>
  <div class="header">
    <div class="title">สัมพันธ์คลินิก</div>
    <div class="subtitle">รายงานรายจ่ายทั่วไป</div>
    <div class="period">วันที่ ${formatThaiDate(startDate)} ถึงวันที่ ${formatThaiDate(endDate || startDate)}</div>
  </div>

  <table>
    <thead>
      <tr>
        <th>ที่</th>
        <th>วันที่</th>
        <th>ใบสำคัญจ่าย</th>
        <th>สถานะ</th>
        <th>จ่ายให้</th>
        <th>รายการ</th>
        <th>จำนวนเงิน</th>
        <th>รวมเงิน</th>
        <th>เงินสด</th>
        <th>เงินโอน</th>
        <th>ธนาคาร</th>
      </tr>
    </thead>
    <tbody>
      ${htmlRows || `<tr><td colspan="11" class="text-center" style="padding: 24px;">ไม่มีข้อมูล</td></tr>`}
      <tr class="totals-row">
        <td colspan="6" class="text-right">รวมเงิน</td>
        <td class="text-right">${formatCurrency(totalAmount)}</td>
        <td class="text-right">${formatCurrency(totalAmount)}</td>
        <td class="text-right">${formatCurrency(cashTotal)}</td>
        <td class="text-right">${formatCurrency(transferTotal)}</td>
        <td></td>
      </tr>
    </tbody>
  </table>

  <div class="footer">
    <div class="signature">
      <div class="signature-line">ผู้จัดทำ</div>
    </div>
    <div class="signature">
      <div class="signature-line">ผู้อนุมัติ</div>
    </div>
  </div>
</body>
</html>`;

      const blob = new Blob([html], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const tab = window.open(url, "_blank");
      if (tab) {
        tab.onload = () => {
          setTimeout(() => tab.print(), 500);
        };
      } else {
        alert("ไม่สามารถเปิดหน้าต่างใหม่ได้ กรุณาอนุญาต popup");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={generate}
      disabled={loading}
      variant="contained"
      color="secondary"
    >
      {loading ? "กำลังสร้าง PDF" : "สั่งพิมพ์รายงาน"}
    </Button>
  );
};

export default ExpensePdfButton;
