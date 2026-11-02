import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import { deleteMystery, getMystery, listMysteries, publicMystery, saveMystery, updateMystery } from '../config/db.js';
import { requireAuth } from '../middleware/auth.js';
import { generateMystery } from '../services/geminiService.js';
import { sanitizeMystery, validateMystery } from '../services/validationService.js';

const router = Router();
const generateSchema = z.object({
  scenario: z.string().trim().min(12, 'Add a little more detail to the scenario.').max(1200),
  type: z.string().trim().max(50).optional().default('general'),
  difficulty: z.enum(['easy', 'medium', 'hard', 'expert']).optional().default('medium'),
});
const accuseSchema = z.object({ suspectId: z.string().min(1), explanation: z.string().max(1600).optional().default(''), pinnedEvidence: z.array(z.string().max(64)).max(30).optional().default([]), clearSuspects: z.array(z.string().max(32)).max(4).optional().default([]) });
router.use(requireAuth);
const generationLimiter = rateLimit({ windowMs: 15 * 60_000, limit: 5, standardHeaders: 'draft-7', legacyHeaders: false, message: { success: false, error: 'Case generation limit reached. Try again in a few minutes.' } });

const generateHandler = async (req, res, next) => {
  try {
    const input = generateSchema.parse(req.body);
    const { mystery, source } = await generateMystery(input);
    const validation = validateMystery(mystery);
    if (!validation.valid) return res.status(502).json({ success: false, error: 'The case generator could not validate its evidence. Please try again.' });
    const record = { id: mystery.id || randomUUID(), ownerId: req.user.id, publicData: sanitizeMystery(mystery), solution: mystery.solution, notes: [], createdAt: new Date(), source };
    await saveMystery(record);
    return res.status(201).json({ success: true, mystery: publicMystery(record) });
  } catch (error) { return next(error); }
};

const accuseHandler = async (req, res, next) => {
  try {
    const input = accuseSchema.parse(req.body);
    const record = await ownedMystery(req.params.id, req.user.id);
    if (!record) return res.status(404).json({ success: false, error: 'Case file not found.' });
    if (record.verdict) return res.status(409).json({ success: false, error: 'A verdict has already been locked for this case.', result: record.verdict });
    if (!record.publicData.suspects.some((suspect) => suspect.id === input.suspectId)) return res.status(400).json({ success: false, error: 'Select one of the listed suspects.' });
    const isCorrect = input.suspectId === record.solution.culpritId;
    const chainIds = record.solution.contradictionChain.map((item) => item.evidenceId);
    const matchedEvidence = chainIds.filter((evidenceId) => input.pinnedEvidence.includes(evidenceId)).length;
    const innocentIds = new Set(record.solution.innocentExplanations.map((item) => item.suspectId));
    const clearedInnocents = input.clearSuspects.filter((suspectId) => innocentIds.has(suspectId)).length;
    const motiveWords = String(record.solution.motive).toLowerCase().match(/[a-z]{5,}/g) || [];
    const explanationWords = new Set(input.explanation.toLowerCase().match(/[a-z]{5,}/g) || []);
    const explainsMotive = [...new Set(motiveWords)].filter((word) => explanationWords.has(word)).length >= 2;
    const cctvStep = record.solution.contradictionChain.find((item) => item.evidenceType === 'cctv');
    const identifiesTimelineConflict = Boolean(cctvStep && input.pinnedEvidence.includes(cctvStep.evidenceId) && clearedInnocents >= 2);
    const result = {
      isCorrect,
      selectedSuspectId: input.suspectId,
      submittedAt: new Date(),
      solution: record.solution,
      selectedSuspect: record.publicData.suspects.find((suspect) => suspect.id === input.suspectId),
      explanation: input.explanation,
      pinnedEvidence: input.pinnedEvidence,
      clearSuspects: input.clearSuspects,
      score: isCorrect ? 60 + (explainsMotive ? 15 : 0) + matchedEvidence * 5 + (identifiesTimelineConflict ? 10 : 0) : 0,
    };
    await updateMystery(req.params.id, (current) => ({ ...current, verdict: result }));
    return res.json({ success: true, result });
  } catch (error) { return next(error); }
};

router.post('/generate', generationLimiter, generateHandler);
router.post('/', generationLimiter, generateHandler);

router.get('/', async (req, res, next) => {
  try {
    const cases = (await listMysteries()).filter((record) => record.ownerId === req.user.id).map(({ ownerId: _ownerId, ...record }) => record);
    return res.json({ success: true, mysteries: cases });
  } catch (error) { return next(error); }
});

router.get('/:id/status', async (req, res, next) => {
  try {
    const record = await ownedMystery(req.params.id, req.user.id);
    if (!record) return res.status(404).json({ success: false, error: 'Case file not found.' });
    return res.json({ success: true, status: 'completed', generationMode: record.source });
  } catch (error) { return next(error); }
});

router.get('/:id/suspects/:suspectId', async (req, res, next) => {
  try {
    const record = await ownedMystery(req.params.id, req.user.id);
    const suspect = record?.publicData.suspects.find((item) => item.id === req.params.suspectId);
    if (!suspect) return res.status(404).json({ success: false, error: 'Suspect dossier not found.' });
    return res.json({ success: true, suspect });
  } catch (error) { return next(error); }
});

