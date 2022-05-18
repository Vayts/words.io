import {
  clearRow,
  disableKeyEvent,
  enableKeyEvent,
  getElement,
  getInputValue,
  getNodeList,
  getWord,
  setErrorAnim,
  setTextValue,
} from '../../../utils/ts/helpers';
import 'core-js/es/reflect';
import 'regenerator-runtime/runtime';
// import { ModalResult } from '../../../components/Modal/modalResult';

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
  const settings = <HTMLElement>getElement('settingsBlock');
  const gameplay = <HTMLElement>getElement('gameplayBlock');
  const table = <HTMLElement>getElement('gameplayTable');
  const button = <HTMLElement>getElement('playButton');
  state.lengthCounter = getInputValue('wordLengthInput');
  state.tryCounter = getInputValue('tryCounterInput');
  state.settings.closeModal();
  settings.style.display = 'none';
  gameplay.style.display = 'flex';
  table.append(generateGameField(state.lengthCounter, state.tryCounter));
  button.style.display = 'none';
  fillState(state);
  generateWord(state);
  const func = (event) => {
    enterTheLetter(state, event, func);
  };
  document.addEventListener('keydown', func);
}

export function generateWord(state) {
  fetch(`http://localhost:3000/word/generate/${state.lengthCounter}/${state.tryCounter}`).then((value) => {});
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
    fetch(`http://localhost:3000/word/check`, {
      method: 'POST',
      body: JSON.stringify(word),
    })
      .then((response) => response.json())
      .then((value: any) => {
        if (value.message === 'WIN') {
          highlightLetter(state, value.wordAnalyse, func, false);
          resolve('WIN');
        }

        if (value.message === 'WORD_DOESNT_EXIST') {
          reject('Error! Wrong word.');
        }

        if (value.message === 'WORD_EXIST') {
          highlightLetter(state, value.wordAnalyse);
          resolve('CONTINUE');
        }

        if (value.message === 'LOOSE') {
          highlightLetter(state, value.wordAnalyse, func, true);
          resolve('LOOSE');
        }

        reject('Error!');
      });
  });
}

export function loadUserInfo(state) {
  fetch('http://localhost:3000/user/pts')
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

function gameWin(state, func) {
  highlightWord(state);
  disableKeyEvent(func);
}

export function looseGame(state, func) {
  disableKeyEvent(func);
  gameResult(state, 'loose', state.looseValue);
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
      .then((value: string) => {
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

export function gameResult(state, result, value) {
  state.modal.fillModal('mainModal', result, value, state.userPts);
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
          looseGame(state, func);
        }, 450);
        return false;
      }
      if (fullMatch.length === colInRow.length) {
        setTimeout(() => {
          gameResult(state, 'win', state.winValue);
        }, 450);
      }

      enableKeyEvent(func);
    }
  }, time);
}
