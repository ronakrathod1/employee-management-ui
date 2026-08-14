const express = require("express");
const { pool } = require("../db");

const router = express.Router();

const SELECT_LEAVE = `
    SELECT l.id, l.leave_type, l.start_date, l.end_date, l.reason, l.status, l.created_at,
           e.id AS employee_id, e.name AS employee_name
    FROM leave_requests l
    JOIN employees e ON e.id = l.employee_id
`;

router.get("/", async (req, res) => {
    const { status } = req.query;
    try {
        const result = status
            ? await pool.query(`${SELECT_LEAVE} WHERE l.status = $1 ORDER BY l.created_at DESC`, [status])
            : await pool.query(`${SELECT_LEAVE} ORDER BY l.created_at DESC`);
        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching leave requests:", error);
        res.status(500).json({ error: "Database error" });
    }
});

router.post("/", async (req, res) => {
    const { employee_id, leave_type, start_date, end_date, reason } = req.body;
    if (!employee_id || !leave_type || !start_date || !end_date) {
        return res.status(400).json({ error: "employee_id, leave_type, start_date, and end_date are required" });
    }

    try {
        const insert = await pool.query(
            `INSERT INTO leave_requests (employee_id, leave_type, start_date, end_date, reason)
             VALUES ($1, $2, $3, $4, $5) RETURNING id`,
            [employee_id, leave_type, start_date, end_date, reason || null]
        );
        const result = await pool.query(`${SELECT_LEAVE} WHERE l.id = $1`, [insert.rows[0].id]);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error("Error creating leave request:", error);
        res.status(500).json({ error: "Database error" });
    }
});

// Approve or reject a pending request.
router.put("/:id", async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    if (!["Approved", "Rejected", "Pending"].includes(status)) {
        return res.status(400).json({ error: "status must be Approved, Rejected, or Pending" });
    }

    try {
        const update = await pool.query(
            "UPDATE leave_requests SET status = $1 WHERE id = $2 RETURNING id",
            [status, id]
        );
        if (update.rows.length === 0) {
            return res.status(404).json({ error: "Leave request not found" });
        }
        const result = await pool.query(`${SELECT_LEAVE} WHERE l.id = $1`, [id]);
        res.json(result.rows[0]);
    } catch (error) {
        console.error("Error updating leave request:", error);
        res.status(500).json({ error: "Database error" });
    }
});

module.exports = router;
