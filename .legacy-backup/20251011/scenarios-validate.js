/**
 * Scenarios Validate API - Validation Endpoint
 * @version 1.0.0
 * @description Vercel Serverless Function for scenario validation
 */

const { validateScenario, validateMetadata, validateStructure, validateBeat, validateChoice } = require('../lib/scenario-validator');

/**
 * Serverless function handler
 */
module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Only POST is allowed
    if (req.method !== 'POST') {
      return res.status(405).json({
        success: false,
        error: 'Method not allowed'
      });
    }

    const { type, data, context } = req.body;

    if (!type || !data) {
      return res.status(400).json({
        success: false,
        error: 'Validation type and data required'
      });
    }

    let result;

    // Validate based on type
    switch (type) {
      case 'scenario':
        result = validateScenario(data);
        break;

      case 'metadata':
        result = validateMetadata(data);
        break;

      case 'structure':
        result = validateStructure(data);
        break;

      case 'beat':
        result = validateBeat(data, context || {});
        break;

      case 'choice':
        result = validateChoice(data, context || {});
        break;

      default:
        return res.status(400).json({
          success: false,
          error: `Unknown validation type: ${type}`
        });
    }

    // Return validation result
    return res.status(200).json({
      success: true,
      validation: result
    });

  } catch (error) {
    console.error('Validation API Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
