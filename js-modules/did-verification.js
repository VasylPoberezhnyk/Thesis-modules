
/**
 * Валідація блоку налаштування багатофакторної аутентифікації (MFA)
 * @param {*} mfa - Об'єкт налаштування MFA, що містить алгоритм, тип крипвої, часовий інтервал та публічний ключ
 * @returns {Object} - Об'єкт з полем valid (boolean) та масивом errors (рядки з описом помилок, якщо є)
 */
function validateMFA(mfa) {
  const allowedAlgorithms = ["SHA-256", "Argon2id", "SHA-512"];
  const allowedTypes = ["Secp256k1", "Secp256r1", "ED25519"];
  const allowedTimeframes = ["30", "60", 30, 60];

  const errors = [];

  // Валідація алгоритму
  if (!allowedAlgorithms.includes(mfa.algorithm)) {
    errors.push(`Invalid algorithm: ${mfa.algorithm}`);
  }

  // Валідація типу крипвої
  if (!allowedTypes.includes(mfa.type)) {
    errors.push(`Invalid type: ${mfa.type}`);
  }

  // Валідація часового інтервалу дійності завджання
  if (!allowedTimeframes.includes(mfa.timeFrame)) {
    errors.push(`Invalid timeframe: ${mfa.timeFrame}`);
  }

  // Валідація публічного ключа (повинен бути валідним hex рядком)
  if (typeof mfa.publicKey !== "string" || !/^[0-9a-fA-F]+$/.test(mfa.publicKey)) {
    errors.push("Публічний ключ повинен бути валідним hex рядком");
  }

  return {
    valid: errors.length === 0,
    errors
  };
}


module.exports = {
  validateMFA
};