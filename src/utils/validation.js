// Caption validation utilities for matching captions to image metadata

const bannedWords = ['nsfw', 'explicit', 'nudity']; // expand as needed

export const validateActionForWaveSize = (action, waveSize) => {
  if (!action) return false;
  const lo = action.toLowerCase();
  if (waveSize === 'big') {
    const powerWords = ['massive','towering','gigantic','enormous','colossal','epic','legendary','thundering','powerful','overwhelming'];
    return powerWords.some(w => lo.includes(w));
  }
  if (waveSize === 'small') {
    const gentleWords = ['tiny','exhausted','sleepy','gentle','minimal','tired','barely','depleted','sluggish','weak'];
    return gentleWords.some(w => lo.includes(w));
  }
  // medium
  const moderateWords = ['steady','consistent','moderate','regular','standard','typical','routine','average','normal','reliable'];
  return moderateWords.some(w => lo.includes(w));
};

export const validateCaptionAgainstImage = (image, caption) => {
  const issues = [];
  const waveSize = image?.metadata?.waveSize || image?.metadata?.size || 'medium';
  const sceneTags = image?.metadata?.tags || [];
  const captionText = (caption || '').toLowerCase();

  // basic moderation
  bannedWords.forEach(bw => { if (captionText.includes(bw)) issues.push({ code: 'moderation', reason: `Contains banned word: ${bw}` }); });

  // size alignment
  // extract a short action phrase from the caption (between brackets or first few words)
  let actionMatch = captionText.match(/\[(.*?)\]/);
  let action = actionMatch ? actionMatch[1] : captionText.split(/[.\-\|]/)[0];
  if (!validateActionForWaveSize(action, waveSize)) {
    issues.push({ code: 'size_mismatch', reason: `Caption action may not match wave size (${waveSize})`, action });
  }

  // scene tag relevance: ensure caption doesn't mention scene words not in tags
  const allowedSceneWords = new Set(sceneTags.map(t => String(t).toLowerCase()));
  const captionWords = captionText.split(/[^a-z0-9]+/).filter(Boolean);
  const offTopic = captionWords.filter(w => w.length > 3 && !allowedSceneWords.has(w) && !w.includes('wave') && !w.includes('ocean'));
  // if too many offTopic words, flag (but be permissive)
  if (offTopic.length > 3) {
    issues.push({ code: 'off_topic', reason: `Caption contains many words not found in scene tags`, offTopic: offTopic.slice(0,6) });
  }

  const pass = issues.length === 0;
  const score = Math.max(0, 1 - (issues.length * 0.25));

  return { pass, issues, score };
};

export default { validateCaptionAgainstImage, validateActionForWaveSize };
