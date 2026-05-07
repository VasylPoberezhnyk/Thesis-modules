const crypto = require('crypto');
const argon2 = require('argon2');

/**
 * Генерує 256-байтовий ключ з пароля за допомогою Argon2id
 * @param {string} password - Пароль
 * @param {Buffer} salt - Сіль
 * @returns {Buffer} - Ключ довжиною 32 байти
 */

async function deriveKey(password, salt) {
    const hash = await argon2.hash(password, {
        type: argon2.argon2id,
        memoryCost: 65536,
        timeCost: 3,
        parallelism: 4,
        hashLength: 32,
        salt
    });

    const hexPart = hash.split('$').pop();
    const fullBuffer = Buffer.from(hexPart);

    const keyBuffer = Buffer.alloc(32);
    for (let i = 0; i < 32; i++) {
        keyBuffer[i] = fullBuffer[i];
    }
    return keyBuffer;
}


(async () => {
    const password = "Безпечний пароль"
    const salt = crypto.randomBytes(16);
    const salt2 = crypto.randomBytes(16);

    const password1 = await deriveKey(password, salt);
    const password2 = await deriveKey(password, salt);

    console.log("Вхідні параметри для генерації ключа:");
    console.log(`Пароль: ${password}\nСіль для ключів 1,2: ${salt}\nСіль для ключа 3: ${salt2}`
    )

    console.log("\nКлючі згенерований із однаковими паролем і сіллю:")
    console.log(`Ключ 1: ${password1}\nКлюч 2: ${password2}`)

    const password3 = await deriveKey(password, salt2);

    console.log("\nКлючі згенерований із однаковим паролем, але різною сіллю:")
    console.log(`Ключ 1: ${password1}\nКлюч 3: ${password3}`)

})();


module.exports = {
    deriveKey
}