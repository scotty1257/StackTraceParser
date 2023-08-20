//const {spawn} = require('child_process');
const util = require('util');
const exec = util.promisify(require('child_process').exec);


/**
 * @description Call DSExplore from the command line
 * @param {string} command - DSExplore Command to be called.
 * @param {boolean} printOutput - Print cmd output to console if true.
 * @param {string} systemPath - Path to Command Prompt or Terminal.
 * @returns {Promise<void>} 
 */
const CallCmdInChildProcess = async function ( command: string, printOutput: boolean, systemPath?: string) : Promise<boolean> {

    return await exec(command, (error: any, stdout: any, stderr: any) => {
        let success: boolean = true;
        if (stdout && printOutput) {
            console.log("Command Output" + stdout);            
        }

        if (stderr && printOutput) {
            console.error('Call Error' + stderr);
            success = false;
        }
        return success;
    }).then( (didSucceed: boolean) => {
        return didSucceed;
    });
}



//CallCmdInChildProcess('ipconfig', true);
