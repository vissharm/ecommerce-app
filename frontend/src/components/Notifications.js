import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Typography, List, ListItem, ListItemText, CircularProgress } from '@material-ui/core';

function Notifications() {
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
    <div>
      <Typography variant="h4" gutterBottom>
        Notifications
      </Typography>
      {notifications.length === 0 ? (
        <Typography>No notifications found</Typography>
      ) : (
        <List>
          {notifications.map(notification => (
            <ListItem key={notification._id}>
              <ListItemText 
                primary={notification.message}
                secondary={`Read: ${notification.read ? 'Yes' : 'No'}`}
              />
            </ListItem>
          ))}
        </List>
      )}
    </div>
  );
}

export default Notifications;
