// Free test transport: Cloudflare Email Routing to a verified destination only.
export async function sendAccountMail(env,message,{EmailMessage}={}){
 if(env.ACCOUNTS_EMAIL_MODE!=='verified_only')return env.ACCOUNTS_EMAIL.send(message);
 const allowed=String(env.ACCOUNTS_TEST_EMAIL||'').trim().toLowerCase();
 if(!/^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(allowed)||String(message.to).toLowerCase()!==allowed)throw Error('Test recipient unavailable');
 const from=env.ACCOUNTS_FROM;if(!/^[a-z0-9._+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(from))throw Error('Sender unavailable');
 EmailMessage ||= (await import('cloudflare:email')).EmailMessage;
 const raw=['From: Orivia <'+from+'>','To: '+allowed,'Subject: Your Orivia sign-in code','MIME-Version: 1.0','Content-Type: text/plain; charset=UTF-8','Content-Transfer-Encoding: 8bit','',message.text].join('\r\n');
 return env.ACCOUNTS_EMAIL.send(new EmailMessage(from,allowed,raw));
}
