const base=require('./playwright.config');

// The copied React frontend replaces the previous native-DOM admin. Its current
// black-box flows and source-fidelity checks run here; public tests remain separate.
module.exports={...base,testMatch:['**/admin-reference.spec.js','**/admin-reference-contract.spec.js','**/admin-mobile-fixes.spec.js'],
 use:{...base.use,browserName:'webkit',channel:undefined,launchOptions:{},hasTouch:true},
};
