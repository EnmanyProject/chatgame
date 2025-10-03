/**
 * Scenarios API - Main CRUD Operations
 * @version 1.0.0
 * @description Vercel Serverless Function for scenario management
 */

const storage = require('../lib/scenario-storage');
const cache = require('../lib/scenario-cache');
const versionControl = require('../lib/scenario-version-control');
const { validateScenario } = require('../lib/scenario-validator');

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

    // GET - List or retrieve scenarios
    if (method === 'GET') {
      const { id, search } = req.query;

      // Get single scenario
      if (id) {
        return await getScenario(req, res, id);
      }

      // Search scenarios
      if (search) {
        return await searchScenarios(req, res, JSON.parse(search));
      }

      // List all scenarios
      return await listScenarios(req, res);
    }

    // POST - Create new scenario
    if (method === 'POST') {
      return await createScenario(req, res);
    }

    // PUT - Update existing scenario
    if (method === 'PUT') {
      return await updateScenario(req, res);
    }

    // DELETE - Delete scenario
    if (method === 'DELETE') {
      return await deleteScenario(req, res);
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
 * List all scenarios
 */
async function listScenarios(req, res) {
  // Check cache first
  const cacheKey = 'scenarios:list';
  const cached = cache.get(cacheKey);

  if (cached) {
    return res.status(200).json({
      success: true,
      data: cached,
      fromCache: true
    });
  }

  // Load from storage
  const scenarios = await storage.list();

  // Cache the result
  cache.set(cacheKey, scenarios);

  return res.status(200).json({
    success: true,
    data: scenarios,
    fromCache: false
  });
}

/**
 * Get single scenario by ID
 */
async function getScenario(req, res, scenarioId) {
  // Check cache
  const cacheKey = `scenario:${scenarioId}`;
  const cached = cache.get(cacheKey);

  if (cached) {
    return res.status(200).json({
      success: true,
      data: cached,
      fromCache: true
    });
  }

  // Load from storage
  const scenario = await storage.load(scenarioId);

  if (!scenario) {
    return res.status(404).json({
      success: false,
      error: 'Scenario not found'
    });
  }

  // Cache the result
  cache.set(cacheKey, scenario);

  return res.status(200).json({
    success: true,
    data: scenario,
    fromCache: false
  });
}

/**
 * Search scenarios by criteria
 */
async function searchScenarios(req, res, criteria) {
  const scenarios = await storage.search(criteria);

  return res.status(200).json({
    success: true,
    data: scenarios
  });
}

/**
 * Create new scenario
 */
async function createScenario(req, res) {
  const scenarioData = req.body;

  // Validate scenario
  const validation = validateScenario(scenarioData);
  if (!validation.valid) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      validationErrors: validation.errors
    });
  }

  // Generate ID if not provided
  const scenarioId = scenarioData.id || `scenario_${Date.now()}`;

  // Save to storage
  const saved = await storage.save(scenarioId, scenarioData);

  // Create initial version
  await versionControl.createVersion(scenarioId, saved, 'Initial version');

  // Invalidate list cache
  cache.invalidate('scenarios:list');

  return res.status(201).json({
    success: true,
    data: saved
  });
}

/**
 * Update existing scenario
 */
async function updateScenario(req, res) {
  const { id } = req.query;
  const scenarioData = req.body;

  if (!id) {
    return res.status(400).json({
      success: false,
      error: 'Scenario ID required'
    });
  }

  // Check if scenario exists
  const existing = await storage.load(id);
  if (!existing) {
    return res.status(404).json({
      success: false,
      error: 'Scenario not found'
    });
  }

  // Validate updated data
  const validation = validateScenario(scenarioData);
  if (!validation.valid) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      validationErrors: validation.errors
    });
  }

  // Increment version number
  const newVersion = (existing.version || 1) + 1;
  const updatedData = {
    ...scenarioData,
    version: newVersion
  };

  // Save updated scenario
  const saved = await storage.save(id, updatedData);

  // Create version snapshot
  await versionControl.createVersion(
    id,
    saved,
    req.body.versionComment || `Update to version ${newVersion}`
  );

  // Invalidate caches
  cache.invalidate(`scenario:${id}`);
  cache.invalidate('scenarios:list');

  return res.status(200).json({
    success: true,
    data: saved
  });
}

/**
 * Delete scenario
 */
async function deleteScenario(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({
      success: false,
      error: 'Scenario ID required'
    });
  }

  // Delete from storage
  const deleted = await storage.delete(id);

  if (!deleted) {
    return res.status(404).json({
      success: false,
      error: 'Scenario not found'
    });
  }

  // Invalidate caches
  cache.invalidate(`scenario:${id}`);
  cache.invalidate('scenarios:list');

  return res.status(200).json({
    success: true,
    message: 'Scenario deleted successfully'
  });
}
