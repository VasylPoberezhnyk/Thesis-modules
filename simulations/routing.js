const crypto = require("crypto");

const node = {
    "nodeA": {
        id: "NODE-A",
        users: ["user1", "user2", "user15", "user16"]
    },
    "nodeB": {
        id: "NODE-B",
        users: ["user3", "user4"]
    },
    "nodeC": {
        id: "NODE-C",
        users: ["user5", "user6", "user11", "user12"]
    },
    "nodeD": {
        id: "NODE-D",
        users: ["user7", "user8"]
    },
    "nodeE": {
        id: "NODE-E",
        users: ["user9", "user10", "user13", "user14"]
    },
    "nodeF": {
        id: "NODE-F",
        users: []
    }
}

const network = {
    "Cluster1": {
        "id": "CLUSTER-1",
        nodes: [node.nodeA, node.nodeB]
    },
    "Cluster2": {
        "id": "CLUSTER-2",
        "nodes": [node.nodeC, node.nodeD, node.nodeE]
    },
    "Cluster3": {
        "id": "CLUSTER-3",
        "nodes": [node.nodeF]
    }
}


const roundIterations = [];
const routes = new Map();

function findPathByHash(reciever, node, thisCluster, isSameNode = false, testNetwork = network) {
    let isPathFound = false;
    let nodeId = null;
    let recieverCluster = null;
    let cluster;
    let iteration = 0;

    if (routes.has(reciever)) {
        iteration++;
        console.log(`Операцій пошуку: ${iteration}`);
        roundIterations.push(iteration);
        return routes.get(reciever);
    }

    //Перевірка свого кластеру за хешем
    for (const node of testNetwork[thisCluster].nodes) {
        iteration++;
        if (node.hashes.includes(crypto.createHash("md5").update(`${node.id}:${reciever}`).digest("hex"))) {
            isPathFound = true;
            nodeId = node.id;
            break;
        }
    }

    if (isPathFound) {
        console.log(`Операцій пошуку: ${iteration}`);
        roundIterations.push(iteration);
        routes.set(reciever, `${thisCluster} -> ${nodeId} -> ${reciever}`);
        return `${thisCluster} -> ${nodeId} -> ${reciever}`;
    }

    //Перевірка іншгих кластерів за хешем
    for (const clusterKey in testNetwork) {
        iteration++;
        if (clusterKey !== thisCluster) {
            const cluster = testNetwork[clusterKey];
            for (const node of cluster.nodes) {
                iteration++;
                if (node.hashes.includes(crypto.createHash("md5").update(`${node.id}:${reciever}`).digest("hex"))) {
                    isPathFound = true;
                    nodeId = node.id;
                    break;
                }
            }
            if (isPathFound) {
                console.log(`Операцій пошуку: ${iteration}`);
                roundIterations.push(iteration);
                routes.set(reciever, `${clusterKey} -> ${nodeId} -> ${reciever}`);
                return `${clusterKey} -> ${nodeId} -> ${reciever}`;
            }
        }
    }
    console.log(reciever)

    // Пошук в тому ж вузлі
    if (isSameNode && node.users.includes(reciever)) {
        iteration++;
        console.log(`Операцій пошуку: ${iteration}`);
        roundIterations.push(iteration);
        routes.set(reciever, `${thisCluster} -> ${node.id} -> ${reciever}`);
        return `${thisCluster} -> ${node.id} -> ${reciever}`;
    }

    // Пошук всередині кластера
    cluster = testNetwork[thisCluster];
    nodeId = cluster["nodes"].find(n => { iteration++; return n.users.includes(reciever) })?.id;

    // Повертає шдях якщо користувач в цьому кластері
    if (nodeId) {
        isPathFound = true;
        console.log(`Операцій пошуку: ${iteration}`);
        roundIterations.push(iteration);
        routes.set(reciever, `${thisCluster} -> ${nodeId} -> ${reciever}`);
        return `${thisCluster} -> ${nodeId} -> ${reciever}`;
    }

    // Пошук в інших кластерах
    for (const clusterKey in testNetwork) {
        iteration++;
        if (clusterKey !== thisCluster) {
            cluster = testNetwork[clusterKey];
            nodeId = cluster.nodes.find(n => { iteration++; return n.users.includes(reciever) })?.id;
            if (nodeId) {
                isPathFound = true;
                recieverCluster = clusterKey;
                break;
            }
        }
    }

    if (isPathFound) {
        console.log(`Операцій пошуку: ${iteration}`);
        roundIterations.push(iteration);
        routes.set(reciever, `${recieverCluster} -> ${nodeId} -> ${reciever}`);
        return `${recieverCluster} -> ${nodeId} -> ${reciever}`;
    }
    roundIterations.push(iteration);
    console.log(`Операцій пошуку: ${iteration}`);
    return null;
}



