import { frontendCurriculum } from './frontend-curriculum';
import { backendCurriculum } from './backend-curriculum';
import { databaseCurriculum } from './database-curriculum';
import { dsaCurriculum } from './dsa-curriculum';
export type Module = 'fundamentals' | 'dsa' | 'ai';
export type Confidence = '' | 'Perfect' | 'Good' | 'Needs revisit';
export type Item = { id: string; module: Module; group: string; title: string; completed: boolean; confidence: Confidence; difficulty: string };
export type Day = { status: 'planned' | 'done' | 'partial' | 'missed'; checks: string[] };
export type State = { version: 1; designChecks?: Record<string,boolean>; items: Item[]; days: Record<string, Day>; settings: { startDate: string; aiMinutes: number; saturdayMinutes: number; certificationDone: boolean; frontendCurriculumVersion?: number; backendCurriculumVersion?: number; databaseCurriculumVersion?: number; aiCourseVersion?: number; dsaCurriculumVersion?: number } };
export const groups = ['Front End', 'Back End', 'Database'];
export const dsaGroups = dsaCurriculum.map(([group])=>group);
export const todayKey = () => dateKey(new Date());
export function dateKey(d: Date) { return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
export function validDate(s: string) { if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false; const d = new Date(s+'T12:00:00'); return !isNaN(+d) && dateKey(d) === s; }
export function initialState(): State {
 const lists: [Module,string,string[]][] = [['fundamentals','Front End',['Components and JSX','Props and state','Event handling','Conditional rendering','Lists and keys','Forms and validation','useState and useEffect','Custom hooks','Context and state management','Routing','API calls and async handling','Testing and accessibility']],['fundamentals','Back End',['.NET request lifecycle','OOP principles','Dependency injection']],['fundamentals','Database',['SQL joins','Indexes','Transactions']],['dsa','Arrays & Hashing',['Two Sum','Contains Duplicate','Valid Anagram','Group Anagrams','Top K Frequent Elements','Product of Array Except Self']],['dsa','Two Pointers',['Valid Palindrome']],['ai','Certification study',Array.from({length:6},(_,i)=>`Session ${i+1}`)]];
 return {version:1,items:lists.flatMap(([module,group,titles])=>titles.map((title,i)=>({id:`${module}-${group}-${i}`,module,group,title,completed:false,confidence:'',difficulty:module==='dsa'?(i<3?'Easy':'Medium'):''}))),days:{},settings:{startDate:'',aiMinutes:30,saturdayMinutes:90,certificationDone:false}};
}
export function progress(items: Item[]) { const total=items.length, done=items.filter(i=>i.completed).length; return {total,done,percent:total?Math.round(done/total*100):0}; }
export function installFrontendCurriculum(state: State): State {
 if(state.settings.frontendCurriculumVersion===2)return state;
 const existing=state.items.filter(i=>i.module==='fundamentals'&&i.group==='Front End');
 const titles=new Set<string>(frontendCurriculum.map(([,title])=>title));
 const topics:Item[]=frontendCurriculum.map(([,title],i)=>{
  const previous=existing.find(item=>item.title===title);
  return {id:previous?.id??`frontend-core-${i+1}`,module:'fundamentals',group:'Front End',title,completed:previous?.completed??false,confidence:previous?.confidence??'',difficulty:''};
 });
 const custom=existing.filter(i=>!titles.has(i.title)&&!i.id.startsWith('frontend-curriculum-')&&!i.id.startsWith('frontend-core-')&&!/^Additional study topic \d+: readable content and keyboard controls$/.test(i.title));
 return {...state,settings:{...state.settings,frontendCurriculumVersion:2},items:[...topics,...custom,...state.items.filter(i=>i.module!=='fundamentals'||i.group!=='Front End')]};
}
export function installBackendCurriculum(state: State): State {
 if(state.settings.backendCurriculumVersion===2)return state;
 const existing=state.items.filter(i=>i.module==='fundamentals'&&i.group==='Back End');
 const titles=new Set<string>(backendCurriculum.map(([,title])=>title));
 const topics:Item[]=backendCurriculum.map(([,title],i)=>{
  const previous=existing.find(item=>item.title===title);
  return {id:previous?.id??`backend-core-${i+1}`,module:'fundamentals',group:'Back End',title,completed:previous?.completed??false,confidence:previous?.confidence??'',difficulty:''};
 });
 const custom=existing.filter(i=>!titles.has(i.title)&&!i.id.startsWith('backend-curriculum-')&&!i.id.startsWith('backend-core-'));
 return {...state,settings:{...state.settings,backendCurriculumVersion:2},items:[...state.items.filter(i=>i.module!=='fundamentals'||i.group!=='Back End'),...topics,...custom]};
}
export function installDatabaseCurriculum(state: State): State {
 if(state.settings.databaseCurriculumVersion===3)return state;
 const existing=state.items.filter(i=>i.module==='fundamentals'&&i.group==='Database');
 const titles=new Set<string>(databaseCurriculum.map(([,title])=>title));
 const topics:Item[]=databaseCurriculum.map(([,title],i)=>{
  const previous=existing.find(item=>item.title===title||({'SQL joins':'SQL joins: INNER, LEFT, RIGHT, FULL, CROSS and self joins','Indexes':'Indexes: clustered/nonclustered, composite keys and included columns','Transactions':'Transactions: ACID, BEGIN/COMMIT/ROLLBACK and XACT_ABORT'} as Record<string,string>)[item.title]===title);
  return {id:previous?.id??`database-core-${i+1}`,module:'fundamentals',group:'Database',title,completed:previous?.completed??false,confidence:previous?.confidence??'',difficulty:''};
 });
 const custom=existing.filter(i=>!titles.has(i.title)&&!i.id.startsWith('database-core-')&&!['SQL joins','Indexes','Transactions'].includes(i.title));
 return {...state,settings:{...state.settings,databaseCurriculumVersion:3},items:[...state.items.filter(i=>i.module!=='fundamentals'||i.group!=='Database'),...topics,...custom]};
}
export function installDsaCurriculum(state: State): State {
 if(state.settings.dsaCurriculumVersion===2)return state;
 const existing=state.items.filter(i=>i.module==='dsa');
 const rank={Easy:0,Medium:1,Hard:2};
 const topics:Item[]=dsaCurriculum.flatMap(([group,problems])=>[...problems].sort((a,b)=>rank[a[1]]-rank[b[1]]).map(([title,difficulty])=>{
  const previous=existing.find(item=>item.title===title);
  return {id:previous?.id??`dsa-core-${title.toLowerCase().replace(/[^a-z0-9]+/g,'-')}`,module:'dsa',group,title,difficulty,completed:previous?.completed??false,confidence:previous?.confidence??''};
 }));
 return {...state,settings:{...state.settings,dsaCurriculumVersion:2},items:[...state.items.filter(i=>i.module!=='dsa'),...topics]};
}
const calendarDay = (key: string) => { const d=new Date(key+'T12:00:00'); return Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())/86400000; };
export function planTimeline(state: State, _today=todayKey()) {
 const start=state.settings.startDate;
 if(!start) return {total:182,completed:0,partial:0,missed:0,end:''};
 const d=new Date(start+'T12:00:00');
 const last=new Date(d.getFullYear(),d.getMonth()+7,0).getDate();
 const boundary=dateKey(new Date(d.getFullYear(),d.getMonth()+6,Math.min(d.getDate(),last)));
 const total=calendarDay(boundary)-calendarDay(start);
 const entries=Object.entries(state.days).filter(([key])=>key>=start);
 const missed=entries.filter(([,day])=>day.status==='missed').length;
 const completed=entries.filter(([,day])=>day.status==='done').length;
 const partial=entries.filter(([,day])=>day.status==='partial').length;
 const endDate=new Date(start+'T12:00:00');endDate.setDate(endDate.getDate()+total+missed+Math.floor(partial/2)-1);
 return {total,completed,partial,missed,end:dateKey(endDate)};
}
export function planDayNumber(key: string,state: State,_today=todayKey()) {
 const start=state.settings.startDate;
 if(!start||key<start||state.days[key]?.status==='missed') return null;
 const earlier=Object.entries(state.days).filter(([k])=>k>=start&&k<key);
 const priorPartial=earlier.filter(([,d])=>d.status==='partial').length;
 const skipped=earlier.filter(([,d])=>d.status==='missed').length+Math.floor(priorPartial/2)+(state.days[key]?.status==='partial'&&priorPartial%2===1?1:0);
 const number=calendarDay(key)-calendarDay(start)+1-skipped;
 return number<=planTimeline(state,_today).total?number:null;
}
export function routine(key: string, settings: State['settings']) {
 if (!settings.startDate || key<settings.startDate) return [];
 const dow=new Date(key+'T12:00:00').getDay();
 return dow===0||dow===6 ? [{id:'weekend',title:'Design, additional AI work & revision',minutes:dow===6?settings.saturdayMinutes:180-settings.saturdayMinutes,detail:'Flexible weekend study budget; content is yours to plan.'}].filter(x=>x.minutes>0) : [{id:'dsa',title:'DSA · morning',minutes:60,detail:'5 min review + 50 min study + 5 min review'},{id:'fundamentals',title:'Fundamentals · evening',minutes:60,detail:'5 min review + 50 min study + 5 min review'},{id:'ai',title:'Claude study',minutes:settings.aiMinutes,detail:`${settings.aiMinutes/12} min review + ${settings.aiMinutes*5/6} min study + ${settings.aiMinutes/12} min review`}];
}
export function parseBackup(text: string): State {
 const s=JSON.parse(text); const fail=()=>{throw new Error('Invalid backup. Expected a version 1 Study Compass export.');};
 if(!s||s.version!==1||!Array.isArray(s.items)||!s.days||typeof s.days!=='object'||Array.isArray(s.days)||!s.settings) fail();
 if(s.designChecks!==undefined&&(!s.designChecks||typeof s.designChecks!=='object'||Array.isArray(s.designChecks)||Object.values(s.designChecks).some(v=>typeof v!=='boolean'))) fail();
 const ids=new Set();
 for(const i of s.items) { if(!i||typeof i.id!=='string'||!i.id||ids.has(i.id)||!['fundamentals','dsa','ai'].includes(i.module)||typeof i.group!=='string'||!i.group.trim()||typeof i.title!=='string'||!i.title.trim()||typeof i.completed!=='boolean'||!['','Perfect','Good','Needs revisit'].includes(i.confidence)||typeof i.difficulty!=='string') fail(); if(i.module==='fundamentals'&&!groups.includes(i.group)) fail(); ids.add(i.id); }
 for(const [k,v] of Object.entries(s.days)) { const d=v as Day; if(!validDate(k)||!d||!['planned','done','partial','missed'].includes(d.status)||!Array.isArray(d.checks)||d.checks.some(x=>!['dsa','fundamentals','ai','weekend'].includes(x))) fail(); }
 const c=s.settings; if(typeof c.startDate!=='string'||(c.startDate&&!validDate(c.startDate))||!Number.isInteger(c.aiMinutes)||c.aiMinutes<30||c.aiMinutes>45||!Number.isInteger(c.saturdayMinutes)||c.saturdayMinutes<0||c.saturdayMinutes>180||typeof c.certificationDone!=='boolean') fail();
 return s as State;
}

