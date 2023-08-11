import { useEffect, useRef, useState } from "react";
import { ToastContainer,toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import{db,auth}from "./firebase-config";
import "./Chat.css";
import { addDoc, collection, onSnapshot, orderBy, query, serverTimestamp, where,deleteDoc, doc, updateDoc, getDoc, and} from "firebase/firestore";
import { getDownloadURL, getStorage, ref, uploadBytesResumable }from "firebase/storage";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { faEnvelope,faPaperPlane,faImage,faBell,faUser,faTrash,faReply } from '@fortawesome/free-solid-svg-icons';






export const Chat = (props)=>{
    const{room,handleSignout,isAuth} = props;
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
    const [isOpponentTyping, setIsOpponentTyping] = useState(false);
    const [isMsgVisible, setIsMsgVisible] = useState(false);
    const [selectedMessage,setSelectedMessage] = useState(null);
    const [replyContent,setReplyContent] = useState("");
    const [replyText,setReplyText] = useState(null);
    const [isReplying,setIsReplying] = useState(false);



    
 

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
             const msg = messages[messages.length-1];
             if(msg.user!==auth.currentUser.displayName && !isAuth ){
                showNotification("Drink more water");
             }

            

            const docref = doc(db,"users",auth.currentUser.displayName);
            const docSnap =  getDoc(docref);

            updateDoc(docref,{
                room:room,
                logInTime:date+"/"+month+" "+hours12+":"+min+ampm,
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


    

    const showNotification = (messageText) => {
        if (Notification.permission === 'granted') {
          const notification = new Notification('Drink more water', {
            
          });
      
          notification.onclick = () => {
            // Handle click on the notification (e.g., focus on chat room)
          };
        }
    };



    const month = new Date().getMonth();
    const date = new Date().getDate();
    const day = new Date().getDay();
    const hours = new Date().getHours();
    const hours12 = hours>=13?hours%12 : hours;
    const min = new Date().getMinutes();
    const sec = new Date().getSeconds();
    const ampm = hours>=13?"PM":"AM";



    const handleSubmit = async(e)=>{
        e.preventDefault();
        if(newMessages ==="" && image===null){
            return;
        }
        if(newMessages !== "" && image!==null){
            const imageFileName = `${Date.now()}_${image.name}`;
            const storageRef = ref(storage,imageFileName);
            const uploadTask = uploadBytesResumable(storageRef,image);
            try {
                await uploadTask;
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          
                await addDoc(messageRef, {
                  text: newMessages,
                  createdAt: serverTimestamp(),
                  sendAt: date+"/"+month+" "+hours12+":"+min+ampm,
                  user: auth.currentUser.displayName,
                  img: downloadURL,
                  room
                });
                setNewMessages("");
                setImage(null);
                
              } catch (error) {
                console.error(error);
              }

        }else{
            await addDoc(messageRef,{
                text:newMessages,
                createdAt: serverTimestamp(),
                sendAt: date+"/"+month+" "+hours12+":"+min+ampm,
                user: auth.currentUser.displayName,
                room
    
    
    
            });
            setNewMessages("");
            setImage(null);
            
            

        }
        

    }
    const handleImage = (e)=>{
        const selectedFile = e.target.files[0];

        if(selectedFile){
            setImage(selectedFile);
        }else{
            setImage(null);
        }
    }
    const requestNotificationPermission = async () => {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          console.log('Notification permission granted.');
        }
    };
    
    const deleteChat = ()=>{
        messages.forEach((message)=>{
            deleteDoc(doc(db,"messages",message.id));
        })
    }
    const deleteSingle = ()=>{
        if(selectedMessage.user===auth.currentUser.displayName){
            deleteDoc(doc(db,"messages",selectedMessage.id));
            setSelectedMessage(null);
        }
    }
    const handleReply = ()=>{
        setIsReplying(true);
    }
    const handleToggleMenu = ()=>{
        setIsElementVisible(!isElementVisible);
    }
    const handleToggleReply = (message)=>{
        setSelectedMessage(message);
        setIsReplying(true)
        
    }
    const clean = ()=>{
        setIsElementVisible(false)
        setSelectedMessage(null)
    }
    const handleReplySubmit = async(event) => {
      event.preventDefault();
      if(replyContent===""){
        return 
      }else{
        await addDoc(messageRef,{
            replyTo:selectedMessage.text,
            text:replyContent,
            createdAt:serverTimestamp(),
            sendAt:date+"/"+month+" "+hours12+":"+min+ampm,
            user:auth.currentUser.displayName,
            room

        })
      }

      
      setReplyContent("");
      setIsReplying(false);
      setSelectedMessage(null)
    };
    
    const checkForInactivity = ()=>{
        const expireTime = localStorage.getItem("expireTime");

        if(loggedIn && expireTime<Date.now()){
            console.log("log out");
            const docref = doc(db,"users",auth.currentUser.displayName);
            updateDoc(docref,{
                logInTime: date+"/"+month+" "+hours12+":"+min+ampm,
                isOnline:false,
            })
            setLoggedIn(false);
            
            
            
        }
    }
    const handleInputChange = (event)=>{
       const inputText = event.target.value;
       
       
      setNewMessages(inputText)
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
                        <p>{users.isOnline?"online":"last seen:"+users.logInTime}</p>
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
                <div onClick={requestNotificationPermission}>
                    <p><FontAwesomeIcon icon={faBell} /></p>
                    {isOpponentTyping && <div className="oppo"> opponentTyping</div>}
                </div>
                
                <div onClick={handleToggleMenu} className="toggle-menu">
                    ...
                    
                </div>
                
                    
            </div>
            <div className="messages">
                    <div className="toggle-menu-ms" style={{display:isElementVisible?"flex":"none"}}>
                       <button onClick={deleteChat} className="delete-button">delete for all</button>
                       <button onClick={handleSignout}  className="inchat-signout-button">sign Out</button>
                    </div>
                    
                    
                {messages.map((message)=>(
                    <div   style={message.user === auth.currentUser.displayName?{alignSelf:"flex-end"}:{alignSelf:"flex-start"}}>
                        <div onClick={()=>handleToggleReply(message)} style={message.user === auth.currentUser.displayName ?{backgroundColor:"rgb(4,57,38)",borderRadius:"10px 15px 0px 15px"}:{backgroundColor:"#454242",borderRadius:"15px 10px 15px 0px"}} className="message" key={message.id}>
                        {/* onClick={()=>{deleteSingle(message.id,message.user,auth.currentUser.displayName)}} */}
                         {message.replyTo&&<div className="replyTo" style={{backgroundColor:"#454242",borderRadius:"15px 10px 15px 0px",fontStyle:"italic"}}>{message.replyTo}</div>}
                         <div     className="text">{message.text}</div>
                         <div className="image">
                            {message.img&&<img style={{maxHeight:"300px",maxWidth:"300px"}} src={message.img}/>}
                         </div>

                        
                        <p  className="time">{message.sendAt? message.sendAt:""}</p>
                        


                        
                        </div>
                        {isReplying && selectedMessage && selectedMessage.id === message.id && (
                          <div>

                            <form onSubmit={handleReplySubmit}>
                                <input onChange={(e) => setReplyContent(e.target.value)} value={replyContent}className="reply-textarea"/>
                                <button type="submit"><FontAwesomeIcon icon={faPaperPlane} /></button>
                            </form>
                            
                          </div>
                        )}
                        
                        
                        
                    </div>
                    
                    
                    
                ))}
                {selectedMessage&&(<div className="toggle-menu">
                                    <button onclick = {handleReply} className="reply_button"><FontAwesomeIcon icon={faReply}/></button>
                                    <button onClick={deleteSingle}  className="delete_button"><FontAwesomeIcon icon={faTrash}/></button>
                                </div>)}
                
                
                <div ref={messagesRef}/>
            </div>
            
            
            <form  onSubmit={handleSubmit} className="new-message-form">
                <input onClick={clean} className="new-message-input" onChange={handleInputChange}  value={newMessages} placeholder="type your message here"/>
                <input style={{display:"none"}} id="file" onChange={handleImage}  type="file"></input>
                <button className="send-button" type="submit"><FontAwesomeIcon icon={faPaperPlane} /></button>
                <label className="chooseFile" htmlFor="file"><FontAwesomeIcon icon={faImage}/></label>
            </form>
        </div>
    )
}