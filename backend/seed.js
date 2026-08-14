// Creates the first HR admin account so there's a way to log in.
// Run once after setting up the database: node seed.js
require("dotenv").config();
const bcrypt = require("bcryptjs");
const { pool, ensureSchema } = require("./db");

const ADMIN_NAME = process.env.ADMIN_NAME || "HR Admin";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@company.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "changeme123";

async function seed() {
    await ensureSchema();

    const existing = await pool.query("SELECT id FROM users WHERE email = $1", [ADMIN_EMAIL]);
    if (existing.rows.length > 0) {
        console.log(`An account for ${ADMIN_EMAIL} already exists — nothing to do.`);
        await pool.end();
        return;
    }

    const password_hash = await bcrypt.hash(ADMIN_PASSWORD, 10);
    await pool.query(
        `INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, 'admin')`,
        [ADMIN_NAME, ADMIN_EMAIL, password_hash]
    );

    console.log("Admin account created:");
    console.log(`  email:    ${ADMIN_EMAIL}`);
    console.log(`  password: ${ADMIN_PASSWORD}`);
    console.log("Log in with these, then change the password by registering a personal account.");
    await pool.end();
}

seed().catch(err => {
    console.error("Seeding failed:", err);
    process.exit(1);
});
