// Fictional campus directory for the Northbay demo (area 23). Northbay University is fictional, set in Dubai Academic
// City. None of these services, buildings, hours or numbers exist; every entry says so, numbers are 000 placeholders
// (shown as "Demo number (not callable)" in a demo organisation) and links use northbay.example. Some details are left
// out on purpose, so the demo shows "not provided" rather than invented facts. A real institution's directory comes from
// that partner.
export const FICTIONAL_NOTE='Fictional demo entry: Northbay University and this service are not real.';
const entry=(title,text,details)=>({kind:'contact',title,body:FICTIONAL_NOTE+' '+text,visibility:'members',details:{sourceUrl:'https://northbay.example/directory',reviewedOn:'2026-10-29',...details}});
export const NORTHBAY_DIRECTORY=[
 entry('Student Hub','Your first stop for student ID cards, letters and general questions.',{category:'student_hub',building:'Building A',room:'Ground floor',address:'Building A, Northbay University, Dubai Academic City',openingHours:'Sunday to Thursday, 8:00 to 17:00',accessibility:'Step-free entrance from the main courtyard. Accessible toilet on the ground floor.',directions:'From the main gate, Building A is straight ahead across the courtyard.',phone:'+971 4 000 0001',email:'hub@northbay.example'}),
 entry('International office','Visa letters, entry permits and help for international students.',{category:'international',building:'Building A',room:'First floor, room A1.05',openingHours:'Sunday to Thursday, 9:00 to 15:00',directions:'Take the lift or stairs in Building A to the first floor.',email:'international@northbay.example'}),
 entry('Main library','Books, quiet study and bookable group rooms.',{category:'library',building:'Building B',openingHours:'Sunday to Thursday, 8:00 to 22:00 in term time; shorter hours in breaks',accessibility:'Lift to all floors. Height-adjustable desks on the ground floor.'}),
 entry('Print and copy centre','Print, scan and copy with your student ID card.',{category:'printing',building:'Building B',room:'Ground floor, next to the library entrance',openingHours:'Sunday to Thursday, 8:00 to 18:00'}),
 entry('IT help desk','Wi-Fi, student accounts and laptop problems.',{category:'it',building:'Building C',room:'Room C0.10',email:'it@northbay.example'}),
 entry('Campus health centre','Nurse-led drop-in for minor illness. In an emergency call 999.',{category:'health',building:'Building D',openingHours:'Sunday to Thursday, 8:30 to 16:30',phone:'+971 4 000 0002'}),
 entry('Student wellbeing','Confidential counselling and wellbeing appointments.',{category:'wellbeing',building:'Building D',room:'First floor',email:'wellbeing@northbay.example'}),
 entry('Accessibility support','Adjustments for study, exams and getting around campus.',{category:'accessibility',building:'Building A',room:'Ground floor, room A0.20',accessibility:'Step-free route from the accessible parking bays by Gate 2.',email:'access@northbay.example'}),
 entry('Campus security','Lost property, campus access and safety on campus.',{category:'security',building:'Main gate lodge',openingHours:'Open 24 hours',phone:'+971 4 000 0003'}),
 entry('Campus shuttle stop','Shuttle between the residences and the main gate.',{category:'transport',building:'Gate 2 shelter',directions:'Outside Gate 2, opposite the car park.'}),
];
