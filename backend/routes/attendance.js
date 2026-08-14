const express = require("express");
const { pool } = require("../db");

const router = express.Router();

// All employees with today's (or ?date=) attendance record, if any.
router.get("/", async (req, res) => {
    const date = req.query.date || new Date().toISOString().slice(0, 10);
    try {
        const result = await pool.query(
            `SELECT e.id AS employee_id, e.name, e.position, d.name AS department,
                    a.id AS attendance_id, a.status, a.check_in, a.check_out, a.date
             FROM employees e
             LEFT JOIN departments d ON d.id = e.department_id
             LEFT JOIN attendance a ON a.employee_id = e.id AND a.date = $1
             ORDER BY e.name ASC`,
            [date]
        );
        res.json({ date, records: result.rows });
    } catch (error) {
        console.error("Error fetching attendance:", error);
        res.status(500).json({ error: "Database error" });
    }
});

// Mark (or update) one employee's attendance for a given date.
router.post("/", async (req, res) => {
    const { employee_id, date, status, check_in, check_out } = req.body;
    if (!employee_id || !status) {
        return res.status(400).json({ error: "employee_id and status are required" });
    }
    const attendanceDate = date || new Date().toISOString().slice(0, 10);

    try {
        const result = await pool.query(
            `INSERT INTO attendance (employee_id, date, status, check_in, check_out)
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (employee_id, date)
             DO UPDATE SET status = $3, check_in = $4, check_out = $5
             RETURNING *`,
            [employee_id, attendanceDate, status, check_in || null, check_out || null]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error("Error marking attendance:", error);
        res.status(500).json({ error: "Database error" });
    }
});

router.get("/summary", async (req, res) => {
    const date = req.query.date || new Date().toISOString().slice(0, 10);
    try {
        const totalEmployees = await pool.query("SELECT COUNT(*)::int AS count FROM employees");
        const marked = await pool.query(
            `SELECT status, COUNT(*)::int AS count FROM attendance WHERE date = $1 GROUP BY status`,
            [date]
        );
        res.json({ date, total_employees: totalEmployees.rows[0].count, by_status: marked.rows });
    } catch (error) {
        console.error("Error building attendance summary:", error);
        res.status(500).json({ error: "Database error" });
    }
});

module.exports = router;
