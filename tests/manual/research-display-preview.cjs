/* Manual preview (not run in CI): feeds the FIXTURE replies into the real app at phone size and saves screenshots.
   Needs the trial served locally on :8791 and Playwright. Usage: node tests/manual/research-display-preview.cjs <outdir> */
const { chromium } = require('playwright');
const F = require('../fixtures/research-replies.json');
const out = process.argv[2] || '.';
(async () => {
  const b = await chromium.launch();
  for (const [name, scheme] of [['evidence-found', 'light'], ['partial', 'dark'], ['not-configured', 'light'], ['hostile', 'light']]) {
    const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, colorScheme: scheme });
    const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.route('**/v1/chat', r => r.fulfill({ contentType: 'application/json', body: JSON.stringify({ actions: [], verifiedSources: [], liveInformation: true, liveJourneyData: false, ...F[name] }) }));
    await p.goto('http://localhost:8791/'); await p.check('#consent'); await p.click('#start');
    await p.fill('#msg', 'FIXTURE question'); await p.click('#send'); await p.waitForFunction(() => !document.getElementById('send').disabled);
    if (await p.$('.claims')) await p.click('.claims summary');
    const links = await p.$$eval('#history a', a => a.map(x => x.href));
    await p.evaluate(() => { const s = document.getElementById('chat-scroll'); s.scrollTop = 0; });
    await p.screenshot({ path: `${out}/research-${name}.png`, fullPage: false });
    console.log(name, '| links:', JSON.stringify(links), '| errors:', errs.length);
    await p.close();
  }
  await b.close();
})();
