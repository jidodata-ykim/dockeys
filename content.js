// Google Docs has moved from using editable HTML elements (textbox with contenteditable=true)
// to custom implementation with its own editing surface since 2015. (https://drive.googleblog.com/2010/05/whats-different-about-new-google-docs.html)
// This means that each keystroke is captured and then fed into layout engine which 
// then draws the text, cursor, selection, headings etc on seperate iframe.
// Such implementation deters any extensibility in terms of text manipulation because 
// there is no API to interact with Google Docs layout engine

// Thus only way (in my understanding) to achieve vim motions would be to capture keystrokes
// before sending to layout engine and interpret them into respective vim motion/command.
// Then implement those motions by sending relevant keystrokes. Essentially doing a keystroke to keystroke remapping. 

// Improved iframe detection using class selector
const iframe = document.querySelector('.docs-texteventtarget-iframe')
const editorDoc = iframe.contentDocument
editorDoc.addEventListener('keydown', eventHandler, true)

const cursorTop = document.getElementsByClassName("kix-cursor-top")[0] // element to edit to show normal vs insert mode
let mode = 'normal'
let tempnormal = false // State variable for indicating temperory normal mode

// Generic pending command object for handling multi-key sequences
const pending = { cmd: null, count: '', arg: null }

// Marks storage - stores Range objects for each mark
const marks = {}   // { a: Range, b: Range, ... }

// How to simulate a keypress in Chrome: http://stackoverflow.com/a/10520017/46237
// Note that we have to do this keypress simulation in an injected script, because events dispatched
// by content scripts do not preserve overridden properties.
const script = document.createElement("script");
script.src = chrome.runtime.getURL("page_script.js");
document.documentElement.appendChild(script);

const keyCodes = {
    backspace: 8,
    enter: 13,
    esc: 27,
    " ": 32,
    end: 35,
    home: 36,
    left: 37,
    up: 38,
    right: 39,
    down: 40,
    "delete": 46,
    f: 70,
};

// Add A-Z keycodes for completeness
for (let i = 65; i <= 90; i++) {
    keyCodes[String.fromCharCode(i).toLowerCase()] = i;
}

// Send request to injected page script to simulate keypress
// Messages are passed to page script via "doc-keys-simulate-keypress" events, which are dispatched
// on the window object by the content script.
function sendKeyEvent(key, mods = {shift:false, control:false}) {
    const keyCode = keyCodes[key]
    window.dispatchEvent(new CustomEvent("doc-keys-simulate-keypress", { detail: { keyCode, mods } }));
}

//Mode indicator thing (insert, visualline)
const modeIndicator = document.createElement('div')
modeIndicator.style.position = 'fixed'
modeIndicator.style.bottom = '20px'
modeIndicator.style.right = '20px'
modeIndicator.style.padding = '8px 16px'
modeIndicator.style.borderRadius = '4px'
modeIndicator.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
modeIndicator.style.fontSize = '14px'
modeIndicator.style.fontWeight = '500'
modeIndicator.style.zIndex = '9999'
document.body.appendChild(modeIndicator)

function updateModeIndicator(currentMode) {
    let displayText = currentMode.toUpperCase()
    
    // Show pending command info
    if (pending.cmd) {
        displayText = pending.count + pending.cmd
    } else if (pending.count) {
        displayText = 'NORMAL ' + pending.count
    }
    
    modeIndicator.textContent = displayText
    
    switch(currentMode) {
        case 'normal':
            modeIndicator.style.backgroundColor = '#1a73e8'
            modeIndicator.style.color = 'white'
            break
        case 'insert':
            modeIndicator.style.backgroundColor = '#34a853'
            modeIndicator.style.color = 'white'
            break
        case 'visual':
        case 'visualLine':
            modeIndicator.style.backgroundColor = '#fbbc04'
            modeIndicator.style.color = 'black'
            break
        case 'search':
            modeIndicator.style.backgroundColor = '#9c27b0'
            modeIndicator.style.color = 'white'
            break
        case 'waitForFirstInput':
        case 'waitForSecondInput':
        case 'waitForVisualInput':
            modeIndicator.style.backgroundColor = '#ea4335'
            modeIndicator.style.color = 'white'
            break
    }
}

