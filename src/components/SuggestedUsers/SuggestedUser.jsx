import { Avatar, Box, Button, Flex, VStack } from "@chakra-ui/react";
import useFollowUser from "../../hooks/useFollowUser";
import useAuthStore from "../../store/authStore";
import { useNavigate } from "react-router-dom";

const SuggestedUser = ({ fromSearch, close, user, setUser }) => {
  //custom hook for handaling the follow/unfollow operation
  const { isFollowing, isUpdating, handleFollowUser } = useFollowUser(user.uid);

  const authUser = useAuthStore((state) => state.user);

  const onFollowUser = async () => {
    await handleFollowUser();
    setUser({
      ...user,
      followers: isFollowing
        ? user.followers.filter((follower) => follower.uid !== authUser.uid)
        : [...user.followers, authUser],
    });
  };

  const navigate = useNavigate();

  return (
    <Flex justifyContent={"space-between"} alignItems={"center"} w={"full"}>
      <Flex alignItems={"center"} gap={2}>
        <Avatar
          src={user.profilePicURL}
          size={"md"}
          cursor={"pointer"}
          onClick={() => {
            navigate(`/${user.username}`);
            if (fromSearch) close();
          }}
        />

        <VStack spacing={2} alignItems={"flex-start"}>
          <Box
            fontSize={12}
            fontWeight={"bold"}
            cursor={"pointer"}
            onClick={() => {
              navigate(`/${user.username}`);
              if (fromSearch) close();
            }}
          >
            {user.username}
          </Box>

          <Box fontSize={11} color={"gray.500"}>
            {user.followers.length} followers
          </Box>
        </VStack>
      </Flex>

      {/* first we ensure that user is authenticated and then we check for uid */}
      {authUser && authUser.uid !== user.uid && (
        <Button
          fontSize={13}
          bg={"transparent"}
          p={0}
          h={"max-content"}
          fontWeight={"medium"}
          color={"blue.400"}
          cursor={"pointer"}
          _hover={{ color: "white" }}
          onClick={onFollowUser}
          isLoading={isUpdating}
        >
          {isFollowing ? "Unfollow" : "Follow"}
        </Button>
      )}
    </Flex>
  );
};

export default SuggestedUser;
