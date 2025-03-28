import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Typography, List, ListItem, ListItemText, TextField, Button } from '@material-ui/core';

function Orders() {
  const [orders, setOrders] = useState([]);
  const [userId, setUserId] = useState('');
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState('');

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/api/orders/orders`)
      .then(res => {
        setOrders(res.data);
      })
      .catch(err => {
        console.error(err);
      });
  }, []);

  const handleCreateOrder = (e) => {
    e.preventDefault();

    const newOrder = { userId, productId, quantity };

    axios.post(`${process.env.REACT_APP_API_URL}/api/orders/create`, newOrder)
      .then(res => {
        setOrders([...orders, res.data]);
        setUserId('');
        setProductId('');
        setQuantity('');
      })
      .catch(err => {
        console.error(err);
      });
  };

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Orders
      </Typography>
      <form onSubmit={handleCreateOrder}>
        <TextField
          label="User ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          required
          fullWidth
          margin="normal"
        />
        <TextField
          label="Product ID"
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          required
          fullWidth
          margin="normal"
        />
        <TextField
          label="Quantity"
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          required
          fullWidth
          margin="normal"
        />
        <Button type="submit" variant="contained" color="primary">
          Create Order
        </Button>
      </form>
      <List>
        {orders.map(order => (
          <ListItem key={order._id}>
            <ListItemText primary={`Order ID: ${order._id}, Product ID: ${order.productId}, Quantity: ${order.quantity}, Status: ${order.status}`} />
          </ListItem>
        ))}
      </List>
    </div>
  );
}

export default Orders;