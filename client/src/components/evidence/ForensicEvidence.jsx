import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Fingerprint, FileText, KeyRound, Map, Maximize2, PackageSearch, Pin, ScanLine, ShieldAlert, X } from 'lucide-react';

const icons = { FINGERPRINT_MATCH: Fingerprint, ACCESS_LOG_SCREENSHOT: KeyRound, FLOORPLAN_TRACE: Map, RECEIPT_DOCUMENT: FileText, PHYSICAL_OBJECT: PackageSearch };

function Blueprint({ item, large = false }) {
  const isFingerprint = item.type === 'FINGERPRINT_MATCH';
  const isMap = item.type === 'FLOORPLAN_TRACE';
  const isObject = item.type === 'PHYSICAL_OBJECT';
  return <svg className={`blueprint-svg ${large ? 'large' : ''}`} viewBox="0 0 420 260" role="img" aria-label={`${item.title} forensic evidence visualization`}>
    <defs><pattern id={`grid-${item.id}`} width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0V20" fill="none" stroke="rgba(70,180,109,.14)" strokeWidth=".7" /></pattern></defs>
    <rect width="420" height="260" fill="#07110b" /><rect width="420" height="260" fill={`url(#grid-${item.id})`} />
    <path d="M18 18H42M18 18V42M402 18H378M402 18V42M18 242H42M18 242V218M402 242H378M402 242V218" className="blueprint-corners" />
    {isFingerprint ? <g className="fingerprint-lines">{Array.from({ length: 10 }, (_, index) => <path key={index} d={`M${130 + index * 3} ${208 - index * 8} C${66 - index * 2} ${160 - index * 5}, ${78 + index * 2} ${42 + index * 3}, 210 ${42 + index * 1.5} C${344 - index * 2} ${45 + index * 2}, ${351 + index * 2} ${176 - index * 6}, ${289 - index * 2} ${211 - index * 4}`} />)}</g>
      : isMap ? <g className="map-lines"><path d="M62 64H170V112H258V70H353V190H282V218H110V172H62Z" /><path d="M170 64V112M110 172V218M258 112V218M62 64V172M353 70V190" /><path className="route-line" d="M86 86L146 86L146 149L232 149L232 186L320 186" /><circle cx="320" cy="186" r="6" className="route-dot" /><text x="80" y="55">ENTRY 21:18</text><text x="264" y="207">TRACE END</text></g>
      : isObject ? <g className="object-drawing"><path d="M155 82L267 70L285 160L175 177Z" /><path d="M155 82L181 114L285 103M181 114L175 177M181 114L272 101" /><circle cx="210" cy="130" r="17" /><path d="M196 130H224M210 116V144" /><text x="87" y="210">SEAL / POLYMER / BATCH 204</text></g>
      : <g className="document-lines"><rect x="123" y="42" width="176" height="176" rx="2" /><path d="M145 68H260M145 85H277M145 108H256M145 127H276M145 148H239M145 169H270" /><rect x="267" y="54" width="18" height="18" className="document-check" /><text x="139" y="197">ARCHIVE RECORD / SEALED</text></g>}
    <text className="blueprint-title" x="25" y="30">{item.type.replaceAll('_', ' ')}</text><text className="blueprint-code" x="25" y="239">{item.code}</text><text className="blueprint-index" x="330" y="239">IMG / {item.id}</text>
  </svg>;
}

export default function ForensicEvidence({ items, pinned, onTogglePin }) {
  const [selected, setSelected] = useState(null);

  return <div className="evidence-page">
    <div className="view-heading"><div><span className="section-index">PHYSICAL & DIGITAL EXHIBITS / 03</span><h2>Forensic <em>locker</em></h2><p>Procedural evidence visualizations. Inspect the source codes and exhibit notes.</p></div><span className="view-count"><Fingerprint size={15} /> {items.length} EXHIBITS</span></div>
    <div className="locker-grid">{items.map((item) => {
      const Icon = icons[item.type] || ShieldAlert;
      return <article className="locker-card" key={item.id}>
        <button className="blueprint-preview" onClick={() => setSelected(item)} aria-label={`Magnify ${item.title}`}><Blueprint item={item} /><span className="magnify-hint"><Maximize2 size={13} /> MAGNIFY</span></button>
        <div className="locker-card-copy"><div className="locker-card-meta"><span><Icon size={13} /> {item.type.replaceAll('_', ' ')}</span><span>{item.capturedAt}</span></div><h3>{item.title}</h3><p>{item.description}</p><div className="artifact-code"><span>TRACE CODE</span><b>{item.code}</b></div><div className="locker-card-foot"><span><ScanLine size={13} /> {item.id}</span><button className={`pin-control ${pinned.includes(item.id) ? 'is-pinned' : ''}`} onClick={() => onTogglePin(item.id)}><Pin size={12} /> {pinned.includes(item.id) ? 'PINNED' : 'PIN'}</button></div></div>
      </article>;
    })}</div>
    <div className="analyst-callout"><span className="callout-mark"><Fingerprint size={16} /></span><p><b>PROCEDURAL VISUALIZATION</b> These diagrams are forensic interface renderings of fictional evidence, not photographs of real scenes.</p></div>
    <AnimatePresence>{selected && <motion.div className="modal-scrim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(event) => { if (event.target === event.currentTarget) setSelected(null); }}><motion.div className="blueprint-modal panel" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} role="dialog" aria-modal="true" aria-label={selected.title}><div className="blueprint-modal-head"><div><span className="section-index">EXHIBIT MAGNIFICATION / {selected.id}</span><h3>{selected.title}</h3></div><button className="icon-button" onClick={() => setSelected(null)} aria-label="Close exhibit"><X size={18} /></button></div><Blueprint item={selected} large /><div className="blueprint-modal-foot"><span><strong>TRACE</strong> {selected.code} / {selected.capturedAt}</span><p>{selected.description}</p></div></motion.div></motion.div>}</AnimatePresence>
  </div>;
}
