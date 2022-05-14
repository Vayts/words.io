import '../../styles/main.scss';
import { getElement, addListener, getInputValue, setTextValue, getLocalStorageItem} from '../../../utils/ts/helpers';
import {changeGameValue, displayCounter, loadUserInfo, startGame} from './logic';

document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

function initApp() {
  const state = {
    looseValue: null,
    winValue: null,
    tryCounter: null,
    lengthCounter: null,
    rowList: null,
    colList: null,
    currentRow: null,
    currentCol: null,
    firstLetter: null,
    word: null,
  };

  addListener('wordLengthInput', 'input', displayCounter.bind(null, state, 'wordLengthDisplay', 'wordLengthInput'));
  addListener('tryCounterInput', 'input', displayCounter.bind(null, state, 'tryCounterDisplay', 'tryCounterInput'));
  addListener('settingsButton', 'click', startGame.bind(null, state));

  setTextValue('userName', getLocalStorageItem('username'))
  changeGameValue(state);
  loadUserInfo();
}


