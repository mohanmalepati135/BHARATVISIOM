/**
 * Fisher-Yates shuffle. Used to randomize which physical image (OpenAI / Gemini 2.5 / Gemini 3.1)
 * lands in slot A, B, or C for each participant, so evaluation stays blind and unbiased.
 */
const shuffle = (array) => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

module.exports = shuffle;
