import React from "react";
import { Container, Tabs, Tab, Card, CardContent, Typography } from "@mui/material";
import BalanceDrugReport from "../components/Report/BalanceDrugReport";

function DrugReport() {
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
                }}
            >
                <Tab label="สินค้าคงเหลือ" />
                <Tab label="สต็อกการ์ด" />
                <Tab label="รายงานยาเวชภัณฑ์ใกล้หมดอายุ" />
            </Tabs>

            <Card sx={{ mt: 2 }}>
                <CardContent>
                    {tabIndex === 0 && <BalanceDrugReport />}
                    {tabIndex === 1 && <Typography>สต็อกการ์ด - Coming Soon</Typography>}
                    {tabIndex === 2 && <Typography>รายงานการเคลื่อนไหวสินค้า - Coming Soon</Typography>}
                    {tabIndex === 3 && <Typography>รายงานยาเวชภัณฑ์ใกล้หมดอายุ - Coming Soon</Typography>}
                </CardContent>
            </Card>
        </Container>
    );
}

export default DrugReport;