export function dayFromChecks(checks: string[], planIds: string[]): Day {
 const selected=Array.from(new Set(checks)).filter(id=>planIds.includes(id));
 return {checks:selected,status:selected.length===0?'missed':selected.length===planIds.length?'done':'partial'};
}
export function calendarProgress(state: State, session?: 'dsa'|'fundamentals'|'ai') {
 if(session==='ai'&&state.settings.aiCourseVersion===1)return progress(state.items.filter(i=>i.module==='ai'));
 const timeline=planTimeline(state);
 let total=timeline.total,done=timeline.completed;
 if(session){
  total=0;done=0;
  if(state.settings.startDate){
   const start=new Date(state.settings.startDate+'T12:00:00');
   for(let i=0;i<timeline.total;i++){const d=new Date(start);d.setDate(start.getDate()+i);if(routine(dateKey(d),state.settings).some(p=>p.id===session))total++;}
   done=Object.entries(state.days).filter(([key,day])=>key>=state.settings.startDate&&day.status!=='missed'&&day.status!=='planned'&&routine(key,state.settings).some(p=>p.id===session)&&day.checks.includes(session)).length;
  }
 }
 done=Math.min(done,total);
 return {total,done,percent:total?Math.round(done/total*100):0};
}
export function moduleProgress(state:State,module:Module) {
 const items=progress(state.items.filter(i=>i.module===module));
 if(module!=='dsa')return items;
 const designTitles=['URL shortener','Rate limiter','Notification service','File storage','Chat application','News feed','Booking system','Order/payment workflow','Parking lot','Vending machine','LRU cache','Elevator system'];
 const total=items.total+designTitles.length;
 const done=items.done+designTitles.filter(title=>state.designChecks?.[title]).length;
 return {total,done,percent:Math.round(done/total*100)};
}

