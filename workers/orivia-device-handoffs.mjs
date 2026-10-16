/**
 * Device-friendly map handoffs for Orivia's browser-based private trial.
 * A website cannot query or force the OS's default navigation app.
 * geo: is a destination lookup, NOT a precomputed or guaranteed routed trip.
 * Apple Maps and Google Maps are explicit provider alternatives; users opt in.
 * Never attach a user's exact GPS location or infer live travel metrics.
 */
const place=x=>String(x||'').replace(/[\r\n<>]/g,' ').trim().slice(0,180);
export function mapHandoffs({origin='',destination='',mode='driving'}={}){
 const dest=place(destination),from=place(origin);
 if(!dest)return [];
 const travelmode=mode==='transit'?'transit':'driving';
 const appleMode=mode==='transit'?'r':'d';
 const apple=new URL('https://maps.apple.com/');
 apple.searchParams.set('daddr',dest);
 if(from)apple.searchParams.set('saddr',from);
 apple.searchParams.set('dirflg',appleMode);
 const google=new URL('https://www.google.com/maps/dir/');
 google.searchParams.set('api','1');
 google.searchParams.set('destination',dest);
 if(from)google.searchParams.set('origin',from);
 google.searchParams.set('travelmode',travelmode);
 // RFC 5870: geo: lookup gives the OS/browser an opportunity to use a map app.
 // Do NOT claim the origin or mode is carried through this URI.
 const geo='geo:0,0?q='+encodeURIComponent(dest);
 return [
  {id:'device',title:'Open destination in device maps',url:geo,mode:'place',handoff:'geo',externalProvider:'Device map handler',note:'Opens a place lookup if the device supports geo: links; then choose directions in your maps app.'},
  {id:'apple',title:(travelmode==='transit'?'Public transport':'Driving')+' in Apple Maps',url:apple.toString(),mode:travelmode,handoff:'url',externalProvider:'Apple Maps',note:'Check the pin, route and live details in Apple Maps.'},
  {id:'google',title:(travelmode==='transit'?'Public transport':'Driving')+' in Google Maps',url:google.toString(),mode:travelmode,handoff:'url',externalProvider:'Google Maps',note:'Check the pin, route and live details in Google Maps.'}
 ];
}
export function calendarHandoffInfo(){
 return {
  format:'text/calendar',
  fileExtension:'.ics',
  displayLabel:'Add to your calendar',
  explanation:'Open or share the calendar file with your preferred device calendar app, then confirm Save there. Downloading does not add the event automatically.',
  requiresConfirmation:true,
  autoAdded:false
 };
}
