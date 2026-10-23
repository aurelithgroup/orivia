// Free test transport: Cloudflare Email Routing to a verified destination only.
export async function sendAccountMail(env,message,{EmailMessage}={}){
 if(env.ACCOUNTS_EMAIL_MODE!=='verified_only')return env.ACCOUNTS_EMAIL.send(message);
 const addresses=String(env.ACCOUNTS_TEST_EMAILS||env.ACCOUNTS_TEST_EMAIL||'').split(',').map(x=>x.trim().toLowerCase());
 const allowed=String(message.to).trim().toLowerCase();
 if(addresses.length>10||addresses.some(x=>!/^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(x))||!addresses.includes(allowed))throw Error('Test recipient unavailable');
 const from=env.ACCOUNTS_FROM;if(!/^[a-z0-9._+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(from))throw Error('Sender unavailable');
 EmailMessage ||= (await import('cloudflare:email')).EmailMessage;
 const raw=['From: Orivia <'+from+'>','To: '+allowed,'Subject: Your Orivia sign-in code','MIME-Version: 1.0','Content-Type: text/plain; charset=UTF-8','Content-Transfer-Encoding: 8bit','',message.text].join('\r\n');
 return env.ACCOUNTS_EMAIL.send(new EmailMessage(from,allowed,raw));
}
