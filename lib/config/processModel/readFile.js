//Convert .graphml to json
const fs = require('fs');
const parseString = require('xml2js').parseString;
const csvConverter = require('../../../node_modules/json-2-csv');


module.exports = {
    readGraphml: function(fileSource) {//separate into two functions?
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
    },

    readCSV: function(fileSource) {//separate into two functions?
        let data = '';
        let Json;//rename?
        
        try {
            
            data = fs.readFileSync(fileSource, 'utf8');
            
            let csv2jsonCallback = function (err, json) {
                if (err) throw err;
                Json = json;
            }

            csvConverter.csv2json(data, csv2jsonCallback);
            return Json;
        }
        catch (error) {
            console.log(error);
        }
    }
}
