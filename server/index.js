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
app.use(express.json);

const init = async () => {
  console.log('connecting to database');
  await client.connect();
  console.log('connected to database');
  await createTables();
  console.log('tables created');
  const [Alice_Smith, Bob_Johnson, Forte, Sushi_Palace] = await Promise.all([
    createCustomer({ name: 'Alice Smith' }),
    createCustomer({ name: 'Bob Johnson' }),
    createRestaurant({ name: 'Forte' }),
    createRestaurant({ name: 'Sushi Palace' }),
  ]);
  console.log(await fetchCustomers());
  console.log(await fetchRestaurants());

  const [reservation1, reservation2] = await Promise.all([
    createReservation({
      customer_id: Alice_Smith.id,
      restaurant_id: Forte.id,
      date: '2024-10-01',
      party_count: 4,
    }),
    createReservation({
      customer_id: Bob_Johnson.id,
      restaurant_id: Sushi_Palace.id,
      date: '2024-10-05',
      party_count: 5,
    }),
  ]);
  console.log('created reservations:', reservation1, reservation2);

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

  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log('some curl commands to test');
    console.log(`curl localhost:${PORT}/api/customers`);
    console.log(`curl localhost:${PORT}/api/restaurants`);
    console.log(`curl localhost:${PORT}/api/reservations`);
  });
};

init();
