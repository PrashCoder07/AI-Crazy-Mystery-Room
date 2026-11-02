import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Activity, Archive, ArrowLeft, ArrowRight, BadgeCheck, BookOpenText, Check, CircleHelp, Clock3, FileSearch, Fingerprint, Flag, FolderOpen, Menu, MessageSquareText, Pin, Search, Shield, ShieldAlert, StickyNote, Users, Video, X } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { mysteryApi } from '../services/api.js';
import WhatsAppEvidence from '../components/evidence/WhatsAppEvidence.jsx';
import CctvEvidence from '../components/evidence/CctvEvidence.jsx';
import ForensicEvidence from '../components/evidence/ForensicEvidence.jsx';

const navigation = [
  { id: 'overview', label: 'Case overview', icon: FolderOpen },
  { id: 'suspects', label: 'Suspect dossiers', icon: Users, countKey: 'suspects' },
  { id: 'messages', label: 'Message intercepts', icon: MessageSquareText, countKey: 'messages' },
  { id: 'cctv', label: 'CCTV review', icon: Video, countKey: 'cameras' },
  { id: 'forensics', label: 'Forensic locker', icon: Fingerprint, countKey: 'forensicImages' },
  { id: 'timeline', label: 'Event timeline', icon: Clock3 },
  { id: 'notes', label: 'Investigation notes', icon: StickyNote },
];

