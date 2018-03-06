#!/usr/bin/env node

var raml = require('raml-1-parser');
var fs = require("fs");

if(process.argv.length < 3){
    console.error("Error", "Not enough parameters");
    console.error("usage:", "ramlparser", "input.raml");
    process.exit(-1);
}

var input_file = process.argv[2];

if(input_file=="" || !fs.existsSync(input_file)){
    console.error("Error", "Invalid or empty input file", input_file);
    process.exit(-1);
}
else{
    console.log("Parsing", input_file, "...");
    raml.loadRAML(input_file,[], {rejectOnErrors: true}).then(function(data) {
        console.log("your RAML file is correct!")
    }, function(error) {
        console.error("Errors found:");
        error.parserErrors.forEach(function(item){
            if(item.range.start.line == item.range.end.line){
              line = item.range.start.line;
            } else {
              line = `${item.range.start.line}-${item.range.end.line}`;
            }
            console.error(`${item.isWarning ? "Warning" : "Error"}: ${item.path}(line ${line} column ${item.range.start.column}-${item.range.end.column} position ${item.range.start.position}-${item.range.end.position}): ${item.code} - ${item.message}`);
        });
        process.exit(1);
    });
}
