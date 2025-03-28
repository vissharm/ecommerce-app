import React, {useEffect} from 'react';
import { 
  BrowserRouter as Router,
  Switch,
  Route
} from 'react-router-dom';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import axios from 'axios';

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

    socket.on('notification', async (data) => {
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

        // Show toast notification
        const formattedDate = orderData.lastUpdated 
          ? new Date(orderData.lastUpdated).toLocaleString()
          : new Date().toLocaleString();

        const toastMessage = (
          <div>
            <strong>Order Status Update</strong>
            <br />
            <span>Order ID: {orderData.orderId}</span>
            <br />
            <span>Status: {orderData.status}</span>
            <br />
            <span>Last Updated: {formattedDate}</span>
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
          },
          onOpen: async () => {
            try {
              if (orderData.notificationId) {
                await axios.put(
                  `${process.env.REACT_APP_API_URL}/api/notifications/markAsRead/${orderData.notificationId}`
                );
                console.log('Notification marked as read:', orderData.notificationId);
                
                const notificationsComponent = document.querySelector('[data-component="notifications"]');
                if (notificationsComponent) {
                  const event = new CustomEvent('notificationUpdate');
                  notificationsComponent.dispatchEvent(event);
                }
              }
            } catch (err) {
              console.error('Error marking notification as read:', err);
            }
          }
        });
      } catch (err) {
        console.error('Error processing notification:', err);
      }
    });

    // Add listener for order status updates
    socket.on('orderStatusUpdate', (data) => {
      console.log('Order status update received:', data);
      const ordersComponent = document.querySelector('[data-component="orders"]');
      if (ordersComponent) {
        const event = new CustomEvent('orderStatusUpdate', { 
          detail: { 
            orderId: data.orderId,
            status: data.status,
            lastUpdated: data.lastUpdated
          } 
        });
        ordersComponent.dispatchEvent(event);
      }
    });

    return () => {
      socket.off('notification');
      socket.off('orderStatusUpdate');
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
