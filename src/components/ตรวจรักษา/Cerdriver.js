import React, { useState } from "react";
import { Container, Grid, TextField, Button, Card, CardContent, Typography, Avatar, Tabs, Tab,Box ,Checkbox,IconButton,Drawer,List,ListItem, Divider} from "@mui/material";
import { Grade } from "@mui/icons-material";

const Cerdriver = () => {
    return (
      <Grid container alignItems="center">
        <Grid item xs={6} sm={12} sx={{ display: 'flex', alignItems: 'center' }}>
            <Card sx={{textAlign:'center',ml:50}}>
        <img src="/formcerdriver.png" alt="Logo" className="receipt-logo" sx={{ display: 'flex', alignItems: 'center' }} />
            </Card>
        </Grid>


        
      </Grid>
    );
  };
  
  export default Cerdriver ;
  