/**
 * Scenarios Beats API - Beat Management
 * @version 1.0.0
 * @description Vercel Serverless Function for beat-level operations
 */

const storage = require('../lib/scenario-storage');
const cache = require('../lib/scenario-cache');
const versionControl = require('../lib/scenario-version-control');
const { validateBeat } = require('../lib/scenario-validator');

/**
 * Serverless function handler
 */
module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { method } = req;
    const { scenarioId, actIndex } = req.query;

    if (!scenarioId) {
      return res.status(400).json({
        success: false,
        error: 'Scenario ID required'
      });
    }

    if (actIndex === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Act index required'
      });
    }

    // GET - List beats
    if (method === 'GET') {
      return await listBeats(req, res, scenarioId, actIndex);
    }

    // POST - Add new beat
    if (method === 'POST') {
      return await addBeat(req, res, scenarioId, actIndex);
    }

    // PUT - Update beat
    if (method === 'PUT') {
      return await updateBeat(req, res, scenarioId, actIndex);
    }

    // DELETE - Delete beat
    if (method === 'DELETE') {
      return await deleteBeat(req, res, scenarioId, actIndex);
    }

    // Method not allowed
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * List all beats in act
 */
async function listBeats(req, res, scenarioId, actIndex) {
  const scenario = await storage.load(scenarioId);

  if (!scenario) {
    return res.status(404).json({
      success: false,
      error: 'Scenario not found'
    });
  }

  const index = parseInt(actIndex);

  if (index < 0 || index >= scenario.structure.acts.length) {
    return res.status(400).json({
      success: false,
      error: 'Invalid act index'
    });
  }

  return res.status(200).json({
    success: true,
    data: scenario.structure.acts[index].beats
  });
}

/**
 * Add new beat to act
 */
async function addBeat(req, res, scenarioId, actIndex) {
  const beatData = req.body;

  // Load scenario
  const scenario = await storage.load(scenarioId);

  if (!scenario) {
    return res.status(404).json({
      success: false,
      error: 'Scenario not found'
    });
  }

  const index = parseInt(actIndex);

  if (index < 0 || index >= scenario.structure.acts.length) {
    return res.status(400).json({
      success: false,
      error: 'Invalid act index'
    });
  }

  const act = scenario.structure.acts[index];

  // Generate beat number
  const beatNumber = act.beats.length + 1;

  // Create new beat
  const newBeat = {
    beat_number: beatNumber,
    beat_type: beatData.beat_type || 'introduction',
    template: beatData.template || {
      npc_dialogue_template: '',
      narration_template: '',
      choice_templates: [],
      emotion_hint: ''
    }
  };

  // Validate beat
  const validation = validateBeat(newBeat, {
    actNumber: act.act_number,
    beatNumber
  });

  if (!validation.valid) {
    return res.status(400).json({
      success: false,
      error: 'Beat validation failed',
      validationErrors: validation.errors
    });
  }

  // Add to act
  act.beats.push(newBeat);

  // Save updated scenario
  const saved = await storage.save(scenarioId, scenario);

  // Create version
  await versionControl.createVersion(
    scenarioId,
    saved,
    `Added beat ${beatNumber} to act ${act.act_number}`
  );

  // Invalidate caches
  cache.invalidate(`scenario:${scenarioId}`);
  cache.invalidate('scenarios:list');

  return res.status(201).json({
    success: true,
    data: newBeat
  });
}

/**
 * Update existing beat
 */
async function updateBeat(req, res, scenarioId, actIndex) {
  const { beatIndex } = req.query;
  const beatData = req.body;

  if (beatIndex === undefined) {
    return res.status(400).json({
      success: false,
      error: 'Beat index required'
    });
  }

  // Load scenario
  const scenario = await storage.load(scenarioId);

  if (!scenario) {
    return res.status(404).json({
      success: false,
      error: 'Scenario not found'
    });
  }

  const aIndex = parseInt(actIndex);
  const bIndex = parseInt(beatIndex);

  if (aIndex < 0 || aIndex >= scenario.structure.acts.length) {
    return res.status(400).json({
      success: false,
      error: 'Invalid act index'
    });
  }

  const act = scenario.structure.acts[aIndex];

  if (bIndex < 0 || bIndex >= act.beats.length) {
    return res.status(400).json({
      success: false,
      error: 'Invalid beat index'
    });
  }

  // Update beat
  const updatedBeat = {
    ...act.beats[bIndex],
    ...beatData,
    beat_number: act.beats[bIndex].beat_number // Preserve beat number
  };

  // Validate beat
  const validation = validateBeat(updatedBeat, {
    actNumber: act.act_number,
    beatNumber: updatedBeat.beat_number
  });

  if (!validation.valid) {
    return res.status(400).json({
      success: false,
      error: 'Beat validation failed',
      validationErrors: validation.errors
    });
  }

  act.beats[bIndex] = updatedBeat;

  // Save updated scenario
  const saved = await storage.save(scenarioId, scenario);

  // Create version
  await versionControl.createVersion(
    scenarioId,
    saved,
    `Updated beat ${updatedBeat.beat_number} in act ${act.act_number}`
  );

  // Invalidate caches
  cache.invalidate(`scenario:${scenarioId}`);
  cache.invalidate('scenarios:list');

  return res.status(200).json({
    success: true,
    data: updatedBeat
  });
}

/**
 * Delete beat from act
 */
async function deleteBeat(req, res, scenarioId, actIndex) {
  const { beatIndex } = req.query;

  if (beatIndex === undefined) {
    return res.status(400).json({
      success: false,
      error: 'Beat index required'
    });
  }

  // Load scenario
  const scenario = await storage.load(scenarioId);

  if (!scenario) {
    return res.status(404).json({
      success: false,
      error: 'Scenario not found'
    });
  }

  const aIndex = parseInt(actIndex);
  const bIndex = parseInt(beatIndex);

  if (aIndex < 0 || aIndex >= scenario.structure.acts.length) {
    return res.status(400).json({
      success: false,
      error: 'Invalid act index'
    });
  }

  const act = scenario.structure.acts[aIndex];

  if (bIndex < 0 || bIndex >= act.beats.length) {
    return res.status(400).json({
      success: false,
      error: 'Invalid beat index'
    });
  }

  // Remove beat
  const deletedBeat = act.beats.splice(bIndex, 1)[0];

  // Renumber remaining beats
  act.beats.forEach((beat, i) => {
    beat.beat_number = i + 1;
  });

  // Save updated scenario
  const saved = await storage.save(scenarioId, scenario);

  // Create version
  await versionControl.createVersion(
    scenarioId,
    saved,
    `Deleted beat ${deletedBeat.beat_number} from act ${act.act_number}`
  );

  // Invalidate caches
  cache.invalidate(`scenario:${scenarioId}`);
  cache.invalidate('scenarios:list');

  return res.status(200).json({
    success: true,
    message: 'Beat deleted successfully',
    deletedBeat
  });
}
