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
  CircularProgress,
  Chip
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

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
  readChip: {
    backgroundColor: theme.palette.success.light,
  },
  unreadChip: {
    backgroundColor: theme.palette.warning.light,
  }
}));

function Notifications() {
  const classes = useStyles();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    axios.get(`${process.env.REACT_APP_API_URL}/api/notifications/notifications`)
      .then(res => {
        setNotifications(Array.isArray(res.data) ? res.data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching notifications:', err);
        setError('Failed to load notifications');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return (
      <Typography color="error" style={{ padding: '20px' }}>
        {error}
      </Typography>
    );
  }

  return (
    <div className={classes.root}>
      <Typography variant="h4" gutterBottom>
        Notifications
      </Typography>
      
      {notifications.length === 0 ? (
        <Typography>No notifications found</Typography>
      ) : (
        <TableContainer component={Paper} className={classes.tableContainer}>
          <Table className={classes.table}>
            <TableHead>
              <TableRow>
                <TableCell>Message</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="right">Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {notifications.map((notification) => (
                <TableRow key={notification._id}>
                  <TableCell>{notification.message}</TableCell>
                  <TableCell align="center">
                    <Chip 
                      label={notification.read ? "Read" : "Unread"}
                      className={notification.read ? classes.readChip : classes.unreadChip}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    {new Date(notification.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </div>
  );
}

export default Notifications;
