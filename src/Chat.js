import { useEffect, useRef, useState } from "react";
import{db,auth}from "./firebase-config";
import "./Chat.css";
import { addDoc, collection, onSnapshot, orderBy, query, serverTimestamp, where,Timestamp, deleteDoc, doc, setDoc, updateDoc, and} from "firebase/firestore";
import { getDownloadURL, getStorage, ref, uploadBytesResumable }from "firebase/storage";




export const Chat = (props)=>{
    const{room,handleSignout} = props;
    const[newMessages,setNewMessages] = useState("");
    const messageRef = collection(db,"messages");
    const [messages,setMessages] = useState([]);
    const messagesRef = useRef(null);
    const[image,setImage] = useState(null);
    const storage = getStorage();
    


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

    
 

    return(
        <div className="chat-app">
            <div className="header">
                <div className="user-details">
                    <div className="user-dp">
                        <h3>DP</h3>
                    </div>
                </div>
                <div>
                    <button onClick={deleteChat} className="delete-button">delete</button>
                    <button onClick={handleSignout}  className="inchat-signout-button">sign Out</button>
                </div>
                    
            </div>
            <div className="messages">
                {messages.map((message)=>(
                    <div style={message.user === auth.currentUser.displayName?{alignSelf:"flex-end"}:{alignSelf:"flex-start"}}>
                        <div style={message.user === auth.currentUser.displayName ?{backgroundColor:"lightblue",borderRadius:"10px 15px 0px 15px"}:{backgroundColor:"lightgreen",borderRadius:"15px 10px 15px 0px"}} className="message" key={message.id}>
                        
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
                <button className="send-button" type="submit">send</button>
            </form>
        </div>
    )
}