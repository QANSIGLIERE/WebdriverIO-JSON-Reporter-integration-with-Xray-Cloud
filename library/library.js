var { XRAYCloud_API } = require('qansigliere-xray-cloud-api-integration');
const fs = require('fs');
const path = require('path');
var { createFileFromString } = require('qansigliere-fs-utils');

function extractTestCaseIDs(fullTitle) {
    return Array.from(fullTitle.matchAll(/\D+-\d+/g), m => m[0]);
}

function parseJSONReporterFolder(pathToFolder) {
    let files = fs.readdirSync(__dirname + pathToFolder).filter(function (file) {
        return path.extname(file) == '.json';
    });
    let results = [];

    for (let jsonFile of files) {
        try {
            let data = require(__dirname + pathToFolder + jsonFile);

            for (let suite of data.suites) {
                for (let testCase of suite.tests) {
                    for (let testCaseResult of extractTestCaseIDs(testCase.name)) {
                        results.push({
                            id: testCaseResult ? testCaseResult : null,
                            start: testCase.start,
                            end: testCase.end,
                            state: testCase.state.toUpperCase(),
                            err: testCase.error ? testCase.error.stack : '',
                        });
                    }
                }
            }
        } catch {
            console.log(`Warning: the file "${__dirname + pathToFolder + jsonFile}" is empty`);
        }
    }

    return results;
}

function parseJSONReporterFolderAndGenerateCSVFile(pathToFolder) {
    let files = fs.readdirSync(__dirname + pathToFolder).filter(function (file) {
        return path.extname(file) == '.json';
    });

    let csvReport = 'SPEC FILE; TEST CASE ID; START; END; STATUS; ERROR MESSAGE;\n';

    for (let jsonFile of files) {
        try {
            let data = require(__dirname + pathToFolder + jsonFile);

            let newLine = `${data.specs};;;;\n`;
            for (let suite of data.suites) {
                for (let testCase of suite.tests) {
                    for (let testCaseResult of extractTestCaseIDs(testCase.name)) {
                        csvReport += `${data.specs};${testCaseResult ? testCaseResult : null};${testCase.start};${
                            testCase.end
                        };${testCase.state.toUpperCase()};${JSON.stringify(
                            testCase.error ? testCase.error.stack : '',
                        )};\n`;
                    }
                }
            }
            csvReport += newLine;
        } catch {
            console.log(`Warning: the file "${__dirname + pathToFolder + jsonFile}" is empty`);
        }
    }

    return createFileFromString(__dirname + pathToFolder + '/results.csv', csvReport);
}

module.exports.parseJSONReporterFolderAndGenerateCSVFile = parseJSONReporterFolderAndGenerateCSVFile;
