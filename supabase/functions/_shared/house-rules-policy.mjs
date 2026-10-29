import houseRules from './house-rules.json' with { type: 'json' };

export const HOUSE_RULES_VERSION = houseRules.version;
export function hasCurrentRulesConsent(accepted, version) {
  return accepted === true && version === HOUSE_RULES_VERSION;
}
