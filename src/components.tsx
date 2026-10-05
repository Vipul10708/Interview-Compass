import { Check, Clock, Pencil, Undo2 } from 'lucide-react';
import { progress, type Confidence, type Item } from './model';
import { frontendCurriculum } from './frontend-curriculum';
import { backendCurriculum } from './backend-curriculum';
import { databaseCurriculum } from './database-curriculum';

/** Totals are derived at render time, never stored separately. */
export function ProgressBar({ items = [], color = 'blue', summary, unit = 'items' }: { items?: Item[]; color?: string; summary?: {done:number;total:number;percent:number}; unit?: string }) {
  const { done, total, percent } = summary ?? progress(items);
  return <>
    <div className="progress-summary">
      <strong className={color}>{total ? `${percent}%` : '—'}</strong>
      <span>{total ? `${done} of ${total} ${unit} complete` : 'Not configured'}</span>
    </div>
    <div className={`bar ${color}`} role="progressbar" aria-label="Completion"
      aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
      <span style={{ width: `${percent}%` }} />
    </div>
    <div className="legend">
      <span>● Completed ({done})</span><span>○ Remaining ({total - done})</span>
    </div>
  </>;
}

type CardProps = {
  items: Item[];
  ai?: boolean;
  aiMinutes: number;
  onEdit: (item: Item) => void;
  onUpdate: (id: string, patch: Partial<Item>) => void;
};

/** Shared controls keep Fundamentals and DSA behavior identical. */
export function StudyCards({ items, ai = false, aiMinutes, onEdit, onUpdate }: CardProps) {
  return <div className={`cards ${ai ? 'ai-cards' : ''}`}>
    {items.map(item => <article className={`item ${item.completed ? 'complete' : ''}`} key={item.id}>
      {item.module==='fundamentals'&&item.group==='Front End'&&frontendCurriculum.some(([,title])=>title===item.title)&&<p className="curriculum-label">{String(frontendCurriculum.findIndex(([,title])=>title===item.title)+1).padStart(2,'0')} · {frontendCurriculum.find(([,title])=>title===item.title)?.[0]}</p>}
      {item.module==='fundamentals'&&item.group==='Back End'&&backendCurriculum.some(([,title])=>title===item.title)&&<p className="curriculum-label">{String(backendCurriculum.findIndex(([,title])=>title===item.title)+1).padStart(2,'0')} · {backendCurriculum.find(([,title])=>title===item.title)?.[0]}</p>}
      {item.module==='fundamentals'&&item.group==='Database'&&databaseCurriculum.some(([,title])=>title===item.title)&&<p className="curriculum-label">{String(databaseCurriculum.findIndex(([,title])=>title===item.title)+1).padStart(2,'0')} · {databaseCurriculum.find(([,title])=>title===item.title)?.[0]}</p>}
      <div className="item-title">
        <h3>{item.title}</h3>
        <button className="icon-button edit" aria-label={`Edit ${item.title}`} onClick={() => onEdit(item)}>
          <Pencil size={16} />
        </button>
      </div>
      {ai ? <p className="muted"><Clock size={16} /> {aiMinutes} min · {item.group}</p>
        : item.difficulty && <span className={`badge ${item.difficulty === 'Easy' ? 'easy' : 'medium'}`}>{item.difficulty}</span>}
      <div className="controls">
        {item.completed ? <>
          <span className="completed"><Check size={19} />Completed</span>
          <button className="icon-button" aria-label={`Undo completion of ${item.title}`}
            onClick={() => onUpdate(item.id, { completed: false })}><Undo2 size={20} /></button>
        </> : <button className="soft" onClick={() => onUpdate(item.id, { completed: true })}>
          <span className="circle" />Mark complete
        </button>}
        {!ai && <select aria-label={`Confidence for ${item.title}`}
          className={`confidence ${item.confidence === 'Perfect' ? 'perfect' : item.confidence === 'Needs revisit' ? 'revisit' : ''}`}
          value={item.confidence}
          onChange={event => onUpdate(item.id, { confidence: event.target.value as Confidence })}>
          <option value="">Set confidence</option>
          {['Perfect', 'Good', 'Needs revisit'].map(value => <option key={value}>{value}</option>)}
        </select>}
      </div>
    </article>)}
    {!items.length && <p className="empty">No items yet. Add your backlog when you’re ready.</p>}
  </div>;
}
