const express = require("express");
const { pool } = require("../db");

const router = express.Router();

// List departments with a live headcount for each.
router.get("/", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT d.id, d.name, COUNT(e.id)::int AS employee_count
            FROM departments d
            LEFT JOIN employees e ON e.department_id = d.id
            GROUP BY d.id
            ORDER BY d.name ASC
        `);
        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching departments:", error);
        res.status(500).json({ error: "Database error" });
    }
});

router.post("/", async (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "Department name is required" });

    try {
        const result = await pool.query(
            "INSERT INTO departments (name) VALUES ($1) RETURNING *",
            [name]
        );
        res.status(201).json({ ...result.rows[0], employee_count: 0 });
    } catch (error) {
        if (error.code === "23505") {
            return res.status(409).json({ error: "A department with that name already exists" });
        }
        console.error("Error adding department:", error);
        res.status(500).json({ error: "Database error" });
    }
});

router.delete("/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query("DELETE FROM departments WHERE id = $1 RETURNING *", [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Department not found" });
        }
        res.json({ message: "Department deleted successfully" });
    } catch (error) {
        console.error("Error deleting department:", error);
        res.status(500).json({ error: "Database error" });
    }
});

module.exports = router;
