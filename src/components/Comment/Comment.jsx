import {
  Avatar,
  Flex,
  HStack,
  Skeleton,
  SkeletonCircle,
  Text,
  VStack,
} from "@chakra-ui/react";
import useGetUserProfileById from "../../hooks/useGetUserProfileById";
import { Link } from "react-router-dom";
import { timeAgo } from "../../utils/timeAgo";

const Comment = ({ comment }) => {
  //custom hook to fetch userProfile by userId
  const { userProfile, isLoading } = useGetUserProfileById(comment.createdBy);

  if (isLoading) return <CommentSkeleton />;

  return (
    <Flex direction={"column"} gap={1} mb={5}>
      <Link to={`/${userProfile.username}`}>
        <HStack gap={2}>
          <Avatar src={userProfile.profilePicURL} size={"sm"} />

          <Text fontWeight={"bold"} fontSize={12}>
            {userProfile.username}
          </Text>
        </HStack>
      </Link>

      <Flex direction={"column"}>
        <Text fontSize={14}>{comment.comment}</Text>

        <Text fontSize={12} color={"gray"}>
          {timeAgo(comment.createdAt)}
        </Text>
      </Flex>
    </Flex>
  );
};

export default Comment;

const CommentSkeleton = () => {
  return (
    <Flex direction={"column"} gap={1} mb={5}>
      <HStack gap={4}>
        <SkeletonCircle h={8} w={8} />
        <Skeleton height={2} width={50} />
      </HStack>
      <Flex gap={2} flexDir={"column"}>
        <Skeleton height={2} width={100} />
        <Skeleton height={2} width={50} />
      </Flex>
    </Flex>
  );
};
