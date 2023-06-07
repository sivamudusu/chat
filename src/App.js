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
        <Auth setIsAuth = {setIsAuth}/>
      </div>
     )
  }
  return(
    <>
      {room?(
        <div>
          <Chat room = {room}/>
        </div>
      ):
      (<div className='room-details'>
        <label className='header1'>enter room name</label>
        <input className='room-input' ref={inputref} ></input>
        <button className='enter-button' onClick={()=>setRoom(inputref.current.value)}>enter</button>
      </div>)
      }
      <div>
        <button className='signout-button' onClick={signUserOut}>sign Out</button>
      </div>
    </>
  )

 
}

export default App;
