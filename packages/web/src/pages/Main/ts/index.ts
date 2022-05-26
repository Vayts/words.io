import '../../styles/main.scss';
import {
  addListener,
  setTextValue,
  getLocalStorageItem,
} from '../../../utils/ts/helpers';
import {
  changeGameValue,
  checkLastGame,
  displayCounter,
  endGame,
  loadUserInfo,
  playGame,
  startGame,
} from './logic';
import { ModalResult } from '../../../components/Modal/modalResult';
import { ModalSettings } from '../../../components/Modal/modalSettings';
import { getLeaderboard } from './leaderboardLogic';
import {
  addWord,
  adminControl,
  deleteWord,
  drawVocabularyList,
  getVocabulary,
  sortVocabulary,
} from './vocabularyLogic';

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
    userPts: null,
    modal: new ModalResult(),
    settings: new ModalSettings('settingsModal'),
    vocabularyMessageTimeout: null,
    vocabulary: null,
    vocabularySortValue: null,
  };

  addListener('wordLengthInput', 'input', displayCounter.bind(null, state, 'wordLengthDisplay', 'wordLengthInput'));
  addListener('tryCounterInput', 'input', displayCounter.bind(null, state, 'tryCounterDisplay', 'tryCounterInput'));
  addListener('playButton', 'click', playGame.bind(null, state));
  addListener('settingsButton', 'click', startGame.bind(null, state));
  addListener('modalButton', 'click', endGame.bind(null, state));
  addListener('leaderboardButton', 'click', getLeaderboard);
  addListener('vocabularyButton', 'click', getVocabulary.bind(null, state));
  addListener('vocabularyAddButton', 'click', addWord.bind(null, state));
  addListener('controlList', 'click', sortVocabulary.bind(null, state));
  addListener('vocabularyList', 'click', deleteWord.bind(null, state));
  addListener('adminControlList', 'click', adminControl.bind(null, state));
  setTextValue('userName', getLocalStorageItem('username'));
  changeGameValue(state);
  loadUserInfo(state);
  checkLastGame(state);
}
