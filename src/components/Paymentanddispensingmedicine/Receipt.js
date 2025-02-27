import React, { useState } from "react";
import { Container, Grid, TextField, Button, Card, CardContent, Typography, Avatar, Tabs, Tab,Box ,Checkbox,IconButton,Drawer,List,ListItem, Divider} from "@mui/material";
import { Grade } from "@mui/icons-material";

const Receipt = () => {
    return (
      <Grid container alignItems="center">
        <Grid item xs={6} sm={4} >
        <img src="/logo4.png" alt="Logo" className="receipt-logo" sx={{ display: 'flex', alignItems: 'left' }} />
        </Grid>
        <Grid item xs={6} sm={9} sx={{ display: 'flex', alignItems: 'center',ml:-20,mt:-10}}>
        <Typography sx={{textAlign:"left",color:'#5BA9FF',fontWeight:700,fontSize:20,mb:8}}>สัมพันธ์คลีนิค</Typography>
        <Typography sx={{textAlign:'left',ml:-15,mt:10,mb:10}}>280 หมู่ 4  ถนน เชียงใหม่-ฮอด ต.บ้านหลวง อ. จอมทอง จ. เชียงใหม่ 50160 </Typography>
        <Typography sx={{textAlign:'left',ml:-63,mt:23,mb:15}}>Tel. 053-826-524</Typography>
        <Typography sx={{textAlign:'left',ml:-15,mt:15}}>เลขประจำตัวผู้เสียอากร xxxxxxxxxxxxxx </Typography>
        <Button sx={{textAlign:'right',bgcolor:'#5698E0',color:'#FFFFFF',ml:50,mt:2,width:200,height:60,borderRadius:2,fontWeight:800,fontSize:'15.5px'}}>ใบเสร็จรับเงิน/Receipt</Button>
        </Grid>
        {/* ใส่รายละเอียดใบเสร็จตรงนี้ */}
         <Card sx={{ p: 3, textAlign: "center",height:180,width:1900,borderRadius:3,mt:1,mb:3, boxShadow: "0px -1px 2px rgba(0, 0, 0, 0.2), 0px 1px 2px rgba(0, 0, 0, 0.2)" }}>
          {/* <h5>ชื่อคนไข้</h5> */}
         </Card>

         <table style={{ width: '100%', marginTop: '1px',border: '1px solid #AFEEEE',borderRadius:10 }}>
                            <thead style={{ backgroundColor: "#F0F5FF"}}>
                                <tr>
                                    {/* <th style={{ padding: '12px 16px', textAlign: 'left', color:'#696969' }}><Checkbox /></th> */}
                                    <th style={{ padding: '12px 6px', textAlign: 'left', color:'#696969',width:'10%',textAlign:'center'}}>ลำดับ</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', color:'#696969',width:'60%' ,textAlign:'center' }}>รายการ</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', color:'#696969',width:'20%',textAlign:'center' }}>จำนวนเงิน</th>
                                </tr>
                                <tr>
                                </tr>
                            </thead>
                            <tbody>
                                {/* Table data will go here */}
                                <tr >
                                <td style={{ padding: '12px 5px' }}>{ 1}</td>
                                <td style={{ padding: '12px 16px' }}></td>
                                <td style={{ padding: '12px 16px' }}></td>
                                </tr>
                            </tbody>
                            <tfoot style={{ backgroundColor: '#F0F5FF' }}>
                          <tr>
                            <td colSpan="2" style={{ padding: '3px 12px', textAlign: 'right', fontWeight: 'bold' }}>รวมเงิน</td>
                            <td style={{ padding: '3px 12px', textAlign: 'center', fontWeight: 'bold',backgroundColor: '#FFFFFF' }}>
                              {/* {totalAmount} */}
                            </td>
                          </tr>
                          <tr>
                            <td colSpan="2" style={{ padding: '3px 12px', textAlign: 'right', fontWeight: 'bold' }}>รวมทั้งสิ้น</td>
                            <td style={{ padding: '3px 12px', textAlign: 'center', fontWeight: 'bold',backgroundColor: '#FFFFFF' }}>
                              {/* {totalAmount}  */}
                            </td>
                          </tr>
                        </tfoot>
                        </table>
      </Grid>
    );
  };
  
  export default Receipt;
  