export function installAiCourse(state:State):State {
 if(state.settings.aiCourseVersion===1)return state;
 const old=state.items.filter(i=>i.module==='ai');
 const items:Item[]=Array.from({length:45},(_,i)=>{const previous=old[i];return {id:previous?.id??'ai-course-'+(i+1),module:'ai',group:'Certification study',title:'Session '+(i+1),completed:previous?.completed??false,confidence:'',difficulty:''};});
 const next={...state,settings:{...state.settings,aiMinutes:40,aiCourseVersion:1},items:[...state.items.filter(i=>i.module!=='ai'),...items]};
 const checked=new Set(aiSchedule(next).filter(s=>s.key&&state.days[s.key]?.checks.includes('ai')).map(s=>s.item.id));
 return {...next,items:next.items.map(i=>checked.has(i.id)?{...i,completed:true}:i)};
}
export function aiSchedule(state:State) {
 const items=state.items.filter(i=>i.module==='ai');const start=state.settings.startDate;
 if(!start)return items.map(item=>({item,key:''}));
 const d=new Date(start+'T12:00:00');
 return items.map(item=>{while(d.getDay()===0||d.getDay()===6)d.setDate(d.getDate()+1);const key=dateKey(d);d.setDate(d.getDate()+1);return {item,key};});
}
export function setAiSession(state:State,id:string,completed:boolean):State {
 const entry=aiSchedule(state).find(s=>s.item.id===id);
 if(!entry)return state;
 const next={...state,items:state.items.map(i=>i.id===id?{...i,completed}:i)};
 if(!entry.key)return next;
 const old=state.days[entry.key]?.checks??[];
 const checks=completed?[...old,'ai']:old.filter(c=>c!=='ai');
 return {...next,days:{...state.days,[entry.key]:dayFromChecks(checks,routine(entry.key,state.settings).map(p=>p.id))}};
}
