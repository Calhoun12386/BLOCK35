
const {
    client,
    createTables,
    createUser,
    createProduct,
    fetchUsers,
    fetchProducts,
    createFavorite,
    fetchFavorites,
    destroyFavorite
  } = require('./db');
  const express = require('express');
  const app = express();
  app.use(express.json());
  
  // GET /api/users: curl http://localhost:3000/api/users
  app.get('/api/users', async (req, res, next) => {
    try {
      res.send(await fetchUsers());
    } catch (ex) {
      next(ex);
    }
  });
  //GET /api/products: curl http://localhost:3000/api/products
  app.get('/api/products', async (req, res, next) => {
    try {
      res.send(await fetchProducts());
    } catch (ex) {
      next(ex);
    }
  });
  //GET /api/users/:id/favorites: curl http://localhost:3000/api/users/<USER_ID>/favorites
  app.get('/api/users/:id/favorites', async (req, res, next) => {
    try {
      res.send(await fetchFavorites(req.params.id));
    } catch (ex) {
      next(ex);
    }
  });
  /* //POST /api/users/:id/favorites: curl -X POST http://localhost:3000/api/users/<USER_ID>/favorites \
                                        -H "Content-Type: application/json" \
                                        -d '{"product_id": <PRODUCT_ID>}'
//user id=1 product_id = 3 adds tablet to lucy's favorites */
  app.post('/api/users/:id/favorites', async (req, res, next) => {
    try {
      const favorite = await createFavorite({ user_id: req.params.id, product_id: req.body.product_id });
      res.status(201).send(favorite);
    } catch (ex) {
      next(ex);
    }
  });
  //curl -X DELETE http://localhost:3000/api/users/[user_id]/favorites/[favorite_id]
  app.delete('/api/users/:userId/favorites/:id', async (req, res, next) => {
    try {
      await destroyFavorite({ user_id: req.params.userId, id: req.params.id });
      res.sendStatus(204);
    } catch (ex) {
      next(ex);
    }
  });

/* // Add the POST /api/products route

curl -X POST http://localhost:3000/api/products \
-H "Content-Type: application/json" \
-d '{"name": "New Product"}'

*/
app.post('/api/products', async(req, res, next) => {
    try {
      const product = await createProduct(req.body);
      res.status(201).send(product);
    } catch (ex) {
      next(ex);
    }
  });
/* 
curl -X POST http://localhost:3000/api/users \
-H "Content-Type: application/json" \
-d '{"username": "steven", "password": "secret"}'
*/
app.post("/api/users", async (req, res, next) => {
  try {
    const user = await createUser(req.body);
    res.status(201).send(user);
  } catch (ex) {
    next(ex);
  }
});

  
  // Initialization function
  const init = async () => {
    console.log('Connecting to the database...');
    await client.connect();
    console.log('Connected to the database.');
  
    await createTables();
    console.log('Tables created.');
  
    // Creating initial data
    const [moe, lucy, larry] = await Promise.all([
      createUser({ username: 'moe', password: 'moe_pw' }),
      createUser({ username: 'lucy', password: 'lucy_pw' }),
      createUser({ username: 'larry', password: 'larry_pw' })
    ]);
  
    const [laptop, phone, tablet] = await Promise.all([
      createProduct({ name: 'Laptop' }),
      createProduct({ name: 'Phone' }),
      createProduct({ name: 'Tablet' })
    ]);
  
    console.log(await fetchUsers());
    console.log(await fetchProducts());
  
    const favorites = await Promise.all([
      createFavorite({ user_id: moe.id, product_id: laptop.id }),
      createFavorite({ user_id: lucy.id, product_id: phone.id }),
      createFavorite({ user_id: larry.id, product_id: tablet.id })
    ]);
  
    console.log(await fetchFavorites(moe.id));
    await destroyFavorite({ user_id: moe.id, id: favorites[0].id });
    console.log(await fetchFavorites(moe.id));
  
    console.log('Data seeded successfully.');
  
    const port = process.env.PORT || 3000;
    app.listen(port, () => console.log(`Server running on port ${port}`));
  };
  
  init();