const allUsers = [];

function generateNetwork({ clusterRange = [1, 10], nodeRange = [1, 10], userRange = [0, 10] } = {}) {
    const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
    const clustersCount = getRandomInt(clusterRange[0], clusterRange[1]);
    const network = {};

    for (let i = 1; i <= clustersCount; i++) {
        const clusterId = `CLUSTER-${i}`;
        const nodesCount = getRandomInt(nodeRange[0], nodeRange[1]);
        const nodes = [];

        for (let j = 1; j <= nodesCount; j++) {
            const nodeId = `NODE-${i}-${j}`;
            const usersCount = getRandomInt(userRange[0], userRange[1]);
            const users = [];
            for (let k = 1; k <= usersCount; k++) {
                users.push(`user${i}${j}${k}`);
                allUsers.push(`user${i}${j}${k}`);
            }
            nodes.push({ id: nodeId, users });
        }

        network[`Cluster${i}`] = { id: clusterId, nodes };
    }
    return network;
}


function generateHashedNetwork({ clusterRange = [1, 24], nodeRange = [1, 10], userRange = [1, 100] } = {}) {
    const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
    const clustersCount = getRandomInt(clusterRange[0], clusterRange[1]);
    const network = {};

    for (let i = 1; i <= clustersCount; i++) {
        const clusterId = `CLUSTER-${i}`;
        const nodesCount = getRandomInt(nodeRange[0], nodeRange[1]);
        const nodes = [];
        const hashes = [];

        for (let j = 1; j <= nodesCount; j++) {
            const nodeId = `NODE-${i}-${j}`;
            const usersCount = getRandomInt(userRange[0], userRange[1]);
            const users = [];
            for (let k = 1; k <= usersCount; k++) {
                users.push(`user${i}${j}${k}`);
                allUsers.push(`user${i}${j}${k}`);
                let hashAddr = crypto.createHash("md5").update(`NODE-${i}-${j}:user${i}${j}${k}`).digest("hex");
                hashes.push(hashAddr);
            }
            nodes.push({ id: nodeId, users, hashes });
        }

        network[`Cluster${i}`] = { id: clusterId, nodes };
    }
    return network;
}


function getRandomNode(network) {
    const clusters = Object.values(network);
    if (clusters.length === 0) return null;

    // Вибираємо випадковий кластер
    const randomCluster = clusters[Math.floor(Math.random() * clusters.length)];

    // Якщо у кластері немає вузлів
    if (randomCluster.nodes.length === 0) return null;

    // Вибираємо випадковий вузол
    const randomNode = randomCluster.nodes[Math.floor(Math.random() * randomCluster.nodes.length)];
    return randomNode;
}


// Генерація мережі та дослідження алгоритму пошуку
const allIterationns = [];

for (let round = 0; round < 100; round++) {
    roundIterations.length = 0;
    allUsers.length = 0;
    const testNet = generateHashedNetwork();
    for (let j = 0; j < 2; j++) {
        for (let i = 1; i <= 1000; i++) {
            let reciever = allUsers[crypto.randomInt(0, allUsers.length - 1)];
            let startNode = getRandomNode(testNet);

            findPathByHash(reciever, startNode, "Cluster1", true, testNet);
        }

        console.log("Максимальна кількість операцій пошуку в раунді:", Math.max(...roundIterations));
        console.log("Мінімальна кількість операцій пошуку в раунді:", Math.min(...roundIterations));
        console.log("Середня кількість операцій пошуку в раунді:", roundIterations.reduce((a, b) => a + b, 0) / roundIterations.length);

        allIterationns.push(...roundIterations);
    }
}

console.log("Максимальна кількість операцій пошуку:", Math.max(...allIterationns));
console.log("Мінімальна кількість операцій пошуку:", Math.min(...allIterationns));
console.log("Середня кількість операцій пошуку:", allIterationns.reduce((a, b) => a + b, 0) / allIterationns.length);