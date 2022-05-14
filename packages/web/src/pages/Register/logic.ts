import { validateConfirmPassword, validateLogin, validatePassword } from '../../utils/ts/validation';
import {
  collectData,
  getElement,
  getInputValue,
  setErrorAnim,
  setInputValue,
  setTextValue,
} from '../../utils/ts/helpers';

export function totalRegisterValidate(): boolean {
  const validateResult = [
    validateLogin(getInputValue('registerLogin')),
    validatePassword(getInputValue('registerPassword')),
    validateConfirmPassword(getInputValue('registerConfirmPassword')),
  ];
  const validateElems = [
    getElement('registerLogin'),
    getElement('registerPassword'),
    getElement('registerConfirmPassword'),
  ];
  let isDataCorrect = true;

  validateResult.forEach((el, index) => {
    const validateItem = <HTMLElement>validateElems[index];
    if (el.includes(false)) {
      setErrorAnim(validateItem.parentNode);
      validateItem.style.borderColor = '#d90023';
      isDataCorrect = false;
    } else {
      validateItem.style.borderColor = '#3bd510';
    }
  });

  return isDataCorrect;
}

export function collectRegisterData(): boolean {
  const totalValidate = totalRegisterValidate();
  setTextValue('registerErrorText', '');

  if (totalValidate) {
    const data = collectData('registerForm');
    fetch('http://localhost:3000/auth/register', {
      method: 'POST',
      body: data,
    })
      .then((res) => res.json())
      .then((result: any) => {
        if ((result.message === 'LOGIN_IN_USE')) {
          const login = <HTMLElement>getElement('registerLogin');
          setTextValue('registerErrorText', 'Логин уже используется');
          login.style.borderColor = '#d90023';
          setErrorAnim(login.parentNode);
        }
      })
      .catch((value) => {
        console.log(value);
      });
  }
  setTextValue('registerErrorText', 'Проверьте введенные данные');
  return false;
}
