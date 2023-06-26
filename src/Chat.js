import { useEffect, useRef, useState } from "react";
import{db,auth}from "./firebase-config";
import "./Chat.css";
import { addDoc, collection, onSnapshot, orderBy, query, serverTimestamp, where,deleteDoc, doc, updateDoc, getDoc, and} from "firebase/firestore";
import { getDownloadURL, getStorage, ref, uploadBytesResumable }from "firebase/storage";




export const Chat = (props)=>{
    const{room,handleSignout} = props;
    const[newMessages,setNewMessages] = useState("");
    const messageRef = collection(db,"messages");
    const [messages,setMessages] = useState([]);
    const messagesRef = useRef(null);
    const[image,setImage] = useState(null);
    const storage = getStorage();
    const userRef = collection(db,"users");
    const [users,setUsers] = useState(null);
    const [loggedIn,setLoggedIn] = useState(true);
    const [isElementVisible,setIsElementVisible] = useState(false);


    
 

    useEffect(()=>{
        const queryMessages = query(messageRef,where("room","==",room),orderBy("createdAt"));
        const unsubscribe = onSnapshot(queryMessages,(snapshot)=>{
            let messages = [];
            snapshot.forEach((doc)=>{
                messages.push({
                    ...doc.data(),id:doc.id
                });
            })
             setMessages(messages);

            const docref = doc(db,"users",auth.currentUser.displayName);
            const docSnap =  getDoc(docref);

            updateDoc(docref,{
                room:room,
                logInTime:serverTimestamp(),
                isOnline:true
            })


            if (messages.length > 0) {
                messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
            }

        });
        return ()=>unsubscribe();
        

    },[]);

    useEffect(()=>{
        const queryUsers = query(userRef,where("room","==",room),where("name","!=",auth.currentUser.displayName));
        const unsubscribe = onSnapshot(queryUsers,(user)=>{
            user.forEach(user=>{
                setUsers(user.data());
            })
        });
        return ()=>unsubscribe();

    },[]);

    useEffect(()=>{
        messagesRef.current?.scrollIntoView();
    },[messages])


    const handleSubmit = async(e)=>{
        e.preventDefault();
        if(newMessages ==="" && image===null){
            return;
        }
        if(newMessages === "" && image!==null){
            const storageRef = ref(storage,auth.currentUser.displayName);
            const uploadTask = uploadBytesResumable(storageRef,image);
            uploadTask.on(
            (error) => {
              console.error(error);
            }, 
            () => {
              // Handle successful uploads on complete
              // For instance, get the download URL: https://firebasestorage.googleapis.com/...
              getDownloadURL(uploadTask.snapshot.ref).then(async(downloadURL) => {
                await addDoc(messageRef,{
                    text:newMessages,
                    createdAt:serverTimestamp(),
                    user: auth.currentUser.displayName,
                    img:downloadURL,
                    room
        
        
        
                });
                setNewMessages("");
                setImage(null);
                return;
              });
            }
          );

        }else{
            await addDoc(messageRef,{
                text:newMessages,
                createdAt:serverTimestamp(),
                user: auth.currentUser.displayName,
                room
    
    
    
            });
            setNewMessages("");
            setImage(null);

        }
        

    }
    const deleteChat = ()=>{
        messages.forEach((message)=>{
            deleteDoc(doc(db,"messages",message.id));
        })
    }
    const deleteSingle = (id,user,curUser)=>{
        if(user===curUser){
            deleteDoc(doc(db,"messages",id));
        }
    }
    const handleToggleMenu = ()=>{
        setIsElementVisible(!isElementVisible);
    }
    const checkForInactivity = ()=>{
        const expireTime = localStorage.getItem("expireTime");

        if(loggedIn && expireTime<Date.now()){
            console.log("log out");
            const docref = doc(db,"users",auth.currentUser.displayName);
            updateDoc(docref,{
                logInTime:serverTimestamp(),
                isOnline:false
            })
            setLoggedIn(false);
            
            
            
        }
    }
    
    const updateExpire = ()=>{
        const expireTime = Date.now()+20000
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
    

    return(
        <div className="chat-app">
            <div className="header">
                {users?(
                    <div className="user-details">
                        <div className="user-dp">
                            <img src={users.photoURL} alt="user profile"/>
                            
                            
                            
                        </div>
                        <div className="onlineStatus">
                        <p>{users.isOnline?"online":"last seen:"+users.logInTime.toDate().toString().substring(4,10)+users.logInTime.toDate().toString().substring(15,21)}</p>
                        </div>
                    </div>
                )
                :
                <div className="user-details">
                    <div className="user-dp">
                        <h3>Dp</h3>
                    </div>
                </div>
                }
                
                <div onClick={handleToggleMenu} className="toggle-menu">
                    ...
                    
                </div>
                
                    
            </div>
            <div className="messages">
                    <div className="toggle-menu-ms" style={{display : isElementVisible?"flex":"none"}}>
                       <button onClick={deleteChat} className="delete-button">delete for all</button>
                       <button onClick={handleSignout}  className="inchat-signout-button">sign Out</button>
                    </div>
                {messages.map((message)=>(
                    <div   style={message.user === auth.currentUser.displayName?{alignSelf:"flex-end"}:{alignSelf:"flex-start"}}>
                        <div onClick={()=>{deleteSingle(message.id,message.user,auth.currentUser.displayName)}} style={message.user === auth.currentUser.displayName ?{backgroundColor:"rgb(4,57,38)",borderRadius:"10px 15px 0px 15px"}:{backgroundColor:"gray",borderRadius:"15px 10px 15px 0px"}} className="message" key={message.id}>
                        
                         <div className="text">{message.text}</div>
                         <div className="image">
                            {message.img&&<img src={message.img}/>}
                         </div>

                        
                        <p className="time">{message.createdAt? message.createdAt.toDate().toString().substring(4,21):""}</p>
                        


                        
                        </div>
                        <div>
                            
                        </div>
                        
                        
                    </div>
                    
                ))}
                <div ref={messagesRef}/>
            </div>
            <form onSubmit={handleSubmit} className="new-message-form">
                <input className="new-message-input" onChange={(e)=>setNewMessages(e.target.value)} value={newMessages} placeholder="type your message here"/>
                {/* <input onChange={(e)=>setImage(e.target.files[0])} type="file"></input> */}
                <button className="send-button" type="submit"> ❤️ </button>
            </form>
        </div>
    )
}