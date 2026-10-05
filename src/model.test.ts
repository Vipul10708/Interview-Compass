import { describe, it, expect } from 'vitest';
import { initialState, installFrontendCurriculum, installBackendCurriculum, installDatabaseCurriculum, installDsaCurriculum, installAiCourse, aiSchedule, setAiSession, dsaGroups, progress, parseBackup, routine, dateKey, planTimeline, planDayNumber, dayFromChecks, calendarProgress, moduleProgress } from './model';
describe('study data rules',()=>{
 it('updates dashboard module totals from topics, DSA/design problems and AI sessions without completing calendar days',()=>{
 const s=installAiCourse(installDsaCurriculum(installDatabaseCurriculum(installBackendCurriculum(installFrontendCurriculum(initialState())))));s.settings.startDate='2026-10-05';const topic=s.items.find(i=>i.module==='fundamentals')!;topic.completed=true;expect(moduleProgress(s,'fundamentals')).toEqual({total:119,done:1,percent:1});expect(calendarProgress(s).done).toBe(0);topic.completed=false;expect(moduleProgress(s,'fundamentals').done).toBe(0);s.items.find(i=>i.module==='dsa')!.completed=true;s.designChecks={'URL shortener':true};expect(moduleProgress(s,'dsa')).toEqual({total:112,done:2,percent:2});s.items.find(i=>i.module==='ai')!.completed=true;expect(moduleProgress(s,'ai')).toEqual({total:45,done:1,percent:2});
 });
 it('plans 45 weekday AI sessions and shares completion with the calendar',()=>{
 const s=initialState();s.settings.startDate='2026-10-05';s.days['2026-10-05']={status:'partial',checks:['ai']};const course=installAiCourse(s);const schedule=aiSchedule(course);expect(schedule).toHaveLength(45);expect(course.settings.aiMinutes).toBe(40);expect(schedule[0].key).toBe('2026-10-05');expect(schedule[44].key).toBe('2026-12-04');expect(schedule[0].item.completed).toBe(true);expect(schedule.every(e=>![0,6].includes(new Date(e.key+'T12:00:00').getDay()))).toBe(true);let next=setAiSession(course,schedule[1].item.id,true);expect(next.days['2026-10-06'].status).toBe('partial');expect(next.days['2026-10-06'].checks).toContain('ai');expect(calendarProgress(next,'ai').done).toBe(2);for(const e of schedule)next=setAiSession(next,e.item.id,true);expect(calendarProgress(next,'ai')).toEqual({total:45,done:45,percent:100});next=setAiSession(next,schedule[1].item.id,false);expect(calendarProgress(next,'ai').done).toBe(44);expect(next.days['2026-10-06'].checks).not.toContain('ai');next.settings.aiMinutes=45;expect(parseBackup(JSON.stringify(next))).toEqual(next);expect(installAiCourse(next)).toBe(next);
 });
 it('keeps unscheduled AI sessions usable before a start date is set',()=>{const s=installAiCourse(initialState());expect(aiSchedule(s).every(e=>e.key==='')).toBe(true);expect(setAiSession(s,aiSchedule(s)[0].item.id,true).days).toEqual({});});
 it('installs exactly 100 unique DSA problems across all 12 categories and preserves progress',()=>{
 const s=initialState();const previous=s.items.find(i=>i.title==='Two Sum')!;previous.completed=true;previous.confidence='Good';const others=s.items.filter(i=>i.module!=='dsa');const next=installDsaCurriculum(s);const problems=next.items.filter(i=>i.module==='dsa');expect(problems).toHaveLength(100);expect(new Set(problems.map(i=>i.title)).size).toBe(100);expect(new Set(problems.map(i=>i.id)).size).toBe(100);expect(dsaGroups).toHaveLength(12);for(const group of dsaGroups)expect(problems.some(i=>i.group===group)).toBe(true);expect(problems.find(i=>i.title==='Two Sum')).toEqual(previous);expect(next.items.filter(i=>i.module!=='dsa')).toEqual(others);expect(installDsaCurriculum(next)).toBe(next);expect(parseBackup(JSON.stringify(next))).toEqual(next);
 });
 it('saves reversible design checkboxes and rejects invalid checkbox backups',()=>{
 const s=initialState();s.designChecks={'URL shortener':true,'Parking lot':false};expect(parseBackup(JSON.stringify(s))).toEqual(s);s.designChecks['URL shortener']=false;expect(parseBackup(JSON.stringify(s)).designChecks?.['URL shortener']).toBe(false);expect(()=>parseBackup(JSON.stringify({...s,designChecks:{'URL shortener':'true'}}))).toThrow();
 });
 it('installs SQL Server topics and preserves existing confidence and other categories',()=>{
 const s=installBackendCurriculum(installFrontendCurriculum(initialState()));const before=s.items.filter(i=>i.group!=='Database');s.items.find(i=>i.title==='SQL joins')!.confidence='Good';const next=installDatabaseCurriculum(s);expect(next.items.filter(i=>i.group==='Database')).toHaveLength(18);expect(next.items.filter(i=>i.group!=='Database')).toEqual(before);expect(next.items.find(i=>i.title.startsWith('SQL joins:'))!.confidence).toBe('Good');expect(installDatabaseCurriculum(next)).toBe(next);expect(parseBackup(JSON.stringify(next))).toEqual(next);
 });
 it('installs ordered backend topics while preserving other categories and progress',()=>{
 const s=installFrontendCurriculum(initialState());const frontend=s.items.filter(i=>i.group==='Front End');const old=s.items.find(i=>i.title==='OOP principles')!;old.completed=true;old.confidence='Good';const next=installBackendCurriculum(s);expect(next.items.filter(i=>i.group==='Back End')).toHaveLength(49);expect(next.items.filter(i=>i.group==='Front End')).toEqual(frontend);expect(next.items.find(i=>i.title==='OOP principles')!.completed).toBe(true);expect(next.items.find(i=>i.title==='OOP principles')!.confidence).toBe('Good');expect(installBackendCurriculum(next)).toBe(next);expect(parseBackup(JSON.stringify(next))).toEqual(next);
 });
 it('replaces front-end placeholders once and preserves progress and other categories',()=>{
 const s=initialState();s.items[0].completed=true;s.items[0].confidence='Good';s.items.push({id:'placeholder',module:'fundamentals',group:'Front End',title:'Additional study topic 1: readable content and keyboard controls',completed:false,confidence:'',difficulty:''});
 const other=s.items.filter(i=>i.group!=='Front End');const updated=installFrontendCurriculum(s);
 expect(updated.items.filter(i=>i.group==='Front End')).toHaveLength(52);expect(updated.items.find(i=>i.title==='Components and JSX')?.completed).toBe(true);expect(updated.items.find(i=>i.title==='Components and JSX')?.confidence).toBe('Good');expect(updated.items.filter(i=>i.group!=='Front End')).toEqual(other);expect(updated.days).toEqual(s.days);expect(installFrontendCurriculum(updated)).toBe(updated);expect(parseBackup(JSON.stringify(updated))).toEqual(updated);
 });
 it('reflects completed days and individual sessions in dashboard progress',()=>{
 const s=initialState();s.settings.startDate='2026-10-05';const ids=['dsa','fundamentals','ai'];
 s.days['2026-10-05']=dayFromChecks(ids,ids);s.days['2026-10-06']=dayFromChecks(ids,ids);
 expect(calendarProgress(s)).toEqual({done:2,total:182,percent:1});expect(calendarProgress(s,'dsa')).toEqual({done:2,total:130,percent:2});
 s.days['2026-10-07']=dayFromChecks(['dsa'],ids);expect(calendarProgress(s).done).toBe(2);expect(calendarProgress(s,'dsa').done).toBe(3);expect(calendarProgress(s,'ai').done).toBe(2);
 s.days['2026-10-05']=dayFromChecks([],ids);expect(calendarProgress(s).done).toBe(1);expect(calendarProgress(s,'dsa').done).toBe(2);expect(calendarProgress(initialState(),'ai').total).toBe(0);
 });
 it('adds one catch-up day per pair of partial days and reverses it on completion',()=>{
 const s=initialState();s.settings.startDate='2026-10-05';
 s.days['2026-10-07']={status:'partial',checks:['dsa']};expect(planDayNumber('2026-10-08',s)).toBe(4);expect(planTimeline(s).end).toBe('2027-04-04');
 s.days['2026-10-08']={status:'partial',checks:['ai']};expect(planDayNumber('2026-10-08',s)).toBe(planDayNumber('2026-10-07',s));expect(planDayNumber('2026-10-09',s)).toBe(4);expect(planTimeline(s).end).toBe('2027-04-05');expect(planTimeline(s).partial).toBe(2);expect(planTimeline(s).missed).toBe(0);
 s.days['2026-10-06']={status:'missed',checks:[]};expect(planDayNumber('2026-10-09',s)).toBe(3);
 s.days['2026-10-08']={status:'done',checks:['dsa','fundamentals','ai']};expect(planDayNumber('2026-10-09',s)).toBe(4);expect(planTimeline(s).end).toBe('2027-04-05');
 });
 it('derives completed, partial and missed days from checked sessions',()=>{
 const ids=['dsa','fundamentals','ai'];expect(dayFromChecks(ids,ids).status).toBe('done');expect(dayFromChecks(['dsa'],ids).status).toBe('partial');expect(dayFromChecks(['dsa','ai'],ids).status).toBe('partial');expect(dayFromChecks([],ids).status).toBe('missed');expect(dayFromChecks(['weekend'],['weekend']).status).toBe('done');
 const s=initialState();s.settings.startDate='2026-10-05';s.days['2026-10-05']=dayFromChecks(['dsa'],ids);expect(planTimeline(s).partial).toBe(1);expect(planTimeline(s).completed).toBe(0);expect(planDayNumber('2026-10-06',s)).toBe(2);expect(parseBackup(JSON.stringify(s))).toEqual(s);s.days['2026-10-05']=dayFromChecks([],ids);expect(planTimeline(s).missed).toBe(1);expect(planDayNumber('2026-10-06',s)).toBe(1);
 });
 it('shifts plan numbers and finish date for missed days and restores them on undo',()=>{
  const s=initialState();s.settings.startDate='2026-10-05';const today='2026-10-12';
  expect(planTimeline(s,today).total).toBe(182);expect(planTimeline(s,today).end).toBe('2027-04-04');
  expect(planDayNumber('2026-10-04',s,today)).toBeNull();expect(planDayNumber('2026-10-05',s,today)).toBe(1);expect(planDayNumber('2026-10-09',s,today)).toBe(5);
  for(const key of ['2026-10-05','2026-10-06','2026-10-07'])s.days[key]={status:'done',checks:[]};
  s.days['2026-10-09']={status:'missed',checks:[]};
  expect(planDayNumber('2026-10-09',s,today)).toBeNull();expect(planDayNumber('2026-10-10',s,today)).toBe(5);expect(planDayNumber('2026-10-11',s,today)).toBe(6);
  expect(planTimeline(s,today)).toEqual({total:182,completed:3,partial:0,missed:1,end:'2027-04-05'});
  s.days['2026-10-09'].status='planned';expect(planDayNumber('2026-10-10',s,today)).toBe(6);expect(planTimeline(s,today).missed).toBe(0);
 });
 it('counts calendar days across daylight savings and clamps six-month boundaries',()=>{
  const s=initialState();s.settings.startDate='2026-08-31';expect(planTimeline(s).total).toBe(181);
  s.settings.startDate='2026-03-01';expect(planDayNumber('2026-03-09',s)).toBe(9);
  expect(planDayNumber('2026-09-01',s)).toBeNull();
 });
 it('starts examples at zero and excludes empty modules from weighted totals',()=>{const s=initialState();expect(progress(s.items).done).toBe(0);s.items[0].completed=true;expect(progress(s.items).percent).toBe(Math.round(100/s.items.length));expect(progress([])).toEqual({total:0,done:0,percent:0});});
 it('keeps confidence through completion and undo',()=>{const i=initialState().items[0];i.confidence='Needs revisit';i.completed=true;expect(progress([i]).done).toBe(1);i.completed=false;expect(i.confidence).toBe('Needs revisit');expect(progress([i]).done).toBe(0);});
 it('round trips progress and rejects invalid backups',()=>{const s=initialState();s.items[0].completed=true;s.items[0].confidence='Good';s.days['2026-01-01']={status:'missed',checks:['dsa']};expect(parseBackup(JSON.stringify(s))).toEqual(s);expect(()=>parseBackup('{}')).toThrow();s.items[1].id=s.items[0].id;expect(()=>parseBackup(JSON.stringify(s))).toThrow();});
 it('validates dates and saves explicitly chosen future adherence without changing syllabus',()=>{const s=initialState();s.days['2099-01-01']={status:'done',checks:[]};expect(parseBackup(JSON.stringify(s))).toEqual(s);s.days={'2026-02-30':{status:'planned',checks:[]}};expect(()=>parseBackup(JSON.stringify(s))).toThrow();expect(progress(s.items).done).toBe(0);});
 it('requires a start date and preserves the weekly budget',()=>{const s=initialState();expect(routine('2026-10-01',s.settings)).toEqual([]);s.settings.startDate='2026-10-01';expect(routine('2026-09-30',s.settings)).toEqual([]);let minutes=0;for(let n=5;n<=11;n++)minutes+=routine(`2026-10-${String(n).padStart(2,'0')}`,s.settings).reduce((a,x)=>a+x.minutes,0);expect(minutes).toBe(930);s.settings.saturdayMinutes=180;expect(routine('2026-10-11',s.settings)).toEqual([]);});
 it('handles month and year rollover with local date keys',()=>{expect(dateKey(new Date(2026,12,1))).toBe('2027-01-01');expect(dateKey(new Date(2026,2,0))).toBe('2026-02-28');});
});
