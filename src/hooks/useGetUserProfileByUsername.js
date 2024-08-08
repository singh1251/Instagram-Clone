import { useEffect, useState } from "react";
import useShowToast from "./useShowToast";
import { collection, getDocs, query, where } from "firebase/firestore";
import { firestore } from "../firebase/firebase";
import useUserProfileStore from "../store/userProfileStore";

/*

the main ides here is that, we create a query (for the users collection) 
to get the user with the provided username 

*/

const useGetUserProfileByUsername = (username) => {
  const [isLoading, setIsLoading] = useState(true);
  const showToast = useShowToast();
  const { userProfile, setUserProfile } = useUserProfileStore();

  useEffect(() => {
    const getUserProfile = async () => {
      setIsLoading(true);
      try {
        const q = query(
          collection(firestore, "users"),
          where("username", "==", username)
        );
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          setUserProfile(null);
          return;
        }

        const userDoc = querySnapshot.docs[0].data();

        setUserProfile(userDoc);
      } catch (error) {
        showToast("Error", error.message, "error");
      } finally {
        //to ensure that loading is completed after we have tried to fetch the user
        //if we don't do this the loading state will always be true
        setIsLoading(false);
      }
    };

    getUserProfile();
  }, [setUserProfile, username, showToast]);

  return { isLoading, userProfile };
};

export default useGetUserProfileByUsername;
