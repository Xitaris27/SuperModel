const generator = require("./TestGenerator");
const microtime = require('../../../node_modules/microtime');
const Objects = require('./Objects');
const FileReader = require('./readFile');

const fs = require('fs');
const parseString = require('xml2js').parseString;

let fileSource = process.argv[2];
let fileDestination_optional = process.argv[3]


//these were included for testing purposes
const objects = new Objects();
let HashMap = require('../../../node_modules/hashmap');
let Model = require('./Model');
let PathManager = require('./PathManager');


let absoluteStartTime = microtime.now();
let startTime = absoluteStartTime;

/////////////////// TESTING AREA /////////////////////
// let model = new Model(readFile(fileSource), 'C:\\Users\\Xitaris27\\Documents\\GitHub\\Models\\model-based-test-master\\model-based-test-master\\identity\\Signin.csv');
//  console.log('model.decisionTable');
//  console.log(model.decisionTable);
//////////////////////////////////////////////////////


//read the xml file (and convert into js object literals)
//find all possible paths thru the model
//generate tests for all possible paths
let tests = generator.generateTests(generator.findPossiblePaths(readFile(fileSource), 'C:\\Users\\Xitaris27\\Documents\\GitHub\\Models\\model-based-test-master\\model-based-test-master\\identity\\Signin.csv'));

let endTime = microtime.now();
let runTime = endTime - startTime;
console.log('Time lapsed to generate tests in milliseconds: ' + (runTime / 1000));
console.log('Time lapsed to generate tests in seconds: '      + (runTime / 1000000));
console.log('Time lapsed to generate tests in minutes: '      + (runTime / 60000000));

// console.log(tests);
startTime = microtime.now();

formatAndWriteTests(tests);

endTime = microtime.now();

let absoluteEndTime = endTime;
runTime = endTime - startTime;

console.log('Time lapsed to write tests in milliseconds: ' + (runTime / 1000));
console.log('Time lapsed to write tests in seconds: '      + (runTime / 1000000));
console.log('Time lapsed to write tests in minutes: '      + (runTime / 60000000));

runTime = absoluteEndTime - absoluteStartTime;

console.log('Total time lapsed in milliseconds: ' + (runTime / 1000));
console.log('Total time lapsed in seconds: '      + (runTime / 1000000));
console.log('Total time lapsed in minutes: '      + (runTime / 60000000));


function readFile(fileSource) {
    let data = '';
    let r;//rename?
    
    try {
        
        data = fs.readFileSync(fileSource, 'utf8');
        
        parseString(data, function(error, result) {
            if(error){
                throw new Error(error);
            }
            r = result;
        });
        return r;
    }
    catch (error) {
        console.log(error);
    }
}

// function writeFile(data, writeStream) {
//     writeStream.write(JSON.stringify(data, null, 4));

//     //I don't think this is working
//     writeStream.on('end', function(error) {
//         if(error){
//             throw new Error(error);
//         }
//         console.log('Your file has finished processing.');
//     });
// }

function formatAndWriteTests(tests) {//I think it owuld be better to separate this into two methods that each have a single responsiblity (1) format 2) write)
                                    //but at this point it's low priority

    const writeStream1 = fs.createWriteStream(getDestination(fileSource, fileDestination_optional, '.json'));
    const writeStream2 = fs.createWriteStream(getDestination(fileSource, fileDestination_optional, '.js'));
    
    writeStream1.write(JSON.stringify(tests[0], 0 , 4));

    let automatedTests = tests[1];
    for(let i = 0; i < automatedTests.length; ++i) {
        for(let num = 0; num < automatedTests[i].length; ++num) {
            writeStream2.write(automatedTests[i][num] + '\r\n');
        }
        writeStream2.write('\r\n');
        writeStream2.write('\r\n');
    }

}

function getDestination(fileSource, fileName, extension) {
    //if user specifies their own username as a param then return that
    if(fileName) {
        return fileName;
    }
    //otherwise the default is the source .graphml name as a .json file
    else {
        return removeFileExtention(fileSource) + extension;
    }
}

function removeFileExtention(file) {
    return file.substring(0, file.search('.graphml'));//this use to be: return file.substring(0, file.search('.'));
                                                    //but this ended up breaking because file.search('.') can == 0 with C:... 


    //you might be able to fix this by changing the start index
    // or doing something like setting the start index to last occurance of .
}

module.exports = {
    readFile: (fileSource) => {
        return readFile(fileSource);
    }
}