/* Generate standards-based iCalendar reminders only when the tester requests one.
 * A reminder is NOT active until their calendar app accepts the imported event.
 * No user calendar credentials or server-side persistence required.
 */
const fmt=d=>d.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}Z$/,'Z');
const esc=s=>String(s).replace(/\\/g,'\\\\').replace(/\r?\n/g,'\\n').replace(/;/g,'\\;').replace(/,/g,'\\,');
export function createCalendarReminder({title,when,alarmMinutes=30,now=new Date()}){
 if(typeof title!=='string'||!title.trim()||title.length>100)return {ok:false,error:'Enter a short reminder title'};
 if(typeof when!=='string'||!/\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z/.test(when))
  return {ok:false,error:'Choose a valid date and time'};
 const start=new Date(when);if(!Number.isFinite(start.getTime()))return {ok:false,error:'Invalid time'};
 if(start.getTime()<now.getTime()+60000||start.getTime()>now.getTime()+366*86400000)
  return {ok:false,error:'Choose a future time within one year'};
 const ahead=Number(alarmMinutes);
 if(![0,5,10,15,30,60,1440].includes(ahead))return {ok:false,error:'Unsupported advance notice'};
 const end=new Date(start.getTime()+30*60000);
 const uid='orivia-'+fmt(start)+'-'+Math.random().toString(36).slice(2,13)+'@orivia.local';
 const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Orivia//Private Trial Reminder//EN',
  'CALSCALE:GREGORIAN','METHOD:PUBLISH','BEGIN:VEVENT','UID:'+uid,
  'DTSTAMP:'+fmt(now),'DTSTART:'+fmt(start),'DTEND:'+fmt(end),
  'SUMMARY:'+esc(title.trim()),'DESCRIPTION:Reminder created in the Orivia private trial. Import into your calendar to activate it.',
  'BEGIN:VALARM','ACTION:DISPLAY','DESCRIPTION:'+esc(title.trim()),
  'TRIGGER:'+(ahead===0?'PT0S':'-PT'+ahead+'M'),'END:VALARM',
  'END:VEVENT','END:VCALENDAR'];
 return {ok:true,ics:lines.join('\r\n')+'\r\n',at:fmt(start),alarmMinutes:ahead};
}
