const params = process.argv.splice(2);
const express = require("express")
const crypto = require("crypto")

const maxLat = parseInt(params[1])
const port = params[0]
const availabliity = params[2]
const integrity = params[3]

const app = express()


app.get("/ping", (req, res) => {

    const lat = crypto.randomInt(10, maxLat + 1);
    if (Math.random() <= availabliity) {
        setTimeout(() => { return res.status(200).send("200OK!"); }, lat);
    } else {
        setTimeout(() => { return res.status(500).send("500!"); }, lat);
    }
});

app.get("/task", (req, res) => {
    if (Math.random() <= integrity) {
        res.status(200).send(true);
    } else {
        res.status(500).send(false);
    }

})

app.listen(port, () => {
    console.log("Симуліяцію вузла розпочато: ", `http://localhost:${port}`)
    console.log("Параметри вузла:");
    console.log("Надійність:", integrity);
    console.log("Доступність:", availabliity);
    console.log("Затримка:", maxLat);
})