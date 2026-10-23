/* Entry point for the PRIVATE research pilot Worker only (its own Worker name and URL; never the public one).
 * This is the only file that loads @cloudflare/puppeteer. Install it here first: npm install --save-exact @cloudflare/puppeteer */
import puppeteer from '@cloudflare/puppeteer';
import {createPilotWorker} from '../orivia-research-pilot.mjs';
import {runNotificationTick} from '../accounts/notifications.mjs';

export const PILOT_ACCOUNTS_DB='8cd85061-ce42-4fa7-8dd7-a4b01f36800a';
const worker=createPilotWorker({launchBrowser:env=>puppeteer.launch(env.BROWSER)});
export default {fetch:worker.fetch,
 // Device alerts for the pilot's own test accounts only (never production's database).
 scheduled(controller,env,ctx){if(env.NOTIFICATION_SCHEDULER!=='pilot'||env.ACCOUNTS_DB_EXPECTED!==PILOT_ACCOUNTS_DB)return;ctx.waitUntil(runNotificationTick(env))}};
