/**
 * Audit Trail Controller
 */

const db = require('../config/db');

const getAuditLogs = async (req, res, next) => {
  try {
    const { limit = 50, page = 1 } = req.query;

    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const result = await db.query(
      `SELECT a.*, u.full_name AS user_name, u.role AS user_role, u.email AS user_email
       FROM audit_logs a
       LEFT JOIN users u ON a.user_id = u.user_id
       ORDER BY a.created_at DESC
       LIMIT $1 OFFSET $2`,
      [parseInt(limit, 10), offset]
    );

    const countRes = await db.query('SELECT COUNT(*) FROM audit_logs');

    res.json({
      success: true,
      logs: result.rows,
      total: parseInt(countRes.rows[0].count, 10),
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAuditLogs,
};
