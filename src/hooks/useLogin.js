import { useSignInWithEmailAndPassword } from "react-firebase-hooks/auth";
import useShowToast from "./useShowToast";
import { auth, firestore } from "../firebase/firebase";
import { doc, getDoc } from "firebase/firestore";
import useAuthStore from "../store/authStore";

//here we simply login the user with email and password and fetch their data and set it to
//the authUser and localStorage

const useLogin = () => {
  const showToast = useShowToast();

  const [signInWithEmailAndPassword, , loading, error] =
    useSignInWithEmailAndPassword(auth);

  const loginUser = useAuthStore((state) => state.login);

  const login = async (inputs) => {
    if (!inputs.email || !inputs.password) {
      return showToast("Error", "Please fill all the fields", "error");
    }
    try {
      const userCred = await signInWithEmailAndPassword(
        inputs.email,
        inputs.password
      );

      if (userCred) {
        const docRef = doc(firestore, "users", userCred.user.uid);
        const docSnap = await getDoc(docRef);

        loginUser(docSnap.data());

        localStorage.setItem("user-info", JSON.stringify(docSnap.data()));
      }
    } catch (err) {
      showToast("Error", err.message, "error");
    }
  };

  return { loading, error, login };
};

export default useLogin;
