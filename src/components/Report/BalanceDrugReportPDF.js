// src/components/Report/BalanceDrugReportPDF.jsx
import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// ไม่ต้อง Register Font - ใช้ Default Helvetica

const styles = StyleSheet.create({
    page: {
        padding: 30,
        // ไม่ต้องระบุ fontFamily - ใช้ default Helvetica
        fontSize: 10,
    },
    header: {
        marginBottom: 20,
        borderBottomWidth: 2,
        borderBottomColor: '#5698E0',
        paddingBottom: 10,
    },
    title: {
        fontSize: 18,
        fontWeight: 700,
        textAlign: 'center',
        color: '#5698E0',
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 10,
        textAlign: 'center',
        color: '#666',
    },
    summarySection: {
        marginBottom: 15,
        padding: 10,
        backgroundColor: '#F0F5FF',
        borderRadius: 5,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    summaryLabel: {
        fontSize: 10,
        fontWeight: 700,
    },
    summaryValue: {
        fontSize: 10,
        color: '#5698E0',
        fontWeight: 700,
    },
    tableContainer: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#5698E0',
        color: '#FFFFFF',
        fontWeight: 700,
        fontSize: 9,
        padding: 5,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
        padding: 5,
        fontSize: 9,
    },
    tableRowEven: {
        backgroundColor: '#F9F9F9',
    },
    col1: { width: '5%', textAlign: 'center' },
    col2: { width: '12%' },
    col3: { width: '23%' },
    col4: { width: '10%' },
    col5: { width: '10%' },
    col6: { width: '10%', textAlign: 'right' },
    col7: { width: '10%' },
    col8: { width: '10%', textAlign: 'right' },
    col9: { width: '10%', textAlign: 'center' },
    totalRow: {
        flexDirection: 'row',
        backgroundColor: '#F0F5FF',
        fontWeight: 700,
        padding: 8,
        borderTopWidth: 2,
        borderTopColor: '#5698E0',
        fontSize: 10,
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 30,
        right: 30,
        fontSize: 8,
        textAlign: 'center',
        color: '#666',
        borderTopWidth: 1,
        borderTopColor: '#CCCCCC',
        paddingTop: 5,
    },
    statusText: {
        fontSize: 8,
        textAlign: 'center',
        fontWeight: 700,
    },
    statusNormal: {
        color: '#4CAF50',
    },
    statusLow: {
        color: '#FF9800',
    },
    statusOut: {
        color: '#F44336',
    }
});

const formatNumber = (number) => {
    return Number(number).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
};

const formatDate = (dateString) => {
    if (!dateString || dateString === '-') return '-';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '-';
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear() + 543;
        return `${day}/${month}/${year}`;
    } catch (error) {
        return '-';
    }
};

const getStockStatus = (qty) => {
    const quantity = parseFloat(qty) || 0;
    if (quantity <= 0) return { label: 'Out', style: styles.statusOut };
    if (quantity <= 10) return { label: 'Low', style: styles.statusLow };
    return { label: 'Normal', style: styles.statusNormal };
};

export const BalanceDrugReportPDF = ({ reportData, summaryStats }) => {
    const currentDate = new Date();
    const formatDateTime = `${currentDate.toLocaleDateString('en-US')} ${currentDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;

    return (
        <Document>
            <Page style={styles.page} size="A4" orientation="landscape">
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Drug Balance Report</Text>
                    <Text style={styles.subtitle}>
                        Print Date: {formatDateTime}
                    </Text>
                </View>

                {/* Summary Section */}
                {summaryStats && (
                    <View style={styles.summarySection}>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Total Items:</Text>
                            <Text style={styles.summaryValue}>{summaryStats.totalItems} items</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>In Stock:</Text>
                            <Text style={styles.summaryValue}>{summaryStats.inStock} items</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Low Stock:</Text>
                            <Text style={styles.summaryValue}>{summaryStats.lowStock} items</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Out of Stock:</Text>
                            <Text style={styles.summaryValue}>{summaryStats.outOfStock} items</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Total Value:</Text>
                            <Text style={styles.summaryValue}>{formatNumber(summaryStats.totalValue)} Baht</Text>
                        </View>
                    </View>
                )}

                {/* Table */}
                <View style={styles.tableContainer}>
                    {/* Table Header */}
                    <View style={styles.tableHeader}>
                        <Text style={styles.col1}>No.</Text>
                        <Text style={styles.col2}>Drug Code</Text>
                        <Text style={styles.col3}>Drug Name</Text>
                        <Text style={styles.col4}>Lot No.</Text>
                        <Text style={styles.col5}>Exp. Date</Text>
                        <Text style={styles.col6}>Quantity</Text>
                        <Text style={styles.col7}>Unit</Text>
                        <Text style={styles.col8}>Value</Text>
                        <Text style={styles.col9}>Status</Text>
                    </View>

                    {/* Table Rows */}
                    {reportData.map((item, index) => {
                        const status = getStockStatus(item.QTY);
                        return (
                            <View
                                key={`${item.DRUG_CODE}-${index}`}
                                style={[styles.tableRow, index % 2 === 0 ? styles.tableRowEven : {}]}
                            >
                                <Text style={styles.col1}>{index + 1}</Text>
                                <Text style={styles.col2}>{item.DRUG_CODE}</Text>
                                <Text style={styles.col3}>{item.GENERIC_NAME || '-'}</Text>
                                <Text style={styles.col4}>{item.LOT_NO || '-'}</Text>
                                <Text style={styles.col5}>{formatDate(item.EXPIRE_DATE)}</Text>
                                <Text style={styles.col6}>{formatNumber(item.QTY)}</Text>
                                <Text style={styles.col7}>{item.UNIT_NAME1 || item.UNIT_CODE1 || '-'}</Text>
                                <Text style={styles.col8}>{formatNumber(item.AMT)}</Text>
                                <Text style={[styles.col9, styles.statusText, status.style]}>
                                    {status.label}
                                </Text>
                            </View>
                        );
                    })}

                    {/* Total Row */}
                    <View style={styles.totalRow}>
                        <Text style={{ width: '60%', textAlign: 'right', paddingRight: 10 }}>
                            Total:
                        </Text>
                        <Text style={styles.col6}>
                            {formatNumber(reportData.reduce((sum, item) => sum + (parseFloat(item.QTY) || 0), 0))}
                        </Text>
                        <Text style={styles.col7}></Text>
                        <Text style={[styles.col8, { color: '#5698E0' }]}>
                            {formatNumber(reportData.reduce((sum, item) => sum + (parseFloat(item.AMT) || 0), 0))} Baht
                        </Text>
                        <Text style={styles.col9}></Text>
                    </View>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text>Drug Balance Report - Drug Inventory Management System</Text>
                </View>
            </Page>
        </Document>
    );
};