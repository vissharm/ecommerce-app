import React from 'react';
import { 
  Typography, 
  Paper, 
  Grid, 
  Box, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText,
  Container 
} from '@material-ui/core';
import { 
  Queue as QueueIcon,
  Notifications as NotificationsIcon,
  Cloud as CloudIcon,  // Changed from API to Cloud
  Code as CodeIcon,
  Web as WebIcon
} from '@material-ui/icons';

function Home() {
  return (
    <Container>
      <Box my={4}>
        <Typography variant="h4" gutterBottom color="primary">
          E-commerce Microservices Architecture
        </Typography>
        <Typography variant="subtitle1" gutterBottom color="textSecondary">
          Scalable Services Course Assignment
        </Typography>

        <Box my={3}>
          <Typography variant="body1" paragraph>
            This project demonstrates a modern microservices architecture implementing 
            real-time notifications, message queuing, and API gateway patterns. The system 
            showcases the integration of various technologies commonly used in distributed systems.
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {/* Architecture Overview */}
          <Grid item xs={12} md={6}>
            <Paper elevation={2} style={{ padding: '20px', height: '100%' }}>
              <Typography variant="h6" gutterBottom color="primary">
                Key Technologies
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <QueueIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Apache Kafka" 
                    secondary="Message queuing system for asynchronous communication between microservices"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <NotificationsIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="WebSocket (Socket.IO)" 
                    secondary="Real-time push notifications for order updates and system events"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CloudIcon color="primary" />  {/* Changed from ApiIcon to CloudIcon */}
                  </ListItemIcon>
                  <ListItemText 
                    primary="API Gateway" 
                    secondary="Centralized routing and request handling for microservices"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CodeIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Express.js Microservices" 
                    secondary="Independent services for Orders, Products, Users, and Notifications"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <WebIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="React.js Frontend" 
                    secondary="Modern, responsive user interface with Material-UI components"
                  />
                </ListItem>
              </List>
            </Paper>
          </Grid>

          {/* System Features */}
          <Grid item xs={12} md={6}>
            <Paper elevation={2} style={{ padding: '20px', height: '100%' }}>
              <Typography variant="h6" gutterBottom color="primary">
                System Features
              </Typography>
              <Box mb={2}>
                <Typography variant="subtitle2" gutterBottom>
                  Microservices Architecture:
                </Typography>
                <Typography variant="body2" paragraph>
                  • Order Service - Manages order creation and processing
                  • Product Service - Handles product inventory and details
                  • User Service - Manages user accounts and authentication
                  • Notification Service - Handles real-time notifications
                </Typography>
              </Box>
              <Box mb={2}>
                <Typography variant="subtitle2" gutterBottom>
                  Real-time Communication:
                </Typography>
                <Typography variant="body2" paragraph>
                  • Instant order status updates
                  • Real-time inventory notifications
                  • WebSocket-based push notifications
                  • Event-driven architecture
                </Typography>
              </Box>
              <Box mb={2}>
                <Typography variant="subtitle2" gutterBottom>
                  Scalability Features:
                </Typography>
                <Typography variant="body2" paragraph>
                  • Distributed message queuing
                  • Service independence and isolation
                  • Horizontal scaling capability
                  • Load balancing ready
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        <Box mt={4}>
          <Paper elevation={2} style={{ padding: '20px' }}>
            <Typography variant="h6" gutterBottom color="primary">
              Learning Objectives
            </Typography>
            <Typography variant="body1" paragraph>
              This project demonstrates proficiency in:
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" component="div">
                  • Building scalable microservices architectures
                  • Implementing message queues with Kafka
                  • Developing real-time notification systems
                  • Creating API gateways for service orchestration
                  • Frontend development with React.js
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" component="div">
                  • Service communication patterns
                  • Event-driven architecture
                  • RESTful API design
                  • WebSocket implementation
                  • Material-UI component usage
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Box>
      </Box>
    </Container>
  );
}

export default Home;
