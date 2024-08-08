import { useState } from "react";
import useShowToast from "./useShowToast";
import useAuthStore from "../store/authStore";
import { arrayUnion, doc, updateDoc } from "firebase/firestore";
import { firestore } from "../firebase/firebase";
import usePostStore from "../store/postStore";
import { v4 as uuidv4 } from "uuid";

/* 

1. here we create a comment object with all the neccessary info and add it to the 
comments array of that particular post (in the posts Collection)

2. we also add it to the posts array present at the postStore

*/

const usePostComment = () => {
  const [isCommenting, setIsCommenting] = useState(false);

  const showToast = useShowToast();

  const authUser = useAuthStore((state) => state.user);

  const addComment = usePostStore((state) => state.addComment);

  const handlePostComment = async (postId, comment) => {
    if (isCommenting) return;

    if (!authUser)
      return showToast("Error", "You must be logged in to comment", "error");

    setIsCommenting(true);

    const newComment = {
      id: uuidv4(),
      comment,
      createdAt: Date.now(),
      createdBy: authUser.uid,
      postId,
    };

    try {
      await updateDoc(doc(firestore, "posts", postId), {
        comments: arrayUnion(newComment),
      });

      addComment(postId, newComment);
    } catch (error) {
      showToast("Error", error.message, "error");
    } finally {
      setIsCommenting(false);
    }
  };

  return { isCommenting, handlePostComment };
};

export default usePostComment;
