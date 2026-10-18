/* Entry point for the PRIVATE research pilot Worker only (its own Worker name and URL; never the public one).
 * This is the only file that loads @cloudflare/puppeteer. Install it here first: npm install --save-exact @cloudflare/puppeteer */
import puppeteer from '@cloudflare/puppeteer';
import {createPilotWorker} from '../orivia-research-pilot.mjs';

export default createPilotWorker({launchBrowser:env=>puppeteer.launch(env.BROWSER)});
