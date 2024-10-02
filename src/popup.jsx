import React, { useEffect, useState } from 'react'
import { render } from 'react-dom'
import Login from './components/Login.jsx';
import Cookies from 'js-cookie';
import Dashboard from './components/Dashboard.jsx';


const Popup = () => {
  const [token,setToken] = useState(null);

  useEffect(()=>{
    const token = Cookies.get('authToken');
    setToken(token);
    console.log(token);  
  })

 return <>
    {token ? <Dashboard setToken={setToken}/>:<Login setToken={setToken}/>}
  </>
};

export default Popup;


render(<Popup/>,document.getElementById("react-target"));