"use strict";
exports.__esModule = true;
exports.supabase = void 0;
var ssr_1 = require("@supabase/ssr");
var config_1 = require("@/config");
console.log("SUPABASE_PUBLIC_URL", config_1.SUPABASE_PUBLIC_URL);
exports.supabase = ssr_1.createBrowserClient(config_1.SUPABASE_PUBLIC_URL, config_1.SUPABASE_ANON_KEY);
