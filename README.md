# DocsKeys

A browser extension that brings Vim-style keyboard shortcuts to Google Docs, allowing you to edit documents with familiar Vim motions and commands.

While this extension currently implements core Vim functionality including basic motions, text manipulation, and visual selections, there's room for expansion. Contributions are welcome to add more Vim features as per your need.

If you are using DocsKeys with Vimium, disable Vimium on Google Docs.

This project is heavily inspired by and uses much of code from [SheetKeys](https://github.com/philc/sheetkeys)

### Available Motions

#### Basic Movement
- `h` - Move cursor left (supports count: `5h` moves 5 chars left)
- `j` - Move cursor down (supports count: `5j` moves 5 lines down)
- `k` - Move cursor up (supports count: `5k` moves 5 lines up)
- `l` - Move cursor right (supports count: `5l` moves 5 chars right)
- `w` - Move to start of next word (supports count)
- `b` - Move to start of previous word (supports count)

#### Line Navigation
- `0` or `^` or `_` - Go to start of line
- `$` - Go to end of line
- `I` - Go to start of line and enter insert mode
- `A` - Go to end of line and enter insert mode

#### Document Navigation
- `gg` - Go to document start (supports count: `5gg` goes to line 5)
- `G` - Go to document end (supports count: `5G` goes to line 5)
- `{` - Go to start of paragraph
- `}` - Go to end of paragraph

### Editing Commands

#### Mode Switching
- `i` - Enter insert mode
- `a` - Enter insert mode (after cursor)
- `v` - Enter visual mode
- `V` - Enter visual line mode
- `Esc` - Return to normal mode
- `Ctrl` + `o` - Temporary normal mode from insert mode

#### Text Manipulation
- `d` + motion - Delete (supports `dw`, `diw`, `dp`, `dip`, `dd`)
- `c` + motion - Change (supports `cw`, `ciw`, `cp`, `cip`, `cc`)
- `y` + motion - Yank/copy (supports `yw`, `yiw`, `yp`, `yip`, `yy`)
- `x` - Delete character under cursor (supports count: `5x` deletes 5 chars)
- `X` - Delete character before cursor (supports count)
- `D` - Delete from cursor to end of line
- `r{char}` - Replace character under cursor with {char} (supports count)
- `p` - Paste (supports count: `5p` pastes 5 times)
- `u` - Undo (supports count: `5u` undoes 5 times)
- `R` - Redo (supports count: `5R` redoes 5 times)

#### Line Operations
- `o` - Add new line below and enter insert mode (supports count)
- `O` - Add new line above and enter insert mode (supports count)
- `J` - Join current line with next line (supports count)

### Marks and Jumps
- `m{a-z}` - Set mark at current position
- `'{a-z}` - Jump to mark (linewise - goes to start of line)
- `` `{a-z}`` - Jump to mark (exact position)

### Search
- `/` - Open search (uses Google Docs Find)
- `n` - Repeat search forward
- `N` - Repeat search backward

### Visual Mode Commands
When in visual mode (`v` or `V`):
- All movement keys (`h`, `j`, `k`, `l`, `w`, `b`, etc.) extend the selection
- `d` - Delete selected text
- `c` - Change selected text
- `y` - Yank selected text
- `p` - Paste over selected text

## Installation

[Chrome Web Store](https://chromewebstore.google.com/detail/docskeys/mmmomengbindngnkjblabjebdfmaiccj) |
[Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/docskeys/)

Install from source
- Check out this repository
- Navigate to chrome://extensions in Chrome
- Toggle into Developer Mode
- Click on "Load Unpacked Extension..."
- Select the docskeys folder

## Usage

1. Open a Google Doc
2. Extension will automatically activate
3. Start using Vim commands in normal mode
4. Press `i` or `a` to enter insert mode for regular typing
5. Press `Esc` to return to normal mode

## Known Limitations

- Marks are lost when the document tab is reloaded or the line that held the mark is deleted
- Macros and registers are not supported
- Custom key mappings are not supported
- PR's are welcome to add these features

## License

See [MIT-LICENSE.txt](MIT-LICENSE.txt) for details.

