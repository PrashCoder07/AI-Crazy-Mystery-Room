import { createHash } from 'node:crypto';

const baseSuspects = [
  { id: 'S-01', name: 'Mara Voss', age: 38, occupation: 'Security architect', relationship: 'Designed the building access system', motive: 'A contract renewal depended on the archive remaining secure.', alibi: 'Says she was in the west atrium from 21:10 to 21:40.', profile: 'Precise and guarded. Knows the camera blind spots better than anyone.', accent: '#a9ffc3' },
  { id: 'S-02', name: 'Elias Rook', age: 44, occupation: 'Night custodian', relationship: 'Maintains the lower archive', motive: 'Was recently warned after a restricted-room access violation.', alibi: 'Claims the service lift was out of order, so he stayed on level one.', profile: 'Observant, soft-spoken, and responsible for overnight floor access.', accent: '#b9d8ff' },
  { id: 'S-03', name: 'Nadia Chen', age: 31, occupation: 'Records analyst', relationship: 'Prepared the sealed archive inventory', motive: 'A missing document could have exposed a serious professional error.', alibi: 'Says she left the building before the 21:00 lock sequence.', profile: 'Methodical and candid, but under pressure to keep her audit clean.', accent: '#ffd4a3' },
  { id: 'S-04', name: 'Victor Hale', age: 52, occupation: 'Operations director', relationship: 'Authorized the archive shutdown', motive: 'The archive held a file that could threaten his position.', alibi: 'Reports a late call from his office between 21:15 and 21:35.', profile: 'Confident, well connected, and accustomed to overriding procedure.', accent: '#e3c9ff' },
];

