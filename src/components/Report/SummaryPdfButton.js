import React, { useState } from "react";
import { Button } from "@mui/material";

const formatCurrency = (value) =>
  new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    minimumFractionDigits: 2,
  }).format(value || 0);

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

const SummaryPdfButton = ({
  startDate,
  endDate,
  incomeRows = [],
  expenseRows = [],
  summary,
}) => {
  const [loading, setLoading] = useState(false);

  const generate = () => {
    setLoading(true);
    try {
      const maxLength = Math.max(incomeRows.length, expenseRows.length);
      const rows = [];
      for (let i = 0; i < maxLength; i += 1) {
        const income = incomeRows[i];
        const expense = expenseRows[i];
        rows.push(`
          <tr>
            <td>${income ? income.name || "-" : ""}</td>
            <td class="text-right">${income ? formatCurrency(income.amount) : ""}</td>
            <td>${expense ? expense.name || "-" : ""}</td>
            <td class="text-right">${expense ? formatCurrency(expense.amount) : ""}</td>
          </tr>`);
      }

      const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>สรุปรายรับ รายจ่ายประจำวัน</title>
  <style>
    body {
      font-family: 'Sarabun', 'TH Sarabun New', sans-serif;
      padding: 24mm 18mm;
      color: #000;
      font-size: 14px;
    }
    .header { text-align: center; margin-bottom: 24px; }
    .title { font-size: 22px; font-weight: 700; margin-bottom: 4px; }
    .subtitle { font-size: 18px; margin-bottom: 12px; }
    .period { margin-bottom: 16px; }
    table { width: 100%; border-collapse: collapse; }
    th, td { border: 1px solid #000; padding: 6px 8px; }
    th { background: #f1f5f9; font-weight: 600; }
    .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px; }
    .summary-box { border: 1px solid #000; padding: 12px; text-align: center; background: #f8fafc; }
    .summary-label { font-size: 12px; margin-bottom: 6px; }
    .summary-value { font-size: 18px; font-weight: 700; }
    .text-right { text-align: right; }
    .totals-row { font-weight: 700; background: #e2e8f0; }
    @page { size: A4 portrait; margin: 20mm 15mm; }
  </style>
</head>
<body>
  <div class="header">
    <div class="title">สัมพันธ์คลินิก</div>
    <div class="subtitle">สรุปรายรับ รายจ่ายประจำวัน</div>
    <div class="period">วันที่ ${formatThaiDate(startDate)} ถึงวันที่ ${formatThaiDate(endDate || startDate)}</div>
  </div>

  <table>
    <thead>
      <tr>
        <th colspan="2">รายรับ</th>
        <th colspan="2">รายจ่าย</th>
      </tr>
      <tr>
        <th>รายการ</th>
        <th>จำนวนเงิน</th>
        <th>รายการ</th>
        <th>จำนวนเงิน</th>
      </tr>
    </thead>
    <tbody>
      ${rows.join("") || `<tr><td colspan="4" style="text-align:center; padding: 24px;">ไม่มีข้อมูล</td></tr>`}
      <tr class="totals-row">
        <td>รวมรายรับ</td>
        <td class="text-right">${formatCurrency(summary?.incomeTotal || 0)}</td>
        <td>รวมรายจ่าย</td>
        <td class="text-right">${formatCurrency(summary?.expenseTotal || 0)}</td>
      </tr>
      <tr class="totals-row">
        <td>คงเหลือ</td>
        <td class="text-right">${formatCurrency(summary?.balance || 0)}</td>
        <td colspan="2"></td>
      </tr>
    </tbody>
  </table>
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
    <Button onClick={generate} disabled={loading} variant="contained">
      {loading ? "กำลังสร้าง PDF" : "สั่งพิมพ์สรุปรายวัน"}
    </Button>
  );
};

export default SummaryPdfButton;
