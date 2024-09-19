const express = require('express');
const {
  client,
  createTables,
  createCustomer,
  createRestaurant,
  fetchCustomers,
  fetchRestaurants,
  createReservation,
  destroyReservation,
} = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;
app.use(express.json());

const init = async () => {
  try {
    await client.connect();
    await createTables();
    console.log('Tables created');
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Error during initialization:', error);
  }
};

init();

app.get('/api/customers', async (req, res, next) => {
  try {
    const customers = await fetchCustomers();
    res.json(customers);
  } catch (ex) {
    next(ex);
  }
});

app.get('/api/restaurants', async (req, res, next) => {
  try {
    const restaurants = await fetchRestaurants();
    res.json(restaurants);
  } catch (ex) {
    next(ex);
  }
});

app.get('/api/reservations', async (req, res, next) => {
  try {
    const result = await client.query('SELECT * FROM reservations');
    res.json(result.rows);
  } catch (ex) {
    next(ex);
  }
});

app.post('/api/customers/:id/reservations', async (req, res, next) => {
  try {
    const reservation = await createReservation({
      customer_id: req.params.customer_id,
      restaurant_id: req.body.restaurant_id,
      date: req.body.date,
      party_count: req.body.party_count,
    });
    res.status(201).json(reservation);
  } catch (ex) {
    next(ex);
  }
});

app.delete(
  '/api/customers/:customer_id/reservations/:reservation_id',
  async (req, res, next) => {
    try {
      await destroyReservation(req.params.reservation_id);
      res.sendStatus(204);
    } catch (ex) {
      next(ex);
    }
  }
);

//error handling route
app.use((err, req, res, next) => {
  const message = err.message || 'Internal Server Error';
  res.status(err.status || 500).json({ error: message });
});
