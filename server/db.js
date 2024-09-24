const pg = require('pg');
const client = new pg.Client(process.env.DATABASE_URL || 'postgres://localhost/acme_store_db');
const bcrypt = require('bcrypt');

// Create Tables
const createTables = async () => {
  const SQL = `
    DROP TABLE IF EXISTS favorites;
    DROP TABLE IF EXISTS users;
    DROP TABLE IF EXISTS products;

    CREATE TABLE users(
      id SERIAL PRIMARY KEY,
      username VARCHAR(20) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL
    );

    CREATE TABLE products(
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL
    );

    CREATE TABLE favorites(
      id SERIAL PRIMARY KEY,
      product_id INT REFERENCES products(id) NOT NULL,
      user_id INT REFERENCES users(id) NOT NULL,
      CONSTRAINT unique_user_id_product_id UNIQUE (user_id, product_id)
    );
  `;
  await client.query(SQL);
};

// Create User
const createUser = async ({ username, password }) => {
  const SQL = `
    INSERT INTO users(username, password) 
    VALUES($1, $2) RETURNING *
  `;
  const hashedPassword = await bcrypt.hash(password, 5);
  const response = await client.query(SQL, [username, hashedPassword]);
  return response.rows[0];
};

// Create Product
const createProduct = async ({ name }) => {
  const SQL = `
    INSERT INTO products(name) 
    VALUES($1) RETURNING *
  `;
  const response = await client.query(SQL, [name]);
  return response.rows[0];
};

// Create Favorite
const createFavorite = async ({ user_id, product_id }) => {
  const SQL = `
    INSERT INTO favorites(user_id, product_id) 
    VALUES($1, $2) RETURNING *
  `;
  const response = await client.query(SQL, [user_id, product_id]);
  return response.rows[0];
};

// Fetch Users
const fetchUsers = async () => {
  const SQL = `
    SELECT id, username 
    FROM users
  `;
  const response = await client.query(SQL);
  return response.rows;
};

// Fetch Products
const fetchProducts = async () => {
  const SQL = `
    SELECT *
    FROM products
  `;
  const response = await client.query(SQL);
  return response.rows;
};

// Fetch Favorites
const fetchFavorites = async (user_id) => {
  const SQL = `
    SELECT f.id, p.name as product_name
    FROM favorites f
    JOIN products p ON f.product_id = p.id
    WHERE f.user_id = $1
  `;
  const response = await client.query(SQL, [user_id]);
  return response.rows;
};

// Destroy Favorite
const destroyFavorite = async ({ user_id, id }) => {
  const SQL = `
    DELETE 
    FROM favorites
    WHERE user_id = $1 AND id = $2
  `;
  await client.query(SQL, [user_id, id]);
};

// Exporting functions
module.exports = {
  client,
  createTables,
  createUser,
  createProduct,
  fetchUsers,
  fetchProducts,
  createFavorite,
  fetchFavorites,
  destroyFavorite
};