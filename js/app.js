let resultContainer = document.getElementById('result-container-area');
let search = document.getElementById('search');
let notesArray = [];
let select = document.getElementById('filterByType');
let pagination = document.querySelector('.pagination');
let totalPages = 0;
let filteredResult;

function getData() {
    return fetch("./data/api.json").then(data => data.json());
}

initializeNotesArray();

function initializeNotesArray() {
    getData()
        .then((resp) => {
            resp.forEach(elem => notesArray.push(elem));
        })
}

function generateNoteList(list) {
    resultContainer.innerHTML = list.map((elem, index) => createNote(elem, index)).join('');
    if (list.length > 0) {
        highlight();
    }
}

function createNote(note, index) {
    return `
    <div class="note-container">
    <div class="note-header">
        <div class="note-header-title">${note.from.name}&nbsp;${note.type == 'Reply' ? 'replied' : 'posted'}&nbsp;</div>
        <div class="note-header-time"> ${note.dateTimeLastModified}</div>
    </div>
    <div class="note-description">${note.fullText}</div>
    </div>
    `
}

function highlight() {
    let texts = document.querySelectorAll('.note-description');
    for (let i = 0; i < texts.length; i++) {
        let substr = search.value;
        var strRegExp = new RegExp(substr, 'g');
        return texts[i].innerHTML.toString().replace(strRegExp, '<b>' + substr + '</b>');
    }
}

//Searching start

function clearSearch() {
    search.value = '';
    searchOperation();
}

let searchOperation = debounce(searchResult, 400);

search.addEventListener('input', searchOperation);

function debounce(fn, delay) {
    let timer;
    return function () {
        clearTimeout(timer);
        timer = setTimeout(() => fn(), delay);
    }
}

function searchResult() {
    let option = select.options[select.selectedIndex];
    if (option.value == '') {
        filteredResult = notesArray.filter(note => {
            return note.fullText.toString().toLowerCase().trim().indexOf(search.value.toLowerCase().trim()) > -1;
        });
    }

    if (option.value == 'Post') {
        filteredResult = notesArray.filter(note => {
            return note.type == 'Post' && note.fullText.toString().toLowerCase().trim().indexOf(search.value.toLowerCase().trim()) > -1;
        });
    }

    if (option.value == 'Reply') {
        filteredResult = notesArray.filter(note => {
            return note.type == 'Reply' && note.fullText.toString().toLowerCase().trim().indexOf(search.value.toLowerCase().trim()) > -1;
        });
    }

    if (search.value === '') {
        filteredResult = [];
    }
    computePages();
}

function filterByType() {
    searchResult();
}
// Searching End

// Pagination Start
function computePages() {
    if (filteredResult.length <= 5) {
        pagination.style.visibility = 'hidden';
        generateNoteList(filteredResult);
    } else {
        totalPages = Math.floor(filteredResult.length / 5) + parseInt((filteredResult.length % 5 > 0) ? 1 : 0);
        pagination.style.visibility = 'visible';
        // Create pagination html
        let pageNumbers=[];
        for(let i=1;i<=totalPages;i++){
            pageNumbers.push(createPage(i));
        }
        pagination.innerHTML = pageNumbers.join('');
        //----------------------
        selectPage(1);
    }
}

function createPage(pageNumber){
    return `
    <a href="#" id="page${pageNumber}" onClick="selectPage(${pageNumber})">${pageNumber}</a>
    `
}

function selectPage(pageNumber){
    for (let i = 0; i < totalPages; i++) {
        pagination.children[i].classList.remove('active');
    }
    pagination.children[pageNumber-1].classList.add('active');
    let end = pageNumber*5;
    let start = end - 5;
    generateNoteList(filteredResult.slice(start, end));
}
// Pagination End
