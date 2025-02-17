// Imports --------------------------------------------------
import mysql from 'mysql2/promise';

// Database Connection --------------------------------------

const dbConfig = {
  database: process.env.DB_NAME || 'fitness application',
  port: process.env.DB_PORT || 3306,
  host: process.env.DB_HOST || '127.0.0.1', // localhost
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PSWD || '',
  namedPlaceholders: true  
};

let database = null;

try {
    database = await mysql.createConnection(dbConfig);
}
catch (error) {
    console.log('Error creating database connection: ' + error.message);
        console.error('Host:', dbConfig.host);
    console.error('Database:', dbConfig.database);
    console.error('Error Message:', error.message);
    process.exit();
}

export default database;
