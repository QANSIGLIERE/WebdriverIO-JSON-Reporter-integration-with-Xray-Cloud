var { XRAYCloud_API } = require('qansigliere-xray-cloud-api-integration');
const fs = require('fs');
const path = require('path');
var { createFileFromString } = require('qansigliere-fs-utils');

function extractTestCaseIDs(fullTitle) {
    return Array.from(fullTitle.matchAll(/[A-z]+-\d+/g), m => m[0]);
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

async function syncResultsToXrayCloud(
    reportResults,
    client_id,
    client_secret,
    testExecutionKey,
    jiraProject,
    testExecutionSummary,
    testPlanKey,
    testEnvironments,
) {
    let xrayCloudAPI = new XRAYCloud_API(client_id, client_secret);

    let executionResultsJSON = {
        tests: [],
    };

    if (testExecutionKey) {
        executionResultsJSON['testExecutionKey'] = testExecutionKey;
    } else {
        executionResultsJSON['info'] = {
            project: jiraProject,
            summary: testExecutionSummary,
            description:
                'This execution is automatically created when importing execution results from an external source',
            //"version" : "v1.3",
            //"user" : "admin",
            //"revision" : "1.0.42134",
            //"startDate" : "2014-08-30T11:47:35+01:00",
            //"finishDate" : "2014-08-30T11:53:00+01:00",
            testPlanKey: testPlanKey,
            testEnvironments: testEnvironments,
        };
    }

    // Add info about test results
    for (let testCaseResult of reportResults) {
        executionResultsJSON['tests'].push({
            testKey: testCaseResult.id,
            start: testCaseResult.start,
            finish: testCaseResult.end,
            comment: testCaseResult.err,
            status: testCaseResult.state,
        });
    }

    console.log(JSON.stringify(await xrayCloudAPI.postXrayJSONResults(executionResultsJSON)));
}

async function parseJSONReporterAndSyncResultsToXrayCloud(
    pathToFolderWithJSONResults,
    client_id,
    client_secret,
    testExecutionKey,
    jiraProject,
    testExecutionSummary,
    testPlanKey,
    testEnvironments,
) {
    if (pathToFolderWithJSONResults && client_id && client_secret) {
        // Parse Mochawesome report
        let reportResults = parseJSONReporterFolder(pathToFolderWithJSONResults);

        // Testrail Integration
        await syncResultsToXrayCloud(
            reportResults,
            client_id,
            client_secret,
            testExecutionKey,
            jiraProject,
            testExecutionSummary,
            testPlanKey,
            testEnvironments,
        );
    } else {
        console.log(`
One of the following parameters is missing:
Path to the folder with JSON results: ${pathToFolderWithJSONResults}
client_id: ${client_id}
client_secret: ${client_secret}`);
    }
}

module.exports.parseJSONReporterFolderAndGenerateCSVFile = parseJSONReporterFolderAndGenerateCSVFile;
module.exports.extractTestCaseIDs = extractTestCaseIDs;
module.exports.parseJSONReporterAndSyncResultsToXrayCloud = parseJSONReporterAndSyncResultsToXrayCloud;
