import {
  clearRow,
  disableKeyEvent,
  enableKeyEvent,
  getElement,
  getInputValue,
  getNodeList,
  getWord,
  setDisplayNone,
  setErrorAnim,
  setTextValue,
} from '../../../utils/ts/helpers';
import 'core-js/es/reflect';
import 'regenerator-runtime/runtime';

export function getGameValue(wordLength, tryCounter): [number, number] {
  const winValue = wordLength * 8 - tryCounter * 3;
  const looseValue = Math.floor(winValue * 0.8);
  return [winValue, looseValue];
}

export function changeGameValue(state) {
  const winCounter = <HTMLElement>getElement('winPtsCounter');
  const looseCounter = <HTMLElement>getElement('loosePtsCounter');
  const wordLengthDisplay = <HTMLElement>getElement('wordLengthDisplay');
  const tryCounterDisplay = <HTMLElement>getElement('tryCounterDisplay');
  const wordLengthValue = getInputValue('wordLengthInput');
  const tryCounterValue = getInputValue('tryCounterInput');
  wordLengthDisplay.innerText = wordLengthValue;
  tryCounterDisplay.innerText = tryCounterValue;
  const results = getGameValue(wordLengthValue, tryCounterValue);
  [state.winValue, state.looseValue] = results;
  looseCounter.innerText = String(results[1]);
  winCounter.innerText = String(results[0]);
  return state;
}

export function displayCounter(state, displayId, inputId): string {
  const display = <HTMLElement>getElement(displayId);
  display.innerText = getInputValue(inputId);
  changeGameValue(state);
  return display.textContent;
}

export function generateGameField(wordLength, tryCounter) {
  const dataFragment = document.createDocumentFragment();

  for (let i = 0; i < tryCounter; i += 1) {
    const tr = document.createElement('tr');
    tr.classList.add('gameplay__row');

    for (let m = 0; m < wordLength; m += 1) {
      const th = document.createElement('th');
      th.classList.add('gameplay__col');
      tr.append(th);
    }

    dataFragment.append(tr);
  }
  return dataFragment;
}

export function startGame(state) {
  setDisplayNone('leaderboardBlock');
  setDisplayNone('vocabularyBlock');
  const gameplay = <HTMLElement>getElement('gameplayBlock');
  const table = <HTMLElement>getElement('gameplayTable');
  const button = <HTMLElement>getElement('playButton');
  state.lengthCounter = getInputValue('wordLengthInput');
  state.tryCounter = getInputValue('tryCounterInput');
  state.settings.closeModal();
  gameplay.style.display = 'flex';
  table.append(generateGameField(state.lengthCounter, state.tryCounter));
  button.style.display = 'none';
  fillState(state);
  generateWord(state);
  changeGameValue(state);
  const func = (event) => {
    enterTheLetter(state, event, func);
  };
  document.addEventListener('keydown', func);
}

export function generateWord(state) {
  fetch(`/word/generate/${state.lengthCounter}/${state.tryCounter}`).then((value) => {});
}

function fillState(state) {
  state.rowList = getNodeList('.gameplay__row');
  state.colList = getNodeList('.gameplay__col');
  state.currentRow = 0;
  state.currentCol = 0;
  state.firstLetter = 0;
  state.rowList[state.currentRow].classList.add('active');
  return state;
}

async function checkWord(state, func): Promise<any> {
  const row = state.rowList[state.currentRow];
  const word = getWord(row);
  return new Promise((resolve, reject) => {
    fetch(`/word/check`, {
      method: 'POST',
      body: JSON.stringify(word),
    })
      .then((response) => response.json())
      .then((value: any) => {
        if (value.message === 'WIN') {
          resolve(value);
        }

        if (value.message === 'WORD_DOESNT_EXIST') {
          reject('Error! Wrong word.');
        }

        if (value.message === 'WORD_EXIST') {
          resolve(value);
        }

        if (value.message === 'LOOSE') {
          resolve(value);
        }

        reject('Error!');
      });
  });
}

export function loadUserInfo(state) {
  fetch('/user/pts')
    .then((data) => data.json())
    .then((response: any) => {
      setTextValue('userPts', response.pts);
      state.userPts = response.pts;
      return response.pts;
    });
}

function enterTheLetter(state, event, func) {
  const regEx = /[а-яА-ЯёЁ]/;
  if (event.key === 'Backspace') {
    removeLetter(state);
    return true;
  }

  if (event.key.match(regEx)) {
    gameProcess(state, event.key, func);
    return true;
  }

  return false;
}

function nextRow(state) {
  state.currentRow += 1;
  state.firstLetter += Number(state.lengthCounter);
}

function wrongWord(state, func) {
  disableKeyEvent(func);
  setErrorAnim(state.rowList[state.currentRow]);
  setTimeout(() => {
    clearRow(state.colList, state.firstLetter);
    state.currentCol = state.firstLetter;
    enableKeyEvent(func);
  }, 450);
}

