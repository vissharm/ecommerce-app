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
import { DateTimePicker } from '@material-ui/pickers';

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
  dialogContent: {
    width: '400px', // Fixed width for dialog
    padding: theme.spacing(2),
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2), // Consistent spacing between fields
  },
  textField: {
    width: '100%',
  },
  dialogActions: {
    padding: theme.spacing(2),
  }
}));

function Orders() {
  const classes = useStyles();
  const [orders, setOrders] = useState([]);
  const [open, setOpen] = useState(false);
  const [userId, setUserId] = useState('');
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [orderDate, setOrderDate] = useState(new Date());

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
  const handleClose = () => {
    setOpen(false);
    // Reset form fields when closing
    setUserId('');
    setProductId('');
    setQuantity('');
  };

  const handleCreateOrder = (e) => {
    e.preventDefault();
    const newOrder = { 
      userId, 
      productId, 
      quantity: parseInt(quantity, 10),
      orderDate: orderDate.toISOString(),
      status: 'Pending'
    };

    axios.post(`${process.env.REACT_APP_API_URL}/api/orders/create`, newOrder)
      .then(res => {
        setOrders([...orders, res.data]);
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
              <TableCell>Order Date</TableCell>
              <TableCell>Last Updated</TableCell>
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
                <TableCell>{new Date(order.orderDate).toLocaleString()}</TableCell>
                <TableCell>{new Date(order.lastUpdated).toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog 
        open={open} 
        onClose={handleClose}
        maxWidth="xs" // Controls the maximum width of the dialog
        fullWidth={false} // Prevents the dialog from taking full width
      >
        <DialogTitle>Create New Order</DialogTitle>
        <DialogContent className={classes.dialogContent}>
          <form onSubmit={handleCreateOrder} className={classes.form}>
            <TextField
              className={classes.textField}
              label="User ID"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              variant="outlined"
              size="small"
              required
            />
            <TextField
              className={classes.textField}
              label="Product ID"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              variant="outlined"
              size="small"
              required
            />
            <TextField
              className={classes.textField}
              label="Quantity"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              variant="outlined"
              size="small"
              required
              InputProps={{ inputProps: { min: 1 } }}
            />
            <DateTimePicker
              label="Order Date"
              inputVariant="outlined"
              value={orderDate}
              onChange={setOrderDate}
              size="small"
              className={classes.textField}
              format="yyyy/MM/dd HH:mm"
            />
          </form>
        </DialogContent>
        <DialogActions className={classes.dialogActions}>
          <Button onClick={handleClose} color="secondary">
            Cancel
          </Button>
          <Button 
            onClick={handleCreateOrder} 
            color="primary" 
            variant="contained"
          >
            Create Order
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default Orders;
