import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Typography, List, ListItem, ListItemText } from '@material-ui/core';

function Products() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/api/products/products`)
      .then(res => {
        setProducts(res.data);
      })
      .catch(err => {
        console.error(err);
      });
  }, []);

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Products
      </Typography>
      <List>
        {products.map(product => (
          <ListItem key={product._id}>
            <ListItemText primary={`${product.name} - ${product.description} - ${product.price} - Stock: ${product.stock}`} />
          </ListItem>
        ))}
      </List>
    </div>
  );
}

export default Products;