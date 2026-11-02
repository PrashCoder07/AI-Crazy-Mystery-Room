import { useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, Camera, ChevronLeft, ChevronRight, Circle, Maximize2, Pause, Pin, Play, ScanLine, Signal, Video } from 'lucide-react';

export default function CctvEvidence({ cameras, suspects, pinned, onTogglePin }) {
  const [cameraIndex, setCameraIndex] = useState(0);
  const [frameIndex, setFrameIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const screenRef = useRef(null);
  const camera = cameras[cameraIndex] || cameras[0];
  const frame = camera?.frames?.[frameIndex] || camera?.frames?.[0];
  const entity = frame?.entities?.[0];
  const suspect = useMemo(() => suspects.find((item) => item.name === entity), [suspects, entity]);

  useEffect(() => {
    if (!playing || !camera?.frames?.length) return undefined;
    const timer = window.setInterval(() => setFrameIndex((current) => current >= camera.frames.length - 1 ? 0 : current + 1), 900);
    return () => window.clearInterval(timer);
  }, [playing, camera]);

  function moveFrame(delta) {
    setFrameIndex((current) => Math.min(Math.max(0, current + delta), camera.frames.length - 1));
  }

  return (
    <div className="evidence-page">
      <div className="view-heading"><div><span className="section-index">SURVEILLANCE ARRAY / 02</span><h2>Camera <em>review</em></h2><p>Scrub the source frames. Compare route, timestamp, and the story on record.</p></div><span className="view-count alert-count"><Video size={15} /> {cameras.length} FEEDS</span></div>
      <div className="camera-selector">{cameras.map((item, index) => <button className={index === cameraIndex ? 'active' : ''} key={item.id} onClick={() => { setCameraIndex(index); setFrameIndex(0); }}><Camera size={14} /><span>{item.name}</span><small>{item.id}</small></button>)}</div>

      <div className="surveillance-screen" ref={screenRef}>
        <div className="screen-topline"><span><i /> SIMULATED FRAME REVIEW</span><span>{camera.id} / {camera.location}</span><button onClick={() => document.fullscreenElement ? document.exitFullscreen() : screenRef.current?.requestFullscreen?.()} aria-label="Toggle full screen"><Maximize2 size={14} /></button></div>
        <div className="surveillance-view">
          <div className="surveillance-grid" />
          <svg className="room-wireframe" viewBox="0 0 820 420" role="img" aria-label={`Schematic view of ${camera.location}`}>
            <path d="M125 100 L650 100 L720 165 L720 320 L180 320 L125 275 Z" className="room-outline" />
            <path d="M240 100 L240 205 L360 205 L360 320 M510 100 L510 228 L720 228 M125 275 L240 275" className="room-divider" />
            <path d="M125 100 L240 205 M650 100 L510 228 M180 320 L240 275" className="room-sightline" />
            <text x="152" y="132">WEST ACCESS</text><text x="276" y="191">ARCHIVE</text><text x="554" y="215">SERVICE LANDING</text><text x="529" y="126">BLIND ZONE</text>
            <g className="camera-marker"><circle cx="410" cy="97" r="10" /><path d="M410 107L410 126M397 126H423" /><text x="429" y="101">{camera.id}</text></g>
            {entity && <g className="person-marker"><circle cx={frameIndex % 2 ? 355 : 305} cy={frameIndex % 2 ? 256 : 245} r="16" /><circle cx={frameIndex % 2 ? 355 : 305} cy={frameIndex % 2 ? 256 : 245} r="3" /><path d={`M${frameIndex % 2 ? 355 : 305} ${frameIndex % 2 ? 256 : 245} L${frameIndex % 2 ? 452 : 470} ${frameIndex % 2 ? 270 : 236}`} /><text x={frameIndex % 2 ? 373 : 325} y={frameIndex % 2 ? 252 : 241}>{suspect?.id || 'SUBJECT'}</text></g>}
            <path className="camera-cone" d="M410 106 L298 270 L545 270 Z" />
          </svg>
          <div className="screen-timestamp"><span>REC</span> 2026.10.31 <b>{frame?.time || '--:--'}</b></div>
          <div className="screen-location"><span>CAMERA / {camera.id}</span><b>{camera.location}</b></div>
          <div className="screen-coordinate">FRAME {String(frameIndex + 1).padStart(3, '0')} / {String(camera.frames.length).padStart(3, '0')}<br />FRAME RATE 24 FPS</div>
          <div className="scanlines" />
        </div>
        <div className="scrubber-row"><button className="transport-button" onClick={() => moveFrame(-1)} aria-label="Previous frame"><ChevronLeft size={18} /></button><button className="transport-play" onClick={() => { setPlaying(!playing); if (!playing) moveFrame(1); }} aria-label={playing ? 'Pause playback' : 'Play next frame'}>{playing ? <Pause size={16} /> : <Play size={16} fill="currentColor" />}</button><input aria-label="Frame scrubber" type="range" min="0" max={Math.max(camera.frames.length - 1, 0)} value={frameIndex} onChange={(event) => { setFrameIndex(Number(event.target.value)); setPlaying(false); }} /><button className="transport-button" onClick={() => moveFrame(1)} aria-label="Next frame"><ChevronRight size={18} /></button><span className="scrub-time">{frame?.time || '--:--'}</span></div>
      </div>

      <div className="frame-details">
        <div className="frame-description"><span className="section-index">FRAME ANALYSIS / {String(frameIndex + 1).padStart(2, '0')}</span><p>{frame?.description}</p></div>
        {frame?.anomaly ? <div className="anomaly-card"><AlertTriangle size={17} /><div><span>ANOMALY FLAGGED</span><b>{frame.anomaly}</b></div></div> : <div className="normal-card"><Signal size={16} /><div><span>SIGNAL STATUS</span><b>NO ANOMALY FLAGGED</b></div></div>}
      </div>

      <div className="camera-frames"><div className="camera-frames-head"><span>FRAME INDEX</span><span>SELECT A RECORD TO REVIEW</span></div>{camera.frames.map((item, index) => <button key={`${camera.id}-${index}`} className={`frame-chip ${frameIndex === index ? 'active' : ''}`} onClick={() => { setFrameIndex(index); setPlaying(false); }}><span>{item.time}</span><b>{String(index + 1).padStart(2, '0')}</b><i>{item.anomaly ? 'FLAG' : 'CLEAR'}</i></button>)}</div>
      <div className="evidence-pin-row"><span><ScanLine size={14} /> SOURCE: {camera.name} / {camera.id}</span><button className={`pin-control ${pinned.includes(camera.id) ? 'is-pinned' : ''}`} onClick={() => onTogglePin(camera.id)}><Pin size={13} /> {pinned.includes(camera.id) ? 'PINNED TO BOARD' : 'PIN CAMERA FEED'}</button></div>
      <div className="analyst-callout"><span className="callout-mark"><Video size={14} /></span><p><b>RECONSTRUCTED CCTV DATA</b> This scrubber visualizes structured fictional camera records; it is not live or recorded video footage.</p></div>
    </div>
  );
}
