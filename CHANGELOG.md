# DocsKeys Changelog

## Refactoring Implementation (Based on REFACTOR.md)

### Major Changes Implemented:

#### 1. Command Parsing Refactor ✓
- Replaced finite state machine with a unified `pending` command object
- Now handles multi-key sequences cleanly without additional states
- Supports numeric repeat counts (e.g., `5j`, `10w`, `3dd`)

#### 2. Marks Functionality ✓
- `m{a-z}` - Set mark at current position
- `'{a-z}` - Jump to mark (linewise)
- `` `{a-z}`` - Jump to mark (exact position)
- Uses browser's Range API to store positions
- Marks persist during editing but are lost on page reload

#### 3. Search Integration ✓
- `/` - Opens Google Docs native Find bar
- `n` - Find next occurrence
- `N` - Find previous occurrence
- Seamlessly integrates with Docs' existing search

#### 4. Improved iframe Detection ✓
- Changed from `getElementsByTagName('iframe')[0]` to `.docs-texteventtarget-iframe`
- More robust against DOM structure changes

#### 5. Additional Improvements ✓
- Extended keyCodes to include A-Z and space
- Fixed `gg` command (now properly handles `5gg` to go to line 5)
- Added `J` command for joining lines
- Numeric repeat counts work for most commands

### Technical Details:

#### Pending Command System
```javascript
const pending = { cmd: null, count: '', arg: null }
```
- Tracks multi-character commands and numeric prefixes
- Shows pending state in mode indicator (e.g., "5g" while typing)

#### Marks Implementation
```javascript
const marks = {}  // Stores Range objects
```
- Uses Selection API instead of simulated keystrokes
- Provides true position tracking

#### Search Mode
- New 'search' mode that passes control to Google Docs
- Automatically exits on Enter or Escape

### Files Modified:
1. `content.js` - Core functionality implementation
2. `README.md` - Updated documentation with new features
3. `test_content.js` - Test suite for new functionality
4. `test.html` - Test page for manual testing

### Testing:
- Created comprehensive test suite in `test_content.js`
- Manual test scenarios documented
- Test HTML page for isolated testing

### Known Limitations:
- Marks don't persist across page reloads
- Join lines (J) implementation is simplified
- Some edge cases in numeric repeat counts
- Full testing requires actual Google Docs environment