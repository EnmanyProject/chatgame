/**
 * Scenario API Client
 * @version 1.0.0
 * @description Frontend client for scenario API operations
 */

// API base URL (adjust for production)
const API_BASE_URL = '/api';

/**
 * API Client Class
 */
class ScenarioAPIClient {
  /**
   * List all scenarios
   */
  async listScenarios() {
    try {
      const response = await fetch(`${API_BASE_URL}/scenarios`);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to list scenarios');
      }

      return result.data;
    } catch (error) {
      console.error('Error listing scenarios:', error);
      throw error;
    }
  }

  /**
   * Get scenario by ID
   */
  async getScenario(scenarioId) {
    try {
      const response = await fetch(`${API_BASE_URL}/scenarios?id=${scenarioId}`);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to get scenario');
      }

      return result.data;
    } catch (error) {
      console.error('Error getting scenario:', error);
      throw error;
    }
  }

  /**
   * Search scenarios
   */
  async searchScenarios(criteria) {
    try {
      const searchParam = encodeURIComponent(JSON.stringify(criteria));
      const response = await fetch(`${API_BASE_URL}/scenarios?search=${searchParam}`);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to search scenarios');
      }

      return result.data;
    } catch (error) {
      console.error('Error searching scenarios:', error);
      throw error;
    }
  }

  /**
   * Create new scenario
   */
  async createScenario(scenarioData) {
    try {
      const response = await fetch(`${API_BASE_URL}/scenarios`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(scenarioData)
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to create scenario');
      }

      return result.data;
    } catch (error) {
      console.error('Error creating scenario:', error);
      throw error;
    }
  }

  /**
   * Update existing scenario
   */
  async updateScenario(scenarioId, scenarioData, versionComment = '') {
    try {
      const response = await fetch(`${API_BASE_URL}/scenarios?id=${scenarioId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...scenarioData,
          versionComment
        })
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to update scenario');
      }

      return result.data;
    } catch (error) {
      console.error('Error updating scenario:', error);
      throw error;
    }
  }

  /**
   * Delete scenario
   */
  async deleteScenario(scenarioId) {
    try {
      const response = await fetch(`${API_BASE_URL}/scenarios?id=${scenarioId}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to delete scenario');
      }

      return true;
    } catch (error) {
      console.error('Error deleting scenario:', error);
      throw error;
    }
  }

  /**
   * List acts in scenario
   */
  async listActs(scenarioId) {
    try {
      const response = await fetch(`${API_BASE_URL}/scenarios-acts?scenarioId=${scenarioId}`);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to list acts');
      }

      return result.data;
    } catch (error) {
      console.error('Error listing acts:', error);
      throw error;
    }
  }

  /**
   * Add new act
   */
  async addAct(scenarioId, actData) {
    try {
      const response = await fetch(`${API_BASE_URL}/scenarios-acts?scenarioId=${scenarioId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(actData)
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to add act');
      }

      return result.data;
    } catch (error) {
      console.error('Error adding act:', error);
      throw error;
    }
  }

  /**
   * Update act
   */
  async updateAct(scenarioId, actIndex, actData) {
    try {
      const response = await fetch(`${API_BASE_URL}/scenarios-acts?scenarioId=${scenarioId}&actIndex=${actIndex}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(actData)
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to update act');
      }

      return result.data;
    } catch (error) {
      console.error('Error updating act:', error);
      throw error;
    }
  }

  /**
   * Delete act
   */
  async deleteAct(scenarioId, actIndex) {
    try {
      const response = await fetch(`${API_BASE_URL}/scenarios-acts?scenarioId=${scenarioId}&actIndex=${actIndex}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to delete act');
      }

      return true;
    } catch (error) {
      console.error('Error deleting act:', error);
      throw error;
    }
  }

  /**
   * List beats in act
   */
  async listBeats(scenarioId, actIndex) {
    try {
      const response = await fetch(`${API_BASE_URL}/scenarios-beats?scenarioId=${scenarioId}&actIndex=${actIndex}`);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to list beats');
      }

      return result.data;
    } catch (error) {
      console.error('Error listing beats:', error);
      throw error;
    }
  }

  /**
   * Add new beat
   */
  async addBeat(scenarioId, actIndex, beatData) {
    try {
      const response = await fetch(`${API_BASE_URL}/scenarios-beats?scenarioId=${scenarioId}&actIndex=${actIndex}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(beatData)
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to add beat');
      }

      return result.data;
    } catch (error) {
      console.error('Error adding beat:', error);
      throw error;
    }
  }

  /**
   * Update beat
   */
  async updateBeat(scenarioId, actIndex, beatIndex, beatData) {
    try {
      const response = await fetch(`${API_BASE_URL}/scenarios-beats?scenarioId=${scenarioId}&actIndex=${actIndex}&beatIndex=${beatIndex}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(beatData)
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to update beat');
      }

      return result.data;
    } catch (error) {
      console.error('Error updating beat:', error);
      throw error;
    }
  }

  /**
   * Delete beat
   */
  async deleteBeat(scenarioId, actIndex, beatIndex) {
    try {
      const response = await fetch(`${API_BASE_URL}/scenarios-beats?scenarioId=${scenarioId}&actIndex=${actIndex}&beatIndex=${beatIndex}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to delete beat');
      }

      return true;
    } catch (error) {
      console.error('Error deleting beat:', error);
      throw error;
    }
  }

  /**
   * Validate data
   */
  async validate(type, data, context = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}/scenarios-validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type,
          data,
          context
        })
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Validation failed');
      }

      return result.validation;
    } catch (error) {
      console.error('Error validating:', error);
      throw error;
    }
  }
}

// Create singleton instance
const scenarioAPI = new ScenarioAPIClient();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = scenarioAPI;
}

// Browser export
if (typeof window !== 'undefined') {
  window.ScenarioAPI = scenarioAPI;
}
