const { Pool } = require("pg");

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
});

// Creates every table the app needs if it doesn't exist yet, so a fresh
// database is ready to go right after `npm install` — no separate
// migration step required.
async function ensureSchema() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            role VARCHAR(50) NOT NULL DEFAULT 'hr',
            created_at TIMESTAMP NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS departments (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) UNIQUE NOT NULL,
            created_at TIMESTAMP NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS employees (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            position VARCHAR(255),
            department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL,
            status VARCHAR(50) NOT NULL DEFAULT 'Active',
            hire_date DATE NOT NULL DEFAULT CURRENT_DATE,
            created_at TIMESTAMP NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS attendance (
            id SERIAL PRIMARY KEY,
            employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
            date DATE NOT NULL DEFAULT CURRENT_DATE,
            check_in TIME,
            check_out TIME,
            status VARCHAR(50) NOT NULL DEFAULT 'Present',
            created_at TIMESTAMP NOT NULL DEFAULT NOW(),
            UNIQUE (employee_id, date)
        );

        CREATE TABLE IF NOT EXISTS leave_requests (
            id SERIAL PRIMARY KEY,
            employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
            leave_type VARCHAR(100) NOT NULL,
            start_date DATE NOT NULL,
            end_date DATE NOT NULL,
            reason TEXT,
            status VARCHAR(50) NOT NULL DEFAULT 'Pending',
            created_at TIMESTAMP NOT NULL DEFAULT NOW()
        );
    `);

    // Defense-in-depth: the app already normalizes emails to lowercase
    // before writing them, but this guarantees case-insensitive uniqueness
    // at the database level too (e.g. Amit@x.com vs amit@x.com), without
    // touching the existing employees_email_unique constraint.
    try {
        await pool.query(`
            CREATE UNIQUE INDEX IF NOT EXISTS employees_email_ci_unique
            ON employees (LOWER(email));
        `);
    } catch (err) {
        console.error(
            "Could not create case-insensitive email index — there may still be case-variant duplicate emails in the employees table. Clean those up, then restart the server.",
            err.message
        );
    }
}

module.exports = { pool, ensureSchema };
