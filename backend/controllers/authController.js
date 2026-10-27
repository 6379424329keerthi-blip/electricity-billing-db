/**
 * Authentication Controller
 * Handles user login, profile fetching, password changes, and role resolution.
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Fetch user with linked consumer record if any
    const userQuery = `
      SELECT u.user_id, u.full_name, u.email, u.password_hash, u.role, u.status,
             c.consumer_id, c.consumer_number
      FROM users u
      LEFT JOIN consumers c ON u.user_id = c.user_id
      WHERE LOWER(u.email) = LOWER($1)
    `;
    const result = await db.query(userQuery, [email.trim()]);

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const user = result.rows[0];

    if (user.status !== 'ACTIVE') {
      return res.status(403).json({
        success: false,
        message: `Account is ${user.status.toLowerCase()}. Please contact system administration.`,
      });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Build JWT payload
    const tokenPayload = {
      user_id: user.user_id,
      email: user.email,
      role: user.role,
      full_name: user.full_name,
      consumer_id: user.consumer_id || null,
      consumer_number: user.consumer_number || null,
    };

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return res.status(500).json({
        success: false,
        message: 'Server configuration error: JWT_SECRET environment variable is missing.',
      });
    }

    const token = jwt.sign(
      tokenPayload,
      jwtSecret,
      { expiresIn: '24h' }
    );

    // Audit login
    await db.query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details)
       VALUES ($1, 'USER_LOGIN', 'users', $2, 'User logged into billing portal')`,
      [user.user_id, user.user_id]
    );

    res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        userId: user.user_id,
        fullName: user.full_name,
        email: user.email,
        role: user.role,
        consumerId: user.consumer_id,
        consumerNumber: user.consumer_number,
      },
    });
  } catch (err) {
    next(err);
  }
};

const getMe = async (req, res, next) => {
  try {
    const userQuery = `
      SELECT u.user_id, u.full_name, u.email, u.role, u.status, u.created_at,
             c.consumer_id, c.consumer_number, c.address, c.phone, c.consumer_category,
             m.meter_number, m.meter_type, m.meter_status
      FROM users u
      LEFT JOIN consumers c ON u.user_id = c.user_id
      LEFT JOIN smart_meters m ON c.consumer_id = m.consumer_id
      WHERE u.user_id = $1
    `;
    const result = await db.query(userQuery, [req.user.user_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User profile not found.' });
    }

    res.json({
      success: true,
      user: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
};

const logout = async (req, res) => {
  res.json({ success: true, message: 'Logged out successfully.' });
};

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters.',
      });
    }

    const userRes = await db.query('SELECT password_hash FROM users WHERE user_id = $1', [req.user.user_id]);
    if (userRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const isMatch = await bcrypt.compare(currentPassword, userRes.rows[0].password_hash);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password does not match.' });
    }

    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(newPassword, salt);

    await db.query('UPDATE users SET password_hash = $1 WHERE user_id = $2', [newHash, req.user.user_id]);

    res.json({ success: true, message: 'Password updated successfully.' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  login,
  getMe,
  logout,
  changePassword,
};
