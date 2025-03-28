import React from 'react';
import { Typography } from '@material-ui/core';

function Home() {
  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Welcome to the E-commerce App
      </Typography>
      <Typography variant="body1">
        Use the navigation bar to access different features of the application.
      </Typography>
    </div>
  );
}

export default Home;