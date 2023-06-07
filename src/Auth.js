import {auth,provider} from "./firebase-config";
import {signInWithPopup}from "firebase/auth";
import Cookies from "universal-cookie";
import "./Auth.css";
const cookie = new Cookies();

export const Auth = (props)=>{
    const {setIsAuth} = props;
    const signInWithGoogle = async()=>{
        try{
            const googleUser = await signInWithPopup(auth,provider);
            cookie.set("auth-token",googleUser.user.refreshToken);
            console.log(googleUser);
            setIsAuth(true);
        }catch(err){
            console.error(err);
        }
    }

    return(
        <div className="auth-page">
            <p>Sign In With google</p>
            <button onClick={signInWithGoogle}>Sign In</button>
        </div>
    )
}