function switchModeToVisual() {
    mode = 'visual'
    updateModeIndicator(mode)
    sendKeyEvent('right', { shift: true })
}

function switchModeToVisualLine() {
    mode = 'visualLine'
    updateModeIndicator(mode)
    sendKeyEvent('home')
    sendKeyEvent('down', { shift: true })
}

function switchModeToNormal() {
    if (mode == "visualLine") sendKeyEvent("left")
    mode = 'normal'
    updateModeIndicator(mode)

    //caret indicating visual mode 
    cursorTop.style.opacity = 1
    cursorTop.style.display = "block"
    cursorTop.style.backgroundColor = "black"
}

function switchModeToInsert() {
    mode = 'insert'
    updateModeIndicator(mode)
    cursorTop.style.opacity = 0
}

function switchModeToWait() {
    mode = "waitForFirstInput"
    updateModeIndicator(mode)
    // define cursor style
}

function switchModeToWait2() {
    mode = "waitForSecondInput"
    updateModeIndicator(mode)
    // define cursor style
}

let longStringOp = ""

// Reset pending command state
function resetPending() {
    pending.cmd = null
    pending.count = ''
    pending.arg = null
    updateModeIndicator(mode)
}

// Set a mark at current cursor position
function setMark(letter) {
    const sel = editorDoc.getSelection()
    if (!sel.rangeCount) return
    marks[letter] = sel.getRangeAt(0).cloneRange()
}

// Jump to a previously set mark
function jumpToMark(letter, linewise = false) {
    const r = marks[letter]
    if (!r) return
    const sel = editorDoc.getSelection()
    sel.removeAllRanges()
    sel.addRange(r.cloneRange())
    if (linewise) {
        // Go to start of the visual line to emulate Vim's ' behaviour
        sendKeyEvent('home')
    }
}

// Handle two-character commands
function dispatchTwoCharCommand(cmd, arg) {
    const count = Number(pending.count) || 1
    switch (cmd) {
        case 'm':                       // set mark
            if (/[a-z]/i.test(arg)) setMark(arg)
            break
        case "'":                       // jump to mark (linewise)
            if (/[a-z]/i.test(arg)) jumpToMark(arg, true)
            break
        case '`':                       // jump to mark (exact)
            if (/[a-z]/i.test(arg)) jumpToMark(arg, false)
            break
        case 'g':
            if (arg === 'g') {
                // Apply count for gg command
                if (count > 1) {
                    sendKeyEvent("home", { control: true })
                    for (let i = 1; i < count; i++) {
                        sendKeyEvent("down")
                    }
                } else {
                    sendKeyEvent("home", { control: true })
                }
            }
            break
        case 'd':
            if (arg === 'd') {
                goToStartOfLine()
                selectToEndOfLine()
                runLongStringOp('d')
            } else {
                longStringOp = 'd'
                waitForFirstInput(arg)
            }
            break
        case 'c':
            if (arg === 'c') {
                goToStartOfLine()
                selectToEndOfLine()
                runLongStringOp('c')
            } else {
                longStringOp = 'c'
                waitForFirstInput(arg)
            }
            break
        case 'y':
            if (arg === 'y') {
                goToStartOfLine()
                selectToEndOfLine()
                runLongStringOp('y')
            } else {
                longStringOp = 'y'
                waitForFirstInput(arg)
            }
            break
    }
}


function goToStartOfLine() {
    sendKeyEvent("home")
}

function goToEndOfLine() {
    sendKeyEvent("end")
}

function selectToEndOfLine() {
    sendKeyEvent("end", { shift: true })
}

function selectToEndOfWord() {
    sendKeyEvent("right", { shift: true, control: true })
}

function goToStartOfWord() {
    sendKeyEvent("left", { shift: false, control: true })
}

