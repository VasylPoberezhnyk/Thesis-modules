const crypto = require("crypto");

/**
 * Перевіряє цифровий підпис
 * @param {*} publicKey 
 * @param {*} data 
 * @param {*} signature 
 * @returns 
 */
function checkSignature(publicKey, data, signature) {
    const verify = crypto.createVerify("SHA256");
    const pubK = hexToPublicKey(publicKey);
    verify.update(data);
    return verify.verify(pubK, signature, "hex");
}

/**
 * Створює цифровий підпис
 * @param {*} privateKey 
 * @param {*} data 
 * @returns 
 */
function sign(privateKey, data) {
    const sign = crypto.createSign("SHA256");
    const privK = hexToPrivateKey(privateKey);
    sign.update(data);
    return sign.sign(privK, "hex");
}

/**
 * Конвертує хекс рядок в публічний ключ
 * @param {*} hexString 
 * @returns 
 */
function hexToPublicKey(hexString) {
    const buffer = Buffer.from(hexString, "hex");
    return crypto.createPublicKey({
        key: buffer,
        format: "der",
        type: "spki",
    });
}

/**
 * Конвертує хекс рядок в приватний ключ
 * @param {*} hexString 
 * @returns 
 */
function hexToPrivateKey(hexString) {
    const buffer = Buffer.from(hexString, "hex");
    return crypto.createPrivateKey({
        key: buffer,
        format: "der",
        type: "pkcs8",
    });
}

/**
 * Генерує пару ключів
 * @returns Oб'єкт з полями publicKey та privateKey, які є DER-кодованими ключами у форматі hex
 */
function generateKeyPair() {
    let keyPair =
        crypto.generateKeyPairSync("ec", {
            namedCurve: "secp256k1",
            publicKeyEncoding: {
                type: "spki",
                format: "der"
            },
            privateKeyEncoding: {
                type: "pkcs8",
                format: "der"
            }
        });
    return keyPair;
}


module.exports = { checkSignature, hexToPublicKey, generateKeyPair, sign };