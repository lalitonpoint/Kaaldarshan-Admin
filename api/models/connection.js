// const databasename = 'testnode';
// const client = new MongoClient(url);
//  async function dbConnect(){
//    let result =  await client.connect();
//    db =result.db(databasename);
//    return db.collection();
// }
// module.exports = dbConnect;

// MySQL connection
const mysql = require('mysql2');


// // Create a MySQL connection
// const db = mysql.createConnection({
//     host: 'localhost',
//     user: 'root',    // Your MySQL username
//     password: '',    // Your MySQL password
//     database: 'node' // Your MySQL database name
// });

// // Connect to MySQL
// db.connect((err) => {
//     if (err) {
//         console.error('Error connecting to MySQL:', err);
//     } else {
//         console.log('Connected to MySQL');
//     }
// });

// db.js
const { Sequelize } = require('sequelize');

// Replace the values with your database configuration
const sequelize = new Sequelize('node', 'root', '', {
    host: 'localhost',
    dialect: 'mysql', // 'postgres', 'sqlite', etc.
});

// Test the connection
async function testConnection() {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}

testConnection();

module.exports = sequelize;