function gameProcess(state, keyValue, func) {
  const nextLetter = state.currentCol + 1;
  state.colList[state.currentCol].innerText = keyValue.toUpperCase();
  state.colList[state.currentCol].classList.add('filled');

  if (nextLetter % state.lengthCounter === 0) {
    // Заполненный рядок
    checkWord(state, func)
      .then((value: { message: string; wordAnalyse: any; userWord: string }) => {
        if (value.message === 'WIN') {
          state.word = value.userWord;
          highlightLetter(state, value.wordAnalyse, func, false);
        }

        if (value.message === 'WORD_EXIST') {
          highlightLetter(state, value.wordAnalyse, func);
        }

        if (value.message === 'LOOSE') {
          state.word = value.userWord;
          highlightLetter(state, value.wordAnalyse, func, true);
        }

        if (Number(state.currentRow) !== state.tryCounter - 1) {
          state.currentCol += 1;
          nextRow(state);
        }
      })
      .catch((value: string) => {
        wrongWord(state, func);
      });
  } else {
    state.currentCol += 1;
  }
}

function removeLetter(state) {
  const previousLetter = state.currentCol - 1;
  if (previousLetter >= state.firstLetter) {
    state.colList[previousLetter].innerText = '';
    state.colList[previousLetter].classList.remove('filled');
    state.currentCol = previousLetter;
    return true;
  }
  return false;
}

export function gameResult(state, result, value, func) {
  disableKeyEvent(func);
  state.modal.fillModal('mainModal', result, value, state);
  loadUserInfo(state);
}

export function highlightLetter(state, wordAnalyse, func, loose = false) {
  disableKeyEvent(func);

  const { noMatch } = wordAnalyse;
  const { partialMatch } = wordAnalyse;
  const { fullMatch } = wordAnalyse;
  const time = 250;
  const row = state.rowList[state.currentRow];
  const colInRow = row.childNodes;
  let letterCounter = 0;
  const interval = setInterval(() => {
    colInRow[letterCounter].style.animation = 'grow 250ms 1';

    if (noMatch.includes(letterCounter)) {
      colInRow[letterCounter].classList.add('never');
    }

    if (fullMatch.includes(letterCounter)) {
      colInRow[letterCounter].classList.add('full');
    }

    if (partialMatch.includes(letterCounter)) {
      colInRow[letterCounter].classList.add('part');
    }

    letterCounter += 1;

    if (letterCounter > colInRow.length - 1) {
      clearInterval(interval);
      if (loose === true) {
        setTimeout(() => {
          gameResult(state, 'loose', state.looseValue, func);
        }, 450);
        return false;
      }
      if (fullMatch.length === colInRow.length) {
        setTimeout(() => {
          gameResult(state, 'win', state.winValue, func);
        }, 450);
      }

      enableKeyEvent(func);
    }
  }, time);
}



export function playGame(state) {
  state.settings.openModal();
  setDisplayNone('leaderboardBlock');
}

export function endGame(state) {
  const playButton = <HTMLElement>getElement('playButton');
  playButton.style.display = 'block';
  const playTable = <HTMLElement>getElement('gameplayTable');
  playTable.innerHTML = '';
  state.modal.closeModal();
  state.looseValue = null;
  state.winValue = null;
  state.tryCounter = null;
  state.lengthCounter = null;
  state.rowList = null;
  state.colList = null;
  state.currentRow = null;
  state.currentCol = null;
  state.firstLetter = null;
  state.word = null;
  return state;
}

export function checkLastGame(state) {
  fetch('/user/last')
    .then((res) => res.json())
    .then((data) => {
      if (data.message === 'NOT_FINISHED') {
        continueLastGame(state, data);
      } else {
        const button = <HTMLElement>getElement('playButton');
        button.style.display = 'block';
      }
    });
}

function continueLastGame(state, obj) {
  const words = obj.words === null ? null : obj.words.split('');
  const table = <HTMLElement>getElement('gameplayTable');
  const gameplay = <HTMLElement>getElement('gameplayBlock');
  state.looseValue = obj.loose;
  state.winValue = obj.win;
  state.lengthCounter = obj.length;
  state.tryCounter = obj.tryCounter;
  state.firstLetter = obj.currentTry * obj.length;
  state.currentRow = obj.currentTry;
  state.currentCol = obj.currentTry * obj.length;
  gameplay.style.display = 'flex';
  console.log(state);
  table.append(generateUsedGameField(state.lengthCounter, state.tryCounter, words));
  state.rowList = getNodeList('.gameplay__row');
  state.colList = getNodeList('.gameplay__col');
  const func = (event) => {
    enterTheLetter(state, event, func);
  };
  document.addEventListener('keydown', func);
}

export function generateUsedGameField(wordLength, tryCounter, words) {
  const dataFragment = document.createDocumentFragment();
  let counter = 0;
  for (let i = 0; i < tryCounter; i += 1) {
    const tr = document.createElement('tr');
    tr.classList.add('gameplay__row');

    for (let m = 0; m < wordLength; m += 1) {
      const th = document.createElement('th');
      th.classList.add('gameplay__col');

      if (words !== null && words[counter] !== undefined) {
        th.classList.add('blocked');
        th.innerText = words[counter].toUpperCase();
      }
      counter += 1;
      tr.append(th);
    }

    dataFragment.append(tr);
  }
  return dataFragment;
}
