require('dotenv').config()
const { PinataSDK } = require("pinata");


const pinata = new PinataSDK({
    pinataGateway: process.env.PINATA_GATEWAY,
    pinataGatewayKey: process.env.PINATA_KEY,
    pinataJwt: process.env.PINATA_JWT
});

async function getFromIPFS(cid) {
    try {
        const data = await pinata.gateways.public.get(cid);
        return data;
    } catch (error) {
        console.log(error);
    }
}


async function uploadToIPFS(data) {
    try {
        const file = new File(["hello world!"], "hello.txt", { type: "text/plain" });
        const upload = await pinata.upload.public.file(file);
        console.log(upload);
        return upload;
    } catch (error) {
        console.log(error);
    }
}


module.exports = { getFromIPFS, uploadToIPFS }