import { validateLogin, validatePassword } from '../../utils/ts/validation';
import {
  collectData,
  getElement,
  getInputValue,
  setErrorAnim,
  setInputValue, setLocalStorageItem,
  setTextValue
} from '../../utils/ts/helpers';

function totalLoginInValidate() {
  const validateResult = [
    validateLogin(getInputValue('loginInLogin')),
    validatePassword(getInputValue('loginInPassword')),
  ];
  const validateElems = [getElement('loginInLogin'), getElement('loginInPassword')];
  let isDataCorrect = true;

  validateResult.forEach((el, index) => {
    const validateItem = <HTMLElement>validateElems[index];
    if (el.includes(false)) {
      setErrorAnim(validateItem.parentNode);
      validateItem.style.borderColor = '#d90023';
      isDataCorrect = false;
    }
  });

  return isDataCorrect;
}

export function collectLoginInData() {
  const totalValidate = totalLoginInValidate();
  setTextValue('loginErrorText', '');

  if (totalValidate) {
    const data = collectData('loginInForm');
    fetch('/auth/login', {
      method: 'POST',
      body: data,
    })
      .then((res) => {
        if (res.redirected) {
          setLocalStorageItem('username', getInputValue('loginInLogin'));
          setInputValue('loginInLogin', '');
          window.location.href = res.url;
          return true;
        }

        return res.json();
      })
      .then((value: any) => {
        if (value.message === 'WRONG_LOGIN_PASSWORD') {
          setTextValue('loginErrorText', 'Неправильный логин или пароль');
        }
      });
    return true;
  }
  setTextValue('loginErrorText', 'Неправильный логин или пароль');
  return false;
}
