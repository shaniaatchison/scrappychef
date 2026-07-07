import { generateVapidKeys } from "https://deno.land/x/webpush@v1.1.1/mod.ts";
const keys = generateVapidKeys();
console.log(JSON.stringify(keys, null, 2));
