
const express = require('express');
const bodyParser = require('body-parser');
const ping = require('ping');
const fs = require("fs")
const app = express();
app.use(bodyParser.json());

const repStats = []
const dateStart = Date.now();


const MAX_LAT = 100;
app.get("/", (req, res) => {
    res.send(1);
});

const rep = {
    availability: 0.5,
    integrity: 0.5,
    latency: 0.5,
    reputation: 0.5,

    calculate: function () {
        this.reputation = this.availability * 0.3 + this.integrity * 0.5 + this.latency * 0.2;
        return this.reputation;
    },

    add: function (param, value) {
        this[param] += value;
        if (this[param] > 1) this[param] = 1;
        if (this[param] < 0) this[param] = 0;
    }
}


const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);

    async function calculateRep() {
        const start = Date.now();
        const res = await fetch("http://127.0.0.1:4041/ping", { method: "GET" });
        const taskRes = await fetch("http://127.0.0.1:4041/task", { method: "GET" })

        const lat = Date.now() - start;
        console.log(lat)
        if (res.status == 200) {
            rep.add("availability", 0.001);
        } else {
            rep.add("availability", -0.001);
        }

        if (taskRes.status == 200) {
            rep.add("integrity", 0.001);
        } else {
            rep.add("integrity", -0.01);
        }

        let l = 1 - (lat / MAX_LAT);
        l = l > 1 ? 1 : l < 0 ? 0 : l;
        rep.latency = l;
        rep.calculate()
        console.log(rep)
        repStats.push({ a: rep.availability, l: rep.latency, i: rep.integrity, r: rep.reputation })
    }

    const a = setInterval(calculateRep, 10);
    setInterval(() => {
        fs.writeFileSync("data_badNode.json", JSON.stringify(repStats));
    }, 20000)
        ;
});
