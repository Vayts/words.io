import {
  collectData,
  getElement,
  getInputValue,
  getTextValue,
  removeChild,
  setDisplayFlex,
  setDisplayNone,
  setErrorAnim,
  setInputValue,
  setTextValue,
} from '../../../utils/ts/helpers';

export function getVocabulary(state) {
  removeChild('vocabularyList');
  setDisplayNone('leaderboardBlock');
  setDisplayNone('gameplayBlock');
  setDisplayFlex('vocabularyBlock');
  fetch('http://localhost:3000/word/vocabulary')
    .then((response) => response.json())
    .then((data) => {
      if (data.message === 'USER_DONE') {
        vocabularyUser(state, data.body);
        setDisplayFlex('vocabularyUser');
      }
      if (data.message === 'ADMIN_DONE') {
        vocabularyAdmin(state, data.body);
        setDisplayFlex('vocabularyAdmin');
      }
    });
}

function vocabularyAdmin(state, data) {
  if (data.length !== 0) {
    state.vocabularyAdmin = data;
    fillAdminWord(data[0]);
  } else {
    removeChild('vocabularyAdmin');
  }
}

function fillAdminWord(item) {
  const date = new Date(item.time);
  setTextValue('adminWord', item.word);
  setTextValue('vocabularyTime', `${date.getDay()}/${date.getMonth()}/${date.getFullYear()}`);
  setTextValue('vocabularyUserInfo', item.user);
}

export function adminControl(state, event) {
  if (event.target.classList.contains('vocabulary__admin-control-item')) {
    const targetValue = event.target.dataset.control;

    if (targetValue === 'add') {
      adminControlAdd(state);
    }

    if (targetValue === 'skip') {
      adminControlSkip(state);
    }

    if (targetValue === 'delete') {
      adminControlDelete(state);
    }

    if (targetValue === 'reject') {
      adminControlReject(state);
    }
  }
}

function adminControlDelete(state) {
  fetch(`http://localhost:3000/word/admin/delete/${state.vocabularyAdmin[0].id}`).then(() => {
    state.vocabularyAdmin.shift();
    nextAdminWord(state);
  });
}


function adminControlReject(state) {
  fetch(`http://localhost:3000/word/admin/reject/${state.vocabularyAdmin[0].id}`).then(() => {
    state.vocabularyAdmin.shift();
    nextAdminWord(state);
  });
}

function adminControlAdd(state) {
  fetch(`http://localhost:3000/word/admin/add/${state.vocabularyAdmin[0].id}`).then(() => {
    state.vocabularyAdmin.shift();
    nextAdminWord(state);
  });
}

function nextAdminWord(state) {
  if (state.vocabularyAdmin.length > 0) {
    fillAdminWord(state.vocabularyAdmin[0]);
  } else {
    removeChild('vocabularyAdmin');
  }
}

//
// function adminControlAdd() {
//
// }
//
function adminControlSkip(state) {
  const missedWord = state.vocabularyAdmin[0];
  state.vocabularyAdmin.shift();
  state.vocabularyAdmin.push(missedWord);
  nextAdminWord(state);
}

function vocabularyUser(state, data) {
  state.vocabulary = data.reverse();
  drawVocabularyList(state.vocabulary);
  vocabularyCounter(state);
}

function vocabularyCounter(state) {
  let statusCheck = 0;
  let statusAdded = 0;
  let statusRejected = 0;
  state.vocabulary.forEach((el) => {
    if (el.status === 0) {
      statusCheck += 1;
    }
    if (el.status === 1) {
      statusAdded += 1;
    }
    if (el.status === 2) {
      statusRejected += 1;
    }
  });
  setTextValue('vocabularyAll', state.vocabulary.length);
  setTextValue('vocabularyCheck', statusCheck);
  setTextValue('vocabularyAdded', statusAdded);
  setTextValue('vocabularyRejected', statusRejected);
}

export function drawVocabularyList(data) {
  const list = <HTMLElement>getElement('vocabularyList');
  const dataFragment = document.createDocumentFragment();
  data.forEach((el) => {
    dataFragment.append(createVocabularyItem(el));
  });
  list.appendChild(dataFragment);
}

