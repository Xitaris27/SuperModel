//TODO:
//Features:
//allow user to manually set weights
//allow user to force Super Model to travel to a specific Node ( and then proceed from there?) or edge?
//find shortest path; define shortest: shortest number of edges or least cumulative weight?
//find 'golden path' if different from shortest path
//allow user to set preferential path (if different than setting weights)
//tell the user which edges and vertices are never visited
    //special case: when end is never visited?


//create: 
    //setweightThreshold(int);

let Model = require('./Model');
let Objects = require('./Objects');
let PathManager = require('./PathManager');
let ModelProcessor = require('./readFile'); //this brings up naming concerns; consider renaming the file or this var.

let HashMap = require('../../../node_modules/hashmap');

let objects = new Objects();

module.exports = {
//FIRST FEW METHODS ARE OUT OF ALPHABETICAL ORDER

////Version 2.1
    //this is going to try to find every way to traverse the model
    //looping weightThreshold or fewer times
    findPossiblePaths(json, filePath) {
        
        let model = new Model(json, filePath);
            model.subModelsPathsCache = this.createSubModelsPathsCache(model.virtualEdgesCache, this);

        let pathManager = new PathManager();
            pathManager.path.push(model.nodesByLabelCache.get('Start'));
            pathManager.edges = model.createElementsByIdCache(model.edges);

        this.branchByDecisionTable(model, pathManager);
        // model.unfinishedPaths.push(pathManager);

        // visitedNodesIds.add(startNode.$.id);//shouldn't be in this method

        while(model.unfinishedPaths.length > 0) {
            this.processUnfinishedPath(model);
        }

        // this.alertUserOfUnvisitedElements(traversedEdgesIds, edgesIds, visitedNodesIds, nodesIds);//shouldn't be in this method

        return model.finishedPaths;
    },

    processUnfinishedPath(model) {
        for(let pathManager of model.unfinishedPaths) {

            let curNode = pathManager.path[pathManager.path.length - 1];
            let outEdges = model.getOutEdgesByNodeId(curNode.$.id, pathManager.edges);

            for(let outEdge of outEdges) {
                if(!this.shouldTraverseEdge(curNode, outEdge, pathManager, model)) {//this also does some modification
                    continue;
                }

                model.incrementWeight(pathManager.edges.get(outEdge.$.id));

                //branch to sub-model
                if(model.virtualEdgesCache.has(outEdge.$.id)) {
                    this.branchPathToSubModel(outEdge, pathManager, model);
                }
                //branch regularly
                else {
                    this.branchPath(outEdge, pathManager, model);
                }
            }
            //we can (and should) remove this incomplete path because we have it copied and continued with all of the branches
            objects.remove(model.unfinishedPaths, pathManager);
        }
    },


///////////////THE BEGINNING OF ALPHABETIZED METHODS/////////////////////

    // alertUserOfUnvisitedElements(//I could use better param names
    //                                 traversedEdgesIds,
    //                                 edgesIds, //master copy
    //                                 visitedNodesIds,
    //                                 nodesIds //master copy
    //                             ) {

    //     if(!traversedEdgesIds.equals(edgesIds)) {
    //         console.log('The following Edges were not traversed:');
    //         let missingEdges = this.returnNotFoundIds(traversedEdgesIds, edgesIds);
    //         console.log(missingEdges.toArray());
    //     }
    //     if(!visitedNodesIds.equals(nodesIds)) {
    //         console.log('The following Nodes were not visited:');
    //         let missingNodes = this.returnNotFoundIds(visitedNodesIds, nodesIds);
    //         console.log(missingNodes.toArray());
    //     }
    // },

    branchByDecisionTable(model, pathManager) {
        for(let testCase of model.decisionTable) {
            let branch = new PathManager(   pathManager.path, 
                                            pathManager.edges);
                branch.decisionTestCase = testCase;

            model.unfinishedPaths.push(branch);
        }
        objects.remove(model.unfinishedPaths, pathManager);
    },

    branchPath(edge, pathManager, model) {
        //add outedge and target Node to traversed edges and visited vertices if not already traversed or visited
        // this.updateVisitedElements(model.traversedEdgesIds, model.visitedNodesIds, edge);
      
        let branch = new PathManager(   pathManager.path, 
                                        pathManager.edges,
                                        pathManager.decisionTestCase);
            branch.path.push(edge);
            branch.path.push(model.getNodeById(edge.$.target, model.nodes));

        //separate finished and unfinished paths so we don't work on finished paths
        if(model.labelsByIdCache.get(edge.$.target) === 'End')
        {
            model.finishedPaths.push(branch);
        }
        else {
            model.unfinishedPaths.push(branch);
        }
    },

    branchPathToSubModel(edge, pathManager, model) {
        let subModelPaths = model.subModelsPathsCache.get(edge.$.target);
        
        //take the current path and branch it for each possible path thru the submodel
        for(let subModelPath of subModelPaths) {//let *insert better var name*
            subModelPath = this.formatSubModelPath(subModelPath);

            let branch = new PathManager(   pathManager.path, 
                                            pathManager.edges,
                                            pathManager.decisionTestCase);
                                            
                branch.path = branch.path.concat(objects.copyObjectsInArray(subModelPath.path));
                //the source node of the virtual edges gets added on last because when we finish
                //traversing the subModel, we return to the source to continue thru the SuperModel
                branch.path.push(model.nodesByIdCache.get(edge.$.source));

            model.unfinishedPaths.push(branch);
        }
    },

    createSubModelsPathsCache(virtualEdgesCache, generator) {//this is here to avoid circular references; suggesting we could reorganize our files in the future
        let subModelsPathsCache = new HashMap();

        virtualEdgesCache.forEach(function(value, key) {
            subModelsPathsCache.set(value.$.id, generator.findPossiblePaths(ModelProcessor.readGraphml(value.$.id)));
        });

        return subModelsPathsCache;
    },

    formatSubModelPath(subModelPath) {
        return subModelPath.slice(1, subModelPath.length - 1);
    },

    generateAbstract(path, iteration) {
        let abstract = [];
            abstract.push("Test Case " + iteration);

        for(let element of path) {
            if(element.label) { abstract.push(element.label); }
        }

        return abstract;
    },

    generateAutomation(path) {
        let arrays      = [];
        let automation  = [];
        let locators    = [];
        let variables   = [];

        for(let element of path) {
            if(element.$.id.startsWith('n')) {
                var vLabel = element.label;
                if(element.data) {
                    var vDetails = element.data[0]['_'];
                }
                if(vLabel.includes('start')) {
                    automation.push("describe('automated test', function() {");
                    vLabel = "  it('run automated test', async function() {";
                }
                if(vLabel.includes('end')) {
                    automation.push("   })");
                    vLabel = "})";
                }
                if(vLabel.includes('click_')) {
                    vLabel = vLabel.replace('click_', '');
                    vDetails = 'var ' + vLabel + " = element(by.css('" + vDetails + "'));";
                    vLabel = '      await ' + vLabel + '.click();';
                }
                if(vLabel.includes('enter_')) {
                    vLabel = vLabel.replace('enter_', '');
                    vDetails = 'var ' + vLabel + " = element(by.css('" + vDetails + "'));";
                    variables.push('var ' + vLabel + '_string;');
                    vLabel = '      await ' + vLabel + ".sendKeys(" + vLabel + "_string);";
                }
                if(vLabel.includes('display_')) {
                    automation.push("      await browser.wait(until.urlContains('" + vDetails + "'), 25000, 'URL did not contain " + vDetails + "');");
                    vLabel = "      expect(await browser.getCurrentUrl()).to.include('" + vDetails + "')";
                }
                if(vLabel.includes('navigate_to_')) {
                    vLabel = "      await browser.get('" + vDetails + "')";
                }
                if(vDetails && vDetails.includes(' = element')) {
                    locators.push(vDetails);
                }
                automation.push(vLabel);
            }
        }

        arrays.push(locators);
        arrays.push(variables);
        arrays.push(automation);

        return arrays;
    },

    generateTests(pathManagers) {
        let abstracts = [];
        let automatedTests = [];
        let automations;//maybe rename?
        let emptyArray = [''];
        let tests = [];

        for(let i = 0; i < pathManagers.length; ++i) {
            abstracts.push(this.generateAbstract(pathManagers[i].path, i + 1));
            automations = this.generateAutomation(pathManagers[i].path);
            automatedTests.push([].concat(automations[0], emptyArray, automations[1], emptyArray, automations[2]));
        }

        tests.push(abstracts);
        tests.push(automatedTests);

        return tests;
    },

    //still needs to be implemented and is brittle
    //the only purpose of this is to help remove decision nodes from the test cases
    isDecisionNode(node) {
        return node.data[0]['y:GenericNode'][0].$.configuration.includes('decision');//this logic might have to change.. I believe it's the last
                                                                                        //index of data rather than 0
    },
    
    //this can probably be reorganized to reduce nesting
    //this should probably be broken into two methods..
    shouldTraverseEdge(node, edge, pathManager, model) {//Should this be in PathManager???
        let weightThreshold = 0;//max path? iteration? path traversal? threshhold?//should this be in 'someMethodName()' rather than global?
        let outEdges = model.getOutEdgesByNodeId(node.$.id, pathManager.edges);
        let pathLength = pathManager.path.length;

        //we're not going to traverse edges that have been traversed the weightThreshold+ times
        if(edge.$.weight > weightThreshold && model.hasUnblockedOutEdge(outEdges, weightThreshold)) {// consider putting this if-statement logic in it's own method for better readability
            return false;
        }

        //we're not going to traverse edges that don't pass validation
        if(model.gatedEdgesByIdCache.has(edge.$.id) && edge.label != pathManager.decisionTestCase[node.label]) {// consider putting this if-statement logic in it's own method for better readability
            return false;
        }

        //if all out-edges have been traversed weightThreshold+ times then we're going to increment the in-edge past the
        //weightThreshold so that we don't come to this Node again.       
        if(edge.$.weight > weightThreshold && !model.hasUnblockedOutEdge(outEdges, weightThreshold)) {
            //find the in-edge and set that above the weightThreshold
            //this logic might not be transparent; we're determining whether there was an in-edge
            if(pathLength > 2) {
                //in the event our 'in-edge' is actually a node, this is indicative that we've backtracked into a sub-model, so we increment the virtual edge leading into the sub-model instead of the 'true' in-edge
                let inEdge = pathManager.edges.get(pathManager.path[pathLength - 2].$.id) ? pathManager.edges.get(pathManager.path[pathLength - 2].$.id) : model.virtualEdgesCache.get(pathManager.path[pathLength - 1].url);

                model.incrementWeight(inEdge,  weightThreshold);
            }
            else {
                //kill this path because we've tried to traverse a path weightThreshold+ times and we don't have any other options -
                //this means we've backed all the back to the start Node and have no other available paths
                objects.remove(unfinishedPaths, pathManager);
            }
        
            return false;
        }

        return true;
    },

}   