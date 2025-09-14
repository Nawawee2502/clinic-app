import React from "react";
import { Page, Text, View, Document, StyleSheet, Font } from "@react-pdf/renderer";

// Register Thai font using Google Fonts
Font.register({
    family: 'NotoSansThai',
    src: 'https://fonts.gstatic.com/s/notosansthai/v20/iJWnBXeUZi_OHPqn4wq6hQ2_hbJ1ByaD.woff2'
});

const styles = StyleSheet.create({
    page: { 
        padding: 30, 
        fontSize: 12, 
        fontFamily: "Helvetica",
        backgroundColor: "#ffffff"
    },
    header: { 
        textAlign: "center", 
        marginBottom: 25,
        fontFamily: "Helvetica",
        paddingBottom: 15,
        borderBottom: "2px solid #1976d2"
    },
    clinicTitle: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 8,
        fontFamily: "Helvetica",
        color: "#1976d2"
    },
    clinicInfo: {
        fontSize: 11,
        marginBottom: 3,
        fontFamily: "Helvetica",
        color: "#555"
    },
    receiptTitle: {
        fontSize: 16,
        fontWeight: "bold",
        marginTop: 12,
        fontFamily: "Helvetica",
        color: "#1976d2"
    },
    section: { 
        marginBottom: 15,
        fontFamily: "Helvetica"
    },
    patientInfoSection: {
        marginBottom: 20,
        padding: 12,
        backgroundColor: "#f8f9fa",
        borderRadius: 4,
        fontFamily: "Helvetica"
    },
    row: { 
        flexDirection: "row", 
        justifyContent: "space-between", 
        marginBottom: 6,
        fontFamily: "Helvetica"
    },
    patientInfoRow: {
        flexDirection: "row",
        justifyContent: "space-between", 
        marginBottom: 5,
        fontSize: 11,
        fontFamily: "Helvetica"
    },
    label: {
        fontWeight: "bold",
        fontFamily: "Helvetica"
    },
    tableContainer: {
        marginBottom: 20,
        fontFamily: "Helvetica"
    },
    tableHeader: { 
        flexDirection: "row", 
        backgroundColor: "#e3f2fd", 
        padding: 10,
        fontFamily: "Helvetica",
        borderBottom: "1px solid #1976d2"
    },
    tableRow: { 
        flexDirection: "row", 
        padding: 8, 
        borderBottom: "1px solid #ddd",
        fontFamily: "Helvetica",
        minHeight: 30
    },
    tableRowEven: {
        backgroundColor: "#f8f9fa"
    },
    cellDescription: { 
        flex: 3,
        fontFamily: "Helvetica",
        paddingRight: 8
    },
    cellQuantity: { 
        flex: 1,
        textAlign: "center",
        fontFamily: "Helvetica"
    },
    cellPrice: { 
        flex: 1.2,
        textAlign: "right",
        fontFamily: "Helvetica"
    },
    headerCell: {
        fontWeight: "bold",
        fontSize: 12,
        fontFamily: "Helvetica"
    },
    totalSection: {
        marginTop: 25,
        paddingTop: 15,
        borderTop: "2px solid #1976d2",
        fontFamily: "Helvetica"
    },
    totalRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 8,
        fontSize: 12,
        fontFamily: "Helvetica"
    },
    finalTotal: {
        backgroundColor: "#e3f2fd",
        padding: 12,
        marginTop: 10,
        borderRadius: 4,
        border: "1px solid #1976d2"
    },
    finalTotalText: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#1976d2",
        fontFamily: "Helvetica"
    },
    footer: {
        textAlign: "center",
        marginTop: 30,
        fontSize: 10,
        color: "#666",
        fontFamily: "Helvetica",
        borderTop: "1px solid #ddd",
        paddingTop: 15
    },
    emptyState: {
        textAlign: "center",
        fontStyle: "italic",
        color: "#999",
        marginVertical: 20,
        fontFamily: "Helvetica"
    }
});

