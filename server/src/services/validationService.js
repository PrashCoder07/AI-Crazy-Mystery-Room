const evidenceTypes = new Set(['whatsapp', 'cctv', 'forensic']);
const hiddenKeys = new Set(['solution', 'culpritId', 'correctSuspectId', 'smokingGunSummary', 'contradictionChain', 'innocentExplanations', 'isCulprit', 'relatedSuspectId', 'significance']);

export function validateMystery(mystery) {
  const issues = [];
  const suspectIds = new Set((mystery?.suspects || []).map((suspect) => suspect.id));
  if (!mystery?.title || !mystery?.incident || !mystery?.location) issues.push('Case overview is incomplete.');
  if (suspectIds.size !== 4) issues.push('A case must contain exactly four unique suspects.');
  if (!suspectIds.has(mystery?.solution?.culpritId)) issues.push('The solution culprit must be one of the case suspects.');
  if (!Array.isArray(mystery?.messages) || mystery.messages.length < 5) issues.push('The case needs at least five message records.');
  if (!Array.isArray(mystery?.cameras) || mystery.cameras.length < 2) issues.push('The case needs at least two camera feeds.');
  if (!Array.isArray(mystery?.forensicImages) || mystery.forensicImages.length < 3) issues.push('The case needs at least three forensic exhibits.');
  if (!Array.isArray(mystery?.solution?.contradictionChain) || mystery.solution.contradictionChain.length !== 3) issues.push('The solution needs a three-step contradiction chain.');

  const messageIds = new Set((mystery?.messages || []).map((item) => item.id));
  const cameraIds = new Set((mystery?.cameras || []).map((item) => item.id));
  const imageIds = new Set((mystery?.forensicImages || []).map((item) => item.id));
  const chain = mystery?.solution?.contradictionChain || [];
  const requiredTypes = new Set(chain.map((item) => item.evidenceType));
  if (!['whatsapp', 'cctv', 'forensic'].every((type) => requiredTypes.has(type))) issues.push('The contradiction chain must connect messages, CCTV, and forensic evidence.');
  if (chain.map((item) => item.evidenceType).join(',') !== 'whatsapp,cctv,forensic') issues.push('The contradiction chain must follow message, camera, then forensic evidence.');
  for (const step of chain) {
    if (!evidenceTypes.has(step.evidenceType)) issues.push(`Unsupported contradiction evidence type: ${step.evidenceType}.`);
    const idSet = step.evidenceType === 'whatsapp' ? messageIds : step.evidenceType === 'cctv' ? cameraIds : imageIds;
    if (!idSet.has(step.evidenceId)) issues.push(`Contradiction evidence ${step.evidenceId} does not exist.`);
  }
  for (const item of mystery?.forensicImages || []) {
    if (!suspectIds.has(item.relatedSuspectId)) issues.push(`Forensic item ${item.id} references an unknown suspect.`);
  }

  return { valid: issues.length === 0, issues };
}

export function sanitizeMystery(mystery) {
  return stripHiddenData(mystery);
}

function stripHiddenData(value) {
  if (Array.isArray(value)) return value.map(stripHiddenData);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(Object.entries(value).filter(([key]) => !hiddenKeys.has(key)).map(([key, nested]) => [key, stripHiddenData(nested)]));
}