router.get('/:id/suspects', async (req, res, next) => {
  try {
    const record = await ownedMystery(req.params.id, req.user.id);
    if (!record) return res.status(404).json({ success: false, error: 'Case file not found.' });
    return res.json({ success: true, suspects: record.publicData.suspects });
  } catch (error) { return next(error); }
});

router.get('/:id/evidence/:evidenceId', async (req, res, next) => {
  try {
    const record = await ownedMystery(req.params.id, req.user.id);
    const evidence = record && allEvidence(record.publicData).find((item) => item.id === req.params.evidenceId);
    if (!evidence) return res.status(404).json({ success: false, error: 'Evidence record not found.' });
    return res.json({ success: true, evidence });
  } catch (error) { return next(error); }
});

router.get('/:id/evidence', async (req, res, next) => {
  try {
    const record = await ownedMystery(req.params.id, req.user.id);
    if (!record) return res.status(404).json({ success: false, error: 'Case file not found.' });
    return res.json({ success: true, evidence: allEvidence(record.publicData) });
  } catch (error) { return next(error); }
});

router.get('/:id/notes', async (req, res, next) => {
  try {
    const record = await ownedMystery(req.params.id, req.user.id);
    if (!record) return res.status(404).json({ success: false, error: 'Case file not found.' });
    return res.json({ success: true, notes: record.notes || [] });
  } catch (error) { return next(error); }
});

router.post('/:id/notes', async (req, res, next) => {
  try {
    const input = z.object({ content: z.string().max(4000), relatedEvidenceId: z.string().max(64).optional().default(''), relatedSuspectId: z.string().max(32).optional().default('') }).parse(req.body);
    const record = await ownedMystery(req.params.id, req.user.id);
    if (!record) return res.status(404).json({ success: false, error: 'Case file not found.' });
    const note = { id: randomUUID(), ...input, createdAt: new Date(), updatedAt: new Date() };
    const updated = await updateMystery(req.params.id, (current) => ({ ...current, notes: [...(current.notes || []), note] }));
    return res.status(201).json({ success: true, notes: updated.notes });
  } catch (error) { return next(error); }
});

router.put('/:id/notes/:noteId', async (req, res, next) => {
  try {
    const input = z.object({ content: z.string().max(4000), relatedEvidenceId: z.string().max(64).optional(), relatedSuspectId: z.string().max(32).optional() }).parse(req.body);
    const record = await ownedMystery(req.params.id, req.user.id);
    if (!record) return res.status(404).json({ success: false, error: 'Case file not found.' });
    if (!(record.notes || []).some((note) => note.id === req.params.noteId)) return res.status(404).json({ success: false, error: 'Note not found.' });
    const changes = Object.fromEntries(Object.entries(input).filter(([, value]) => value !== undefined));
    const updated = await updateMystery(req.params.id, (current) => ({ ...current, notes: current.notes.map((note) => note.id === req.params.noteId ? { ...note, ...changes, updatedAt: new Date() } : note) }));
    return res.json({ success: true, notes: updated.notes });
  } catch (error) { return next(error); }
});

router.delete('/:id/notes/:noteId', async (req, res, next) => {
  try {
    const record = await ownedMystery(req.params.id, req.user.id);
    if (!record) return res.status(404).json({ success: false, error: 'Case file not found.' });
    const updated = await updateMystery(req.params.id, (current) => ({ ...current, notes: current.notes.filter((note) => note.id !== req.params.noteId) }));
    return res.json({ success: true, notes: updated.notes });
  } catch (error) { return next(error); }
});

router.post('/:id/accuse', accuseHandler);
router.post('/:id/verdict', accuseHandler);

router.get('/:id/result', async (req, res, next) => {
  try {
    const record = await ownedMystery(req.params.id, req.user.id);
    if (!record) return res.status(404).json({ success: false, error: 'Case file not found.' });
    if (!record.verdict) return res.status(403).json({ success: false, error: 'Submit an accusation before opening the result.' });
    return res.json({ success: true, result: record.verdict });
  } catch (error) { return next(error); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const record = await ownedMystery(req.params.id, req.user.id);
    if (!record) return res.status(404).json({ success: false, error: 'Case file not found.' });
    return res.json({ success: true, mystery: publicMystery(record) });
  } catch (error) { return next(error); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const record = await ownedMystery(req.params.id, req.user.id);
    if (!record) return res.status(404).json({ success: false, error: 'Case file not found.' });
    await deleteMystery(req.params.id);
    return res.json({ success: true });
  } catch (error) { return next(error); }
});

async function ownedMystery(id, userId) {
  const record = await getMystery(id);
  return record?.ownerId === userId ? record : null;
}

function allEvidence(data) {
  return [
    ...data.messages.map((item) => ({ ...item, category: 'whatsapp' })),
    ...data.cameras.map((item) => ({ ...item, category: 'cctv' })),
    ...data.forensicImages.map((item) => ({ ...item, category: 'forensic' })),
  ];
}

export default router;
