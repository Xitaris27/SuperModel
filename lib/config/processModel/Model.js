let ModelProcessor = require('./readFile'); //this brings up naming concerns; consider renaming the file or this var.

let HashMap = require('../../../node_modules/hashmap');

class Model {
    constructor(json, filePath) {//not true json; js object literals
        //model
        this.edges = this.simplifyEdges(this.getEdgesFromJson(json));
        this.nodes = this.simplifyNodes(this.getNodesFromJson(json));

        //model management helpers (consider creating a new class for this)
        // this.edgesIds = this.initializeIdList(this.edges);
        this.finishedPaths = [];
        // this.nodesIds = this.initializeIdList(this.nodes);
        // this.traversedEdgesIds = new HashSet();
        this.unfinishedPaths = [];
        // this.visitedNodesIds = new HashSet();

        //model caches
        this.gatedEdgesByIdCache = this.createGatedEdgesByIdCache(this.edges);
        this.labelsByIdCache = this.createLabelsByIdCache(this.nodes, this.edges);
        this.nodesByIdCache = this.createElementsByIdCache(this.nodes);
        this.nodesByLabelCache = this.createElementsByLabelCache(this.nodes);
        this.virtualEdgesCache = this.createCacheOfVirtualEdgesAndAddToEdges(this.nodes, this.edges);//virtual edges === edges that connect to a different model

        this.outEdgeIdsByNodeCache = this.createOutEdgeIdsByNodeCache(this.nodes, this.edges);

        //submodel caches
        this.subModelsPathsCache;
        // this.subModelsPathsCache = this.createSubModelsPathsCache(this.virtualEdgesCache);

        //decision table//probably move this up into the model section and move the decision table cache in with the caches
        this.decisionTable = this.getDecisionTable(filePath);

        //decision table cache
        this.decisionsByTestCaseCache = this.createDecisionsByTestCaseCache(this.decisionTable);
    }
    
    createCacheOfVirtualEdgesAndAddToEdges(nodes, edges) {//this name sucks
        let cache = new HashMap();

        for(let node of nodes) {
            if (node.url && node.url.includes('.graphml')) {

                let newEdge = {};//should this be name virtual edge?
                    newEdge.$ = {};
                    newEdge.$.source = node.$.id;
                    newEdge.$.id = node.url;
                    newEdge.$.weight = 0;

                edges.push(newEdge);
                cache.set(newEdge.$.id, newEdge);
            }
        }

        return cache;
    }

    createDecisionsByTestCaseCache(decisionTable) {
        let cache = new HashMap();

        for(let testCase of decisionTable) {
            cache.set(testCase['Test Case Name'], testCase);
        }

        return cache;
    }

    createElementsByIdCache(elements) {
        let cache = new HashMap();

        for(let element of elements) {
            cache.set(element.$.id, element);
        }

        return cache;
    }

    createElementsByLabelCache(elements) {
        let cache = new HashMap();

        for(let element of elements) {
            cache.set(element.label, element);
        }

        return cache;
    }

    createGatedEdgesByIdCache(edges) {
        let cache = new HashMap();

        for(let edge of edges) {
            if(edge.label) {
                cache.set(edge.$.id, edge);
            }
        }

        return cache;
    }
    
    createLabelsByIdCache(nodes, edges) {
        let cache = new HashMap();

        for(let node of nodes) {
            cache.set(node.$.id, node.label);
        }
        for(let edge of edges) {
            cache.set(edge.$.id, edge.label);
        }

        return cache;
    }

    createOutEdgeIdsByNodeCache(nodes, edges) {
        let cache = new HashMap();

        for(let node of nodes) {
            let outEdgeIds = [];

            //find all the edgeIds leaving the current Node
            for(let edge of edges) {
                if(edge.$.source === node.$.id) { outEdgeIds.push(edge.$.id); }
            }
            cache.set(node.$.id, outEdgeIds);
        }

        return cache;
    }

    getDecisionTable(filePath) {
        return ModelProcessor.readCSV(filePath);
    }

    getEdgeById(id, edges) {//updated version temporarily in the PathManager Class
        for(let i = 0; i < edges.length; ++i) {
            if(edges[i].$.id === id) {
                return edges[i];
            }
        }
    }

