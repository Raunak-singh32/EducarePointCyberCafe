const parsePrice = (value) => {
    const normalized = String(value ?? '').replace(/[₹,\s]/g, '');
    const match = normalized.match(/^\d+(?:\.\d{1,2})?/);
    return match ? Number(match[0]) : NaN;
};

module.exports = { parsePrice };
