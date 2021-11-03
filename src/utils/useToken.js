import { useState } from 'react';

export default function useToken() {  

  const getToken = () => {
    const tokenString = localStorage.getItem('tokenHP');
    const userToken = JSON.parse(tokenString);    
    return userToken?.token
  };
  
  const getUsername = () => {
    const tokenString = localStorage.getItem('tokenHP');
    const userName = JSON.parse(tokenString);        
    return userName?.username
  };

  const saveToken = userToken => {
    localStorage.setItem('tokenHP', JSON.stringify(userToken));
    setToken(userToken.token);
  };

  const [token, setToken] = useState(getToken());

  return {
    setToken: saveToken, token, getUsername, 
  }

  
}

