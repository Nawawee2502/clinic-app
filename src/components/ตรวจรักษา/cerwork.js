import React, { useState } from "react";
import { Container, Grid, TextField, Button, Card, CardContent, Typography, Avatar, Tabs, Tab,Box ,Checkbox,IconButton,Drawer,List,ListItem, Divider} from "@mui/material";
import { Grade } from "@mui/icons-material";

const cerwork = () => {
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
        </Grid>
        <Grid item xs={6} sm={12} >
        <Divider sx={{mt:-1}} />
        </Grid>
        <Typography sx={{fontSize:24,textAlign:'center',ml:70,mt:5,fontWeight:800}}>ใบรับรองแพทย์</Typography>
        <Grid item xs={6} sm={10}  >
        <Typography sx={{ml:20}}>เลขที่ R0000001</Typography>
        <Typography sx={{ml:'85%',mt:-3}}>วันที่ 15  มีนาคม  2567</Typography>
        <Grid item xs={6} sm={6}  sx={{mt:5,textAlign:'center',ml:50}}>
        <Typography>
        ข้าพเจ้า นายแพทย์xxxxxxxxxxxxxxxxx     ใบอนุญาตประกอบวิชาชีพเวชกรรมเลขที่ xxxxxxxxx

        ได้ทําการตรวจร่างกาย นายทดสอบ ทดสอบนามสกุล        เมื่อวันที่  21  ตุลาคม  2567    เวลา 10:18 น.

        ผลการวินิจฉัย
        เห็นควรอนุญาตให้
        มีกําหนด วันตั้งแต่วันที่                                          ถึงวันที่
        </Typography>
        </Grid>
        </Grid>

        
      </Grid>
    );
  };
  
  export default cerwork;
  