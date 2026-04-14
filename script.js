const htmlInput = document.getElementById('html-input');
const cssInput = document.getElementById('css-input');
const previewFrame = document.getElementById('preview-frame');
const htmlToolbar = document.getElementById('html-toolbar');
const suggestionBox = document.getElementById('suggestion-box');
const confirmModal = document.getElementById('confirm-modal');

let currentMode = 'html';

const htmlTags = [
    { tag: 'h1', display: '<h1> (Heading 1)', template: '<h1></h1>', cursorOffset: 4 },
    { tag: 'h2', display: '<h2> (Heading 2)', template: '<h2></h2>', cursorOffset: 4 },
    { tag: 'p', display: '<p> (Paragraph)', template: '<p></p>', cursorOffset: 3 },
    { tag: 'button', display: '<button> (Button)', template: '<button></button>', cursorOffset: 8 },
    { tag: 'img', display: '<img src=""> (Image)', template: '<img src="">', cursorOffset: 10 },
    { tag: 'div', display: '<div> (Container)', template: '<div></div>', cursorOffset: 5 },
    { tag: 'span', display: '<span> (Text Span)', template: '<span></span>', cursorOffset: 6 },
    { tag: 'ul', display: '<ul> (List)', template: '<ul></ul>', cursorOffset: 4 },
    { tag: 'li', display: '<li> (List Item)', template: '<li></li>', cursorOffset: 4 },
    { tag: 'br', display: '<br> (New Line)', template: '<br>', cursorOffset: 4 },
    { tag: 'hr', display: '<hr> (Line)', template: '<hr>', cursorOffset: 4 },
    { tag: 'a', display: '<a href=""> (Link)', template: '<a href=""></a>', cursorOffset: 9 },
    { tag: 'input', display: '<input> (Input Box)', template: '<input type="text">', cursorOffset: 19 },
    { tag: 'style', display: '<style> (Styles)', template: '<style></style>', cursorOffset: 7 }
];

const cssProps = [
    { prop: 'color', display: 'color: skyblue;' },
    { prop: 'background-color', display: 'background-color: darkblue;' },
    { prop: 'font-size', display: 'font-size: 24px;' },
    { prop: 'border', display: 'border: 3px solid cyan;' },
    { prop: 'margin', display: 'margin: 20px;' },
    { prop: 'padding', display: 'padding: 15px;' },
    { prop: 'text-align', display: 'text-align: center;' },
    { prop: 'width', display: 'width: 100%;' },
    { prop: 'border-radius', display: 'border-radius: 20px;' },
    { prop: 'display', display: 'display: flex;' }
];

window.onload = () => {
    htmlInput.value = "";
    cssInput.value = "";
    updatePreview();
};

// Modal Functions
function showClearModal() {
    confirmModal.classList.remove('hidden');
}

function closeModal() {
    confirmModal.classList.add('hidden');
}

function confirmClear() {
    htmlInput.value = '';
    cssInput.value = '';
    updatePreview();
    closeModal();
}

function handleKeydown(e) {
    const pairs = { '{': '}', '(': ')', '[': ']', '"': '"', "'": "'" };
    const input = e.target;
    
    if (pairs[e.key]) {
        const start = input.selectionStart;
        const end = input.selectionEnd;
        const val = input.value;
        input.value = val.substring(0, start) + e.key + pairs[e.key] + val.substring(end);
        input.setSelectionRange(start + 1, start + 1);
        e.preventDefault();
        updatePreview();
        return;
    }
}

function showSection(section) {
    currentMode = section;
    document.getElementById('html-section').classList.add('hidden');
    document.getElementById('css-section').classList.add('hidden');
    document.getElementById('preview-section').classList.add('hidden');
    document.getElementById(`${section}-section`).classList.remove('hidden');

    if(section === 'html') htmlToolbar.classList.remove('hidden');
    else htmlToolbar.classList.add('hidden');

    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`btn-${section}`).classList.add('active');

    if(section === 'preview') updatePreview();
    suggestionBox.style.display = 'none';
}

function updatePreview() {
    const content = `<html><head><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>${cssInput.value}</style></head><body>${htmlInput.value}</body></html>`;
    const doc = previewFrame.contentWindow.document;
    doc.open();
    doc.write(content);
    doc.close();
}

function handleInput(e) {
    const input = e.target;
    const value = input.value;
    const cursorPos = input.selectionStart;
    const lastChar = value.charAt(cursorPos - 1);

    const textBeforeCursor = value.substring(0, cursorPos);
    const words = textBeforeCursor.split(/[\s<>;:{}]/);
    const currentWord = words[words.length - 1].toLowerCase();

    if (currentMode === 'html') {
        if (currentWord.length > 0 || lastChar === '<') {
            const filtered = htmlTags.filter(item => item.tag.startsWith(currentWord.replace('<', '')));
            showSuggestions(filtered, 'html');
        } else {
            suggestionBox.style.display = 'none';
        }
    } else if (currentMode === 'css') {
        if (currentWord.length > 0) {
            const filtered = cssProps.filter(item => item.prop.startsWith(currentWord));
            showSuggestions(filtered, 'css');
        } else {
            suggestionBox.style.display = 'none';
        }
    }
    updatePreview();
}

function showSuggestions(list, type) {
    if (list.length === 0) {
        suggestionBox.style.display = 'none';
        return;
    }

    suggestionBox.innerHTML = '';
    list.slice(0, 5).forEach(item => {
        const div = document.createElement('div');
        div.className = 'suggestion-item';
        div.innerHTML = `<span>${item.display}</span> <span class="text-xs bg-slate-700 px-2 py-1 rounded">ADD</span>`;
        div.onclick = () => applySuggestion(item, type);
        suggestionBox.appendChild(div);
    });
    suggestionBox.style.display = 'block';
}

function applySuggestion(item, type) {
    const input = type === 'html' ? htmlInput : cssInput;
    const value = input.value;
    const cursorPos = input.selectionStart;
    
    let start = cursorPos - 1;
    while (start >= 0 && !/[\s<>;:{}]/.test(value[start])) {
        start--;
    }
    if (type === 'html' && value[start] === '<') {
        start = start; 
    } else {
        start++;
    }

    const before = value.substring(0, start);
    const after = value.substring(cursorPos);
    
    let insertion = type === 'html' ? item.template : `${item.prop}: `;
    let newCursorPos = start + (type === 'html' ? item.cursorOffset : insertion.length);

    input.value = before + insertion + after;
    suggestionBox.style.display = 'none';
    input.focus();
    input.setSelectionRange(newCursorPos, newCursorPos);
    updatePreview();
}

function insertTag(tag, offset) {
    const input = currentMode === 'html' ? htmlInput : cssInput;
    const start = input.selectionStart;
    const end = input.selectionEnd;
    input.value = input.value.substring(0, start) + tag + input.value.substring(end);
    input.focus();
    const newPos = start + (offset || tag.length);
    input.setSelectionRange(newPos, newPos);
    updatePreview();
}

function downloadCode() {
    const code = `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>${cssInput.value}</style></head><body>${htmlInput.value}</body></html>`;
    const blob = new Blob([code], {type: 'text/html'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'my_code.html';
    a.click();
}

htmlInput.addEventListener('input', handleInput);
cssInput.addEventListener('input', handleInput);
htmlInput.addEventListener('keydown', handleKeydown);
cssInput.addEventListener('keydown', handleKeydown);

document.addEventListener('click', (e) => {
    if (!suggestionBox.contains(e.target) && e.target !== htmlInput && e.target !== cssInput) {
        suggestionBox.style.display = 'none';
    }
});