function goToStartOfDoc() {
    sendKeyEvent("home", { control: true })
}

function selectToEndOfPara() {
    sendKeyEvent("down", { control: true, shift: true })
}
function goToEndOfPara(shift = false) {
    console.log({ shift })
    sendKeyEvent("down", { control: true, shift })
    sendKeyEvent("right", { shift })
}
function goToStartOfPara(shift = false) {
    sendKeyEvent("up", { control: true, shift })
}


function addLineTop() {
    goToStartOfLine()
    sendKeyEvent("enter", { shift: true })
    sendKeyEvent("up")
    switchModeToInsert()
}
function addLineBottom() {
    goToEndOfLine()
    sendKeyEvent("enter", { shift: true })
    switchModeToInsert()
}

function runLongStringOp(operation = longStringOp) {
    switch (operation) {
        case "c":
            clickMenu(menuItems.cut)
            switchModeToInsert()
            break
        case "d":
            clickMenu(menuItems.cut)
            sendKeyEvent('backspace')
            mode = 'normal'
            switchModeToNormal()
            break
        case "y":
            clickMenu(menuItems.copy)
            switchModeToNormal()
            break
        case "p":
            clickMenu(menuItems.paste)
            switchModeToNormal()
            break
        case "v":
            break
    }
}


function waitForSecondInput(key) {
    switch (key) {
        case "w":
            goToStartOfWord()
            waitForFirstInput(key)
            break
        case "p":
            goToStartOfPara()
            waitForFirstInput(key)
            break
        default:
            switchModeToNormal()
            break
    }
}

function waitForFirstInput(key) {
    switch (key) {
        case "i":
        case "a":
            switchModeToWait2()
            break
        case "w":
            selectToEndOfWord()
            runLongStringOp()
            break
        case "p":
            selectToEndOfPara()
            runLongStringOp()
            break
        case longStringOp:
            goToStartOfLine()
            selectToEndOfLine()
            runLongStringOp()
            break
        default:
            switchModeToNormal()
    }
}

function waitForVisualInput(key) {
    switch (key) {
        case "w":
            sendKeyEvent("left",{control:true})
            goToStartOfWord()
            selectToEndOfWord()
            break
        case "p":
            goToStartOfPara()
            goToEndOfPara(true)
            break
    }
    mode = "visualLine"
}




function eventHandler(e) {
    
    if (e.ctrlKey && mode=='insert' && e.key=='o' ){
        e.preventDefault()
        e.stopImmediatePropagation()
        switchModeToNormal()

        // Turn on state variable to indicate temperory normal mode
        tempnormal = true
        return;
    }
    
    // Handle search mode
    if (mode === 'search') {
        if (e.key === 'Escape' || e.key === 'Enter') {
            e.preventDefault()
            switchModeToNormal()
        }
        return; // let Docs handle all other keystrokes in search mode
    }
    
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    if (e.key == 'Escape') {
        e.preventDefault()
        if (mode == 'visualLine' || mode == 'visual') {
            sendKeyEvent("right")
        }
        switchModeToNormal()
        resetPending()
        return;
    }
    if (mode != 'insert') {
        e.preventDefault()
        switch (mode) {
            case "normal":
                handleKeyEventNormal(e.key)
                break
            case "visual":
            case "visualLine":
                handleKeyEventVisualLine(e.key)
                break
            case "waitForFirstInput":
                waitForFirstInput(e.key)
                break
            case "waitForSecondInput":
                waitForSecondInput(e.key)
                break
            case "waitForVisualInput":
                waitForVisualInput(e.key)
                break
        }
    }
}

