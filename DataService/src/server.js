'use strict';

require('dotenv').config();
const app = require('./app');
const db = require('./models');

const PORT = process.env.PORT || 4010;

// Test database connection
db.sequelize.authenticate()
  .then(() => {
    console.log('Database connection established successfully.');
    
    // Start server
    app.listen(PORT, () => {
      console.log(`DataService listening on port ${PORT}`);
      console.log('API documentation available at /docs');
    });
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
    process.exit(1);
  });