export function createFallbackMystery({ scenario, type = 'general' }) {
  const hash = createHash('sha256').update(`${scenario}|${type}`).digest();
  const culpritIndex = hash[0] % baseSuspects.length;
  const culprit = baseSuspects[culpritIndex];
  const id = `MR-${Date.now().toString(36).toUpperCase()}-${hash.toString('hex').slice(0, 4).toUpperCase()}`;
  const scenarioTitle = scenario.trim().split(/[.!?\n]/)[0].replace(/^(a|an|the)\s+/i, '').slice(0, 42);
  const title = scenarioTitle ? `The ${toTitleCase(scenarioTitle)}` : 'The Meridian Archive';
  const caseType = type === 'general' ? 'Archive breach' : toTitleCase(type.replaceAll('-', ' '));
  const timestamp = '21:24';

  const messages = [
    { id: 'MSG-01', sender: 'Mara Voss', receiver: 'Elias Rook', time: '20:58', text: 'Level two is sealed after the inventory pass. Use the north corridor only.', recovered: false, read: true, evidenceCode: 'CHAT-01' },
    { id: 'MSG-02', sender: 'Elias Rook', receiver: 'Nadia Chen', time: '21:06', text: 'The west lift is still cycling. I logged it with facilities.', recovered: false, read: true, evidenceCode: 'CHAT-02' },
    { id: 'MSG-03', sender: 'Nadia Chen', receiver: 'Victor Hale', time: '21:12', text: 'The checksum report is ready. I am off site now.', recovered: false, read: true, evidenceCode: 'CHAT-03' },
    { id: 'MSG-04', sender: culprit.name, receiver: 'Victor Hale', time: '21:24', text: 'The archive is quiet. The west reader still accepts the old override.', recovered: true, read: true, evidenceCode: 'CHAT-04' },
    { id: 'MSG-05', sender: 'Victor Hale', receiver: culprit.name, time: '21:26', text: 'Do not touch the sealed drawer. Leave the access log intact.', recovered: true, read: false, evidenceCode: 'CHAT-05' },
    { id: 'MSG-06', sender: 'Elias Rook', receiver: 'Mara Voss', time: '21:38', text: 'The corridor lights just came back. Did someone reset the panel?', recovered: false, read: false, evidenceCode: 'CHAT-06' },
  ];

  const cameras = [
    { id: 'CAM-01', name: 'WEST CORRIDOR', location: 'Level 2 / west access', frames: [
      { time: '21:12', description: 'Corridor empty. The archive door indicator is green.', entities: [], anomaly: '' },
      { time: '21:18', description: 'A figure enters the west reader blind zone, moving against the posted route.', entities: [culprit.name], anomaly: 'MOTION PATH DEVIATES FROM DECLARED ROUTE' },
      { time: '21:24', description: 'The figure exits toward the archive. The door indicator remains green.', entities: [culprit.name], anomaly: 'DOOR OPENED WITHOUT A NEW BADGE EVENT' },
      { time: '21:31', description: 'Corridor clears. A brief camera timestamp skip is detected.', entities: [], anomaly: '6-SECOND SIGNAL GAP' },
    ] },
    { id: 'CAM-02', name: 'SERVICE LANDING', location: 'Level 2 / service lift', frames: [
      { time: '21:10', description: 'Service lift doors open, then close without a passenger.', entities: [], anomaly: '' },
      { time: '21:19', description: 'The landing camera records a shadow crossing toward the archive stairwell.', entities: [culprit.name], anomaly: 'MOVEMENT TOWARD RESTRICTED FLOOR' },
      { time: '21:27', description: 'A person returns carrying a flat document sleeve.', entities: [culprit.name], anomaly: 'OBJECT NOT PRESENT ON ENTRY' },
      { time: '21:39', description: 'No further movement detected.', entities: [], anomaly: '' },
    ] },
  ];

  const forensicImages = [
    { id: 'IMG-01', type: 'ACCESS_LOG_SCREENSHOT', title: 'Reader cache / west door', description: 'The central access log shows no badge swipe during the camera gap. A local cache retains a manual override token.', code: 'OVR-7C-21:24', capturedAt: '21:42', relatedSuspectId: culprit.id, significance: `The override token was issued to ${culprit.name}; it explains how the door opened without a badge event.` },
    { id: 'IMG-02', type: 'FLOORPLAN_TRACE', title: 'Recovered route trace', description: 'A temporary floor sensor recorded a single path from the service landing to the west archive door.', code: 'TRACE-W2-09', capturedAt: '21:46', relatedSuspectId: culprit.id, significance: 'The route contradicts the declared alibi and matches the camera sequence.' },
    { id: 'IMG-03', type: 'PHYSICAL_OBJECT', title: 'Seal fragment / drawer 04', description: 'A green polymer seal fragment is lodged beneath the archive drawer. Its coded batch matches the access override sleeve.', code: 'SEAL-GR-204', capturedAt: '21:51', relatedSuspectId: culprit.id, significance: 'Links the override method to physical access at the sealed drawer.' },
    { id: 'IMG-04', type: 'FINGERPRINT_MATCH', title: 'Sleeve edge lift', description: 'A partial print was recovered from the document sleeve found on the service landing.', code: 'FP-88-A2', capturedAt: '22:03', relatedSuspectId: culprit.id, significance: 'The sleeve was handled during the archive visit.' },
  ];

  const timeline = [
    { time: '20:58', event: 'Restricted-floor route reminder sent to the night team.', source: 'CHAT-01' },
    { time: '21:12', event: 'Nadia reports leaving the building; west corridor remains clear.', source: 'CHAT-03 / CAM-01' },
    { time: '21:18', event: 'Movement enters the west reader blind zone.', source: 'CAM-01' },
    { time: '21:24', event: 'Recovered message references the override; camera records archive access.', source: 'CHAT-04 / CAM-01' },
    { time: '21:27', event: 'A figure leaves the landing with a document sleeve.', source: 'CAM-02' },
    { time: '21:42', event: 'Local reader cache and physical seal fragment recovered.', source: 'IMG-01 / IMG-03' },
  ];

  const contradictionChain = [
    { evidenceType: 'whatsapp', evidenceId: 'MSG-04', label: 'THE RECOVERED MESSAGE', reveal: `${culprit.name} refers to the west reader override at 21:24, demonstrating knowledge of the active bypass.` },
    { evidenceType: 'cctv', evidenceId: 'CAM-01', label: 'THE CAMERA GAP', reveal: `CAM-01 places ${culprit.name} at the archive during the claimed alibi window; the reader opened without a badge swipe.` },
    { evidenceType: 'forensic', evidenceId: 'IMG-01', label: 'THE OVERRIDE TOKEN', reveal: `The cached token is assigned to ${culprit.name}, tying the message and camera anomaly to the access event.` },
  ];

  const innocentExplanations = baseSuspects.filter((suspect) => suspect.id !== culprit.id).map((suspect) => ({
    suspectId: suspect.id,
    explanation: `${suspect.name}'s motive looked suspicious, but the recovered route and override token do not connect them to the west-door entry. Their alibi is consistent with the independent timeline.`,
  }));

  const solution = {
    culpritId: culprit.id,
    motive: culprit.motive,
    method: `Used a cached west-reader override to enter during the camera blind interval, remove the sealed archive file, then left by the service landing.`,
    smokingGunSummary: `Three independent records converge on ${culprit.name}: a recovered message names the override, CCTV places them at the archive, and the reader cache assigns the token to them.`,
    contradictionChain,
    innocentExplanations,
  };

  return {
    id,
    title,
    incident: `A sealed archive item disappeared during the overnight security cycle. Case seed: “${scenario.trim()}” The incident is presented as a fictional training simulation.`,
    location: 'Meridian House · Level 2 Records Wing',
    incidentDate: '2026-10-31',
    caseType,
    suspects: baseSuspects.map((suspect) => ({ ...suspect })),
    messages,
    cameras,
    forensicImages,
    timeline,
    solution,
  };
}

function toTitleCase(value) {
  return value.split(/\s+/).filter(Boolean).map((word) => word[0].toUpperCase() + word.slice(1)).join(' ');
}
