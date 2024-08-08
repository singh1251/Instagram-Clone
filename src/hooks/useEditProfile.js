import { useState } from "react";
import useAuthStore from "../store/authStore";
import useShowToast from "./useShowToast";
import { getDownloadURL, ref, uploadString } from "firebase/storage";
import { firestore, storage } from "../firebase/firebase";
import { doc, updateDoc } from "firebase/firestore";
import useUserProfileStore from "../store/userProfileStore";

/*

the main idea here is:

1. first we store the image file to the firebase storage
2. prepare the updated userDoc and update the existing userDoc with it
3. make sure that all the global states present have the updated userDoc

*/

const useEditProfile = () => {
  const [isUpdating, setIsUpdating] = useState(false);

  const authUser = useAuthStore((state) => state.user);
  const setAuthUser = useAuthStore((state) => state.setUser);

  const setUserProfile = useUserProfileStore((state) => state.setUserProfile);

  const showToast = useShowToast();

  const editProfile = async (inputs, selectedFile) => {
    if (isUpdating || !authUser) return;

    setIsUpdating(true);

    const storageRef = ref(storage, `profilePics/${authUser.uid}`);
    const userDocRef = doc(firestore, "users", authUser.uid);

    let URL = "";
    try {
      //uploading the image file in the storage
      if (selectedFile) {
        await uploadString(storageRef, selectedFile, "data_url");
        URL = await getDownloadURL(ref(storage, `profilePics/${authUser.uid}`));
      }

      //updated userDoc
      const updatedUser = {
        ...authUser,
        fullName: inputs.fullName || authUser.fullName,
        username: inputs.username || authUser.username,
        bio: inputs.bio || authUser.bio,
        profilePicURL: URL || authUser.profilePicURL,
      };

      //updating the existing userDoc with the lastest userDoc
      await updateDoc(userDocRef, updatedUser);

      //ensuring that all the global states present have the latest userDoc
      setAuthUser(updatedUser);
      setUserProfile(updatedUser);
      localStorage.setItem("user-info", JSON.stringify(updatedUser));
      showToast("Success", "Profile updated successfully", "success");
    } catch (error) {
      showToast("Error", error.message, "error");
    }
  };

  return { editProfile, isUpdating };
};

export default useEditProfile;