const ReceiptPDF = ({ patient, editablePrices, total, discount = 0 }) => {
    // Ensure we have valid data
    if (!patient) {
        return (
            <Document>
                <Page size="A4" style={styles.page}>
                    <View style={styles.emptyState}>
                        <Text>ไม่พบข้อมูลผู้ป่วย</Text>
                    </View>
                </Page>
            </Document>
        );
    }

    // Calculate final total
    const finalTotal = Math.max(0, total - discount);
    
    // Prepare all items for the table
    const allItems = [];
    
    // Add lab items
    if (editablePrices?.labs?.length > 0) {
        editablePrices.labs.forEach(item => {
            allItems.push({
                description: item.LABNAME || item.LABCODE || "การตรวจ",
                quantity: "1",
                price: item.editablePrice || 0,
                type: "การตรวจ"
            });
        });
    }
    
    // Add procedure items
    if (editablePrices?.procedures?.length > 0) {
        editablePrices.procedures.forEach(item => {
            allItems.push({
                description: item.MED_PRO_NAME_THAI || item.PROCEDURE_NAME || item.MEDICAL_PROCEDURE_CODE || "หัตถการ",
                quantity: "1",
                price: item.editablePrice || 0,
                type: "หัตถการ"
            });
        });
    }
    
    // Add drug items
    if (editablePrices?.drugs?.length > 0) {
        editablePrices.drugs.forEach(item => {
            allItems.push({
                description: item.GENERIC_NAME || item.DRUG_CODE || "ยา",
                quantity: `${item.QTY || 1} ${item.UNIT_CODE || ""}`.trim(),
                price: item.editablePrice || 0,
                type: "ยา"
            });
        });
    }

    const formatDate = (date) => {
        return date.toLocaleDateString("th-TH", {
            year: 'numeric',
            month: 'long', 
            day: 'numeric'
        });
    };

    const formatTime = (date) => {
        return date.toLocaleTimeString("th-TH", {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const currentDate = new Date();

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.clinicTitle}>สัมพันธ์คลินิค</Text>
                    <Text style={styles.clinicInfo}>
                        280 หมู่ 4 ถนน เชียงใหม่-ฮอด ต.บ้านหลวง อ.จอมทอง จ.เชียงใหม่ 50160
                    </Text>
                    <Text style={styles.clinicInfo}>โทรศัพท์: 053-826-524</Text>
                    <Text style={styles.receiptTitle}>ใบเสร็จรับเงิน</Text>
                </View>

                {/* Patient Information */}
                <View style={styles.patientInfoSection}>
                    <View style={styles.patientInfoRow}>
                        <Text>VN: {patient.VNO || "N/A"}</Text>
                        <Text>HN: {patient.HNCODE || "N/A"}</Text>
                    </View>
                    <View style={styles.patientInfoRow}>
                        <Text style={styles.label}>
                            ชื่อผู้ป่วย: {`${patient.PRENAME || ""}${patient.NAME1 || ""} ${patient.SURNAME || ""}`.trim()}
                        </Text>
                        <Text>วันที่: {formatDate(currentDate)}</Text>
                    </View>
                    <View style={styles.patientInfoRow}>
                        <Text></Text>
                        <Text>เวลา: {formatTime(currentDate)}</Text>
                    </View>
                </View>

                {/* Items Table */}
                {allItems.length > 0 ? (
                    <View style={styles.tableContainer}>
                        {/* Table Header */}
                        <View style={styles.tableHeader}>
                            <Text style={[styles.cellDescription, styles.headerCell]}>รายการ</Text>
                            <Text style={[styles.cellQuantity, styles.headerCell]}>จำนวน</Text>
                            <Text style={[styles.cellPrice, styles.headerCell]}>ราคา (บาท)</Text>
                        </View>
                        
                        {/* Table Rows */}
                        {allItems.map((item, index) => (
                            <View key={index} style={[
                                styles.tableRow,
                                index % 2 === 1 ? styles.tableRowEven : {}
                            ]}>
                                <Text style={styles.cellDescription}>
                                    {item.description}
                                </Text>
                                <Text style={styles.cellQuantity}>
                                    {item.quantity}
                                </Text>
                                <Text style={styles.cellPrice}>
                                    {item.price.toFixed(2)}
                                </Text>
                            </View>
                        ))}
                    </View>
                ) : (
                    <View style={styles.emptyState}>
                        <Text>ไม่มีรายการ</Text>
                    </View>
                )}

                {/* Total Section */}
                <View style={styles.totalSection}>
                    <View style={styles.totalRow}>
                        <Text>รวมค่ารักษาทั้งหมด:</Text>
                        <Text>{total.toFixed(2)} บาท</Text>
                    </View>
                    
                    {discount > 0 && (
                        <View style={styles.totalRow}>
                            <Text>หักส่วนลด:</Text>
                            <Text>-{discount.toFixed(2)} บาท</Text>
                        </View>
                    )}
                    
                    <View style={[styles.finalTotal]}>
                        <View style={styles.totalRow}>
                            <Text style={styles.finalTotalText}>ยอดชำระสุทธิ:</Text>
                            <Text style={styles.finalTotalText}>{finalTotal.toFixed(2)} บาท</Text>
                        </View>
                    </View>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text>ขอบคุณที่ใช้บริการ</Text>
                    <Text style={{ marginTop: 8 }}>
                        พิมพ์เมื่อ: {formatDate(currentDate)} เวลา {formatTime(currentDate)}
                    </Text>
                </View>
            </Page>
        </Document>
    );
};

export default ReceiptPDF;