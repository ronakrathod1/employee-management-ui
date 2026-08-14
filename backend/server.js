require("dotenv").config();
const express = require("express");
const { pool, ensureSchema } = require("./db");
const { requireAuth } = require("./middleware/auth");

const authRoutes = require("./routes/auth");
const employeeRoutes = require("./routes/employees");
const departmentRoutes = require("./routes/departments");
const attendanceRoutes = require("./routes/attendance");
const leaveRequestRoutes = require("./routes/leaveRequests");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", process.env.FRONTEND_URL || "http://localhost:5173");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === "OPTIONS") return res.sendStatus(204);
    next();
});

pool.query("SELECT NOW()", (error, result) => {
    if (error) {
        console.error("Database connection failed:", error);
    } else {
        console.log("Database connected successfully!", result.rows[0].now);
        ensureSchema()
            .then(() => console.log("Schema is ready (users, departments, employees, attendance, leave_requests)."))
            .catch(err => console.error("Failed to set up schema:", err));
    }
});

app.get("/", (req, res) => {
    res.send("Employee Management System Backend");
});

// Auth routes are public (you need them to get a token in the first place).
app.use("/api/auth", authRoutes);

// Everything else requires a valid login.
app.use("/api/employees", requireAuth, employeeRoutes);
app.use("/api/departments", requireAuth, departmentRoutes);
app.use("/api/attendance", requireAuth, attendanceRoutes);
app.use("/api/leave-requests", requireAuth, leaveRequestRoutes);

// Unknown API route.
app.use("/api", (req, res) => {
    res.status(404).json({ error: "Not found" });
});

// Safety net: catches anything a route didn't handle itself (e.g. a thrown
// error in an async handler that skipped its own try/catch) and returns a
// generic message instead of letting Express's default handler leak a
// stack trace to the client.
app.use((err, req, res, next) => {
    console.error("Unhandled error:", err);
    if (res.headersSent) return next(err);
    res.status(500).json({ error: "Something went wrong. Please try again." });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
