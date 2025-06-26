// Basic test suite for DocsKeys content.js
// This file provides manual tests that can be run in the browser console
// Note: Full automated testing would require a testing framework and mocking of DOM/browser APIs

const testSuite = {
    // Test the pending command system
    testPendingCommands: function() {
        console.log("Testing pending command system...");
        
        // Test numeric counts
        const tests = [
            { input: ['5', 'j'], expected: "Should move down 5 lines" },
            { input: ['1', '0', 'w'], expected: "Should move forward 10 words" },
            { input: ['3', 'd', 'd'], expected: "Should delete 3 lines" },
            { input: ['g', 'g'], expected: "Should go to document start" },
            { input: ['5', 'g', 'g'], expected: "Should go to line 5" },
            { input: ['2', '0', 'G'], expected: "Should go to line 20" },
            { input: ['5', 'x'], expected: "Should delete 5 characters" },
            { input: ['r', 'a'], expected: "Should replace character with 'a'" },
            { input: ['3', 'r', 'x'], expected: "Should replace 3 characters with 'x'" },
            { input: ['D'], expected: "Should delete to end of line" },
            { input: ['X'], expected: "Should delete character before cursor" },
        ];
        
        tests.forEach(test => {
            console.log(`Input: ${test.input.join('')} - ${test.expected}`);
        });
    },
    
    // Test marks functionality
    testMarks: function() {
        console.log("Testing marks functionality...");
        
        console.log("1. Set mark 'a' at current position: ma");
        console.log("2. Move elsewhere in document");
        console.log("3. Jump back to mark 'a' (linewise): 'a");
        console.log("4. Jump to exact mark position: `a");
        console.log("5. Test that marks persist during editing");
    },
    
    // Test search functionality
    testSearch: function() {
        console.log("Testing search functionality...");
        
        console.log("1. Press / to open search");
        console.log("2. Type search term and press Enter");
        console.log("3. Press n to go to next match");
        console.log("4. Press N to go to previous match");
        console.log("5. Press Esc to exit search mode");
    },
    
    // Test iframe detection
    testIframeDetection: function() {
        console.log("Testing iframe detection...");
        
        const iframe = document.querySelector('.docs-texteventtarget-iframe');
        if (iframe) {
            console.log("✓ Iframe found using class selector");
            console.log("  Content document accessible:", !!iframe.contentDocument);
        } else {
            console.log("✗ Iframe not found - may not be on a Google Docs page");
        }
    },
    
    // Test keyCodes extension
    testKeyCodes: function() {
        console.log("Testing extended keyCodes...");
        
        // Check if A-Z keycodes are properly set
        const expectedCodes = {
            'a': 65, 'b': 66, 'c': 67, 'z': 90,
            'f': 70, 'enter': 13
        };
        
        console.log("Checking keycode mappings:");
        Object.entries(expectedCodes).forEach(([key, code]) => {
            console.log(`  ${key}: expected ${code}`);
        });
    },
    
    // Run all tests
    runAll: function() {
        console.log("=== DocsKeys Test Suite ===\n");
        this.testPendingCommands();
        console.log("\n");
        this.testMarks();
        console.log("\n");
        this.testSearch();
        console.log("\n");
        this.testIframeDetection();
        console.log("\n");
        this.testKeyCodes();
        console.log("\n=== Tests Complete ===");
    }
};

// Manual test scenarios to verify in Google Docs
const manualTestScenarios = `
Manual Test Scenarios for DocsKeys:

1. Numeric Repeat Counts:
   - Type "5j" → Should move down 5 lines
   - Type "3w" → Should move forward 3 words
   - Type "2dd" → Should delete 2 lines
   - Type "4u" → Should undo 4 times

2. Character Operations:
   - Type "x" → Delete character under cursor
   - Type "5x" → Delete 5 characters forward
   - Type "X" → Delete character before cursor
   - Type "3X" → Delete 3 characters backward
   - Type "ra" → Replace character under cursor with 'a'
   - Type "3rx" → Replace next 3 characters with 'x'
   - Type "D" → Delete from cursor to end of line

3. Marks:
   - Position cursor, type "ma" → Set mark 'a'
   - Move elsewhere, type "'a" → Jump to line with mark 'a'
   - Type "\`a" → Jump to exact position of mark 'a'
   - Edit document, marks should persist

4. Search:
   - Type "/" → Google Docs Find bar should open
   - Search for text, press Enter → Should exit search mode
   - Type "n" → Should find next occurrence
   - Type "N" → Should find previous occurrence

5. Two-character Commands:
   - Type "gg" → Go to document start
   - Type "5gg" → Go to line 5
   - Type "diw" → Delete inner word
   - Type "ciw" → Change inner word
   - Type "yiw" → Yank inner word

6. Visual Mode with Counts:
   - Type "v5l" → Select 5 characters to the right
   - Type "V3j" → Select 3 lines down in visual line mode

7. Undo/Redo:
   - Type "u" → Undo last change
   - Type "3u" → Undo last 3 changes
   - Type "R" → Redo (note: capital R)
   - Type "2R" → Redo 2 changes

8. Edge Cases:
   - Type "0" at start of line → Should not enter repeat count
   - Type "100j" → Should handle large counts gracefully
   - Set marks, reload page → Marks should be lost (known limitation)
`;

// Export for use in browser console
window.docsKeysTests = testSuite;
window.docsKeysManualTests = manualTestScenarios;

console.log("DocsKeys test suite loaded!");
console.log("Run tests with: docsKeysTests.runAll()");
console.log("View manual test scenarios: console.log(docsKeysManualTests)");