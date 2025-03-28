import React, {useEffect} from 'react';
import { 
  BrowserRouter as Router,
  Switch,
  Route
} from 'react-router-dom';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';

import { Container } from '@material-ui/core';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Users from './components/Users';
import Orders from './components/Orders';
import Notifications from './components/Notifications';
import Products from './components/Products';

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
        
        // Update orders list if Orders component is open
        if (window.location.pathname === '/orders') {
          const ordersComponent = document.querySelector('[data-component="orders"]');
          if (ordersComponent) {
            const event = new CustomEvent('orderStatusUpdate', { 
              detail: { 
                orderId: orderData.orderId,
                status: orderData.status,
                lastUpdated: orderData.lastUpdated
              } 
            });
            ordersComponent.dispatchEvent(event);
          }
        }

        // Create a formatted message for the toast
        const formattedDate = new Date(orderData.orderDate).toLocaleString();
        const toastMessage = (
          <div>
            <strong>New Order Received</strong>
            <br />
            <span>Product ID: {orderData.productId}</span>
            <br />
            <span>Quantity: {orderData.quantity}</span>
            <br />
            <span>Status: {orderData.status}</span>
            <br />
            <span>Date: {formattedDate}</span>
          </div>
        );
        
        toast(toastMessage, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          style: {
            background: '#f5f5f5',
            color: '#333',
            borderLeft: '4px solid #4caf50'
          }
        });
      } catch (err) {
        console.error('Notification processing error:', err);
        toast('New notification received', {
          position: "top-right",
          type: "info"
        });
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
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <Router>
        <div className="App">
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
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </div>
      </Router>
    </MuiPickersUtilsProvider>
  );
}

export default App;
