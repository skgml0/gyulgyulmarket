import { 
  BASE_URL,
  MAX_AGE,
  TOKEN_KEY,
  ACCOUNT_NAME
} from '../constant.js';

export default class Auth {
  
  static setToken(token, maxAge = MAX_AGE) {
    document.cookie = `${TOKEN_KEY}=${token}; max-age=${maxAge};`;
  }

  static getToken() {
    let jwt = document.cookie
      .split(' ')
      .filter((v) => v.split('=')[0] === TOKEN_KEY)
      .join('')
      .split('=')[1];

    if (jwt && jwt[jwt.length - 1] === ';') {
      jwt = jwt.slice(0, jwt.length - 1);
    }
    return jwt;
  }

  static async SignUp(email, password) {

    try {
      const user = {
        email,
        password,
        username: 'deaultUserName',
        accountname: 'user'+String(Math.floor(Math.random()*99999999999)),
        intro: 'intro',
        image: null
      }

      return await fetch(`${BASE_URL}/user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({user})
      })
      .then(res => res.json())      
      .then(res => res)
      .catch((error) => {
        console.error(error);
      });
    } catch (error) {
      console.error(error);
    }
  }

  static setProfile(user) {
    const token = this.getToken();
    if(!token) {
      return {
        message: '토큰 없음'
      }
    }

    return fetch(`${BASE_URL}/user`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({user})
    })
    .then(res => res.json())
    .then(res => {
      if(!res.message) { // SUCCESS
        localStorage.setItem(ACCOUNT_NAME, user.accountname);
        return {
          ...res,
          message: '프로필 수정 성공'
        }
      } else {
        return res;
      }
    })
  }

  static async getProfile() {
    const token = this.getToken();
    const accountname = localStorage.getItem(ACCOUNT_NAME);
    if (!token || !accountname) {
      return {
        isLogin: false,
        message: !token ? '토큰 없음' : '계정ID 없음'
      }
    }

    const userProfile = await fetch(`${BASE_URL}/profile/${accountname}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }).then(res => res.json());

    if (!userProfile.message) { // SUCCESS
      return {
        ...userProfile,
        isLogin: true
      }
    } else {
      return {
        ...userProfile,
        isLogin: false,
      }
    }
  }

  static Login(email, password) {
    const user = {email, password};

    return fetch(`${BASE_URL}/user/login`, {
      method: 'POST',
      headers: {
        'Content-Type':'application/json'
      },
      body: JSON.stringify({user})
    })
    .then(res => res.json())
    .then(res => {
      if (!res.message) { // Success
        this.setToken(res.user.token);
        localStorage.setItem(ACCOUNT_NAME, res.user.accountname);
        return {
          ...res,
          message: '로그인 성공'
        }
      } else { // Fail
        return res;
      }
    })
    .catch(err => {
      console.error(err);
    })
  }

  static Logout() {
    this.setToken(this.getToken(), 0);
    localStorage.setItem(ACCOUNT_NAME, '');
    window.location.reload();
  }
}
