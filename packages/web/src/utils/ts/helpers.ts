export function addListener(id, eventType, cb): boolean {
  const node = document.getElementById(id);

  if (node) {
    node.addEventListener(eventType, cb);
    return true;
  }
  return false;
}

export function getElement(id): Node | boolean {
  const node = document.getElementById(id);

  if (node) {
    return node;
  }
  return false;
}

export function setTextValue(id, text): boolean {
  const node = document.getElementById(id);

  if (node) {
    node.innerText = text;
    return true;
  }
  return false;
}

export function getTextValue(id): boolean | string {
  const node = document.getElementById(id);

  if (node) {
    return node.textContent;
  }
  return false;
}

export function setDisplayNone(id): boolean {
  const node = document.getElementById(id);

  if (node) {
    node.style.display = 'none';
    return true;
  }
  return false;
}

export function setDisplayFlex(id): boolean {
  const node = document.getElementById(id);

  if (node) {
    node.style.display = 'flex';
    return true;
  }
  return false;
}

export function setInputValue(id, value): boolean {
  const input = <HTMLInputElement>document.getElementById(id);

  if (input) {
    input.value = value;
    return true;
  }
  return false;
}

export function getInputValue(id): any | boolean {
  const input = <HTMLInputElement>document.getElementById(id);

  if (input) {
    return input.value;
  }
  return false;
}

export function getRandomNum(min, max): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function getNodeList(className): NodeList | boolean {
  const nodeList = document.querySelectorAll(className);

  if (nodeList) {
    return nodeList;
  }
  return false;
}

export function collectData(id): URLSearchParams {
  const data = new URLSearchParams();
  const formData = new FormData(<HTMLFormElement>getForm(id));
  for (const values of formData) {
    data.append(values[0], <string>values[1]);
  }
  return data;
}

export function getForm(id): HTMLFormElement | boolean {
  const form = <HTMLFormElement>document.getElementById(id);

  if (form) {
    return form;
  }
  return false;
}

export function appendChild(id, value): boolean {
  const node = document.getElementById(id);

  if (node) {
    node.appendChild(value);
    return true;
  }
  return false;
}

export function clearRow(cols, start) {
  cols.forEach((el, index) => {
    if (index >= start) {
      el.classList.remove('filled');
      el.innerText = '';
    }
  });
}

export function getWord(row): string {
  let word = '';
  row.childNodes.forEach((el) => {
    word += el.textContent;
  });
  return word;
}

export function disableKeyEvent(func) {
  document.removeEventListener('keydown', func);
}

export function enableKeyEvent(func) {
  document.addEventListener('keydown', func);
}

export function createValidateLi(text, className) {
  const li = document.createElement('li');
  li.classList.add(className);
  li.innerText = text;
  return li;
}

export function getMatch(value, regex): Node | boolean {
  if (value) {
    return value.match(regex);
  }
  return false;
}

export function removeChild(id): boolean {
  const node = document.getElementById(id);

  if (node) {
    while (node.firstChild) {
      node.removeChild(node.firstChild);
    }
    return true;
  }
  return false;
}

export function checkRegexMatch(arr, regex) {
  return arr.some((el) => getMatch(el, regex));
}

export function makeLabelPosition(event): boolean {
  if (event.target.classList.contains('authentication__input')) {
    event.target.style.borderColor = '#93939359';
    if (getInputValue(event.target.id) !== '') {
      event.target.parentNode.classList.add('filled');
      return true;
    }
    event.target.parentNode.classList.remove('filled');
    return false;
  }
  return false;
}

export function setErrorAnim(element): boolean {
  if (element) {
    element.style.animation = 'shake 400ms';
    setTimeout(() => {
      element.style.animation = 'none';
    }, 450);
    return true;
  }
  return false;
}

export function getLocalStorageItem(key): string {
  return localStorage.getItem(key);
}

export function setLocalStorageItem(key, value) {
  localStorage.setItem(key, value);
  return true;
}
