import assert from 'node:assert/strict';
import {sendAccountMail} from '../workers/accounts/mail.mjs';
import {accountTestPage,mountAccountTest} from '../workers/accounts/test-entry.mjs';
const out=[];class EmailMessage{constructor(from,to,raw){Object.assign(this,{from,to,raw})}}
const env={ACCOUNTS_EMAIL_MODE:'verified_only',ACCOUNTS_TEST_EMAIL:'tester@example.com',ACCOUNTS_FROM:'login@auth.example.com',ACCOUNTS_EMAIL:{send:async m=>out.push(m)}};
const m={to:'tester@example.com',text:'Code: 123456'};
await sendAccountMail(env,m,{EmailMessage});assert.equal(out[0].to,m.to);assert.match(out[0].raw,/Code: 123456/);assert.match(out[0].raw,/From: Orivia <login@auth.example.com>/);
await assert.rejects(sendAccountMail(env,{...m,to:'other@example.com'},{EmailMessage}));assert.equal(out.length,1);
await assert.rejects(sendAccountMail({...env,ACCOUNTS_TEST_EMAIL:'bad\r\nBcc: other@example.com'},m,{EmailMessage}));
await assert.rejects(sendAccountMail({...env,ACCOUNTS_FROM:'bad\r\nBcc: other@example.com'},m,{EmailMessage}));
await sendAccountMail({...env,ACCOUNTS_EMAIL_MODE:undefined},m);assert.equal(out[1],m);
await sendAccountMail({...env,ACCOUNTS_TEST_EMAILS:'tester@example.com,student@example.com'},{...m,to:'student@example.com'},{EmailMessage});assert.equal(out.at(-1).to,'student@example.com');
await assert.rejects(sendAccountMail({...env,ACCOUNTS_TEST_EMAILS:'tester@example.com,student@example.com'},{...m,to:'outsider@example.com'},{EmailMessage}));
await assert.rejects(sendAccountMail({...env,ACCOUNTS_TEST_EMAILS:'tester@example.com,broken'},m,{EmailMessage}));
assert.match(accountTestPage,/account-test.js/);assert.doesNotMatch(accountTestPage,/<script>/);new Function('return ('+mountAccountTest.toString()+')');assert.doesNotMatch(mountAccountTest.toString(),/localStorage|console\.|innerHTML/);
console.log('Account mail: verified-only recipient restriction, safe envelope, unchanged paid transport and private test page passed. Delivery scripted.');
