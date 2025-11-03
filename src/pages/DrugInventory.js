import React from "react";
import { Container, Tabs, Tab, Card, CardContent, Typography } from "@mui/material";
import Borrow1Management from "./Borrow1Management";
import CheckStockManagement from "./CheckStockManagement";
import Receipt1Management from "./Receipt1Management";
import Return1Management from "./Return1Management";
import BalMonthDrugManagement from "./BalMonthDrugManagement";


function DrugInventory() {
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
                ระบบคลังยา/เวชภัณฑ์
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
                    // maxWidth: "500px",
                }}
            >
                {/* <Tab label="ข้อมูลยา" />
                <Tab label="ข้อมูลหัตถการ" /> */}
                <Tab label="ยอดยกมา" />
                <Tab label="ใบรับยา/เวชภัณฑ์" />
                <Tab label="ใบคืนยา/เวชภัณฑ์" />
                <Tab label="ใบเบิกยา" />
                <Tab label="ใบตรวจนับสต๊อก" />

            </Tabs>

            <Card>
                <CardContent>
                    {tabIndex === 0 && <BalMonthDrugManagement />}
                    {tabIndex === 1 && <Receipt1Management />}
                    {tabIndex === 2 && <Return1Management />}
                    {tabIndex === 3 && <Borrow1Management />}
                    {tabIndex === 4 && <CheckStockManagement />}
                </CardContent>
            </Card>
        </Container>
    );
};

export default DrugInventory