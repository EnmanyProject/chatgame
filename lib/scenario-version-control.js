/**
 * Scenario Version Control Module
 * @version 1.0.0
 * @description Version management system with history and rollback capabilities
 */

const fs = require('fs').promises;
const path = require('path');

// Version storage paths
const VERSION_DIR = path.join(process.cwd(), 'data', 'scenarios', 'versions');

// Ensure version directory exists
async function ensureVersionDir() {
  try {
    await fs.mkdir(VERSION_DIR, { recursive: true });
  } catch (error) {
    console.error('Error creating version directory:', error);
  }
}

/**
 * Create new version snapshot
 * @param {string} scenarioId - Scenario ID
 * @param {Object} data - Scenario data
 * @param {string} comment - Version comment/description
 * @returns {Promise<Object>} Version metadata
 */
async function createVersion(scenarioId, data, comment = '') {
  await ensureVersionDir();

  const timestamp = Date.now();
  const versionId = `${scenarioId}-v${timestamp}`;
  const versionPath = path.join(VERSION_DIR, `${versionId}.json`);

  const versionData = {
    versionId,
    scenarioId,
    timestamp,
    createdAt: new Date().toISOString(),
    comment,
    data
  };

  await fs.writeFile(versionPath, JSON.stringify(versionData, null, 2), 'utf-8');

  return {
    versionId,
    scenarioId,
    timestamp,
    createdAt: versionData.createdAt,
    comment
  };
}

/**
 * Get version history for scenario
 * @param {string} scenarioId - Scenario ID
 * @returns {Promise<Array>} Array of version metadata
 */
async function getHistory(scenarioId) {
  await ensureVersionDir();

  try {
    const files = await fs.readdir(VERSION_DIR);
    const versions = [];

    for (const file of files) {
      if (file.startsWith(`${scenarioId}-v`) && file.endsWith('.json')) {
        const versionPath = path.join(VERSION_DIR, file);
        const content = await fs.readFile(versionPath, 'utf-8');
        const versionData = JSON.parse(content);

        versions.push({
          versionId: versionData.versionId,
          timestamp: versionData.timestamp,
          createdAt: versionData.createdAt,
          comment: versionData.comment
        });
      }
    }

    // Sort by timestamp descending (newest first)
    return versions.sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    console.error('Error reading version history:', error);
    return [];
  }
}

/**
 * Get specific version data
 * @param {string} versionId - Version ID
 * @returns {Promise<Object|null>} Version data or null if not found
 */
async function getVersion(versionId) {
  try {
    const versionPath = path.join(VERSION_DIR, `${versionId}.json`);
    const content = await fs.readFile(versionPath, 'utf-8');
    const versionData = JSON.parse(content);

    return versionData;
  } catch (error) {
    if (error.code === 'ENOENT') {
      return null;
    }
    throw error;
  }
}

/**
 * Rollback to specific version
 * @param {string} versionId - Version ID to rollback to
 * @returns {Promise<Object>} Restored scenario data
 */
async function rollback(versionId) {
  const versionData = await getVersion(versionId);

  if (!versionData) {
    throw new Error(`Version not found: ${versionId}`);
  }

  // Return the scenario data from that version
  return versionData.data;
}

/**
 * Compare two versions
 * @param {string} versionId1 - First version ID
 * @param {string} versionId2 - Second version ID
 * @returns {Promise<Object>} Comparison result
 */
async function compareVersions(versionId1, versionId2) {
  const version1 = await getVersion(versionId1);
  const version2 = await getVersion(versionId2);

  if (!version1 || !version2) {
    throw new Error('One or both versions not found');
  }

  // Basic comparison - can be enhanced with detailed diff
  return {
    version1: {
      versionId: version1.versionId,
      createdAt: version1.createdAt,
      comment: version1.comment
    },
    version2: {
      versionId: version2.versionId,
      createdAt: version2.createdAt,
      comment: version2.comment
    },
    changes: {
      metadataChanged: JSON.stringify(version1.data.metadata) !== JSON.stringify(version2.data.metadata),
      structureChanged: JSON.stringify(version1.data.structure) !== JSON.stringify(version2.data.structure),
      compatibilityChanged: JSON.stringify(version1.data.compatibility) !== JSON.stringify(version2.data.compatibility)
    }
  };
}

/**
 * Delete old versions (cleanup)
 * @param {string} scenarioId - Scenario ID
 * @param {number} keepCount - Number of recent versions to keep
 * @returns {Promise<number>} Number of deleted versions
 */
async function cleanupOldVersions(scenarioId, keepCount = 10) {
  const history = await getHistory(scenarioId);

  if (history.length <= keepCount) {
    return 0;
  }

  const versionsToDelete = history.slice(keepCount);
  let deletedCount = 0;

  for (const version of versionsToDelete) {
    try {
      const versionPath = path.join(VERSION_DIR, `${version.versionId}.json`);
      await fs.unlink(versionPath);
      deletedCount++;
    } catch (error) {
      console.error(`Error deleting version ${version.versionId}:`, error);
    }
  }

  return deletedCount;
}

// Export for Node.js
module.exports = {
  createVersion,
  getHistory,
  getVersion,
  rollback,
  compareVersions,
  cleanupOldVersions
};
