# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DocsKeys is a browser extension that brings Vim-style keyboard shortcuts to Google Docs. It works by intercepting keystrokes in a content script and simulating native keypresses through an injected page script to work around Google Docs' custom canvas-based rendering.

## Development Commands

This is a vanilla JavaScript browser extension with no build process:
- **Load extension**: Chrome > chrome://extensions > Developer Mode > Load Unpacked > Select dockeys folder
- **Reload after changes**: Click the reload button in chrome://extensions
- **Debug**: Use browser DevTools on Google Docs pages where content.js runs
- **No tests**: Currently no automated testing framework - test manually in Google Docs

## Architecture

### Key Files
- `content.js`: Main content script with Vim mode state machine and key handling
- `page_script.js`: Injected script that simulates keypresses in the Google Docs editor iframe
- `manifest.json`: Chrome/Firefox extension manifest (v3)

### Communication Flow
1. Content script (`content.js`) intercepts keydown events on the Google Docs page
2. Based on current mode (normal/insert/visual), it decides how to handle the key
3. For navigation/editing, it sends custom events to the injected page script
4. Page script (`page_script.js`) simulates native keypresses in the editor iframe
5. Google Docs processes these as if the user typed them

### Important Implementation Details
- The extension finds the Google Docs editor iframe using `document.getElementsByTagName('iframe')[1]`
- Key simulation happens through `KeyboardEvent` with proper `bubbles: true, cancelable: true`
- Visual selections are implemented by holding Shift while sending arrow keys
- The mode indicator is a fixed div in the bottom-right corner

### State Management
The extension uses a finite state machine with these modes:
- `normal`: Default Vim mode for navigation
- `insert`: Regular typing mode
- `visual`: Character-wise selection
- `visualLine`: Line-wise selection
- `waitForFirstInput`: After operators like d, c, y
- `waitForSecondInput`: For two-character motions like diw, ciw

## Common Development Tasks

### Adding a New Motion
1. Add the key handler in `handleKeyEventNormal()` in content.js
2. Implement the motion using `sendKeyEvent()` to simulate arrow keys or other navigation
3. If it's a two-character command, update the operator-pending states

### Adding a New Operator
1. Add case in `handleKeyEventNormal()` to enter `waitForFirstInput` state
2. Add handling in `handleKeyEventWaitForFirstInput()` for the operator
3. Implement the operation using menu commands or key simulation

### Debugging Tips
- Check if keystrokes are being captured: Add console.log in `handleKeydown()`
- Verify iframe detection: Log `editorIframe` in `injectPageScript()`
- Test key simulation: Log events in `simulateKeypress()` in page_script.js

## Proposed Improvements (from REFACTOR.md)

1. **Better command parsing**: Replace the finite state machine with a unified pending command object to handle multi-key sequences more elegantly
2. **Marks implementation**: Use the Selection API and Range objects to store positions
3. **Search functionality**: Integrate with Google Docs' native Find (Ctrl+F) for `/`, `n`, `N`
4. **Frame detection**: Use `.docs-texteventtarget-iframe` selector instead of array index
5. **Numeric repeat counts**: Add support for commands like `5j`, `3dw`

## Constraints

- Must work within browser extension security model (content scripts can't directly access page context)
- Google Docs uses custom rendering, so we can't manipulate DOM directly - must simulate keystrokes
- No access to absolute cursor position, only relative movement through arrow keys
- Extension manifest v3 restrictions apply