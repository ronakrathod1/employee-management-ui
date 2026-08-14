const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { pool } = require("../db");
const { requireAuth, JWT_SECRET } = require("../middleware/auth");

const router = express.Router();

function signToken(user) {
    return jwt.sign({ id: user.id, name: user.name, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "12h" });
}

function publicUser(user) {
    return { id: user.id, name: user.name, email: user.email, role: user.role };
}

// Self-service sign-up for HR staff. New accounts get the 'hr' role;
// the first account in the system (created via seed.js) is the admin.
router.post("/register", async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ error: "Name, email, and password are required" });
    }
    if (password.length < 8) {
        return res.status(400).json({ error: "Password must be at least 8 characters" });
    }

    try {
        const password_hash = await bcrypt.hash(password, 10);
        const result = await pool.query(
            `INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, 'hr') RETURNING *`,
            [name, email, password_hash]
        );
        const user = result.rows[0];
        res.status(201).json({ token: signToken(user), user: publicUser(user) });
    } catch (error) {
        if (error.code === "23505") {
            return res.status(409).json({ error: "An account with that email already exists" });
        }
        console.error("Error registering user:", error);
        res.status(500).json({ error: "Database error" });
    }
});

router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
    }

    try {
        const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        const user = result.rows[0];
        if (!user) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        res.json({ token: signToken(user), user: publicUser(user) });
    } catch (error) {
        console.error("Error logging in:", error);
        res.status(500).json({ error: "Database error" });
    }
});

router.get("/me", requireAuth, (req, res) => {
    res.json({ user: req.user });
});

module.exports = router;
