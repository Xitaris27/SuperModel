let Objects = require('./Objects');

let HashMap = require('../../../node_modules/hashmap');

let objects = new Objects();

class PathManager {
    constructor(path, edges, decisionTestCase) {
        this.path = path ? objects.copyObjectsInArray(path) : [];
        this.edges = edges ? objects.copyObject(edges) : new HashMap();
        this.decisionTestCase = decisionTestCase ? decisionTestCase : {};
    }
}

module.exports = PathManager;