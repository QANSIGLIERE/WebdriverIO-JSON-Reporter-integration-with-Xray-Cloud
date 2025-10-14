let { parseJSONReporterFolderAndGenerateCSVFile } = require('./library/library');

JSON.stringify(parseJSONReporterFolderAndGenerateCSVFile('/../results/jsonReporter/'));

module.exports.parseJSONReporterFolderAndGenerateCSVFile = parseJSONReporterFolderAndGenerateCSVFile;