function handleKeyEventNormal(key) {
    // Handle numeric repeat counts
    if (/[0-9]/.test(key) && !(pending.count === '' && key === '0')) {
        pending.count += key
        updateModeIndicator(mode)
        return
    }
    
    // Handle second keystroke of two-char commands
    if (pending.cmd) {
        dispatchTwoCharCommand(pending.cmd, key)
        resetPending()
        return
    }
    
    const count = Number(pending.count) || 1
    
    switch (key) {
        // Two-character command starters
        case 'm':
        case "'":
        case '`':
        case 'g':
        case 'd':
        case 'y':
        case 'c':
            pending.cmd = key
            updateModeIndicator(mode)
            return
            
        // Search
        case '/':
            sendKeyEvent('f', { control: true }) // open Find
            mode = 'search'
            updateModeIndicator('search')
            resetPending()
            return
            
        case 'n':
            sendKeyEvent('enter')              // repeat forward
            break
        case 'N':
            sendKeyEvent('enter', { shift: true }) // repeat backward
            break
            
        // Movement with repeat support
        case "h":
            for (let i = 0; i < count; i++) sendKeyEvent("left")
            break
        case "j":
            for (let i = 0; i < count; i++) sendKeyEvent("down")
            break
        case "k":
            for (let i = 0; i < count; i++) sendKeyEvent("up")
            break
        case "l":
            for (let i = 0; i < count; i++) sendKeyEvent("right")
            break
        case "}":
            for (let i = 0; i < count; i++) goToEndOfPara()
            break
        case "{":
            for (let i = 0; i < count; i++) goToStartOfPara()
            break
        case "b":
            for (let i = 0; i < count; i++) sendKeyEvent("left", { control: true })
            break
        case "w":
            for (let i = 0; i < count; i++) sendKeyEvent("right", { control: true })
            break
        case "G":
            if (pending.count) {
                // Go to specific line number
                sendKeyEvent("home", { control: true })
                for (let i = 1; i < count; i++) {
                    sendKeyEvent("down")
                }
            } else {
                sendKeyEvent("end", { control: true })
            }
            break
        case "p":
            for (let i = 0; i < count; i++) clickMenu(menuItems.paste)
            break
        case "a":
            sendKeyEvent("right")
            switchModeToInsert()
            break
        case "i":
            switchModeToInsert()
            break
        case "^":
        case "_":
        case "0":
            goToStartOfLine()
            break
        case "$":
            goToEndOfLine()
            break
        case "I":
            goToStartOfLine()
            switchModeToInsert()
            break
        case "A":
            goToEndOfLine()
            switchModeToInsert()
            break
        case "v":
            switchModeToVisual()
            break
        case "V":
            switchModeToVisualLine()
            break
        case "o":
            for (let i = 0; i < count; i++) addLineBottom()
            break
        case "O":
            for (let i = 0; i < count; i++) addLineTop()
            break
        case "u":
            for (let i = 0; i < count; i++) clickMenu(menuItems.undo)
            break
        case "r":
            for (let i = 0; i < count; i++) clickMenu(menuItems.redo)
            break
        case "J":
            // Join lines - go to end of current line, delete newline, add space
            for (let i = 0; i < count; i++) {
                goToEndOfLine()
                sendKeyEvent("delete")
                // Add space unless there's already one
                sendKeyEvent("right")
                sendKeyEvent("left")
                // This is a simplified version - in real Vim it's more complex
                sendKeyEvent(" ")
            }
            break
        default:
            resetPending()
            return;
    }
    
    resetPending()
    
    // Check if operation is occuring in temperory normal mode after ctrl-o
    if (tempnormal) {
        tempnormal = false
        if (mode != 'visual' && mode != 'visualLine'){  // Switch back to insert 
            switchModeToInsert()                        // after operation
        }
    }
}

function handleKeyEventVisualLine(key) {
    switch (key) {
        case "":
            break
        case "h":
            sendKeyEvent("left", { shift: true })
            break
        case "j":
            sendKeyEvent("down", { shift: true })
            break
        case "k":
            sendKeyEvent("up", { shift: true })
            break
        case "l":
            sendKeyEvent("right", { shift: true })
            break
        case "p":
            clickMenu(menuItems.paste)
            switchModeToNormal()
            break
        case "}":
            goToEndOfPara(true)
            break
        case "{":
            goToStartOfPara(true)
            break
        case "b":
            sendKeyEvent("left", { control: true, shift: true })
            break
        case "w":
            sendKeyEvent("right", { control: true, shift: true })
            break
        case "G":
            sendKeyEvent("end", { control: true, shift: true })
            break
        case "g":
            sendKeyEvent("home", { control: true, shift: true })
            break
        case "c":
        case "d":
        case "y":
            runLongStringOp(key)
            break
        case "i":
        case "a":
            mode = "waitForVisualInput"
            break


    }
}

