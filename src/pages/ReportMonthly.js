import React from "react";
import { Container, Tabs, Tab, Card, CardContent, Typography } from "@mui/material";
import MonthlyIncome from '../components/Report/MonthlyIncome';
import MonthlyExpense from "../components/Report/MonthlyExpense";
import MonthlySummary from "../components/Report/MonthlySummary";

const ReportMonthly = () => {
  const [tabIndex, setTabIndex] = React.useState(0);

  const handleTabChange = (event, newIndex) => {
    setTabIndex(newIndex);
  };

  return (
    <Container maxWidth={false} sx={{ mt: 4, maxWidth: "1400px" }}>
      <Typography sx={{
        fontWeight: '600',
        fontSize: '24px',
        fontFamily: 'Instrument Sans',
        letterSpacing: '1.5px',
        lineHeight: '2',
        textShadow: '1px 1px 2px rgba(0, 0, 0, 0.1)'
      }}>
        รายงานประจำเดือน
      </Typography>
      <Tabs
        value={tabIndex}
        onChange={handleTabChange}
        variant="scrollable"
        sx={{
          backgroundColor: "#F0F5FF",
          borderRadius: "8px",
          alignSelf: "start",
          "& .MuiTab-root": {
            color: "#6B7280",
            fontWeight: "bold",
            textAlign: "left",
          },
          "& .Mui-selected": {
            backgroundColor: "#D6E4FF",
            borderRadius: "8px",
            color: "#1D4ED8",
          },
          "& .MuiTabs-indicator": {
            display: "none",
          },
        }}
      >
        <Tab label="รายรับประจำเดือน" />
        <Tab label="รายจ่ายประจำเดือน" />
        <Tab label="สรุปรายรับรายจ่ายประจำเดือน" />
      </Tabs>

      <Card>
        <CardContent>
          {tabIndex === 0 && <MonthlyIncome />}
          {tabIndex === 1 && <MonthlyExpense />}
          {tabIndex === 2 && <MonthlySummary />}
        </CardContent>
      </Card>
    </Container>
  );
};

export default ReportMonthly;
