export const mysteryResponseSchema = {
  type: 'OBJECT',
  properties: {
    title: { type: 'STRING' },
    incident: { type: 'STRING' },
    location: { type: 'STRING' },
    incidentDate: { type: 'STRING' },
    caseType: { type: 'STRING' },
    suspects: {
      type: 'ARRAY', minItems: 4, maxItems: 4,
      items: {
        type: 'OBJECT',
        properties: {
          id: { type: 'STRING' }, name: { type: 'STRING' }, age: { type: 'NUMBER' }, occupation: { type: 'STRING' },
          relationship: { type: 'STRING' }, motive: { type: 'STRING' }, alibi: { type: 'STRING' }, profile: { type: 'STRING' }, accent: { type: 'STRING' },
        },
        required: ['id', 'name', 'age', 'occupation', 'relationship', 'motive', 'alibi', 'profile', 'accent'],
      },
    },
    messages: {
      type: 'ARRAY', minItems: 5, maxItems: 12,
      items: { type: 'OBJECT', properties: { id: { type: 'STRING' }, sender: { type: 'STRING' }, receiver: { type: 'STRING' }, time: { type: 'STRING' }, text: { type: 'STRING' }, recovered: { type: 'BOOLEAN' }, read: { type: 'BOOLEAN' }, evidenceCode: { type: 'STRING' } }, required: ['id', 'sender', 'receiver', 'time', 'text', 'recovered', 'read', 'evidenceCode'] },
    },
    cameras: {
      type: 'ARRAY', minItems: 2, maxItems: 4,
      items: { type: 'OBJECT', properties: { id: { type: 'STRING' }, name: { type: 'STRING' }, location: { type: 'STRING' }, frames: { type: 'ARRAY', items: { type: 'OBJECT', properties: { time: { type: 'STRING' }, description: { type: 'STRING' }, entities: { type: 'ARRAY', items: { type: 'STRING' } }, anomaly: { type: 'STRING' } }, required: ['time', 'description', 'entities', 'anomaly'] } } }, required: ['id', 'name', 'location', 'frames'] },
    },
    forensicImages: {
      type: 'ARRAY', minItems: 3, maxItems: 6,
      items: { type: 'OBJECT', properties: { id: { type: 'STRING' }, type: { type: 'STRING', enum: ['FINGERPRINT_MATCH', 'ACCESS_LOG_SCREENSHOT', 'FLOORPLAN_TRACE', 'RECEIPT_DOCUMENT', 'PHYSICAL_OBJECT'] }, title: { type: 'STRING' }, description: { type: 'STRING' }, code: { type: 'STRING' }, capturedAt: { type: 'STRING' }, relatedSuspectId: { type: 'STRING' }, significance: { type: 'STRING' } }, required: ['id', 'type', 'title', 'description', 'code', 'capturedAt', 'relatedSuspectId', 'significance'] },
    },
    timeline: { type: 'ARRAY', minItems: 4, maxItems: 8, items: { type: 'OBJECT', properties: { time: { type: 'STRING' }, event: { type: 'STRING' }, source: { type: 'STRING' } }, required: ['time', 'event', 'source'] } },
    solution: {
      type: 'OBJECT',
      properties: {
        culpritId: { type: 'STRING' }, motive: { type: 'STRING' }, method: { type: 'STRING' }, smokingGunSummary: { type: 'STRING' },
        contradictionChain: { type: 'ARRAY', minItems: 3, maxItems: 3, items: { type: 'OBJECT', properties: { evidenceType: { type: 'STRING' }, evidenceId: { type: 'STRING' }, label: { type: 'STRING' }, reveal: { type: 'STRING' } }, required: ['evidenceType', 'evidenceId', 'label', 'reveal'] } },
        innocentExplanations: { type: 'ARRAY', minItems: 3, maxItems: 3, items: { type: 'OBJECT', properties: { suspectId: { type: 'STRING' }, explanation: { type: 'STRING' } }, required: ['suspectId', 'explanation'] } },
      },
      required: ['culpritId', 'motive', 'method', 'smokingGunSummary', 'contradictionChain', 'innocentExplanations'],
    },
  },
  required: ['title', 'incident', 'location', 'incidentDate', 'caseType', 'suspects', 'messages', 'cameras', 'forensicImages', 'timeline', 'solution'],
};
