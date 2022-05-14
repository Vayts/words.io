import {
  appendChild,
  checkRegexMatch,
  createValidateLi,
  getInputValue,
  getMatch,
  removeChild
} from './helpers';

export function validateLogin(value) {
  const result = [false, false];
  const loginRegex = /^[a-zA-Z0-9_]*$/;

  if (value.length > 4 && value.length < 21) {
    result[0] = true;
  }

  if (getMatch(value, loginRegex)) {
    result[1] = true;
  }

  return result;
}

export function validatePassword(value) {
  const latinRegex = /^[a-zA-Z0-9!@#$%^&*]+$/g;
  const specialSymbolRegex = /[!@#$%^&*_]/;
  const numberRegex = /[0-9]/;
  const result = [false, false, false, false];

  if (value.length > 8 && value.length < 255) {
    result[0] = true;
  }

  if (checkRegexMatch(value.split(''), specialSymbolRegex)) {
    result[1] = true;
  }

  if (checkRegexMatch(value.split(''), numberRegex)) {
    result[2] = true;
  }

  if (getMatch(value, latinRegex)) {
    result[3] = true;
  }

  return result;
}

export function validateConfirmPassword(value) {
  const latinRegex = /^[a-zA-Z0-9!@#$%^&*]+$/g;
  const specialSymbolRegex = /[!@#$%^&*_]/;
  const numberRegex = /[0-9]/;
  const password = getInputValue('registerPassword');
  const result = [false, false, false, false, false];

  if (value.length > 8 && value.length < 255) {
    result[0] = true;
  }

  if (checkRegexMatch(value.split(''), specialSymbolRegex)) {
    result[1] = true;
  }

  if (checkRegexMatch(value.split(''), numberRegex)) {
    result[2] = true;
  }

  if (getMatch(value, latinRegex)) {
    result[3] = true;
  }

  if (value !== '' && password === value) {
    result[4] = true;
  }

  return result;
}

export function generateValidationList(func, inputId, rules, listId) {
  removeChild(listId);
  const validateListFragment = document.createDocumentFragment();
  const validationResult = func(getInputValue(inputId));

  validationResult.forEach((el, index) => {
    if (el === false) {
      validateListFragment.append(createValidateLi(rules[index], 'validation__item_fail'));
    } else {
      validateListFragment.append(createValidateLi(rules[index], 'validation__item'));
    }
  });

  appendChild(listId, validateListFragment);
  return validateListFragment;
}

export function removeValidationList(event) {
  event.target.style.borderColor = '#93939359';
  removeChild('validationList');
}
