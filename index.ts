const fs = require('fs');
const path = require('path');

interface StackContent {
    fileName: string[];
    functionName: string[];
    fileLocation: string[];
    lineNumber: number[];
}

const printStackContentToConsole = function (stackContent: StackContent): void {
    let lineStr: string = '';
    let paddingChar: string = '';
    for (let i = 0; i < stackContent.fileName.length; i++) {

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
}

const readFileFromDisk = function (fileName: string, fileType: string): string {
    let isRead: string = '';

    let fileTypeLower = fileType.toLowerCase();

    if (!(fileTypeLower === 'txt' || fileTypeLower === '.txt'))
        return '';

    let ext = fileName.slice(-4);
    let joiningName: string = '';

    if (ext === '.txt')
        joiningName = fileName;
    else
        joiningName = fileName + fileType;


    let filePath = path.join(__dirname, joiningName)

    if (filePath.length === 0) return '';

    let encoding = { encoding: 'utf-8' };

    isRead = fs.readFileSync(filePath, encoding, (err: Error, data: string) => {
        if (err) {
            throw err;
        }
        return data.toString();
    })
    return isRead;
}

const trimAbendString = function (abendString: string): string {
    let indexAS = abendString.indexOf('[ALTERNATE_STACK]');
    let indexSE = abendString.lastIndexOf('[STACK EXTRACT]');

    let altStack = abendString.substring(indexAS, indexSE);
    altStack = altStack.trim();

    return altStack;
}

const splitStackByLine = function (inputStr: string): string[] {
    let splitArray = inputStr.split('\n');

    splitArray.shift(); // Remove first two lines with the title
    splitArray.shift();

    return splitArray;
}

const getFunctionNameFromLine = function (line: string): string {
    let result: string = '';

    let leftAngleIndex: number = line.indexOf('<');

    result = line.substring(0, leftAngleIndex);
    let fileFuncSp = result.split('::');

    result = fileFuncSp[1];

    return result;
}

const getFileNameFromline = function (line: string): string {
    let result: string = '';

    let leftAngleIndex: number = line.indexOf('<');

    result = line.substring(0, leftAngleIndex);
    let fileFuncSp = result.split('::');

    result = fileFuncSp[0];

    return result;
}

const getFileLocationFromline = function (line: string): string {
    let result: string = '';
    return result;
}

const getLineNumberFromLine = function (line: string): number {
    let result: number = 0;

    let lastColonBeforeString: string = line.substring(0, line.lastIndexOf(':') - 1);
    let rightAngleIndex: number = line.indexOf('>');
    let colonIndex: number = lastColonBeforeString.lastIndexOf(':') + 1;

    let numString: string = line.substring(rightAngleIndex, colonIndex).trim();

    result = parseInt(numString);

    return result;
}

const addFieldToStackContent = function (content: StackContent, func: string, file: string, loc: string, num: number): void {
    content.fileName.push(file);
    content.functionName.push(func);
    content.fileLocation.push(loc);
    content.lineNumber.push(num);
}

const getStackContentFromLine = function (line: string): any[] {
    return [
        getFunctionNameFromLine(line),
        getFileNameFromline(line),
        getFileLocationFromline(line),
        getLineNumberFromLine(line),
    ];
}

const parseStackByLine = function (inputArr: any): StackContent {
    let stackContent: StackContent = {
        fileName: [],
        functionName: [],
        fileLocation: [],
        lineNumber: [],
    }

    let fields: any[] = [];
    let index: number = 0;

    let addToStack: boolean = true;

    for (let line in inputArr) {
        addToStack = true;
        fields = getStackContentFromLine(inputArr[index]);

        for (let k = 0; k < 4; k++) {
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
}

let output = readFileFromDisk('AbendFileTest', '.txt');
let trimmedOut = trimAbendString(output);
let arrLines = splitStackByLine(trimmedOut);
//console.log(arrLines);
let stackContent: StackContent = parseStackByLine(arrLines);
printStackContentToConsole(stackContent);
