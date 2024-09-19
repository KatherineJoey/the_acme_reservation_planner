const pg = require('pg');
const uuid = require('uuid');

const client = new pg.Client(
  process.env.DATABASE_URL ||
    'postgres://localhost/the_acme_reservation_planner'
);

const createTables = async () => {
  const SQL = `
    DROP TABLE IF EXISTS reservations;
    DROP TABLE IF EXISTS customers;
    DROP TABLE IF EXISTS restaurants;

    CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL
    );

    CREATE TABLE restaurants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL
    );

    CREATE TABLE reservations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL,
    party_count INT NOT NULL,
    customer_id UUID REFERENCES customers(id) NOT NULL,
    restaurant_id UUID REFERENCES restaurants(id) NOT NULL
    );
`;

  await client.query(SQL);
};

const createCustomer = async ({ name }) => {
  const SQL = `
    INSERT INTO customers(id, name)
    VALUES ($1, $2)
    RETURNING *
    `;
  const result = await client.query(SQL, [uuid.v4(), name]);
  return result.rows[0];
};

const createRestaurant = async ({ name }) => {
  const SQL = `
    INSERT INTO restaurants(id, name)
    VALUES ($1, $2)
    RETURNING *
    `;
  const result = await client.query(SQL, [uuid.v4(), name]);
  return result.rows[0];
};

const fetchCustomers = async () => {
  const SQL = `
      SELECT * FROM customers
      `;
  const result = await client.query(SQL);
  return result.rows;
};

const fetchRestaurants = async () => {
  const SQL = `
    SELECT * FROM restaurants
    `;
  const result = await client.query(SQL);
  return result.rows;
};

const createReservation = async ({
  customer_id,
  restaurant_id,
  date,
  party_count,
}) => {
  const SQL = `
    INSERT INTO reservations(uuid.v4, customer_id, restaurant_id, date, party_count)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
    `;
  const result = await client.query(SQL, [
    uuid.v4(),
    customer_id,
    restaurant_id,
    date,
    party_count,
  ]);
  return result.rows[0];
};
const destroyReservation = async (reservation_id) => {
  console.log(reservation_id);
  const SQL = `
DELETE FROM reservations
WHERE id = $1
`;
  await client.query(SQL, [reservation_id]);
};

module.exports = {
  client,
  createTables,
  createCustomer,
  createRestaurant,
  fetchCustomers,
  fetchRestaurants,
  createReservation,
  destroyReservation,
};
