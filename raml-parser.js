#!/usr/bin/env node

var raml = require('raml-1-parser');
var fs = require("fs");

var args = process.argv.slice(2)

var errorsOnly = false;
var beQuiet = false;
var input_file = "";

var arg;
while (arg = args.shift()) {
  if(arg == '-e') {
    errorsOnly = true;
  } else if (arg == '-q'){
    beQuiet = true
  } else {
    input_file = arg;
  }
}

if(input_file == ''){
    console.error("Error", "Not enough parameters");
    console.error("usage:", "ramlparser", "[options]", "input.raml");
    console.error();
    console.error("Options:");
    console.error("  -e  Display only files with errors");
    console.error("  -q  Display nothing. Use exit code to check validation result.");
    process.exit(-1);
}

if(!fs.existsSync(input_file)){
    console.error("Error", "Invalid input file", input_file);
    process.exit(-1);
}
else{
    var outputHeader = "Parsing " + input_file + " ... ";
    raml.loadRAML(input_file,[], {rejectOnErrors: true}).then(function(data) {
      if(!errorsOnly && !beQuiet) {
        console.log(outputHeader, "your RAML file is correct!")
      }
    }, function(error) {
        var lsErrors = "";
        var lnErrorCount = 0;
        error.parserErrors.forEach(function(item){
            if(item.range.start.line == item.range.end.line){
              line = item.range.start.line;
            } else {
              line = `${item.range.start.line}-${item.range.end.line}`;
            }
            if(item.code != 'INVALID_COMPONENT_TYPE') {
              lsErrors += `${item.isWarning ? "Warning" : "Error"}: ${item.path}(line ${line} column ${item.range.start.column}-${item.range.end.column} position ${item.range.start.position}-${item.range.end.position}): ${item.code} - ${item.message}\n`;
              lnErrorCount++;
            }
        });
        if (lnErrorCount > 0) {
          if(!beQuiet) {
            console.error(outputHeader, lnErrorCount+" error(s) found:");
            console.error(lsErrors);
          }
          process.exit(1);
        } else {
          if(!errorsOnly && !beQuiet) {
            console.log(outputHeader, "Only ignored errors found.");
          }
        }
    });
}
