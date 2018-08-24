let readFile = require('./readGraphml');

let sourceFile = process.argv[2];

let json = readFile.readFile(sourceFile);
let nodes = json.graphml.graph[0].node;
let edges = json.graphml.graph[0].edge;

// console.log('edges');
// console.log(edges);
// console.log('nodes');
// console.log(nodes);

console.log('edges');
for(let edge of edges) {
    console.log(edge);
}

console.log('nodes');
for(let node of nodes) {
    console.log(node);
}

console.log('TESTING');
console.log(nodes[0].data);