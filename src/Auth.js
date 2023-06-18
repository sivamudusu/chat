import {auth,db,provider} from "./firebase-config";
import {signInWithPopup}from "firebase/auth";
import Cookies from "universal-cookie";
import "./Auth.css";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
const cookie = new Cookies();

export const Auth = (props)=>{
    const {setIsAuth} = props;
    const userRef = collection(db,"users");
    const signInWithGoogle = async()=>{
        try{
            const googleUser = await signInWithPopup(auth,provider);
            cookie.set("auth-token",googleUser.user.refreshToken);
            await addDoc(userRef,{
                name : auth.currentUser.displayName,
                logInTime: serverTimestamp(),
                email:auth.currentUser.email,
                phone:auth.currentUser.phoneNumber,
                x:auth.currentUser.emailVerified,
                



            })
            setIsAuth(true);
        }catch(err){
            console.error(err);
        }
    }

    return(
        <div className="auth-page">
            <div>
                <h3> Welcome</h3>
            </div>
            <div className="sign-in-card">
            <p>Press the button and sit back we will sign you In</p>
            <button className="auth-Sign-in" onClick={signInWithGoogle}>Google</button>
            <p>Sign In with Google</p>
            </div>
        </div>
    )
}