export default function InvestigationRoom({ session, onExit }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [mystery, setMystery] = useState(null);
  const [activeView, setActiveView] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [pinned, setPinned] = useState(() => readArray(`amr-pins-${id}`));
  const [suspectStatus, setSuspectStatus] = useState(() => readObject(`amr-suspect-status-${id}`));
  const [selectedSuspect, setSelectedSuspect] = useState('');
  const [verdictExplanation, setVerdictExplanation] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [resultError, setResultError] = useState('');
  const [notes, setNotes] = useState([]);
  const [noteDraft, setNoteDraft] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [noteError, setNoteError] = useState('');
  const [noteEvidenceId, setNoteEvidenceId] = useState('');
  const [noteSuspectId, setNoteSuspectId] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    Promise.all([mysteryApi.get(id, session.token), mysteryApi.notes(id, session.token).catch(() => ({ notes: [] })), mysteryApi.result(id, session.token).catch(() => null)])
      .then(([caseResponse, noteResponse, resultResponse]) => {
        if (!active) return;
        setMystery(caseResponse.mystery);
        setNotes(noteResponse.notes || []);
        if (resultResponse?.result) setResult(resultResponse.result);
      })
      .catch((cause) => { if (active) setError(cause.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id, session.token]);

  useEffect(() => {
    setPinned(readArray(`amr-pins-${id}`));
    setSuspectStatus(readObject(`amr-suspect-status-${id}`));
    setActiveView('overview');
    setResult(null);
    setSelectedSuspect('');
    setVerdictExplanation('');
    setNoteDraft('');
    setNoteEvidenceId('');
    setNoteSuspectId('');
    setNoteError('');
  }, [id]);

  const evidenceCount = useMemo(() => mystery ? mystery.messages.length + mystery.cameras.length + mystery.forensicImages.length : 0, [mystery]);
  const selectedSuspectData = mystery?.suspects.find((suspect) => suspect.id === selectedSuspect);

  function togglePin(evidenceId) {
    setPinned((current) => {
      const next = current.includes(evidenceId) ? current.filter((item) => item !== evidenceId) : [...current, evidenceId];
      localStorage.setItem(`amr-pins-${id}`, JSON.stringify(next));
      return next;
    });
  }

  function toggleStatus(suspectId, status) {
    setSuspectStatus((current) => {
      const next = { ...current, [suspectId]: current[suspectId] === status ? '' : status };
      localStorage.setItem(`amr-suspect-status-${id}`, JSON.stringify(next));
      return next;
    });
  }

  async function saveNote(event) {
    event.preventDefault();
    if (!noteDraft.trim()) return;
    setSavingNote(true);
    setNoteError('');
    try {
      const response = await mysteryApi.addNote(id, { content: noteDraft.trim(), relatedEvidenceId: noteEvidenceId, relatedSuspectId: noteSuspectId }, session.token);
      setNotes(response.notes || []);
      setNoteDraft('');
      setNoteEvidenceId('');
      setNoteSuspectId('');
    } catch (cause) { setNoteError(cause.message); }
    finally { setSavingNote(false); }
  }

  async function submitVerdict(event) {
    event.preventDefault();
    setResultError('');
    if (!selectedSuspect) { setResultError('Select one suspect before locking your accusation.'); return; }
    setSubmitting(true);
    try {
      const response = await mysteryApi.accuse(id, { suspectId: selectedSuspect, explanation: verdictExplanation, pinnedEvidence: pinned, clearSuspects: Object.entries(suspectStatus).filter(([, status]) => status === 'clear').map(([suspectId]) => suspectId) }, session.token);
      setResult(response.result);
      setActiveView('accuse');
    } catch (cause) { setResultError(cause.message); }
    finally { setSubmitting(false); }
  }

  function setView(viewId) { setActiveView(viewId); setMobileNavOpen(false); }

  if (loading) return <div className="room-loading"><div className="loading-mark"><Fingerprint size={34} /></div><span className="section-index">DECRYPTING INVESTIGATION FILE</span><h1>Reconstructing<br /><em>the scene.</em></h1><div className="loading-track"><i /></div><p>ESTABLISHING SECURE EVIDENCE CHANNEL</p></div>;
  if (error && !mystery) return <div className="room-error"><ShieldAlert size={25} /><span className="section-index">CASE FILE UNAVAILABLE</span><h1>Unable to open<br /><em>the evidence.</em></h1><p>{error}</p><button className="primary-button" onClick={onExit}><ArrowLeft size={16} /> RETURN TO INTAKE</button></div>;
  if (!mystery) return null;

  const navToResult = () => setView('accuse');
  return <main className="investigation-shell">
    <header className="room-topbar">
      <button className="room-brand" onClick={onExit}><span className="brand-mark"><Fingerprint size={19} /></span><span>AI MYSTERY ROOM<small>FORENSIC TERMINAL</small></span></button>
      <div className="room-case-strip"><span className="system-online"><i /> SECURE CHANNEL</span><b>{mystery.id}</b><span className={`generation-badge ${mystery.generationMode === 'gemini' ? 'is-ai' : 'is-local'}`}>{mystery.generationMode === 'gemini' ? 'GEMINI CASE' : 'LOCAL SIMULATION'}</span></div>
      <div className="room-user"><span>{session.user?.username || 'OPERATOR'}</span><button className="room-exit" onClick={onExit}><ArrowLeft size={14} /> EXIT FILE</button></div>
    </header>

    {mystery.generationMode !== 'gemini' && <div className="simulation-notice"><ShieldAlert size={15} /><span><b>LOCAL TRAINING SIMULATION</b> This case was created from a deterministic offline template because Gemini is not connected. Its evidence loop is playable; add a Gemini API key for scenario-specific generation.</span></div>}

    <div className="room-layout">
      <aside className={`room-sidebar ${mobileNavOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-case-card"><span className="section-index">ACTIVE INVESTIGATION</span><b>{mystery.title}</b><span><i /> INVESTIGATION OPEN</span></div>
        <div className="sidebar-section-label">CASE FILE</div>
        <nav className="room-nav" aria-label="Investigation sections">{navigation.map((item) => {
          const Icon = item.icon;
          return <button className={activeView === item.id ? 'active' : ''} key={item.id} onClick={() => setView(item.id)}><Icon size={16} /><span>{item.label}</span>{item.countKey ? <small>{String(mystery[item.countKey]?.length || 0).padStart(2, '0')}</small> : null}</button>;
        })}</nav>
        <div className="sidebar-section-label">FINAL ACTION</div>
        <button className={`verdict-nav ${activeView === 'accuse' ? 'active' : ''}`} onClick={navToResult}><Flag size={16} /><span>{result ? 'Case result' : 'Submit verdict'}</span><ArrowRight size={14} /></button>
        <div className="sidebar-footer"><div><span>CLUES PINNED</span><b>{String(pinned.length).padStart(2, '0')}</b></div><div><span>SUBJECTS CLEARED</span><b>{String(Object.values(suspectStatus).filter((item) => item === 'clear').length).padStart(2, '0')}</b></div><p><Shield size={12} /> CASE ACCESS LOGGED</p></div>
      </aside>

      <div className="room-center">
        <div className="mobile-room-head"><button className="icon-button" onClick={() => setMobileNavOpen(!mobileNavOpen)} aria-label={mobileNavOpen ? 'Close navigation' : 'Open navigation'}>{mobileNavOpen ? <X size={19} /> : <Menu size={19} />}</button><div><span className="section-index">ACTIVE CASE</span><b>{mystery.title}</b></div><span className="mobile-pin-count"><Pin size={13} /> {pinned.length}</span></div>
        <AnimatePresence mode="wait">
          <motion.section className="room-view" key={activeView} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -3 }} transition={{ duration: 0.16 }}>
            {activeView === 'overview' && <Overview mystery={mystery} pinned={pinned} onNavigate={setView} />}
            {activeView === 'suspects' && <Suspects suspects={mystery.suspects} status={suspectStatus} onStatus={toggleStatus} selectedId={selectedSuspect} onSelect={setSelectedSuspect} />}
            {activeView === 'messages' && <WhatsAppEvidence messages={mystery.messages} pinned={pinned} onTogglePin={togglePin} />}
            {activeView === 'cctv' && <CctvEvidence cameras={mystery.cameras} suspects={mystery.suspects} pinned={pinned} onTogglePin={togglePin} />}
            {activeView === 'forensics' && <ForensicEvidence items={mystery.forensicImages} pinned={pinned} onTogglePin={togglePin} />}
            {activeView === 'timeline' && <Timeline events={mystery.timeline} />}
            {activeView === 'notes' && <Notes notes={notes} mystery={mystery} draft={noteDraft} setDraft={setNoteDraft} evidenceId={noteEvidenceId} setEvidenceId={setNoteEvidenceId} suspectId={noteSuspectId} setSuspectId={setNoteSuspectId} onSubmit={saveNote} saving={savingNote} error={noteError} setError={setNoteError} onUpdate={async (noteId, content) => { const response = await mysteryApi.updateNote(id, noteId, { content }, session.token); setNotes(response.notes || []); }} onDelete={async (noteId) => { const response = await mysteryApi.deleteNote(id, noteId, session.token); setNotes(response.notes || []); }} />}
            {activeView === 'accuse' && (result ? <Result result={result} mystery={mystery} onReturn={() => setView('overview')} /> : <Verdict mystery={mystery} selected={selectedSuspect} setSelected={setSelectedSuspect} explanation={verdictExplanation} setExplanation={setVerdictExplanation} error={resultError} submitting={submitting} onSubmit={submitVerdict} selectedSuspectData={selectedSuspectData} pinned={pinned} status={suspectStatus} />)}
          </motion.section>
        </AnimatePresence>
      </div>

      <aside className="room-insights">
        <div className="insight-heading"><span className="section-index">FIELD INTELLIGENCE</span><Activity size={15} /></div>
        <div className="case-status-card"><div className="case-status-head"><span>CASE STATUS</span><i /></div><b>ACTIVE</b><small>Investigation in progress</small></div>
        <div className="stat-card"><div><span>AVAILABLE EVIDENCE</span><b>{String(evidenceCount).padStart(2, '0')}</b></div><FileSearch size={16} /></div>
        <div className="stat-card"><div><span>PINNED TO BOARD</span><b>{String(pinned.length).padStart(2, '0')}</b></div><Pin size={16} /></div>
        <div className="insight-divider" />
        <div className="side-suspects-head"><span>PERSONS OF INTEREST</span><span>{String(mystery.suspects.length).padStart(2, '0')}</span></div>
        <div className="side-suspects">{mystery.suspects.map((suspect, index) => <button key={suspect.id} onClick={() => { setSelectedSuspect(suspect.id); setView('suspects'); }}><span className="mini-avatar" style={{ '--avatar-accent': suspect.accent }}>{suspect.name.split(' ').map((part) => part[0]).join('')}</span><span><b>{suspect.name}</b><small>{suspect.occupation}</small></span><i className={suspectStatus[suspect.id] === 'clear' ? 'clear' : suspectStatus[suspect.id] === 'suspect' ? 'flagged' : ''} /></button>)}</div>
        <div className="insight-divider" />
        <button className="deduction-board-shortcut" onClick={() => setView('accuse')}><div><span className="section-index">READY TO CLOSE?</span><b>Build your accusation.</b><small>Review your pinned clues and choose one suspect.</small></div><ArrowRight size={17} /></button>
        <div className="integrity-note"><Shield size={13} /> SOLUTION ENCRYPTED UNTIL SUBMISSION</div>
      </aside>
    </div>
  </main>;
}

function Overview({ mystery, pinned, onNavigate }) {
  return <div className="overview-page">
    <div className="overview-banner"><div><span className="section-index">CASE OVERVIEW / INTAKE RECORD</span><h1>{mystery.title}</h1><p>{mystery.incident}</p></div><div className="case-stamp"><Fingerprint size={28} /><span>CASE<br />ACTIVE</span></div></div>
    <div className="overview-meta-grid"><Meta label="LOCATION" value={mystery.location} /><Meta label="INCIDENT DATE" value={mystery.incidentDate || 'UNCONFIRMED'} /><Meta label="CASE CLASS" value={mystery.caseType} /><Meta label="DIFFICULTY" value="CALIBRATED / MEDIUM" /></div>
    <div className="overview-intro"><div><span className="section-index">CASE BRIEF / 001</span><h2>The facts are<br /><em>still in motion.</em></h2></div><p>{mystery.incident} Your task is to review each source, test the alibis against the timeline, and identify which account cannot survive the evidence.</p></div>
    <div className="overview-evidence-grid">{[
      { id: 'messages', icon: MessageSquareText, number: mystery.messages.length, label: 'MESSAGE INTERCEPTS', copy: 'Recovered communications and deleted fragments.' },
      { id: 'cctv', icon: Video, number: mystery.cameras.length, label: 'SURVEILLANCE FEEDS', copy: 'Scrubbable camera frames with anomaly flags.' },
      { id: 'forensics', icon: Fingerprint, number: mystery.forensicImages.length, label: 'FORENSIC EXHIBITS', copy: 'Procedural records and trace visualizations.' },
    ].map((item) => { const Icon = item.icon; return <button className="overview-evidence-card" key={item.id} onClick={() => onNavigate(item.id)}><span><Icon size={17} /> {item.label}</span><b>{String(item.number).padStart(2, '0')}</b><p>{item.copy}</p><i>OPEN SOURCE <ArrowRight size={13} /></i></button>; })}</div>
    <div className="overview-next"><div className="next-icon"><Search size={20} /></div><div><span className="section-index">NEXT STEP / SUSPECT DOSSIERS</span><b>Four accounts. One impossible timeline.</b><p>Start with the claimed alibis, then see who appears in the recovered records.</p></div><button className="icon-button" onClick={() => onNavigate('suspects')} aria-label="Open suspect dossiers"><ArrowRight size={18} /></button></div>
    <div className="overview-foot"><span><Pin size={13} /> {pinned.length} CLUES ON YOUR DEDUCTION BOARD</span><button onClick={() => onNavigate('timeline')}>REVIEW TIMELINE <ArrowRight size={13} /></button></div>
  </div>;
}

function Meta({ label, value }) { return <div className="overview-meta"><span>{label}</span><b>{value}</b></div>; }

function Suspects({ suspects, status, onStatus, selectedId, onSelect }) {
  const [localActive, setLocalActive] = useState(suspects[0]?.id);
  const active = selectedId || localActive;
  const suspect = suspects.find((item) => item.id === active) || suspects[0];
  if (!suspect) return null;
  return <div className="evidence-page">
    <div className="view-heading"><div><span className="section-index">PERSONS OF INTEREST / 04 DOSSIERS</span><h2>Suspect <em>roster</em></h2><p>Each subject has a motive and a claim. Test their account against the case file.</p></div><span className="view-count"><Users size={15} /> {suspects.length} SUBJECTS</span></div>
    <div className="suspect-workspace"><div className="suspect-list">{suspects.map((item, index) => <button className={item.id === suspect.id ? 'active' : ''} key={item.id} onClick={() => { setLocalActive(item.id); onSelect(item.id); }}><span className="suspect-list-number">0{index + 1}</span><span className="suspect-avatar" style={{ '--avatar-accent': item.accent }}>{item.name.split(' ').map((part) => part[0]).join('')}</span><span className="suspect-list-copy"><b>{item.name}</b><small>{item.occupation}</small></span><i className={status[item.id] === 'clear' ? 'clear' : status[item.id] === 'suspect' ? 'flagged' : ''} /></button>)}</div>
      <article className="suspect-dossier"><div className="dossier-top"><div><span className="section-index">SUBJECT FILE / {suspect.id}</span><span className="dossier-status">{status[suspect.id] === 'clear' ? 'CLEARED BY OPERATOR' : status[suspect.id] === 'suspect' ? 'FLAGGED FOR REVIEW' : 'UNRESOLVED'}</span></div><span className="dossier-index">{suspect.id}</span></div><div className="dossier-profile"><div className="dossier-avatar" style={{ '--avatar-accent': suspect.accent }}><span>{suspect.name.split(' ').map((part) => part[0]).join('')}</span><Fingerprint size={45} /></div><div><h3>{suspect.name}</h3><span>{suspect.age} YEARS / {suspect.occupation.toUpperCase()}</span><p>{suspect.profile}</p></div></div><div className="dossier-fields"><div><span>RELATIONSHIP TO CASE</span><b>{suspect.relationship}</b></div><div><span>POSSIBLE MOTIVE</span><p>{suspect.motive}</p></div><div className="alibi-field"><span>CLAIMED ALIBI</span><p>“{suspect.alibi}”</p></div></div><div className="suspect-actions"><span>OPERATOR ASSESSMENT</span><button className={status[suspect.id] === 'clear' ? 'assessment-clear active' : 'assessment-clear'} onClick={() => onStatus(suspect.id, 'clear')}><Check size={14} /> MARK CLEAR</button><button className={status[suspect.id] === 'suspect' ? 'assessment-flag active' : 'assessment-flag'} onClick={() => onStatus(suspect.id, 'suspect')}><Flag size={14} /> FLAG SUSPECT</button></div></article></div>
  </div>;
}

function Timeline({ events }) {
  return <div className="evidence-page">
    <div className="view-heading"><div><span className="section-index">CHRONOLOGY / SOURCE-CROSSCHECK</span><h2>Event <em>timeline</em></h2><p>Every timestamp is a testable claim. Compare the sequence with what each subject reported.</p></div><span className="view-count"><Clock3 size={15} /> {events.length} EVENTS</span></div>
    <div className="timeline-card"><div className="timeline-card-head"><span>LOCAL TIME / 24-HOUR CLOCK</span><span>DATE {events[0]?.date || '2026.10.31'}</span></div><div className="timeline-list">{events.map((event, index) => <article key={`${event.time}-${index}`} className="timeline-item"><div className="timeline-time"><b>{event.time}</b><span>{String(index + 1).padStart(2, '0')}</span></div><div className="timeline-marker"><i /></div><div className="timeline-event"><p>{event.event}</p><span><Archive size={12} /> SOURCE / {event.source}</span></div></article>)}</div><div className="timeline-legend"><span><i className="legend-event" /> VERIFIED EVENT</span><span><i className="legend-source" /> SOURCE REFERENCE</span></div></div>
    <div className="analyst-callout"><span className="callout-mark">↔</span><p><b>CROSS-CHECK REQUIRED</b> A timeline can establish where someone was, but not why. Open the linked message or camera feed before drawing a conclusion.</p></div>
  </div>;
}

function Notes({ notes, mystery, draft, setDraft, evidenceId, setEvidenceId, suspectId, setSuspectId, onSubmit, saving, error, setError, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(null);
  const [editText, setEditText] = useState('');
  async function saveEdit(noteId) { try { setError(''); await onUpdate(noteId, editText); setEditing(null); } catch (cause) { setError(cause.message); } }
  async function deleteNote(noteId) { try { setError(''); await onDelete(noteId); } catch (cause) { setError(cause.message); } }
  return <div className="evidence-page">
    <div className="view-heading"><div><span className="section-index">PRIVATE OPERATOR LOG / LOCAL TO CASE</span><h2>Investigation <em>notes</em></h2><p>Keep working theories, contradictions, and questions in your private case notebook.</p></div><span className="view-count"><StickyNote size={15} /> {notes.length} ENTRIES</span></div>
    <form className="notes-composer panel" onSubmit={onSubmit}><div className="notes-composer-head"><span><StickyNote size={15} /> NEW FIELD NOTE</span><span>PRIVATE TO YOUR ACCOUNT</span></div><textarea value={draft} onChange={(event) => setDraft(event.target.value)} maxLength={4000} rows={5} placeholder="What doesn't add up? Record the evidence ID, the claim, and the contradiction you see…" /><div className="note-associations"><label>LINK SUSPECT<select value={suspectId} onChange={(event) => setSuspectId(event.target.value)}><option value="">No suspect linked</option>{mystery.suspects.map((suspect) => <option value={suspect.id} key={suspect.id}>{suspect.name}</option>)}</select></label><label>LINK EVIDENCE<select value={evidenceId} onChange={(event) => setEvidenceId(event.target.value)}><option value="">No evidence linked</option>{mystery.messages.map((item) => <option value={item.id} key={item.id}>{item.id} / Message</option>)}{mystery.cameras.map((item) => <option value={item.id} key={item.id}>{item.id} / CCTV</option>)}{mystery.forensicImages.map((item) => <option value={item.id} key={item.id}>{item.id} / Forensic</option>)}</select></label></div><div className="notes-composer-foot"><span>{draft.length} / 4000 CHARACTERS</span><button className="primary-button compact-button" disabled={saving || !draft.trim()}>{saving ? 'SAVING…' : <>SAVE FIELD NOTE <ArrowRight size={15} /></>}</button></div></form>
    <div className="note-list-head"><span>FIELD NOTE ARCHIVE</span><span>{String(notes.length).padStart(2, '0')} RECORDS</span></div>
    {error && <div className="inline-error"><ShieldAlert size={15} /> {error}</div>}
    {notes.length ? <div className="note-list">{[...notes].reverse().map((note) => <article key={note.id} className="note-entry"><span className="note-entry-index"><StickyNote size={16} /></span><div className="note-entry-copy"><span className="section-index">OPERATOR NOTE / {new Date(note.createdAt || note.updatedAt).toLocaleString()}</span>{editing === note.id ? <><textarea value={editText} maxLength={4000} onChange={(event) => setEditText(event.target.value)} /><div className="note-edit-actions"><button type="button" onClick={() => saveEdit(note.id)}>SAVE EDIT</button><button type="button" onClick={() => setEditing(null)}>CANCEL</button></div></> : <><p>{note.content}</p>{note.relatedSuspectId && <small>RELATED SUSPECT / {mystery.suspects.find((item) => item.id === note.relatedSuspectId)?.name || note.relatedSuspectId}</small>}{note.relatedEvidenceId && <small>RELATED EVIDENCE / {note.relatedEvidenceId}</small>}<div className="note-edit-actions"><button type="button" onClick={() => { setEditing(note.id); setEditText(note.content); }}>EDIT NOTE</button><button type="button" onClick={() => deleteNote(note.id)}>DELETE</button></div></>}</div></article>)}</div> : <div className="empty-notes"><BookOpenText size={22} /><b>NO FIELD NOTES YET</b><p>Record your first observation above.</p></div>}
  </div>;
}

function Verdict({ mystery, selected, setSelected, explanation, setExplanation, error, submitting, onSubmit, selectedSuspectData, pinned, status }) {
  const clearCount = Object.values(status).filter((item) => item === 'clear').length;
  return <div className="evidence-page verdict-page">
    <div className="view-heading"><div><span className="section-index">FINAL ACTION / SOLUTION SEALED</span><h2>Who did <em>it?</em></h2><p>Make one accusation. The solution and contradiction chain will be unlocked after submission.</p></div><span className="view-count"><Shield size={15} /> ONE VERDICT</span></div>
    <div className="verdict-seal"><div><LockKeyholeIcon /><span>SEALED SOLUTION</span></div><p>The culprit ID, motive, method, and explanation are held server-side until this verdict is locked.</p></div>
    <form onSubmit={onSubmit}>
      <div className="accusation-grid">{mystery.suspects.map((suspect, index) => <button type="button" key={suspect.id} className={`accusation-card ${selected === suspect.id ? 'selected' : ''}`} onClick={() => setSelected(suspect.id)}><span className="accusation-index">SUBJECT / 0{index + 1}</span><span className="accusation-avatar" style={{ '--avatar-accent': suspect.accent }}>{suspect.name.split(' ').map((part) => part[0]).join('')}</span><b>{suspect.name}</b><small>{suspect.occupation}</small><i className="radio-indicator">{selected === suspect.id && <i />}</i><span className={`assessment-tag ${status[suspect.id] === 'clear' ? 'is-clear' : status[suspect.id] === 'suspect' ? 'is-suspect' : ''}`}>{status[suspect.id] === 'clear' ? 'CLEARED' : status[suspect.id] === 'suspect' ? 'FLAGGED' : 'UNRESOLVED'}</span></button>)}</div>
      <label className="verdict-explanation"><span>YOUR REASONING <small>OPTIONAL / HELPS CALCULATE YOUR SCORE</small></span><textarea value={explanation} onChange={(event) => setExplanation(event.target.value)} maxLength={1600} rows={4} placeholder="Which message, frame, or forensic trace changed your mind?" /></label>
      <div className="verdict-summary"><span><Pin size={14} /> {pinned.length} CLUES PINNED</span><span><Check size={14} /> {clearCount} SUBJECTS CLEARED</span><span><CircleHelp size={14} /> ONE FINAL ACCUSATION</span></div>
      {selectedSuspectData && <div className="selected-warning"><ShieldAlert size={15} /><span>YOU ARE ACCUSING <b>{selectedSuspectData.name.toUpperCase()}</b>. This action cannot be changed.</span></div>}
      {error && <div className="inline-error"><ShieldAlert size={15} /> {error}</div>}
      <button className="primary-button lock-verdict" disabled={submitting}>{submitting ? 'UNSEALING VERDICT…' : <>LOCK IN CULPRIT &amp; SOLVE <ArrowRight size={17} /></>}</button>
    </form>
  </div>;
}

function LockKeyholeIcon() { return <div className="lock-emblem"><Shield size={27} /><LockKeyholeGraphic /></div>; }
function LockKeyholeGraphic() { return <span className="lock-keyhole" />; }

function Result({ result, mystery, onReturn }) {
  const solution = result.solution;
  const selected = mystery.suspects.find((suspect) => suspect.id === result.selectedSuspectId);
  return <div className="result-page">
    <div className={`result-banner ${result.isCorrect ? 'is-correct' : 'is-incorrect'}`}><span className="section-index">CASE CLOSURE / {result.isCorrect ? 'VERDICT CONFIRMED' : 'VERDICT DISPUTED'}</span><div className="result-emblem">{result.isCorrect ? <BadgeCheck size={31} /> : <ShieldAlert size={31} />}</div><h1>{result.isCorrect ? <>You found<br />the <em>truth.</em></> : <>The evidence<br />says <em>otherwise.</em></>}</h1><p>{result.isCorrect ? 'Your accusation matches the sealed case solution.' : `${selected?.name || 'Your suspect'} was not responsible. Review the case closure below.`}</p><div className="result-score"><span>INVESTIGATION SCORE</span><b>{String(result.score).padStart(2, '0')}<small> / 100</small></b></div></div>
    <div className="solution-reveal"><div className="reveal-head"><span className="section-index">SEALED SOLUTION / NOW DECLASSIFIED</span><span><Shield size={13} /> RETURNED AFTER ACCUSATION</span></div><div className="culprit-reveal"><span className="culprit-mark"><Fingerprint size={26} /></span><div><span>RESPONSIBLE PARTY</span><h2>{mystery.suspects.find((suspect) => suspect.id === solution.culpritId)?.name || solution.culpritId}</h2><p>{solution.motive}</p></div><span className="culprit-stamp">CULPRIT<br />IDENTIFIED</span></div><div className="solution-details"><div><span>MOTIVE</span><p>{solution.motive}</p></div><div><span>METHOD</span><p>{solution.method}</p></div></div><div className="smoking-gun"><span><Fingerprint size={15} /> THE SMOKING GUN</span><p>{solution.smokingGunSummary}</p></div></div>
    <div className="contradiction-reveal"><div className="contradiction-head"><div><span className="section-index">THREE-POINT PROOF</span><h2>The contradiction <em>chain.</em></h2></div><span>MESSAGE → CAMERA → TRACE</span></div><div className="chain-list">{solution.contradictionChain.map((step, index) => <article className="chain-step" key={`${step.evidenceId}-${index}`}><div className="chain-index">0{index + 1}<i /></div><div className="chain-content"><span>{step.evidenceType.toUpperCase()} / {step.evidenceId}</span><h3>{step.label}</h3><p>{step.reveal}</p></div></article>)}</div></div>
    <div className="innocent-review"><span className="section-index">THE OTHER ACCOUNTS</span><h2>Why they were <em>cleared.</em></h2><div>{solution.innocentExplanations.map((item) => { const suspect = mystery.suspects.find((entry) => entry.id === item.suspectId); return <article key={item.suspectId}><span><Check size={14} /></span><div><b>{suspect?.name || item.suspectId}</b><p>{item.explanation}</p></div></article>; })}</div></div>
    <button className="primary-button result-return" onClick={onReturn}><ArrowLeft size={15} /> RETURN TO CASE FILE</button>
  </div>;
}

function readArray(key) { try { const data = JSON.parse(localStorage.getItem(key) || '[]'); return Array.isArray(data) ? data : []; } catch { return []; } }
function readObject(key) { try { const data = JSON.parse(localStorage.getItem(key) || '{}'); return data && typeof data === 'object' ? data : {}; } catch { return {}; } }
