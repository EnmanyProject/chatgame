/**
 * Scenario Storage Module
 * @version 1.0.0
 * @description File-based storage system for scenarios with CRUD operations
 */

const fs = require('fs').promises;
const path = require('path');

// Storage paths
const DATA_DIR = path.join(process.cwd(), 'data', 'scenarios');
const BACKUP_DIR = path.join(DATA_DIR, 'backups');

// Ensure directories exist
async function ensureDirectories() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.mkdir(BACKUP_DIR, { recursive: true });
  } catch (error) {
    console.error('Error creating directories:', error);
  }
}

/**
 * Save scenario to file
 * @param {string} scenarioId - Scenario ID
 * @param {Object} data - Scenario data
 * @returns {Promise<Object>} Saved scenario with metadata
 */
async function save(scenarioId, data) {
  await ensureDirectories();

  const filePath = getPath(scenarioId);
  const scenarioWithMeta = {
    ...data,
    id: scenarioId,
    savedAt: new Date().toISOString(),
    version: data.version || 1
  };

  await fs.writeFile(filePath, JSON.stringify(scenarioWithMeta, null, 2), 'utf-8');

  return scenarioWithMeta;
}

/**
 * Load scenario from file
 * @param {string} scenarioId - Scenario ID
 * @returns {Promise<Object|null>} Scenario data or null if not found
 */
async function load(scenarioId) {
  try {
    const filePath = getPath(scenarioId);
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return null; // File not found
    }
    throw error;
  }
}

/**
 * Delete scenario file
 * @param {string} scenarioId - Scenario ID
 * @returns {Promise<boolean>} Success status
 */
async function deleteScenario(scenarioId) {
  try {
    const filePath = getPath(scenarioId);
    await fs.unlink(filePath);
    return true;
  } catch (error) {
    if (error.code === 'ENOENT') {
      return false; // File already deleted
    }
    throw error;
  }
}

/**
 * List all scenarios
 * @returns {Promise<Array>} Array of scenario metadata
 */
async function list() {
  await ensureDirectories();

  try {
    const files = await fs.readdir(DATA_DIR);
    const scenarios = [];

    for (const file of files) {
      if (file.endsWith('.json') && !file.includes('backup-')) {
        const filePath = path.join(DATA_DIR, file);
        const content = await fs.readFile(filePath, 'utf-8');
        const scenario = JSON.parse(content);

        scenarios.push({
          id: scenario.id,
          title: scenario.metadata?.title || 'Untitled',
          genre: scenario.metadata?.genre || 'unknown',
          sexy_level: scenario.metadata?.sexy_level || 0,
          savedAt: scenario.savedAt,
          version: scenario.version || 1
        });
      }
    }

    return scenarios;
  } catch (error) {
    console.error('Error listing scenarios:', error);
    return [];
  }
}

/**
 * Search scenarios by criteria
 * @param {Object} criteria - Search criteria
 * @returns {Promise<Array>} Matching scenarios
 */
async function search(criteria) {
  const allScenarios = await list();

  return allScenarios.filter(scenario => {
    let matches = true;

    if (criteria.genre && scenario.genre !== criteria.genre) {
      matches = false;
    }

    if (criteria.sexy_level !== undefined && scenario.sexy_level !== criteria.sexy_level) {
      matches = false;
    }

    if (criteria.title && !scenario.title.toLowerCase().includes(criteria.title.toLowerCase())) {
      matches = false;
    }

    return matches;
  });
}

/**
 * Create backup of scenario
 * @param {string} scenarioId - Scenario ID
 * @returns {Promise<string>} Backup file path
 */
async function backup(scenarioId) {
  await ensureDirectories();

  const scenario = await load(scenarioId);
  if (!scenario) {
    throw new Error(`Scenario not found: ${scenarioId}`);
  }

  const timestamp = Date.now();
  const backupFileName = `backup-${scenarioId}-${timestamp}.json`;
  const backupPath = path.join(BACKUP_DIR, backupFileName);

  await fs.writeFile(backupPath, JSON.stringify(scenario, null, 2), 'utf-8');

  return backupPath;
}

/**
 * Restore scenario from backup
 * @param {string} backupPath - Backup file path
 * @returns {Promise<Object>} Restored scenario
 */
async function restore(backupPath) {
  const content = await fs.readFile(backupPath, 'utf-8');
  const scenario = JSON.parse(content);

  return await save(scenario.id, scenario);
}

/**
 * Get file path for scenario
 * @param {string} scenarioId - Scenario ID
 * @returns {string} File path
 */
function getPath(scenarioId) {
  return path.join(DATA_DIR, `${scenarioId}.json`);
}

// Export for Node.js
module.exports = {
  save,
  load,
  delete: deleteScenario,
  list,
  search,
  backup,
  restore,
  getPath
};
