/**
 * Episodes API - Episode Generation
 * @version 1.0.0
 * @description Vercel Serverless Function for episode generation
 */

const { generateEpisode } = require('../lib/episode-generator');
const storage = require('../lib/scenario-storage');

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

    const { action } = req.query;

    if (action === 'generate') {
      return await generateEpisodeHandler(req, res);
    }

    return res.status(400).json({
      success: false,
      error: 'Invalid action'
    });

  } catch (error) {
    console.error('Episodes API Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Generate episode handler
 */
async function generateEpisodeHandler(req, res) {
  const { scenario_id, character_id, game_state, context } = req.body;

  if (!scenario_id || !character_id || !game_state) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields'
    });
  }

  try {
    // Load scenario
    const scenario = await storage.load(scenario_id);
    if (!scenario) {
      return res.status(404).json({
        success: false,
        error: 'Scenario not found'
      });
    }

    // For now, use a mock character
    // In production, load from character storage
    const character = {
      id: character_id,
      basic_info: {
        name: "윤아",
        age: 22,
        mbti: "INFP",
        occupation: "대학생"
      },
      personality_traits: ["감성적", "따뜻함"],
      appeal_profile: {
        charm_points: ["미소", "눈빛"]
      },
      conversation_dynamics: {
        speech_style: "부드럽고 따뜻한"
      }
    };

    // Generate episode
    const episode = await generateEpisode(
      scenario,
      character,
      game_state,
      context || {}
    );

    return res.status(200).json({
      success: true,
      episode
    });

  } catch (error) {
    console.error('Generate episode error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
