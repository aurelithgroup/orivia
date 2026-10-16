// Generates server/src/journeys-data.js from the app's checked journeys.
// Run from the repo root while serving it: python3 -m http.server 8767 & node tools/export-journeys.cjs
const { chromium } = require('playwright'); const fs = require('fs');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage();
  await p.goto('http://localhost:8767/');
  const out = await p.evaluate(() => {
    const clean = o => JSON.parse(JSON.stringify(o ?? null, (k, v) => typeof v === 'function' ? undefined : v));
    const iso = s => { const t = Date.parse(s && s.en ? s.en : s); if (isNaN(t)) return null; const d = new Date(t); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
    const words = typeof GOAL_WORDS !== 'undefined' ? GOAL_WORDS : {};
    const contacts = typeof CONTACTS !== 'undefined' ? clean(CONTACTS) : {};
    const J = {};
    for (const [id, j] of Object.entries(DATA.journeys)) {
      const problems = (j.problems || []).map(x => clean({
        id: x.id, question: x.q, answer: x.a, contact: x.esc, staffPhrase: x.phraseText,
        branch: x.branch && { question: x.branch.q, options: x.branch.options.map(o => ({ label: o.label, answer: o.a, link: o.link, contact: o.esc, reportDifference: o.report })) },
        guide: x.guide && { calm: x.guide.calm, steps: x.guide.steps.map(g => ({ title: g.title, body: g.body, list: g.list, tip: g.tip })) }
      }));
      const contactKeysFor = ids => [...new Set(problems.filter(pr => ids.includes(pr.id)).flatMap(pr => [pr.contact && pr.contact.to, ...((pr.branch && pr.branch.options) || []).map(o => o.contact && o.contact.to)]).filter(Boolean))];
      const steps = j.stages.map(s => {
        const B = s.blocks || [], pick = t => B.filter(x => x.t === t);
        const help = s.help || [];
        return clean({
          id: s.id, label: s.label, title: s.title, now: s.now,
          doThis: pick('steps').flatMap(x => x.v),
          info: [...pick('p').map(x => x.v), ...pick('list').flatMap(x => x.v)],
          tips: pick('tip').map(x => x.v),
          links: pick('link').map(x => ({ name: x.v || x.name || x.label, url: x.url || x.href })),
          sayThis: pick('phraseCard').map(x => x.v)[0],
          bring: (s.need || []).map(n => ({ item: n.v, note: n.note || undefined })),
          expect: s.expect, waitingFor: s.wait, time: s.time, cost: s.cost,
          appointment: !!s.appt, staffQuestion: s.staff,
          problemIds: help, contactKeys: contactKeysFor(help),
          checkupIds: (j.finder || []).map((f, i) => f.stage === s.id ? 'q' + (i + 1) : null).filter(Boolean)
        });
      });
      J[id] = clean({
        id, city: j.city, need: j.need, title: j.title, doneTitle: j.doneTitle, pathway: j.pathway,
        keywords: words[j.need] || '', checked: iso(j.checked),
        sources: j.sources || (j.source ? [j.source] : []),
        quickPlace: j.lastDone,
        checkups: (j.finder || []).map((f, i) => ({ id: 'q' + (i + 1), step: f.stage, question: f.q, answers: { yes: f.yes, no: f.no }, allowsUnsure: !f.noUnsure, explain: f.explain, checks: f.checks, confirm: f.confirm })),
        steps, problems,
        otherContacts: j.stuck && j.stuck.cards,
        afterThis: j.after, end: j.end
      });
    }
    const pathways = clean(Object.fromEntries(Object.entries(DATA.pathways).map(([id, x]) => [id, { id, title: x.title, sub: x.sub, options: x.options, dontKnow: x.dontKnow }])));
    return { J, pathways, contacts };
  });
  const AI_READY = ['dubai.eid.student'];
  const src = `// GENERATED from the Orivia app's checked journeys on ${new Date().toISOString().slice(0, 10)}. Do not edit by hand:\n// change the journey in the app, then regenerate (see docs/journey-api.md).\nexport const AI_READY = ${JSON.stringify(AI_READY)};\nexport const JOURNEYS = ${JSON.stringify(out.J)};\nexport const PATHWAYS = ${JSON.stringify(out.pathways)};\nexport const CONTACTS = ${JSON.stringify(out.contacts)};\n`;
  fs.writeFileSync(require('path').join(process.cwd(),'server/src/journeys-data.js'), src);
  const s = out.J['dubai.eid.student'];
  console.log('journeys', Object.keys(out.J).length, 'bytes', src.length, 'checked', s.checked, 'steps', s.steps.length, 'checkups', s.checkups.length, 'problems', s.problems.length, 'contacts', Object.keys(out.contacts));
  console.log(JSON.stringify(s.steps[3]).slice(0, 900));
  await b.close();
})();
