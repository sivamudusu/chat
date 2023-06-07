import { useEffect, useState } from "react";
import{db,auth}from "./firebase-config";
import "./Chat.css";
import { addDoc, collection, onSnapshot, orderBy, query, serverTimestamp, where,Timestamp } from "firebase/firestore";



export const Chat = (props)=>{
    const{room} = props;
    const[newMessages,setNewMessages] = useState("");
    const messageRef = collection(db,"messages");
    const [messages,setMessages] = useState([]);

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

        })
        return ()=>unsubscribe();

    },[]);


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
                <h1>welcome to :{room.toUpperCase()}</h1>    
            </div>
            <div className="messages">
                {messages.map((message)=>(
                    <div style={message.user === auth.currentUser.displayName ?{backgroundColor:"lightblue"}:{backgroundColor:"lightgreen"}} className="message" key={message.id}>
                        
                        <span className="user">{message.user}:</span>
                        {message.text}
                        
                        <p className="time">{message.createdAt? message.createdAt.toDate().toString().substring(4,21):""}</p>
                        
                        
                    </div>
                ))}
            </div>
            <form onSubmit={handleSubmit} className="new-message-form">
                <input className="new-message-input" onChange={(e)=>setNewMessages(e.target.value)} value={newMessages} placeholder="type your message here"/>
                <button className="send-button" type="submit">send</button>
            </form>
        </div>
    )
}