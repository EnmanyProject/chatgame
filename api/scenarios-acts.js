/**
 * Scenarios Acts API - Act Management
 * @version 1.0.0
 * @description Vercel Serverless Function for act-level operations
 */

const storage = require('../lib/scenario-storage');
const cache = require('../lib/scenario-cache');
const versionControl = require('../lib/scenario-version-control');

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
    const { scenarioId } = req.query;

    if (!scenarioId) {
      return res.status(400).json({
        success: false,
        error: 'Scenario ID required'
      });
    }

    // GET - List acts
    if (method === 'GET') {
      return await listActs(req, res, scenarioId);
    }

    // POST - Add new act
    if (method === 'POST') {
      return await addAct(req, res, scenarioId);
    }

    // PUT - Update act
    if (method === 'PUT') {
      return await updateAct(req, res, scenarioId);
    }

    // DELETE - Delete act
    if (method === 'DELETE') {
      return await deleteAct(req, res, scenarioId);
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
 * List all acts in scenario
 */
async function listActs(req, res, scenarioId) {
  const scenario = await storage.load(scenarioId);

  if (!scenario) {
    return res.status(404).json({
      success: false,
      error: 'Scenario not found'
    });
  }

  return res.status(200).json({
    success: true,
    data: scenario.structure.acts
  });
}

/**
 * Add new act to scenario
 */
async function addAct(req, res, scenarioId) {
  const actData = req.body;

  // Load scenario
  const scenario = await storage.load(scenarioId);

  if (!scenario) {
    return res.status(404).json({
      success: false,
      error: 'Scenario not found'
    });
  }

  // Generate act number
  const actNumber = scenario.structure.acts.length + 1;

  // Create new act
  const newAct = {
    act_number: actNumber,
    act_title: actData.act_title || `Act ${actNumber}`,
    act_description: actData.act_description || '',
    beats: actData.beats || []
  };

  // Add to scenario
  scenario.structure.acts.push(newAct);

  // Save updated scenario
  const saved = await storage.save(scenarioId, scenario);

  // Create version
  await versionControl.createVersion(
    scenarioId,
    saved,
    `Added act ${actNumber}: ${newAct.act_title}`
  );

  // Invalidate caches
  cache.invalidate(`scenario:${scenarioId}`);
  cache.invalidate('scenarios:list');

  return res.status(201).json({
    success: true,
    data: newAct
  });
}

/**
 * Update existing act
 */
async function updateAct(req, res, scenarioId) {
  const { actIndex } = req.query;
  const actData = req.body;

  if (actIndex === undefined) {
    return res.status(400).json({
      success: false,
      error: 'Act index required'
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

  const index = parseInt(actIndex);

  if (index < 0 || index >= scenario.structure.acts.length) {
    return res.status(400).json({
      success: false,
      error: 'Invalid act index'
    });
  }

  // Update act
  scenario.structure.acts[index] = {
    ...scenario.structure.acts[index],
    ...actData,
    act_number: scenario.structure.acts[index].act_number // Preserve act number
  };

  // Save updated scenario
  const saved = await storage.save(scenarioId, scenario);

  // Create version
  await versionControl.createVersion(
    scenarioId,
    saved,
    `Updated act ${scenario.structure.acts[index].act_number}`
  );

  // Invalidate caches
  cache.invalidate(`scenario:${scenarioId}`);
  cache.invalidate('scenarios:list');

  return res.status(200).json({
    success: true,
    data: scenario.structure.acts[index]
  });
}

/**
 * Delete act from scenario
 */
async function deleteAct(req, res, scenarioId) {
  const { actIndex } = req.query;

  if (actIndex === undefined) {
    return res.status(400).json({
      success: false,
      error: 'Act index required'
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

  const index = parseInt(actIndex);

  if (index < 0 || index >= scenario.structure.acts.length) {
    return res.status(400).json({
      success: false,
      error: 'Invalid act index'
    });
  }

  // Remove act
  const deletedAct = scenario.structure.acts.splice(index, 1)[0];

  // Renumber remaining acts
  scenario.structure.acts.forEach((act, i) => {
    act.act_number = i + 1;
  });

  // Save updated scenario
  const saved = await storage.save(scenarioId, scenario);

  // Create version
  await versionControl.createVersion(
    scenarioId,
    saved,
    `Deleted act: ${deletedAct.act_title}`
  );

  // Invalidate caches
  cache.invalidate(`scenario:${scenarioId}`);
  cache.invalidate('scenarios:list');

  return res.status(200).json({
    success: true,
    message: 'Act deleted successfully',
    deletedAct
  });
}
