/**
 * Episode Effects Module
 * @version 1.0.0
 * @description UI effects and animations for episode player
 */

/**
 * Typewriter effect
 * @param {string} text - Text to type
 * @param {HTMLElement} element - Element to type into
 * @param {number} speed - Typing speed in ms
 * @returns {Promise<void>}
 */
async function typewriterEffect(text, element, speed = 40) {
  element.textContent = '';

  for (let i = 0; i < text.length; i++) {
    element.textContent += text[i];
    await new Promise(resolve => setTimeout(resolve, speed));
  }
}

/**
 * Fade in message
 * @param {HTMLElement} element - Element to fade in
 * @returns {Promise<void>}
 */
async function fadeInMessage(element) {
  element.style.opacity = '0';
  element.style.transform = 'translateY(10px)';

  await new Promise(resolve => setTimeout(resolve, 10));

  element.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
  element.style.opacity = '1';
  element.style.transform = 'translateY(0)';

  await new Promise(resolve => setTimeout(resolve, 300));
}

/**
 * Slide in choices
 * @param {HTMLElement} container - Choices container
 */
function slideInChoices(container) {
  const buttons = container.querySelectorAll('.choice-button');

  buttons.forEach((button, index) => {
    button.style.opacity = '0';
    button.style.transform = 'translateX(-20px)';

    setTimeout(() => {
      button.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      button.style.opacity = '1';
      button.style.transform = 'translateX(0)';
    }, index * 100);
  });
}

/**
 * Pulse affection bar
 * @param {HTMLElement} element - Affection bar element
 */
function pulseAffectionBar(element) {
  element.style.transition = 'transform 0.2s ease';
  element.style.transform = 'scale(1.05)';

  setTimeout(() => {
    element.style.transform = 'scale(1)';
  }, 200);
}

/**
 * Shake screen effect
 */
function shakeScreen() {
  const container = document.querySelector('.player-container');
  if (!container) return;

  container.style.animation = 'shake 0.5s ease';

  setTimeout(() => {
    container.style.animation = '';
  }, 500);
}

/**
 * Show emoji effect
 * @param {string} emoji - Emoji character
 * @param {object} position - {x, y} position
 */
function showEmoji(emoji, position = { x: 50, y: 50 }) {
  const emojiDiv = document.createElement('div');
  emojiDiv.textContent = emoji;
  emojiDiv.style.cssText = `
    position: fixed;
    left: ${position.x}%;
    top: ${position.y}%;
    font-size: 48px;
    pointer-events: none;
    animation: emojiFloat 1s ease-out forwards;
    z-index: 9999;
  `;

  document.body.appendChild(emojiDiv);

  setTimeout(() => {
    emojiDiv.remove();
  }, 1000);
}

// Add emoji float animation
const style = document.createElement('style');
style.textContent = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-10px); }
    75% { transform: translateX(10px); }
  }

  @keyframes emojiFloat {
    0% {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
    100% {
      opacity: 0;
      transform: translateY(-50px) scale(1.5);
    }
  }
`;
document.head.appendChild(style);

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.EpisodeEffects = {
    typewriterEffect,
    fadeInMessage,
    slideInChoices,
    pulseAffectionBar,
    shakeScreen,
    showEmoji
  };
}
