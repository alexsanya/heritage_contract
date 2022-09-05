import React from 'react';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import { Link } from "react-router-dom";

import { Metamask } from './metamask';

import './App.css';

function App() {
  return (
  <Metamask>
    <Grid
      container
      spacing={0}
      direction="column"
      alignItems="center"
      justifyContent="center"
      style={{ minHeight: '100vh' }}
    >
      <Grid item xs={3}>
        <Grid container direction="row" alignItems="center" spacing={5} justifyContent="space-between">
          <Link to="/owner"><Button variant="outlined">I'm owner</Button></Link>
          <div style={{ width: '100px' }}></div>
          <Link to="/successor"><Button variant="outlined">I'm successor</Button></Link>
        </Grid> 
      </Grid>
    </Grid>
  </Metamask>
  );
}

export default App;
