import React, { useState } from "react";
import { Container, Grid, TextField, Button, Card, CardContent, Typography, Avatar, Tabs, Tab,Box ,Checkbox,IconButton,Drawer,List,ListItem, Divider} from "@mui/material";
import { Grade } from "@mui/icons-material";

const Receipt = () => {

      const medicineList = [
        {
          id: 1,
          name: "ยาพาราเซตามอล",
          composition: "Paracetamol 500mg",
          dosage: "รับประทานครั้งละ 1 เม็ด ทุก 4-6 ชั่วโมง",
          description: "ใช้สำหรับบรรเทาอาการปวด ลดไข้",
          warning: "อาจทำให้ง่วงซึม เสี่ยงต่อการขับรถ",
          doctor: "นายแพทย์xxxxxxxxxxxxxxxxx",
        },
        {
          id: 2,
          name: "ยาแก้ปวดหัว",
          composition: "Ibuprofen 400mg",
          dosage: "รับประทานครั้งละ 1 เม็ด ทุก 6 ชั่วโมง",
          description: "ใช้สำหรับบรรเทาอาการปวดศีรษะ",
          warning: " อาจทำให้ง่วงซึม เสี่ยงต่อการขับรถ",
          doctor: "นายแพทย์xxxxxxxxxxxxxxxxx",
        },
      ];
      
    
    return (
      <Grid container alignItems="center">
       
       <Grid container justifyContent="center" alignItems="center" sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
  {medicineList.map((medicine) => (
    <Box key={medicine.id} sx={{ width: '50%', mb: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Button variant="contained" size="md" sx={{ display: "block", textAlign: "left", bgcolor:'#5698E0', borderRadius: "16px 16px 0 0", width: '100%', fontSize: '18px' }}>
        สัมพันธ์คลีนิค
        <Typography>280 หมู่ 4 ถนน เชียงใหม่-ฮอด ต.บ้านหลวง อ. จอมทอง จ. เชียงใหม่ 50160</Typography>
      </Button>
      
      <Card sx={{ width: '100%', padding: 2, display: 'flex', flexDirection: 'column', alignItems: 'left' }}>
        <CardContent>
          <Typography sx={{ fontWeight: "bold", fontSize: 18, textAlign: "left" }}>
            {medicine.name}
          </Typography>
          <Typography sx={{ textAlign: "left", color: "gray", fontSize: 14 }}>
            {medicine.composition}
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Typography sx={{ whiteSpace: "pre-line", fontSize: 16 }}>
            <strong>วิธีใช้:</strong> {medicine.dosage}
          </Typography>
          <Typography sx={{ mt: 2, fontSize: 16 }}>
            <strong>สรรพคุณ:</strong> {medicine.description}
          </Typography>
          <Typography sx={{ mt: 2, color: "red", fontWeight: "bold", fontSize: 14 }}>
            {medicine.warning}
          </Typography>
          <Divider sx={{ mt: 3,bgcolor:'#5698E0',width:'200%',ml:-5 }} />
          <Typography sx={{ textAlign: 'center', mt: 2, mb: -2 }}>
            นายแพทย์ {medicine.doctor}
          </Typography>
        </CardContent>
      </Card>

      <Button variant="contained" size="large" sx={{ display: "block", textAlign: "center", bgcolor:'#5698E0', borderRadius: "0 0 16px 16px", width: '100%' }}>
        สอบถามข้อมูลเพิ่มเติม เบอร์โทรติดต่อ : 053-826-524
      </Button>
    </Box>
  ))}
</Grid>



      </Grid>
    );
  };
  
  export default Receipt;
  

