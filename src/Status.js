import React, { useEffect, useState } from 'react'
import "./Status.css";

function Status() {
    const [loggedIn,setLoggedIn] = useState(true);

    const checkForInactivity = ()=>{
        const expireTime = localStorage.getItem("expireTime");

        if(expireTime<Date.now()){
            console.log("log out");
            setLoggedIn(false);
        }
    }

    const updateExpire = ()=>{
        const expireTime = Date.now()+10000
        localStorage.setItem("expireTime",expireTime);
    }

    useEffect(()=>{
        const interval = setInterval(()=>{
            checkForInactivity();
        },5000);
        return ()=> clearInterval(interval);
    },[]);

    useEffect(()=>{
        updateExpire();

        window.addEventListener("click",updateExpire);
        window.addEventListener("scroll",updateExpire);
        window.addEventListener("keypress",updateExpire);
        window.addEventListener("mousemove",updateExpire);


        return ()=>{
            window.addEventListener("click",updateExpire);
            window.addEventListener("scroll",updateExpire);
            window.addEventListener("keypress",updateExpire);
            window.addEventListener("mousemove",updateExpire);

        }
    },[]);





  return (
    <div className='so'>
        logged in : {loggedIn.toString()}
    </div>
  )
}

export default Status