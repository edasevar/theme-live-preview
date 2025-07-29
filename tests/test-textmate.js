// Test file for TextMate token routing
console.log("Testing TextMate tokens:");

// Variable tokens
const myVariable = "test";
var anotherVariable = 42;

// Function tokens  
function myFunction() {
    return "hello";
}

// Type tokens
class MyClass {
    constructor() {
        this.property = "value";
    }
}

// Namespace tokens
namespace MyNamespace {
    export const constant = "CONSTANT_VALUE";
}

// Labels
label: for (let i = 0; i < 10; i++) {
    if (i === 5) break label;
}

// Escape sequences and placeholders
const stringWithEscape = "Hello\nWorld";
const template = `Value: ${myVariable}`;

console.log("End of test");
