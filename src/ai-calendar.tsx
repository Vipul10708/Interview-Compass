import { useState } from 'react';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { aiSchedule, dateKey, progress, type State } from './model';

export function AiCalendar({state,onCheck,onDuration}:{state:State;onCheck:(id:string,completed:boolean)=>void;onDuration:(minutes:number)=>void}) {
 const [month,setMonth]=useState(()=>new Date((state.settings.startDate||dateKey(new Date())).slice(0,7)+'-01T12:00:00'));
 const sessions=aiSchedule(state),summary=progress(sessions.map(s=>s.item));
 const complete=summary.total===45&&summary.done===45;
 const finish=sessions.at(-1)?.key;
 return <div className="ai-course">
  <div className="ai-course-summary panel">
   <div><h2>{complete?'Study course complete':'Claude study calendar'}</h2><p>{summary.done} of {summary.total} sessions complete · {summary.percent}%</p><p className="muted">{summary.total} weekday sessions · {(summary.total*state.settings.aiMinutes/60).toFixed(1)} planned hours · about 9 weeks</p></div>
   <label>Session duration<select value={state.settings.aiMinutes} onChange={e=>onDuration(Number(e.target.value))}>{Array.from({length:16},(_,i)=><option key={i} value={30+i}>{30+i} minutes</option>)}</select></label>
  </div>
  <div className="ai-course-layout">
   <section className="panel calendar">
    <div className="calendar-heading"><button className="icon-button" aria-label="Previous AI month" onClick={()=>setMonth(new Date(month.getFullYear(),month.getMonth()-1,1))}><ChevronLeft/></button><h2>{month.toLocaleDateString(undefined,{month:'long',year:'numeric'})}</h2><button className="icon-button" aria-label="Next AI month" onClick={()=>setMonth(new Date(month.getFullYear(),month.getMonth()+1,1))}><ChevronRight/></button></div>
    <div className="calendar-grid">
     {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d=><div className="weekday" key={d}>{d}</div>)}
     {Array.from({length:Math.ceil(((month.getDay()+6)%7+new Date(month.getFullYear(),month.getMonth()+1,0).getDate())/7)*7},(_,i)=>{
      const d=new Date(month.getFullYear(),month.getMonth(),i-(month.getDay()+6)%7+1),key=dateKey(d),session=sessions.find(s=>s.key===key);
      return <div key={key} className={`date ${session?.item.completed?'done':''} ${d.getMonth()!==month.getMonth()?'outside':''}`}><span>{d.getDate()}</span>{session&&<label className="ai-date-check"><input type="checkbox" aria-label={`${session.item.title}, ${key}`} checked={session.item.completed} onChange={e=>onCheck(session.item.id,e.target.checked)}/><span>{session.item.title}</span></label>}{session?.item.completed&&<b><Check size={16}/></b>}</div>;
     })}
    </div>
    <p className="ai-calendar-note muted">{finish?'Target finish: '+new Date(finish+'T12:00:00').toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'})+'. You can complete any session when you study it.':'Set your study start date in Plan & backup to place sessions on the calendar.'}</p>
   </section>
   <section className="panel ai-session-panel"><h2>All 45 sessions</h2><div className="ai-session-list">{sessions.map(({item,key})=><label className={`session ${item.completed?'complete':''}`} key={item.id}><input type="checkbox" checked={item.completed} onChange={e=>onCheck(item.id,e.target.checked)}/><span><strong>{item.title}</strong><small>{key?new Date(key+'T12:00:00').toLocaleDateString(undefined,{weekday:'short',month:'short',day:'numeric'}):'Date not set'} · {state.settings.aiMinutes} minutes</small></span></label>)}</div><p className="muted">{complete?'All planned study sessions are complete. Phase 2 can be planned next.':'Check each session after studying; uncheck to undo.'}</p></section>
  </div>
 </div>;
}
