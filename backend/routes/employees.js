const express = require("express");
const { pool } = require("../db");

const router = express.Router();

const SELECT_EMPLOYEE = `
    SELECT e.id, e.name, e.email, e.position, e.status, e.hire_date,
           e.department_id, d.name AS department
    FROM employees e
    LEFT JOIN departments d ON d.id = e.department_id
`;

// Reasonable, not-overly-strict email shape check. Real deliverability is
// something no regex can guarantee — this just catches obvious typos.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Trims and validates the fields shared by create and update. Returns
// { values } on success, or { error } with a message ready to send back
// as a 400 response.
function parseEmployeeInput(body) {
    const name = (body.name || "").trim();
    const email = (body.email || "").trim().toLowerCase();
    const position = (body.position || "").trim();
    const department_id = body.department_id || null;

    if (!name) {
        return { error: "Name is required" };
    }
    if (!email) {
        return { error: "Email is required" };
    }
    if (!EMAIL_PATTERN.test(email)) {
        return { error: "Please enter a valid email address" };
    }

    return { values: { name, email, position: position || null, department_id } };
}

router.get("/", async (req, res) => {
    try {
        const result = await pool.query(`${SELECT_EMPLOYEE} ORDER BY e.id ASC`);
        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching employees:", error);
        res.status(500).json({ error: "Something went wrong loading employees. Please try again." });
    }
});

router.post("/", async (req, res) => {
    const { error, values } = parseEmployeeInput(req.body);
    if (error) {
        return res.status(400).json({ error });
    }

    try {
        const insert = await pool.query(
            `INSERT INTO employees (name, email, position, department_id)
             VALUES ($1, $2, $3, $4) RETURNING id`,
            [values.name, values.email, values.position, values.department_id]
        );
        const result = await pool.query(`${SELECT_EMPLOYEE} WHERE e.id = $1`, [insert.rows[0].id]);
        res.status(201).json(result.rows[0]);
    } catch (dbError) {
        if (dbError.code === "23505") {
            return res.status(409).json({ error: "This email address is already held by another employee." });
        }
        console.error("Error adding employee:", dbError);
        res.status(500).json({ error: "Something went wrong adding the employee. Please try again." });
    }
});

router.put("/:id", async (req, res) => {
    const { id } = req.params;
    if (!/^\d+$/.test(id)) {
        return res.status(400).json({ error: "Invalid employee id" });
    }

    const { error, values } = parseEmployeeInput(req.body);
    if (error) {
        return res.status(400).json({ error });
    }
    const status = req.body.status;

    try {
        const update = await pool.query(
            `UPDATE employees
             SET name = $1, email = $2, position = $3, department_id = $4, status = COALESCE($5, status)
             WHERE id = $6
             RETURNING id`,
            [values.name, values.email, values.position, values.department_id, status, id]
        );
        if (update.rows.length === 0) {
            return res.status(404).json({ error: "Employee not found" });
        }
        const result = await pool.query(`${SELECT_EMPLOYEE} WHERE e.id = $1`, [id]);
        res.json(result.rows[0]);
    } catch (dbError) {
        if (dbError.code === "23505") {
            return res.status(409).json({ error: "This email address is already held by another employee." });
        }
        console.error("Error updating employee:", dbError);
        res.status(500).json({ error: "Something went wrong updating the employee. Please try again." });
    }
});

router.delete("/:id", async (req, res) => {
    const { id } = req.params;
    if (!/^\d+$/.test(id)) {
        return res.status(400).json({ error: "Invalid employee id" });
    }

    try {
        const result = await pool.query("DELETE FROM employees WHERE id = $1 RETURNING *", [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Employee not found" });
        }
        res.json({ message: "Employee deleted successfully" });
    } catch (dbError) {
        console.error("Error deleting employee:", dbError);
        res.status(500).json({ error: "Something went wrong deleting the employee. Please try again." });
    }
});

module.exports = router;
