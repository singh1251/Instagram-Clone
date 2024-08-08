import { useEffect, useState } from "react";
import useAuthStore from "../store/authStore";
import useShowToast from "./useShowToast";
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { firestore } from "../firebase/firebase";

/*

 the main ides here is

1. first we create a query (for the users collection) to get all the users 
that the authUser dosen't follow and we do it in a useEffect because we want the list to 
change in real-time when the authUser follows or unfollows someone


*/

const useGetSuggestedUsers = () => {
  const [isLoading, setIsLoading] = useState(true);

  //state to manage the suggested users
  const [suggestedUsers, setSuggestedUsers] = useState([]);

  const authUser = useAuthStore((state) => state.user);

  const showToast = useShowToast();

  //we create an async function in useEffect that fectches the suggested users for us
  //and we call this function only when the user is authenticated
  useEffect(() => {
    const getSuggestedUsers = async () => {
      setIsLoading(true);

      try {
        const usersRef = collection(firestore, "users");
        const q = query(
          usersRef,
          where("uid", "not-in", [authUser.uid, ...authUser.following]),
          orderBy("uid"),
          limit(4)
        );

        const querySnapshot = await getDocs(q);

        const users = querySnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));

        setSuggestedUsers(users);
      } catch (error) {
        showToast("Error", error.message, "error");
      } finally {
        setIsLoading(false);
      }
    };

    if (authUser) getSuggestedUsers();
  }, [authUser, showToast]);

  return { isLoading, suggestedUsers };
};

export default useGetSuggestedUsers;
