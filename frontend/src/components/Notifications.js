import React, { useState, useEffect, useCallback } from 'react';
import {
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  makeStyles
} from '@material-ui/core';
import axiosInstance from '../utils/axiosConfig';
import { useNavigate } from 'react-router-dom';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    marginTop: theme.spacing(3),
  },
  table: {
    minWidth: 650,
  },
  tableContainer: {
    marginTop: theme.spacing(2),
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
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/api/notifications/notifications');
      
      const sortedNotifications = Array.isArray(res.data) 
        ? res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        : [];
      setNotifications(sortedNotifications);
      setError(null);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      if (err.response?.status === 401) {
        navigate('/login');
      } else {
        setError('Failed to load notifications');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchNotifications();

    const handleUpdate = () => {
      console.log('Notification update event received');
      fetchNotifications();
    };

    window.addEventListener('notificationUpdate', handleUpdate);
    
    return () => {
      window.removeEventListener('notificationUpdate', handleUpdate);
    };
  }, [fetchNotifications]);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await axiosInstance.put(
        `/api/notifications/markAsRead/${notificationId}`
      );

      setNotifications(prevNotifications =>
        prevNotifications.map(notification =>
          notification._id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
      if (err.response?.status === 401) {
        navigate('/login');
      }
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <div className={classes.root} data-component="notifications">
      <Typography variant="h5" gutterBottom>
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
                <TableRow 
                  key={notification._id}
                  onClick={() => !notification.read && handleMarkAsRead(notification._id)}
                  style={{ cursor: notification.read ? 'default' : 'pointer' }}
                >
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
