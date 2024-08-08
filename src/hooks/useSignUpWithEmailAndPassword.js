import { useCreateUserWithEmailAndPassword } from "react-firebase-hooks/auth";
import { auth, firestore } from "../firebase/firebase";
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import useShowToast from "./useShowToast";
import useAuthStore from "../store/authStore";

/*

1. here we first signIn the user and then we create the user document with all the neccessary
info and set it to the users collection (for every new user)

2. and also set the user document in the authUser

*/

const useSignUpWithEmailAndPassword = () => {
  const [createUserWithEmailAndPassword, , loading, error] =
    useCreateUserWithEmailAndPassword(auth);

  const showToast = useShowToast();

  const loginUser = useAuthStore((state) => state.login);

  const signup = async (inputs) => {
    //checking if all fields are filled or not
    if (
      !inputs.email ||
      !inputs.password ||
      !inputs.username ||
      !inputs.fullName
    ) {
      showToast("Error", "Please fill all the fields", "error");
      return;
    }

    //checking for unique user (if username already exists in the database show error and return)
    const usersRef = collection(firestore, "users");

    const q = query(usersRef, where("username", "==", inputs.username));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      showToast("Error", "Username already exists", "error");
      return;
    }

    //creating new user in the database
    try {
      const newUser = await createUserWithEmailAndPassword(
        inputs.email,
        inputs.password
      );

      if (!newUser && error) {
        showToast("Error", error.message, "error");
        return;
      }

      if (newUser) {
        //user data for (users Collection)
        const userDoc = {
          uid: newUser.user.uid,
          email: inputs.email,
          username: inputs.username,
          fullName: inputs.fullName,
          bio: "",
          profilePicURL: "",
          followers: [],
          following: [],
          posts: [],
          createdAt: Date.now(),
        };
        //setting the data in the collection
        await setDoc(doc(firestore, "users", newUser.user.uid), userDoc);

        //setting the data in local storage
        localStorage.setItem("user-info", JSON.stringify(userDoc));

        //logging in the user
        loginUser(userDoc);
      }
    } catch (error) {
      showToast("Error", error.message, "error");
    }
  };

  return { loading, error, signup };
};

export default useSignUpWithEmailAndPassword;
