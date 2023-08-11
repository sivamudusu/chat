import React, { useState,useRef } from 'react';
import './App.css';
import { Auth } from './Auth';
import Cookies from 'universal-cookie/cjs/Cookies';
import { Chat } from './Chat';
import { signOut } from 'firebase/auth';
import { auth, db } from './firebase-config';
import Status from './Status';
import { doc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
const cookie = new Cookies();



function App() {
  const[isAuth,setIsAuth] = useState(cookie.get("auth-token"));
  const [room,setRoom] = useState(null);
  const inputref = useRef(null);

  
  const month = new Date().getMonth();
    const date = new Date().getDate();
    const day = new Date().getDay();
    const hours = new Date().getHours();
    const hours12 = hours>=13?hours%12 : hours;
    const min = new Date().getMinutes();
    const sec = new Date().getSeconds();
    const ampm = hours>=13?"PM":"AM";


  


  const signUserOut = async()=>{
    const docref = doc(db,"users",auth.currentUser.displayName);
    const docSnap =  getDoc(docref);

    await updateDoc(docref,{
        logInTime:date+"/"+month+" "+hours12+":"+min+ampm,      
        isOnline:false
    })

    await signOut(auth);
    cookie.remove("auth-token");
    setIsAuth(false);
    setRoom(null);
    
  }

  if(!isAuth){
    return(
      <div>
      {/* <Status></Status> */}
        <Auth setIsAuth = {setIsAuth} />
      </div>
     )
  }
  return(
    <>
      {room?(
        <div>
          <Chat auth = {isAuth} room = {room} handleSignout = {signUserOut}/>
        </div>
      ):
      (<div class="form">
      <p class="login">please enter your key</p>
      <div class="inputContainer">
        
        <input placeholder="your key"  ref = {inputref} class="fInput email"/>
        
        <button type="button" value="Enter" onClick={()=>setRoom(inputref.current.value)} class="submit">Enter</button>
      </div>
      
      <button onClick={signUserOut} class="forget">Sign Out</button>
      <div class="con">
        <p>dont share your Key with other than your bae😍?</p>
       
        
        
        
      </div>
    </div>)
      
      }
      
    </>
  )

 
}

export default App;
