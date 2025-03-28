import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  makeStyles
} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(3)
  },
  table: {
    minWidth: 650,
  },
  tableContainer: {
    marginTop: theme.spacing(3),
    borderRadius: theme.spacing(1)
  },
  addButton: {
    marginBottom: theme.spacing(3)
  },
  form: {
    '& .MuiTextField-root': {
      margin: theme.spacing(1),
      width: '100%',
    },
  },
}));

function Orders() {
  const classes = useStyles();
  const [orders, setOrders] = useState([]);
  const [open, setOpen] = useState(false);
  const [userId, setUserId] = useState('');
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = () => {
    axios.get(`${process.env.REACT_APP_API_URL}/api/orders/orders`)
      .then(res => {
        setOrders(res.data);
      })
      .catch(err => {
        console.error(err);
      });
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleCreateOrder = (e) => {
    e.preventDefault();
    const newOrder = { userId, productId, quantity };

    axios.post(`${process.env.REACT_APP_API_URL}/api/orders/create`, newOrder)
      .then(res => {
        setOrders([...orders, res.data]);
        setUserId('');
        setProductId('');
        setQuantity('');
        handleClose();
      })
      .catch(err => {
        console.error(err);
      });
  };

  return (
    <div className={classes.root}>
      <Typography variant="h4" gutterBottom>
        Orders
      </Typography>

      <Button
        variant="contained"
        color="primary"
        startIcon={<AddIcon />}
        onClick={handleOpen}
        className={classes.addButton}
      >
        Add New Order
      </Button>

      <TableContainer component={Paper} className={classes.tableContainer}>
        <Table className={classes.table}>
          <TableHead>
            <TableRow>
              <TableCell>Order ID</TableCell>
              <TableCell>User ID</TableCell>
              <TableCell>Product ID</TableCell>
              <TableCell align="right">Quantity</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order._id}>
                <TableCell>{order._id}</TableCell>
                <TableCell>{order.userId}</TableCell>
                <TableCell>{order.productId}</TableCell>
                <TableCell align="right">{order.quantity}</TableCell>
                <TableCell>{order.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Create New Order</DialogTitle>
        <form onSubmit={handleCreateOrder} className={classes.form}>
          <DialogContent>
            <TextField
              label="User ID"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              required
            />
            <TextField
              label="Product ID"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              required
            />
            <TextField
              label="Quantity"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="secondary">
              Cancel
            </Button>
            <Button type="submit" color="primary" variant="contained">
              Create Order
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </div>
  );
}

export default Orders;
