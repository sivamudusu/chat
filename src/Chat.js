import { useEffect, useRef, useState } from "react";
import{db,auth}from "./firebase-config";
import "./Chat.css";
import { addDoc, collection, onSnapshot, orderBy, query, serverTimestamp, where,Timestamp } from "firebase/firestore";



export const Chat = (props)=>{
    const{room} = props;
    const[newMessages,setNewMessages] = useState("");
    const messageRef = collection(db,"messages");
    const [messages,setMessages] = useState([]);
    const messagesRef = useRef(null);

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

            if (messages.length > 0) {
                messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
            }

        });
        return ()=>unsubscribe();

    },[]);

    useEffect(()=>{
        messagesRef.current?.scrollIntoView();
    },[messages])


    const handleSubmit = async(e)=>{
        e.preventDefault();
        if(newMessages ==="")return;
        await addDoc(messageRef,{
            text:newMessages,
            createdAt:serverTimestamp(),
            user: auth.currentUser.displayName,
            room



        });
        setNewMessages("");

    }
 

    return(
        <div className="chat-app">
            <div className="header">
                <div className="user-details">
                    <div className="user-dp">
                        <h3>DP</h3>
                    </div>
                </div>
                <div>
                    <button className="signout-button">sign Out</button>
                </div>
                    
            </div>
            <div className="messages">
                {messages.map((message)=>(
                    <div style={message.user === auth.currentUser.displayName?{alignSelf:"flex-end"}:{alignSelf:"flex-start"}}>
                        <div style={message.user === auth.currentUser.displayName ?{backgroundColor:"lightblue",borderRadius:"10px 15px 0px 15px"}:{backgroundColor:"lightgreen",borderRadius:"15px 10px 15px 0px"}} className="message" key={message.id}>
                        
                        {message.text}
                        
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
                <button className="send-button" type="submit">send</button>
            </form>
        </div>
    )
}