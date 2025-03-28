import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { Container } from '@material-ui/core';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Users from './components/Users';
import Orders from './components/Orders';
import Notifications from './components/Notifications';
import Products from './components/Products';

import React, { useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import socket from './socket';


function App() {
  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to WebSocket server via API Gateway');
    });
  
    socket.on('notification', (data) => {
      console.log('Notification received:', data);
      try {
        const orderData = JSON.parse(data.message);
        toast(`New order received for product: ${orderData.productId}`);
      } catch (err) {
        console.error('Toast error:', err);
        // Fallback if parsing fails
        toast(typeof data === 'string' ? data : 'New order notification received');
      }
    });
  
    socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
    });
  
    return () => {
      socket.off('connect');
      socket.off('notification');
      socket.off('disconnect');
    };
  }, []);

  return (
    <div>
      {/* <div className="App">
        <ToastContainer />
      </div> */}
      <Router>
        <Navbar />
        <Container>
          <Switch>
            <Route exact path="/" component={Home} />
            <Route path="/users" component={Users} />
            <Route path="/orders" component={Orders} />
            <Route path="/notifications" component={Notifications} />
            <Route path="/products" component={Products} />
          </Switch>
        </Container>
      </Router>
    </div>
  );
}

export default App;