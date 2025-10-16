import React from "react";
import { Container, Tabs, Tab, Card, CardContent, Typography } from "@mui/material";
import TypePayManagement from '../components/financeType/TypePayManagement';
import TypeIncomeManagement from '../components/financeType/TypeIncomeManagement';

const FinanceTypes = () => {
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
                ระบบจัดการประเภทรายรับ/รายจ่าย
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
                <Tab label="ประเภทรายจ่าย" />
                <Tab label="ประเภทรายรับ" />
            </Tabs>

            <Card sx={{ mt: 2 }}>
                <CardContent>
                    {tabIndex === 0 && <TypePayManagement />}
                    {tabIndex === 1 && <TypeIncomeManagement />}
                </CardContent>
            </Card>
        </Container>
    );
};

export default FinanceTypes;