    getEdgesByIds(ids, edges) {
        let newEdges = [];

        for(let id of ids) {
            newEdges.push(edges.get(id));
        }

        return newEdges;
    }

    getEdgesFromJson(json) {
        let edges = json.graphml.graph[0].edge;
        this.initializeWeights(edges);
        return edges;
    }

    getElementById(id, elements) {
        return elements.get(id);
    }

    getLabelByEdgeId(id, edges) {
        //for now we only handle PolyLineEdge's - not sure if we'll ever need to handle SplineEdges or other types of edges
        let edge = this.getEdgeById(id, edges);
        //I'm guessing I'm going to have to search data[datalength - 1] here rather than data[0]
        if(edge.label) {
            return edge.label;
        }
        else if(
            edge.data
        &&  edge.data[0]['y:PolyLineEdge']
        &&  edge.data[0]['y:PolyLineEdge'][0]['y:EdgeLabel']) {
            return edge.data[0]['y:PolyLineEdge'][0]['y:EdgeLabel'][0]._.trim();
        }
    }

    getLabelById(id) {
        return this.labelsByIdCache.get(id);
    }

    getNodeById(id, nodes) {
        for(let node of nodes) {
            if(node.$.id === id) { return node; }
        }
    }
    
    getNodesFromJson(json) {
        return json.graphml.graph[0].node;
    }

    getOutEdgesByNodeId(id, edges) {
        return this.getEdgesByIds(this.outEdgeIdsByNodeCache.get(id), edges);
    }

    getOutEdgeIdsForNode(node, cache) {
        return cache.get(node.$.id);
    }

    hasUnblockedOutEdge(outEdges, weightThreshold) {//THIS MIGHT BE A PATHMANGER METHOD OR TEST GENERATOR
        return outEdges.every(edge => edge.$.weight < weightThreshold);
    }

    incrementWeight(edge, weight) {//This is only here and not pathManager to access the cache more easily.....
        //the edge to the end node is never incremented
        if(this.labelsByIdCache.get(edge.$.target) === 'end') {
            return;
        }

        //if target Node !equal 'end', increment
        if(weight) {
            edge.$.weight += weight;
        }
        else {
            edge.$.weight++;
        }
    }

    initializeWeights(edges) {
        for(let edge of edges) {
            edge.$.weight = 0;
        }
    }
    
    // returnNotFoundIds(idsToCompare, idsMaster) {
    //     let array = idsToCompare.toArray();

    //     for(let id in array) {
    //         if(idsMaster.contains(array[id])) {
    //             idsMaster.remove(array[id]);
    //         }
    //     }

    //     return idsMaster;
    // }
    
    simplifyEdges(edges) {
        let simplifiedEdges = [];//should i just make them a hashmap already?

        for(let edge of edges) {
            let newEdge = {}
                newEdge.$ = edge.$;
                newEdge.label = this.getLabelByEdgeId(edge.$.id, edges);
            simplifiedEdges.push(newEdge);
        }

        return simplifiedEdges;
    }

    simplifyNodes(nodes) {
        let simplifiedNodes = [];

        let i = 0;
        for(let node of nodes) {
            let newNode = {};
                newNode.$ = node.$;

            for(let data of node.data) {

                let key = data.$.key;
                if(key === 'd4') {
                    newNode.url = data._;
                }
                if(key === 'd5') {
                    newNode.property = data._;
                }
                if(data.$.key === 'd6' 
                && data['y:GenericNode']
                && data['y:GenericNode'][0]['y:NodeLabel'][0]._) {
                    newNode.label = data['y:GenericNode'][0]['y:NodeLabel'][0]._.trim();
                }
            }
           
            simplifiedNodes.push(newNode);
        }

        return simplifiedNodes;
    }

    // updateVisitedElements(traversedEdgesIds, visitedNodesIds, edge) {
    //     if(!traversedEdgesIds.contains(edge.$.id)) {
    //         traversedEdgesIds.add(edge.$.id);
    //     }
    //     if(!visitedNodesIds.contains(edge.$.target)) {
    //         visitedNodesIds.add(edge.$.target);
    //     }
    // }

}

module.exports = Model;