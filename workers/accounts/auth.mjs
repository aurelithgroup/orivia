import {betterAuth} from 'better-auth';
import {emailOTP} from 'better-auth/plugins/email-otp';
export function accountConfig(env){
 let origin='';try{const u=new URL(env.ACCOUNTS_ORIGIN);if(u.protocol==='https:'&&!u.username&&!u.password&&u.pathname==='/'&&!u.search&&!u.hash)origin=u.origin}catch(_){}
 const enabled=env.ACCOUNTS_ENABLED==='1'&&!!env.ACCOUNTS_DB&&typeof env.ACCOUNTS_SECRET==='string'&&env.ACCOUNTS_SECRET.length>=32&&!!origin;
 return {ui:env.ACCOUNTS_UI==='1',enabled,origin,email:enabled&&env.ACCOUNTS_EMAIL_ENABLED==='1'&&!!env.ACCOUNTS_EMAIL?.send&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(env.ACCOUNTS_FROM||''),google:enabled&&!!env.GOOGLE_CLIENT_ID&&!!env.GOOGLE_CLIENT_SECRET,apple:enabled&&!!env.APPLE_CLIENT_ID&&!!env.APPLE_CLIENT_SECRET};
}
export function authOptions(env,{database=env.ACCOUNTS_DB,deliver}={}){
 const c=accountConfig(env),socialProviders={};for(const key of ['google','apple'])if(c[key])socialProviders[key]={clientId:env[key.toUpperCase()+'_CLIENT_ID'],clientSecret:env[key.toUpperCase()+'_CLIENT_SECRET']};
 return {appName:'Orivia',baseURL:c.origin,basePath:'/api/auth',secret:env.ACCOUNTS_SECRET,database,trustedOrigins:[c.origin,...(c.apple?['https://appleid.apple.com']:[])],logger:{disabled:true},emailAndPassword:{enabled:false},socialProviders,
 session:{expiresIn:7*86400,updateAge:86400,freshAge:900,cookieCache:{enabled:false}},account:{storeStateStrategy:'database',accountLinking:{enabled:false}},user:{deleteUser:{enabled:true}},
 advanced:{useSecureCookies:true,cookiePrefix:'orivia_account',ipAddress:{ipAddressHeaders:['cf-connecting-ip']},defaultCookieAttributes:{httpOnly:true,secure:true,sameSite:'lax',path:'/'}},rateLimit:{enabled:true,storage:'database',window:60,max:20},
 plugins:[emailOTP({otpLength:6,expiresIn:300,allowedAttempts:5,storeOTP:'hashed',rateLimit:{window:60,max:3},async sendVerificationOTP({email,otp,type}){
 if(!c.email||type!=='sign-in')throw Error('Email unavailable');if(deliver)return deliver({email,otp,type});await reserveEmail(env);
 await env.ACCOUNTS_EMAIL.send({to:email,from:{email:env.ACCOUNTS_FROM,name:'Orivia'},subject:'Your Orivia sign-in code',text:'Your Orivia sign-in code is '+otp+'. It expires in 5 minutes. Do not share it. If you did not request it, ignore this email.',html:'<p>Your Orivia sign-in code is <strong>'+otp+'</strong>.</p><p>It expires in 5 minutes. Do not share it. If you did not request it, ignore this email.</p>'});}})]};
}
export const createAccountAuth=(env,options)=>betterAuth(authOptions(env,options));
export async function reserveEmail(env,now=new Date()){
 const day=now.toISOString().slice(0,10),month=day.slice(0,7),dc=Number(env.ACCOUNTS_EMAIL_DAY_CAP),mc=Number(env.ACCOUNTS_EMAIL_MONTH_CAP);
 if(!Number.isSafeInteger(dc)||dc<1||!Number.isSafeInteger(mc)||mc<1)throw Error('Email allowance unavailable');
 const row=await env.ACCOUNTS_DB.prepare(`INSERT INTO account_mail_meter(month,day,day_count,month_count) VALUES (?,?,1,1) ON CONFLICT(month) DO UPDATE SET day=excluded.day,day_count=CASE WHEN account_mail_meter.day=excluded.day THEN account_mail_meter.day_count+1 ELSE 1 END,month_count=account_mail_meter.month_count+1 WHERE account_mail_meter.month_count<? AND (account_mail_meter.day<>excluded.day OR account_mail_meter.day_count<?) RETURNING month_count`).bind(month,day,mc,dc).first();if(!row)throw Error('Email allowance reached');
}
