# WebdriverIO-JSON-Reporter-integration-with-Xray-Cloud

The main idea of ​​this library created in the JavaScript language is to provide a better way to synchronize
JSON-Reporter results with Xray Cloud.

## Author

https://www.youtube.com/@QANSIGLIERE/

## Support the project

https://buymeacoffee.com/qansigliere

## Installation

Using npm `npm i qansigliere-json-reporter-integration-with-xray-cloud`

## Requirements

To make the library works well, You need to complete the following steps:

1. Each test case should have at least one test case ID inside of the description and follow to the pattern like
   JIRAKEY-XXXXXX, example:

`it("ASQ-1418 - Change Item Coursing", async () => {`

or

`it("ASQ-1418, ASQ-1413, ASQ-1415 - Change Item Coursing", async () => {`

2. You should have Xray Cloud CLIENT_ID and CLIENT_SECRET keys for the API integration
3. You need to know the project id and suite id values

## How to use it

Example:

```
let { parseJSONReporterAndSyncResultsToXrayCloud } = require('qansigliere-json-reporter-integration-with-xray-cloud');

(async function Integration() {

})();
```

## Related Videos

-

## Improvements & Suggestions

https://forms.gle/GZbS9hw42tSYJxKL7
