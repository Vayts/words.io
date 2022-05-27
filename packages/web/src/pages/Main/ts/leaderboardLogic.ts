import { getElement, removeChild, setDisplayFlex, setDisplayNone } from '../../../utils/ts/helpers';

export function generateLeaderboardItem(user, index, currentUser = false) {
  const li = document.createElement('li');
  li.classList.add('leaderboard__item');
  li.innerHTML =
    '<div class="leaderboard__content">' +
    '<div class="leaderboard__place"' +
    `<span class="leaderboard__place-number">${index + 1}</span>` +
    '</div>' +
    '<div class="leaderboard__user-info">' +
    `<div class="leaderboard__name">${user.login}</div>` +
    `<div class="leaderboard__pts">${user.pts}</div>` +
    '</div>';

  if (currentUser) {
    li.classList.add('leaderboard__item_selected');
  }

  return li;
}

export function addUserToLeaderBoard(user) {
  const table = <HTMLElement>getElement('leaderboardTable');
  const design = document.createElement('li');
  design.classList.add('leaderboard__design');
  const li = document.createElement('li');
  li.classList.add('leaderboard__item');
  li.classList.add('leaderboard__item_selected');
  li.innerHTML =
    '<div class="leaderboard__content">' +
    '<div class="leaderboard__place"' +
    `<span class="leaderboard__place-number">${user.place + 1}</span>` +
    '</div>' +
    '<div class="leaderboard__user-info">' +
    `<div class="leaderboard__name">${user.login}</div>` +
    `<div class="leaderboard__pts">${user.pts}</div>` +
    '</div>';
  table.append(design);
  table.append(li);
}

export function generateLeaderboard(users, login = '') {
  const table = <HTMLElement>getElement('leaderboardTable');
  users.forEach((el: any, index) => {
    if (el.login !== login) {
      table.append(generateLeaderboardItem(el, index));
    } else {
      table.append(generateLeaderboardItem(el, index, true));
    }
  });
}

export function getLeaderboard() {
  removeChild('leaderboardTable');
  setDisplayNone('gameplayBlock');
  setDisplayNone('vocabularyBlock');
  setDisplayFlex('leaderboardBlock');
  fetch('/user/leaderboard')
    .then((res) => res.json())
    .then((data) => {
      if (data.message === 'USER_INCLUDED') {
        generateLeaderboard(data.board, data.user.login);
      }

      if (data.message === 'USER_NOT_INCLUDED') {
        generateLeaderboard(data.board);
        addUserToLeaderBoard(data.user);
      }
    })
    .catch(() => {
      console.log('ERROR');
    });
}
