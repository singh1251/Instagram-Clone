import { useEffect, useState } from "react";
import usePostStore from "../store/postStore";
import useShowToast from "./useShowToast";
import useUserProfileStore from "../store/userProfileStore";
import { collection, getDocs, query, where } from "firebase/firestore";
import { firestore } from "../firebase/firebase";

/*

the main ides here is

1. first we create a query (for the posts collection) to get all the posts 
that the user whose profile you are on, has created

2. then we sort the posts from latest to oldest

*/

const useGetUserPosts = () => {
  const [isLoading, setIsLoading] = useState(true);

  const { posts, setPosts } = usePostStore();

  const showToast = useShowToast();

  const userProfile = useUserProfileStore((state) => state.userProfile);

  useEffect(() => {
    const getPosts = async () => {
      if (!userProfile) return;
      setIsLoading(true);
      setPosts([]);

      try {
        //getting all the posts
        const q = query(
          collection(firestore, "posts"),
          where("createdBy", "==", userProfile.uid)
        );
        const querySnapshot = await getDocs(q);

        //we create a posts array and assign it all the posts
        const posts = querySnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));

        //sorting the posts array (latest to oldest)
        posts.sort((a, b) => b.createdAt - a.createdAt);

        setPosts(posts);
      } catch (err) {
        showToast("Error", err.message, "error");
        setPosts([]);
      } finally {
        setIsLoading(false);
      }
    };

    getPosts();
  }, [setPosts, userProfile, showToast]);

  return { isLoading, posts };
};

export default useGetUserPosts;
