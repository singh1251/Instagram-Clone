import {
  Box,
  Button,
  Flex,
  Input,
  InputGroup,
  InputRightElement,
  Text,
} from "@chakra-ui/react";

import { useEffect, useRef, useState } from "react";
import {
  CommentLogo,
  NotificationsLogo,
  UnlikeLogo,
} from "../../assets/constants";
import usePostComment from "../../hooks/usePostComment";
import useAuthStore from "../../store/authStore";
import useLikePost from "../../hooks/useLikePost";
import { timeAgo } from "../../utils/timeAgo";
import Comment from "../Comment/Comment";

const PostFooter = ({ post, isProfilePage, creatorProfile }) => {
  //custom hook that returs a function to handle the posting of a comment
  const { isCommenting, handlePostComment } = usePostComment();

  const [comment, setComment] = useState("");

  const authUser = useAuthStore((state) => state.user);

  const commentRef = useRef(null);

  //custom hook that returns a function to handle the liking of a post
  const { handleLikePost, isLiked, likes } = useLikePost(post);

  //state for comments section visibility
  const [isOpen, setIsOpen] = useState(false);

  //to scroll down to the last comment
  const commentsContainerRef = useRef(null);
  useEffect(() => {
    const scrollToBottom = () => {
      commentsContainerRef.current.scrollTop =
        commentsContainerRef.current.scrollHeight;
    };

    //scroll to bottom after all the comments are fetched
    if (isOpen) {
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    }
  }, [isOpen, post.comments.length]);

  const handleSubmitComment = async () => {
    await handlePostComment(post.id, comment);
    setComment("");
  };

  return (
    <Box mt={"auto"}>
      <Flex alignItems={"center"} gap={4} w={"full"} pt={0} mb={2} mt={4}>
        <Box onClick={handleLikePost} cursor={"pointer"} fontSize={18}>
          {!isLiked ? <NotificationsLogo /> : <UnlikeLogo />}
        </Box>

        <Box
          cursor={"pointer"}
          fontSize={18}
          onClick={() => commentRef.current.focus()}
        >
          <CommentLogo />
        </Box>
      </Flex>
      <Text fontWeight={600} fontSize={"sm"}>
        {likes} likes
      </Text>

      {isProfilePage && (
        <Text fontSize="12" color={"gray"}>
          Posted {timeAgo(post.createdAt)}
        </Text>
      )}

      {!isProfilePage && (
        <>
          <Text fontSize="sm" fontWeight={700}>
            {creatorProfile?.username}{" "}
            <Text as="span" fontWeight={400}>
              {post.caption}
            </Text>
          </Text>

          {post.comments.length > 0 && (
            <Text
              fontSize="sm"
              color={"gray"}
              cursor={"pointer"}
              onClick={() => setIsOpen(!isOpen)}
              mb={5}
            >
              {isOpen
                ? "View less"
                : `View all ${post.comments.length} comments`}
            </Text>
          )}

          {/* ensuring that comment section only appears on home page */}
          {isOpen && (
            <Box
              ref={commentsContainerRef}
              display={isOpen ? "block" : "none"}
              maxH={"250px"}
              overflowY={"auto"}
              mb={4}
            >
              {post.comments.map((comment, idx) => (
                <Comment key={idx} comment={comment} />
              ))}
            </Box>
          )}
        </>
      )}

      {authUser && (
        <Flex w={"full"}>
          <InputGroup>
            <Input
              variant={"flushed"}
              placeholder={"Add a comment..."}
              fontSize={14}
              onChange={(e) => setComment(e.target.value)}
              value={comment}
              ref={commentRef}
            />
            <InputRightElement>
              <Button
                variant={"ghost"}
                colorScheme="blue"
                onClick={handleSubmitComment}
                isLoading={isCommenting}
              >
                Post
              </Button>
            </InputRightElement>
          </InputGroup>
        </Flex>
      )}
    </Box>
  );
};

export default PostFooter;
