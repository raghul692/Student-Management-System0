// Server entry point
const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Student Management System Server`);
    console.log(`Running on http://localhost:${PORT}`);
    console.log(`\nFirst time setup:`);
    console.log(`1. Create MySQL database 'sms_db'`);
    console.log(`2. Import config/schema.sql`);
    console.log(`3. Visit http://localhost:${PORT}/auth/setup`);
    console.log(`4. Login with username: admin, password: admin123`);
});
