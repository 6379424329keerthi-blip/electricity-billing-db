/**
 * Smart Billing Engine & Tariff Slab Calculation Service
 * Implements progressive tiered tariff calculation with decimal safety.
 */

const db = require('../config/db');

/**
 * Calculates progressive bill charges based on consumer category and units consumed.
 * @param {string} category - 'Residential', 'Commercial', or 'Industrial'
 * @param {number} units - Units consumed in kWh (Current - Previous)
 * @param {number} customAdjustment - Optional adjustment amount (+/-)
 * @returns {Promise<Object>} Billing calculation breakdown
 */
const calculateBill = async (category, units, customAdjustment = 0) => {
  const unitsConsumed = parseFloat(units);
  if (isNaN(unitsConsumed) || unitsConsumed < 0) {
    throw new Error('Units consumed must be a non-negative number.');
  }

  // 1. Fetch active tariff slabs for this consumer category
  const slabResult = await db.query(
    `SELECT slab_id, minimum_units, maximum_units, rate_per_unit, fixed_charge, tax_percentage
     FROM tariff_slabs
     WHERE consumer_category = $1
       AND (effective_to IS NULL OR effective_to >= CURRENT_DATE)
     ORDER BY minimum_units ASC`,
    [category]
  );

  if (slabResult.rows.length === 0) {
    throw new Error(`No active tariff slabs found for category: ${category}`);
  }

  const slabs = slabResult.rows;

  let remainingUnits = unitsConsumed;
  let totalEnergyCharge = 0;
  const slabBreakdown = [];

  // 2. Iterate through slabs progressively
  for (const slab of slabs) {
    const minUnits = parseFloat(slab.minimum_units);
    const maxUnits = slab.maximum_units !== null ? parseFloat(slab.maximum_units) : null;
    const rate = parseFloat(slab.rate_per_unit);

    if (remainingUnits > 0) {
      let tierUnits = 0;
      if (maxUnits !== null) {
        const tierCapacity = maxUnits - minUnits;
        tierUnits = Math.min(remainingUnits, tierCapacity);
      } else {
        // Upper unbounded tier
        tierUnits = remainingUnits;
      }

      const tierCost = tierUnits * rate;
      totalEnergyCharge += tierCost;
      remainingUnits -= tierUnits;

      slabBreakdown.push({
        slabRange: maxUnits !== null ? `${minUnits} - ${maxUnits} kWh` : `Above ${minUnits} kWh`,
        units: Number(tierUnits.toFixed(2)),
        ratePerUnit: rate,
        cost: Number(tierCost.toFixed(2)),
      });
    }
  }

  // 3. Retrieve fixed charge and tax percentage from the category's active rules
  const fixedCharge = parseFloat(slabs[0].fixed_charge || 0);
  const taxPercentage = parseFloat(slabs[0].tax_percentage || 5);

  // 4. Calculate Taxes: applied on (Energy Charge + Fixed Charge)
  const taxableSubtotal = totalEnergyCharge + fixedCharge;
  const taxAmount = Number(((taxableSubtotal * taxPercentage) / 100).toFixed(2));
  const adjustmentAmount = parseFloat(customAdjustment || 0);

  // 5. Total Bill = Energy Charges + Fixed Charges + Taxes + Adjustments
  const totalAmount = Number(
    (totalEnergyCharge + fixedCharge + taxAmount + adjustmentAmount).toFixed(2)
  );

  return {
    consumerCategory: category,
    unitsConsumed: Number(unitsConsumed.toFixed(2)),
    energyCharge: Number(totalEnergyCharge.toFixed(2)),
    fixedCharge: Number(fixedCharge.toFixed(2)),
    taxPercentage: Number(taxPercentage.toFixed(2)),
    taxAmount: taxAmount,
    adjustmentAmount: Number(adjustmentAmount.toFixed(2)),
    totalAmount: Math.max(0, totalAmount),
    slabBreakdown,
  };
};

module.exports = {
  calculateBill,
};
