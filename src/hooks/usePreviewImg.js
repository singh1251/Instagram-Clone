import { useState } from "react";
import useShowToast from "./useShowToast";

const usePreviewImg = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const showToast = useShowToast();
  const maxFileSizeInBytes = 2 * 1024 * 1024; // 2MB

  const handleImageChange = (e) => {
    //getting the file
    const file = e.target.files[0];

    //checking if its an image file or not
    if (file && file.type.startsWith("image/")) {
      //checking the size of the file
      if (file.size > maxFileSizeInBytes) {
        showToast("Error", "File size must be less than 2MB", "error");
        setSelectedFile(null);
        return;
      }

      //setting the state with the image file's URL (string)
      const reader = new FileReader();

      reader.onloadend = () => {
        setSelectedFile(reader.result);
      };

      reader.readAsDataURL(file);
    } else {
      showToast("Error", "Please select an image file", "error");
      setSelectedFile(null);
    }
  };

  return { selectedFile, handleImageChange, setSelectedFile };
};

export default usePreviewImg;
