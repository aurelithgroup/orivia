/* Manual preview (not run in CI): feeds the labelled FIXTURE replies into the real app at phone size, clicks through
   D (list + shortlist) → C (choose) → B (email/phone) → A (single), and saves screenshots.
   Needs the trial served locally on :8791 and Playwright. Usage: node tests/manual/information-cards-preview.cjs <outdir> */
const { chromium } = require('playwright');
const F = require('../fixtures/organisation-cards.json');
const out = process.argv[2] || '.';
const body = name => JSON.stringify({ actions: [], verifiedSources: [], liveInformation: true, liveJourneyData: false, ...F[name] });
(async () => {
  const b = await chromium.launch();
  const page = async (scheme, name, existing) => {
    const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, colorScheme: scheme });
    p.errs = []; p.on('pageerror', e => p.errs.push(e.message));
    await p.route('**/v1/chat', r => r.fulfill({ contentType: 'application/json', body: body(p.fixture || name) }));
    await p.goto('http://localhost:8791/');
    if (existing) await p.evaluate(c => localStorage.setItem('orivia-private-chats-v1', JSON.stringify(c)), existing);
    await p.evaluate(() => sessionStorage.setItem('orivia-ai-private-consent', 'yes')); await p.reload(); await p.waitForTimeout(300);
    return p;
  };
  const ask = async (p, q) => { await p.fill('#msg', q); await p.click('#send'); await p.waitForFunction(() => !document.getElementById('send').disabled); await p.waitForTimeout(150); };
  const shot = async (p, sel, file) => { const e = await p.$(sel); await e.scrollIntoViewIfNeeded(); await e.screenshot({ path: `${out}/${file}.png` }); };
  // D → shortlist → C → B, light mode, with an older chat already saved
  const older = { chats: [{ id: 'cOld', title: 'Bus to uni', turns: [{ role: 'user', content: 'bus?' }, { role: 'assistant', content: 'yes' }], updated: 1 }], active: null };
  let p = await page('light', 'list', older);
  await ask(p, 'Find British curriculum schools in Sharjah');
  console.log('D cards:', await p.$$eval('.org-mini', x => x.length), '| actions per card:', JSON.stringify(await p.$$eval('.org-mini', x => x.map(c => [...c.querySelectorAll('.org-act span')].map(s => s.textContent)))));
  await shot(p, '.org-wrap', 'D-list-light');
  await p.click('.org-mini:nth-of-type(1) .org-pin'); await p.click('.org-mini:nth-of-type(2) .org-pin');
  console.log('shortlist bar:', await p.textContent('.org-bar'));
  await p.click('.org-bar .org-primary');
  console.log('C choices:', JSON.stringify(await p.$$eval('.org-choice strong', x => x.map(s => s.textContent))), '| pager:', await p.textContent('.org-back'));
  await shot(p, '.org-card', 'C-choose-light');
  await p.click('.org-choice:has-text("Email them")');
  console.log('B email mailto ok:', /^mailto:wesgreenintl-psch@spea\.shj\.ae\?subject=/.test(await p.getAttribute('.org-reach a.org-primary', 'href')));
  await shot(p, '.org-card', 'B-email-light');
  await p.click('.org-tab[data-mode="phone"]');
  console.log('B phone tel:', await p.getAttribute('.org-reach a.org-primary', 'href'));
  await p.reload(); await p.waitForTimeout(300);
  console.log('after reload: shortlist kept:', await p.textContent('.org-bar'), '| older chat kept:', await p.evaluate(() => JSON.parse(localStorage.getItem('orivia-private-chats-v1')).chats.some(c => c.id === 'cOld')));
  console.log('Listen button present:', await p.$$eval('#history .bubble.assistant .listen-btn', x => x.length));
  console.log('errors:', p.errs.length); await p.close();
  // A single, dark mode, with a sourced map link
  p = await page('dark', 'single'); await ask(p, 'Tell me about Wes Green');
  console.log('A actions:', JSON.stringify(await p.$$eval('.org-acts .org-act span', x => x.map(s => s.textContent))), '| Take me there:', await p.getAttribute('.org-go', 'href'));
  await p.click('.org-evidence summary'); await shot(p, '.org-card', 'A-single-dark');
  console.log('errors:', p.errs.length); await p.close();
  // Facts only and hostile data
  for (const [name, scheme] of [['facts-only', 'light'], ['hostile', 'dark'], ['choose', 'dark']]) {
    p = await page(scheme, name); await ask(p, 'FIXTURE ' + name);
    console.log(name, '| cards:', await p.$$eval('.org-card,.org-mini', x => x.length), '| buttons:', JSON.stringify(await p.$$eval('.org-act span,.org-go span', x => x.map(s => s.textContent))), '| links:', JSON.stringify(await p.$$eval('.org-wrap a', x => [...new Set(x.map(a => a.href.split('?')[0]))])), '| errors:', p.errs.length);
    await shot(p, '.org-wrap', name + '-' + scheme); await p.close();
  }
  await b.close();
})();
