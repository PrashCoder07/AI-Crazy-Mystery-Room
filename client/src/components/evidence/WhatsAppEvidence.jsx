import { useMemo, useState } from 'react';
import { Check, ChevronDown, Circle, MessageSquareText, Pin, Radio, Search, ShieldCheck } from 'lucide-react';

export default function WhatsAppEvidence({ messages, pinned, onTogglePin }) {
  const [thread, setThread] = useState('ALL INTERCEPTS');
  const threads = useMemo(() => ['ALL INTERCEPTS', ...new Set(messages.map((item) => [item.sender, item.receiver].sort().join(' ↔ ')))], [messages]);
  const visible = thread === 'ALL INTERCEPTS' ? messages : messages.filter((item) => [item.sender, item.receiver].sort().join(' ↔ ') === thread);

  return (
    <div className="evidence-page">
      <div className="view-heading"><div><span className="section-index">DIGITAL EXTRACTION / 01</span><h2>Message <em>intercepts</em></h2><p>Recovered fragments, contact metadata, and one conversation that should not exist.</p></div><span className="view-count"><MessageSquareText size={15} /> {messages.length} RECORDS</span></div>
      <div className="evidence-toolbar"><div className="thread-select"><span>THREAD</span><select value={thread} onChange={(event) => setThread(event.target.value)}>{threads.map((item) => <option key={item}>{item}</option>)}</select><ChevronDown size={14} /></div><span className="toolbar-status"><i /> EXTRACTION VERIFIED</span></div>
      <div className="chat-shell">
        <div className="chat-top"><div className="chat-avatar"><ShieldCheck size={18} /></div><div><b>ENCRYPTED INTERCEPTS</b><small>DEVICE IMAGE // READ-ONLY</small></div><span className="chat-lock"><Radio size={13} /> SIGNAL RECOVERED</span></div>
        <div className="chat-messages">
          {visible.map((item) => {
            return <article className={`chat-row ${item.recovered ? 'is-recovered' : ''}`} key={item.id}>
              <div className="chat-message-meta"><span>{item.sender} <i>→</i> {item.receiver}</span><time>{item.time}</time></div>
              <div className="chat-bubble"><p>{item.text}</p>{item.recovered && <span className="recovered-label"><Search size={11} /> RECOVERED FROM DELETED CACHE</span>}</div>
              <div className="chat-message-foot"><span>RECORD {item.id} / {item.evidenceCode} <span className={`read-receipt ${item.read ? 'is-read' : ''}`}><Check size={11} /><Check size={11} /> {item.read ? 'READ' : 'DELIVERED'}</span></span><button className={`pin-control ${pinned.includes(item.id) ? 'is-pinned' : ''}`} onClick={() => onTogglePin(item.id)} title={pinned.includes(item.id) ? 'Unpin evidence' : 'Pin to deduction board'}><Pin size={13} /> {pinned.includes(item.id) ? 'PINNED' : 'PIN CLUE'}</button></div>
            </article>;
          })}
          {!visible.length && <div className="empty-evidence">No messages found in this thread.</div>}
        </div>
        <div className="chat-bottom"><Circle size={8} fill="currentColor" /> METADATA RETAINED <span>END-TO-END ENCRYPTION / BYPASSED</span></div>
      </div>
      <div className="analyst-callout"><span className="callout-mark">!</span><p><b>ANALYST NOTE</b> Recovered messages are marked in green. Timestamps are preserved from the source device image.</p></div>
    </div>
  );
}
