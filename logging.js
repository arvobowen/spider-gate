// This module provides a simple logging utility for the SpiderGate server.
// It can be used to log messages with a consistent format across the application.

/**
 * ANSI Escape Codes for Text Formatting
 * Explanation of the Codes
 * 
 * \x1b
 * This is the escape character. It signals the terminal that the following characters are
 * not text to be displayed, but rather a command.
 * 
 * [31m
 * This is the color code for red. The m at the end signifies that this is a formatting command.
 * 
 * [0m
 * This is the reset code. It's crucial to include this after your message to prevent all
 * subsequent console output from being colored red. It resets the terminal's formatting to its
 * default state.
 * 
 * Colors
 * Black: [30m
 * Red: [31m
 * Green: [32m
 * Yellow: [33m
 * Blue: [34m
 * Magenta: [35m
 * Cyan: [36m
 * White: [37m
 * To get bright colors, you can combine the color with bold like:
 * Bright Red: [1;31m
 * 
 * Background Colors
 * Black: [40m
 * Red: [41m
 * Green: [42m
 * Yellow: [43m
 * Blue: [44m
 * Magenta: [45m
 * Cyan: [46m
 * White: [47m
 * To get bright background colors, you can combine the background color with bold like:
 * Bright Red Background: [1;41m
 * 
 * Styles
 * Bold: [1m
 * Faint: [2m
 * Italic: [3m
 * Underline: [4m
 * Blink: [5m
 * Reverse: [7m
 * Hidden: [8m
 * Strikethrough: [9m
 * 
 * Examples
 * Regular Text: \x1b[0mThis is regular text\x1b[0m
 * Red Text: \x1b[31mThis is red text\x1b[0m
 * Green Text: \x1b[32mThis is green text\x1b[0m
 * Bold Text: \x1b[1mThis is bold text\x1b[0m
 * Bold Red Text: \x1b[1;31mThis is bold red text\x1b[0m
 */

const consoleHeader = "[spider-gate] ";
const horizonalLine = "-".repeat(80);

function header(header) {
    console.log(`${consoleHeader}${horizonalLine}`);
    console.log(`${consoleHeader}\x1b[33m${header}\x1b[0m`);
    console.log(`${consoleHeader}${horizonalLine}`);
}

function message(message) {
    console.log(`${consoleHeader}${message}`);
}

function success(message) {
    console.log(`${consoleHeader}\x1b[32m${message}\x1b[0m`);
}

function info(message) {
    console.log(`${consoleHeader}\x1b[34m${message}\x1b[0m`);
}

function debug(message) {
    console.log(`${consoleHeader}\x1b[30m${message}\x1b[0m`);
}

function error(err) {
    if (err instanceof Error) {
        const errorStack = err.stack;
        const stackLines = errorStack.split('\n');
    
        // The first line of the stack is the error message itself,
        // and the second line usually contains the file and line number.
        // For Node.js, it often looks like: "    at <function> (<file>:<line>:<column>)"
        const errorLocation = stackLines[1] ? stackLines[1].trim() : 'Unknown location';
        
        // Log the error message and its location
        console.error(`\x1b[31m${consoleHeader}ERROR: ${err.message}\n${consoleHeader}  at ${errorLocation}\x1b[0m`);
      } else {
        // If it's not an Error object, just log the message as a regular error
        console.error(`${consoleHeader}\x1b[31m${err}\x1b[0m`);
      }
}

// Export the function to be used in other files
module.exports = {
    header,
    message,
    success,
    info,
    debug,
    error
};