import { useState } from "react";
import useAuthStore from "../store/authStore";
import useShowToast from "./useShowToast";
import { arrayRemove, arrayUnion, doc, updateDoc } from "firebase/firestore";
import { firestore } from "../firebase/firebase";

/*

the main idea here is to single out the post that is being liked/unliked with the help of post Id
and then 

liked: add the id of the user who liked the post in the likes array
unliked: remove the id of the user who unliked the post from the likes array

*/

const useLikePost = (post) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const authUser = useAuthStore((state) => state.user);

  const [likes, setLikes] = useState(post.likes.length);

  const [isLiked, setIsLiked] = useState(post.likes.includes(authUser?.uid));

  const showToast = useShowToast();

  const handleLikePost = async () => {
    if (isUpdating) return;
    if (!authUser)
      return showToast(
        "Error",
        "You must be logged in to like a post",
        "error"
      );
    setIsUpdating(true);

    try {
      const postRef = doc(firestore, "posts", post.id);
      await updateDoc(postRef, {
        likes: isLiked ? arrayRemove(authUser.uid) : arrayUnion(authUser.uid),
      });

      setIsLiked(!isLiked);
      isLiked ? setLikes(likes - 1) : setLikes(likes + 1);
    } catch (error) {
      showToast("Error", error.message, "error");
    } finally {
      setIsUpdating(false);
    }
  };

  return { isLiked, likes, handleLikePost, isUpdating };
};

export default useLikePost;
