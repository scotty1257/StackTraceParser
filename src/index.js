var fs = require('fs');
var path = require('path');
var printStackContentToConsole = function (stackContent) {
    var lineStr = '';
    var paddingChar = '';
    for (var i = 0; i < stackContent.fileName.length; i++) {
        if ((stackContent.fileName.length - i) < 10)
            paddingChar = ' ';
        lineStr = paddingChar + (stackContent.fileName.length - i) +
            ':   ' + stackContent.fileLocation[i] +
            '....' + stackContent.fileName[i] +
            '::' + stackContent.functionName[i] +
            ' @ Line' + stackContent.lineNumber[i].toString();
        console.log(lineStr);
        paddingChar = '';
    }
};
var readFileFromDisk = function (fileName, fileType) {
    var isRead = '';
    var fileTypeLower = fileType.toLowerCase();
    if (!(fileTypeLower === 'txt' || fileTypeLower === '.txt'))
        return '';
    var ext = fileName.slice(-4);
    var joiningName = '';
    if (ext === '.txt')
        joiningName = fileName;
    else
        joiningName = fileName + fileType;
    var filePath = path.join(__dirname, joiningName);
    if (filePath.length === 0)
        return '';
    var encoding = { encoding: 'utf-8' };
    isRead = fs.readFileSync(filePath, encoding, function (err, data) {
        if (err) {
            throw err;
        }
        return data.toString();
    });
    return isRead;
};
var trimAbendString = function (abendString) {
    var indexAS = abendString.indexOf('[ALTERNATE_STACK]');
    var indexSE = abendString.lastIndexOf('[STACK EXTRACT]');
    var altStack = abendString.substring(indexAS, indexSE);
    altStack = altStack.trim();
    return altStack;
};
var splitStackByLine = function (inputStr) {
    var splitArray = inputStr.split('\n');
    splitArray.shift(); // Remove first two lines with the title
    splitArray.shift();
    return splitArray;
};
var getFunctionNameFromLine = function (line) {
    var result = '';
    var leftAngleIndex = line.indexOf('<');
    result = line.substring(0, leftAngleIndex);
    var fileFuncSp = result.split('::');
    result = fileFuncSp[1];
    return result;
};
var getFileNameFromline = function (line) {
    var result = '';
    var leftAngleIndex = line.indexOf('<');
    result = line.substring(0, leftAngleIndex);
    var fileFuncSp = result.split('::');
    result = fileFuncSp[0];
    return result;
};
var getFileLocationFromline = function (line) {
    var result = '';
    var leftAngleIndex = line.indexOf('<') + 1;
    var rightAngleIndex = line.indexOf('>') - 1;
    var filePath = line.substring(leftAngleIndex, rightAngleIndex);
    var secondColonIndex = filePath.lastIndexOf(':');
    var lineNoNumber = filePath.substring(0, secondColonIndex);
    result = lineNoNumber;
    return result;
};
var getLineNumberFromLine = function (line) {
    var result = 0;
    var lastColonBeforeString = line.substring(0, line.lastIndexOf(':') - 1);
    var rightAngleIndex = line.indexOf('>');
    var colonIndex = lastColonBeforeString.lastIndexOf(':') + 1;
    var numString = line.substring(rightAngleIndex, colonIndex).trim();
    result = parseInt(numString);
    return result;
};
var addFieldToStackContent = function (content, func, file, loc, num) {
    content.fileName.push(file);
    content.functionName.push(func);
    content.fileLocation.push(loc);
    content.lineNumber.push(num);
};
var getStackContentFromLine = function (line) {
    return [
        getFunctionNameFromLine(line),
        getFileNameFromline(line),
        getFileLocationFromline(line),
        getLineNumberFromLine(line),
    ];
};
var parseStackByLine = function (inputArr) {
    var stackContent = {
        fileName: [],
        functionName: [],
        fileLocation: [],
        lineNumber: [],
    };
    var fields = [];
    var index = 0;
    var addToStack = true;
    for (var line in inputArr) {
        addToStack = true;
        fields = getStackContentFromLine(inputArr[index]);
        for (var k = 0; k < 4; k++) {
            if (fields[k] === undefined) {
                addToStack = false;
                break;
            }
        }
        if (addToStack)
            addFieldToStackContent(stackContent, fields[0], fields[1], fields[2], fields[3]);
        index += 1;
    }
    return stackContent;
};
var GenerateTableHead = function (stackContents) {
    var abendTable = document.querySelector('abend-table');
    var tableHead = abendTable.createTHead();
    var row = tableHead.insertRow();
    var tableHeaderTitles = ['File Location', 'File Name', 'Function Name', 'Line Number'];
    for (var i = 0; i < tableHeaderTitles.length; i++) {
        var th = document.createElement('th');
        var text = document.createTextNode(tableHeaderTitles[i]);
        th.appendChild(text);
        row.appendChild(th);
    }
};
var DoParsing = function () {
    var output = readFileFromDisk('../data/AbendFileTest', '.txt');
    var trimmedOut = trimAbendString(output);
    var arrLines = splitStackByLine(trimmedOut);
    var stackContent = parseStackByLine(arrLines);
    GenerateTableHead(stackContent);
    printStackContentToConsole(stackContent);
};
DoParsing();
/**
 * Need to find the longest file path and then once done reprint (but printing doesnt really matter does it????)
 * Make an HTML Table in descending order
 * |  File  |  Function  |  Line No.  |  File Path  |
 *
 *
 *
 */
