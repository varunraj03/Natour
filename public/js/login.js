// import axios from 'axios';
// import { showAlert } from './alerts';

export const hideAlert = () => {
  const el = document.querySelector('.alert');
  if (el) el.parentElement.removeChild(el);
};

// type is 'success' or 'error'
export const showAlert = (type, msg) => {
  hideAlert();
  const markup = `<div class="alert alert--${type}">${msg}</div>`;
  document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
  window.setTimeout(hideAlert, 5000);
};


export const login = async (email, password) => {

const responce = await fetch('http://localhost:3000/api/v1/users/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email,
    password,
  }),
})
const data = await responce.json();
if (data.status === 'success') {
  showAlert('success', 'Logged in successfully!');
  window.setTimeout(() => {
    location.assign('/');
  }, 1500)}

if(data.status === 'fail'){
  showAlert('Fail', data.message);
}
}


export const logout = async () => {
  try {
    const responce = await fetch('http://localhost:3000/api/v1/users/logout')
    // const data = await responce.json();
    const data = await responce.json();
    if ((data.status = 'success')) location.reload(true);
  } catch (err) {
    console.log(err);
    showAlert('error', 'Error logging out! Try again.');
  }
};

export const updateSettings = async (data, type) => {
    const url =
      type === 'password'
        ? 'http://127.0.0.1:3000/api/v1/users/updateMyPassword'
        : 'http://127.0.0.1:3000/api/v1/users/updateMe';
      
    // const responce = await fetch(url,{
    //   method: 'PATCH',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${document.cookie.split('=')[1]}`
    //   },
    //   body: JSON.stringify(
    //   data
    //   )
    // })

    const res = await axios({
      method: 'PATCH',
      url,
      headers: {'Authorization': `Bearer ${document.cookie.split('=')[1]}`},
      data
    });

    // const actdata = await responce.json();
    console.log(res); 

    if (res.data.status === 'success') {
      showAlert('success', `${type.toUpperCase()} updated successfully!`);
    }
    if(res.data.status === 'fail'){
      showAlert('error', err.response.data.message);
    }
};


// DOM ELEMENTS
const loginForm = document.querySelector('.form--login');
const logOutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');


if (loginForm)
  loginForm.addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });

if (logOutBtn) logOutBtn.addEventListener('click', logout);

if (userDataForm)
  userDataForm.addEventListener('submit', e => {
    e.preventDefault();
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);
    console.log(form);

    updateSettings(form, 'data');
    // const name = document.getElementById('name').value;
    // const email = document.getElementById('email').value;
    // updateSettings({ name, email }, 'data');
  });

if (userPasswordForm)
  userPasswordForm.addEventListener('submit', async e => {
    e.preventDefault();
    document.querySelector('.btn--save-password').textContent = 'Updating...';

    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    await updateSettings(
      { passwordCurrent, password, passwordConfirm },
      'password'
    );

    document.querySelector('.btn--save-password').textContent = 'Save password';
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  })
