/**
 * Tariff Slab & Billing Rules Controller
 */

const db = require('../config/db');

const getAllTariffs = async (req, res, next) => {
  try {
    const { category = '' } = req.query;

    let queryText = `
      SELECT * FROM tariff_slabs
      WHERE 1=1
    `;
    const params = [];

    if (category) {
      params.push(category);
      queryText += ` AND consumer_category = $${params.length}`;
    }

    queryText += ` ORDER BY consumer_category, minimum_units ASC`;

    const result = await db.query(queryText, params);
    res.json({ success: true, tariffs: result.rows });
  } catch (err) {
    next(err);
  }
};

const createTariff = async (req, res, next) => {
  try {
    const {
      consumer_category,
      minimum_units,
      maximum_units,
      rate_per_unit,
      fixed_charge = 0,
      tax_percentage = 5,
      effective_from,
    } = req.body;

    const min = parseFloat(minimum_units);
    const max = maximum_units !== null && maximum_units !== '' && maximum_units !== undefined ? parseFloat(maximum_units) : null;
    const rate = parseFloat(rate_per_unit);

    if (max !== null && max <= min) {
      return res.status(400).json({
        success: false,
        message: 'Maximum units must be strictly greater than minimum units.',
      });
    }

    const insertText = `
      INSERT INTO tariff_slabs (consumer_category, minimum_units, maximum_units, rate_per_unit, fixed_charge, tax_percentage, effective_from)
      VALUES ($1, $2, $3, $4, $5, $6, COALESCE($7, CURRENT_DATE))
      RETURNING *
    `;
    const result = await db.query(insertText, [
      consumer_category,
      min,
      max,
      rate,
      parseFloat(fixed_charge),
      parseFloat(tax_percentage),
      effective_from || null,
    ]);

    await db.query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details)
       VALUES ($1, 'CREATE_TARIFF', 'tariff_slabs', $2, $3)`,
      [req.user.user_id, result.rows[0].slab_id, `Created tariff slab for ${consumer_category} (${min}-${max} @ ₹${rate})`]
    );

    res.status(201).json({
      success: true,
      message: 'Tariff slab created successfully.',
      tariff: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
};

const updateTariff = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rate_per_unit, fixed_charge, tax_percentage, maximum_units } = req.body;

    const updateText = `
      UPDATE tariff_slabs
      SET rate_per_unit = COALESCE($1, rate_per_unit),
          fixed_charge = COALESCE($2, fixed_charge),
          tax_percentage = COALESCE($3, tax_percentage),
          maximum_units = CASE WHEN $4::text IS NOT NULL THEN $4::numeric ELSE maximum_units END
      WHERE slab_id = $5
      RETURNING *
    `;
    const result = await db.query(updateText, [
      rate_per_unit !== undefined ? parseFloat(rate_per_unit) : null,
      fixed_charge !== undefined ? parseFloat(fixed_charge) : null,
      tax_percentage !== undefined ? parseFloat(tax_percentage) : null,
      maximum_units !== undefined ? (maximum_units === null ? null : parseFloat(maximum_units)) : null,
      id,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Tariff slab not found.' });
    }

    await db.query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details)
       VALUES ($1, 'UPDATE_TARIFF', 'tariff_slabs', $2, $3)`,
      [req.user.user_id, id, `Updated tariff slab #${id}`]
    );

    res.json({
      success: true,
      message: 'Tariff slab updated successfully.',
      tariff: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
};

const deleteTariff = async (req, res, next) => {
  try {
    const { id } = req.params;
    const delRes = await db.query('DELETE FROM tariff_slabs WHERE slab_id = $1 RETURNING *', [id]);

    if (delRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Tariff slab not found.' });
    }

    await db.query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details)
       VALUES ($1, 'DELETE_TARIFF', 'tariff_slabs', $2, $3)`,
      [req.user.user_id, id, `Deleted tariff slab #${id}`]
    );

    res.json({ success: true, message: 'Tariff slab deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllTariffs,
  createTariff,
  updateTariff,
  deleteTariff,
};