function createVocabularyItem(item) {
  const date = new Date(item.time);
  let status;
  let pts;
  const li = document.createElement('li');
  li.classList.add('vocabulary__words-item');
  li.dataset.wordid = item.id;
  if (item.status === 0) {
    li.classList.add('vocabulary__words-item_check');
    status = 'Проверяется';
    pts = '';
  }
  if (item.status === 1) {
    li.classList.add('vocabulary__words-item_added');
    status = 'Добавлено';
    pts = '+3';
  }
  if (item.status === 2) {
    li.classList.add('vocabulary__words-item_rejected');
    status = 'Отклонено';
    pts = '-5';
  }
  li.innerHTML =
    `<span class='vocabulary__word'>${item.word}<span class='vocabulary__pts'>${pts}</span></span>` +
    `<div class='vocabulary__delete-word'><span></span><span></span></div>` +
    `<div class='vocabulary__word-info'>` +
    `<span class='vocabulary__word-status'>${status}</span>` +
    `<span class='vocabulary__word-time'>${date.getDay()}/${date.getMonth() + 1}/${date.getFullYear()}</span>` +
    `</div>`;
  return li;
}

export function vocabularyMessage(message, state, error = true) {
  state.vocabularyMessageTimeout = null;
  setTextValue('vocabularyMessage', message);
  const messageElem = <HTMLElement>getElement('vocabularyMessage');
  messageElem.style.color = '#85ce56';
  if (error) {
    const input = getElement('vocabularyInput');
    setInputValue('vocabularyInput', '');
    setErrorAnim(input);
    messageElem.style.color = '#da5c5c';
  }
  state.vocabularyMessageTimeout = setTimeout(() => {
    setTextValue('vocabularyMessage', '');
    messageElem.style.color = '#000000';
  }, 2500);
}

export function validateWord(word, messageState) {
  const regex = /^[а-яА-ЯёЁ]+$/g;
  if (word.length < 4) {
    vocabularyMessage('Минимум четыре буквы', messageState);
    return false;
  }
  if (word.length > 10) {
    vocabularyMessage('Максимум 10 букв', messageState);
    return false;
  }
  if (!word.match(regex)) {
    vocabularyMessage('Только русский язык без спецсимволов и пробелов', messageState);
    return false;
  }
  return true;
}

export function postWord(state) {
  const word = collectData('vocabularyForm');
  fetch('http://localhost:3000/word/add', {
    method: 'POST',
    body: word,
  })
    .then((res) => res.json())
    .then((data: any) => {
      if (data.message === 'ALREADY_IN_VOCABULARY') {
        vocabularyMessage('Слово уже есть в словаре', state);
      }

      if (data.message === 'ALREADY_UNDER_REVIEW') {
        vocabularyMessage('Слово уже в процессе проверки', state);
      }

      if (data.message === 'DONE') {
        vocabularyMessage('Слово было отправлено на проверку', state, false);
        const list = <HTMLElement>getElement('vocabularyList');
        const addedWord = { id: data.id, word: getInputValue('vocabularyInput'), status: 0, time: Date.now() };
        state.vocabulary.unshift(addedWord);
        list.insertAdjacentElement('afterbegin', createVocabularyItem(addedWord));
        setTextValue('vocabularyAll', Number(getTextValue('vocabularyAll')) + 1);
        setTextValue('vocabularyCheck', Number(getTextValue('vocabularyCheck')) + 1);
      }
      setInputValue('vocabularyInput', '');
    });
}

export function addWord(state, event) {
  event.preventDefault();
  clearInterval(state.vocabularyMessageTimeout);
  const word = getInputValue('vocabularyInput');
  if (validateWord(word, state)) {
    postWord(state);
  }
}

export function sortVocabulary(state, event) {
  if (event.target.dataset.sort) {
    state.vocabularySortValue = event.target.dataset.sort;
    getSortVocabulary(state);
    return state;
  }
  return false;
}

export function getSortVocabulary(state): boolean {
  removeChild('vocabularyList');
  if (state.vocabularySortValue !== 'all' && state.vocabularySortValue !== null) {
    const sortedVocabulary = state.vocabulary.filter((el) => el.status === Number(state.vocabularySortValue));
    drawVocabularyList(sortedVocabulary);
    return true;
  }
  drawVocabularyList(state.vocabulary);
  return false;
}

export function deleteWord(state, event) {
  if (event.target.classList.contains('vocabulary__delete-word')) {
    fetch(`http://localhost:3000/word/delete/${event.target.parentNode.dataset.wordid}`).then(() => {
      let deletedIndex;
      state.vocabulary.map((el, index) => {
        if (el.id === Number(event.target.parentNode.dataset.wordid)) {
          deletedIndex = index;
        }
      });
      state.vocabulary.splice(deletedIndex, 1);
      removeChild('vocabularyList');
      getSortVocabulary(state);
      vocabularyCounter(state);
    });
  }
}