let menuItemElements = {}

let menuItems = {
    copy: { parent: "Edit", caption: "Copy" },
    cut: { parent: "Edit", caption: "Cut" },
    paste: { parent: "Edit", caption: "Paste" },
    redo: { parent: "Edit", caption: "Redo" },
    undo: { parent: "Edit", caption: "Undo" },
}

function clickMenu(itemCaption) {
    simulateClick(getMenuItem(itemCaption));
}

function clickToolbarButton(captionList) {
    // Sometimes a toolbar button won't exist in the DOM until its parent has been clicked, so we
    // click all of its parents in sequence.
    for (const caption of Array.from(captionList)) {
        const els = document.querySelectorAll(`*[aria-label='${caption}']`);
        if (els.length == 0) {
            console.log(`Couldn't find the element for the button labeled ${caption}.`);
            console.log(captionList);
            return;
        }
        // Sometimes there are multiple elements that have the same label. When that happens, it's
        // ambiguous which one to click, so we log it so it's easier to debug.
        if (els.length > 1) {
            console.log(
                `Warning: there are multiple buttons with the caption ${caption}. ` +
                "We're expecting only 1.",
            );
            console.log(captionList);
        }
        simulateClick(els[0]);
    }
}
// Returns the DOM element of the menu item with the given caption. Prints a warning if a menu
// item isn't found (since this is a common source of errors in SheetKeys) unless silenceWarning
// is true.

function getMenuItem(menuItem, silenceWarning = false) {
    const caption = menuItem.caption;
    let el = menuItemElements[caption];
    if (el) return el;
    el = findMenuItem(menuItem);
    if (!el) {
        if (!silenceWarning) console.error("Could not find menu item with caption", menuItem.caption);
        return null;
    }
    return menuItemElements[caption] = el;
}

function findMenuItem(menuItem) {
    activateTopLevelMenu(menuItem.parent);
    const menuItemEls = document.querySelectorAll(".goog-menuitem");
    const caption = menuItem.caption;
    const isRegexp = caption instanceof RegExp;
    for (const el of Array.from(menuItemEls)) {
        const label = el.innerText;
        if (!label) continue;
        if (isRegexp) {
            if (caption.test(label)) {
                return el;
            }
        } else {
            if (label.startsWith(caption)) {
                return el;
            }
        }
    }
    return null;
}

function simulateClick(el, x = 0, y = 0) {
    const eventSequence = ["mouseover", "mousedown", "mouseup", "click"];
    for (const eventName of eventSequence) {
        const event = document.createEvent("MouseEvents");
        event.initMouseEvent(
            eventName,
            true, // bubbles
            true, // cancelable
            window, //view
            1, // event-detail
            x, // screenX
            y, // screenY
            x, // clientX
            y, // clientY
            false, // ctrl
            false, // alt
            false, // shift
            false, // meta
            0, // button
            null, // relatedTarget
        );
        el.dispatchEvent(event);
    }
}

function activateTopLevelMenu(menuCaption) {
    const buttons = Array.from(document.querySelectorAll(".menu-button"));
    const button = buttons.find((el) => el.innerText.trim() == menuCaption);
    if (!button) {
        throw new Error(`Couldn't find top-level button with caption ${menuCaption}`);
    }
    // Unlike submenus, top-level menus can be hidden by clicking the button a second time to
    // dismiss the menu.
    simulateClick(button);
    simulateClick(button);
}

// Initiate to Normal Mode
switchModeToNormal()
