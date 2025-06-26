# Next Steps for DocsKeys - Achieving Vim Feature Parity

Based on research of the most commonly used Vim commands and community feedback, here's a roadmap for extending DocsKeys to reach closer feature parity with full Vim bindings.

## Priority 1: Text Objects (High Impact)

Text objects are one of Vim's most powerful features. Implementing these would significantly enhance productivity:

### Inner/Around Text Objects
- [ ] `iw`/`aw` - inner/around word
- [ ] `iW`/`aW` - inner/around WORD (space-delimited)
- [ ] `is`/`as` - inner/around sentence
- [ ] `ip`/`ap` - inner/around paragraph
- [ ] `i"`/`a"` - inner/around double quotes
- [ ] `i'`/`a'` - inner/around single quotes
- [ ] `i(`/`a(` or `ib`/`ab` - inner/around parentheses
- [ ] `i[`/`a[` - inner/around square brackets
- [ ] `i{`/`a{` or `iB`/`aB` - inner/around curly braces
- [ ] `it`/`at` - inner/around HTML/XML tags

**Implementation Note**: These should work with `d`, `c`, `y`, and `v` operators.

## Priority 2: Essential Missing Commands

### Character-based Operations
- [ ] `x` - delete character under cursor
- [ ] `X` - delete character before cursor
- [ ] `r{char}` - replace single character
- [ ] `R` - enter replace mode
- [ ] `s` - substitute character (delete and enter insert)
- [ ] `S` - substitute line

### Advanced Movement
- [ ] `f{char}` - find character forward on line
- [ ] `F{char}` - find character backward on line
- [ ] `t{char}` - till character forward
- [ ] `T{char}` - till character backward
- [ ] `;` - repeat last f/F/t/T
- [ ] `,` - repeat last f/F/t/T in opposite direction
- [ ] `%` - jump to matching bracket/parenthesis
- [ ] `*` - search forward for word under cursor
- [ ] `#` - search backward for word under cursor

### Line Operations
- [ ] `D` - delete to end of line
- [ ] `C` - change to end of line
- [ ] `cc` - change entire line (already partially implemented)
- [ ] `S` - substitute entire line

## Priority 3: Visual Mode Enhancements

### Visual Block Mode
- [ ] `Ctrl-v` - visual block mode
- [ ] `I` in visual block - insert at beginning of each line
- [ ] `A` in visual block - append at end of each line
- [ ] Column operations in visual block

### Visual Mode Operations
- [ ] `gv` - reselect last visual selection
- [ ] `o` in visual mode - move to other end of selection
- [ ] `>` / `<` - indent/outdent in visual mode

## Priority 4: Registers and Macros

### Basic Register Support
- [ ] `"ayy` - yank to register 'a'
- [ ] `"ap` - paste from register 'a'
- [ ] `"*` - system clipboard register
- [ ] `"+` - system clipboard register (alternative)
- [ ] `"0` - last yank register
- [ ] `""` - default register

### Macro Recording
- [ ] `q{register}` - start recording macro
- [ ] `q` - stop recording
- [ ] `@{register}` - execute macro
- [ ] `@@` - repeat last macro

## Priority 5: Advanced Features

### Dot Command
- [ ] `.` - repeat last change (one of Vim's most powerful features)

### Undo/Redo Enhancement
- [ ] `U` - undo all changes on current line
- [ ] Undo tree visualization (if feasible)

### Case Operations
- [ ] `~` - toggle case
- [ ] `gu{motion}` - lowercase
- [ ] `gU{motion}` - uppercase
- [ ] `g~{motion}` - toggle case with motion

### Additional Navigation
- [ ] `H` - move to top of screen
- [ ] `M` - move to middle of screen
- [ ] `L` - move to bottom of screen
- [ ] `zz` - center cursor line
- [ ] `zt` - cursor line to top
- [ ] `zb` - cursor line to bottom

## Priority 6: Command-line Mode

### Basic Ex Commands
- [ ] `:s/find/replace/` - substitute on current line
- [ ] `:%s/find/replace/g` - global substitute
- [ ] `:line` - go to line number
- [ ] `:$` - go to last line
- [ ] `:set` commands for options

## Implementation Considerations

### Technical Challenges
1. **Text Objects**: Requires understanding of word/sentence/paragraph boundaries in Google Docs
2. **Registers**: Need persistent storage (localStorage or extension storage)
3. **Visual Block**: Complex due to Google Docs' rendering model
4. **Dot Command**: Requires tracking and replaying command sequences
5. **Macros**: Complex state management and command recording

### Google Docs Limitations
- No direct DOM manipulation
- Custom canvas rendering
- Limited access to document structure
- Keyboard event simulation constraints

### Suggested Implementation Order
1. Start with text objects (highest impact on productivity)
2. Add character operations (x, X, r, s)
3. Implement f/F/t/T movements (frequently used)
4. Add visual mode enhancements
5. Implement basic register support
6. Add dot command
7. Finally, tackle macros and ex commands

## Testing Strategy
- Create comprehensive test cases for each feature
- Test edge cases with Google Docs' specific behaviors
- Ensure compatibility with different document types
- Performance testing for complex operations

## Community Features to Consider
Based on community feedback, these features are also highly valued:
- [ ] `:normal` command for scripting
- [ ] Custom key mappings (`:map`, `:noremap`)
- [ ] Plugin system for extensibility
- [ ] Settings persistence
- [ ] Help system (`:help`)

## Success Metrics
- Coverage of top 80% of daily-used Vim commands
- Performance comparable to native Vim
- Minimal conflicts with Google Docs shortcuts
- Intuitive mode switching and visual feedback

This roadmap would transform DocsKeys from a basic Vim emulator into a powerful productivity tool that brings most of Vim's efficiency to Google Docs.