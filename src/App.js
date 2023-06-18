import React, { useState,useRef } from 'react';
import './App.css';
import { Auth } from './Auth';
import Cookies from 'universal-cookie/cjs/Cookies';
import { Chat } from './Chat';
import { signOut } from 'firebase/auth';
import { auth } from './firebase-config';
const cookie = new Cookies();



function App() {
  const[isAuth,setIsAuth] = useState(cookie.get("auth-token"));
  const [room,setRoom] = useState(null);
  const inputref = useRef(null);


  const signUserOut = async()=>{
    await signOut(auth);
    cookie.remove("auth-token");
    setIsAuth(false);
    setRoom(null);
  }

  if(!isAuth){
    return(
      <div>
        <Auth setIsAuth = {setIsAuth} />
      </div>
     )
  }
  return(
    <>
      {room?(
        <div>
          <Chat room = {room} handleSignout = {signUserOut}/>
        </div>
      ):
      (<div className='room-details'>
        <label className='header1'>Please enter your Key </label>
        <input className='room-input' ref={inputref} ></input>
        <button className='enter-button' onClick={()=>setRoom(inputref.current.value)}>enter</button>
        <div>
        <button className='app-signout-button' onClick={signUserOut}>sign Out</button>
      </div>
      </div>)
      
      }
      
    </>
  )

 
}

export default App;
