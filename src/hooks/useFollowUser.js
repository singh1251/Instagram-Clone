import { useEffect, useState } from "react";
import useAuthStore from "../store/authStore";
import useUserProfileStore from "../store/userProfileStore";
import useShowToast from "./useShowToast";
import { firestore } from "../firebase/firebase";
import { arrayRemove, arrayUnion, doc, updateDoc } from "firebase/firestore";

/*

its mainly a two step process,

1. first we update the currentUser and userToFollowOrUnfollow user's document, particularly their
following and followers array

2. ensuring all of our global states are in sync with these changes (i.e. setting the currentUsers updated following array
wrt to follow and unfollow operation)

*/

const useFollowUser = (userId) => {
  const [isUpdating, setIsUpdating] = useState(false);

  //state to keep a track of following status
  const [isFollowing, setIsFollowing] = useState(false);

  const authUser = useAuthStore((state) => state.user);
  const setAuthUser = useAuthStore((state) => state.setUser);

  const { userProfile, setUserProfile } = useUserProfileStore();

  const showToast = useShowToast();

  //set the isFollowing state to true or false (based on if already following or not)
  useEffect(() => {
    if (authUser) {
      const isAlreadyFollowing = authUser.following.includes(userId);
      setIsFollowing(isAlreadyFollowing);
    }
  }, [authUser, userId]);

  //function for handling the follow and unfollow operation
  const handleFollowUser = async () => {
    setIsUpdating(true);

    try {
      const currentUserRef = doc(firestore, "users", authUser.uid);
      const userToFollowOrUnfollorRef = doc(firestore, "users", userId);

      await updateDoc(currentUserRef, {
        following: isFollowing ? arrayRemove(userId) : arrayUnion(userId),
      });

      await updateDoc(userToFollowOrUnfollorRef, {
        followers: isFollowing
          ? arrayRemove(authUser.uid)
          : arrayUnion(authUser.uid),
      });

      if (isFollowing) {
        // unfollow operation
        setAuthUser({
          ...authUser,
          following: authUser.following.filter((uid) => uid !== userId),
        });

        if (userProfile)
          setUserProfile({
            ...userProfile,
            followers: userProfile.followers.filter(
              (uid) => uid !== authUser.uid
            ),
          });

        localStorage.setItem(
          "user-info",
          JSON.stringify({
            ...authUser,
            following: authUser.following.filter((uid) => uid !== userId),
          })
        );
        setIsFollowing(false);
      } else {
        // follow operation
        setAuthUser({
          ...authUser,
          following: [...authUser.following, userId],
        });

        if (userProfile)
          setUserProfile({
            ...userProfile,
            followers: [...userProfile.followers, authUser.uid],
          });

        localStorage.setItem(
          "user-info",
          JSON.stringify({
            ...authUser,
            following: [...authUser.following, userId],
          })
        );
        setIsFollowing(true);
      }
    } catch (error) {
      showToast("Error", error.message, "error");
    } finally {
      setIsUpdating(false);
    }
  };

  return { isUpdating, isFollowing, handleFollowUser };
};

export default useFollowUser;
