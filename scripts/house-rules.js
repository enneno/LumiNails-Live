'use strict';
const rules = require('../supabase/functions/_shared/house-rules.json');
function injectHouseRules(source) {
    return source.replace('/* build:house-rules */ {}', JSON.stringify(rules));
}
module.exports = { rules, injectHouseRules };
