import {
  ChatBubbleOutlineOutlined,
  FavoriteBorderOutlined,
  FavoriteOutlined,
  ShareOutlined,
  SendOutlined,
} from "@mui/icons-material";
import { Box, Divider, IconButton, Typography, useTheme } from "@mui/material";
import FlexBetween from "components/FlexBetween";
import Friend from "components/Friend";
import WidgetWrapper from "components/WidgetWrapper";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setPost } from "state";
import { toast } from 'sonner';

const PostWidget = ({
  postId,
  postUserId,
  name,
  description,
  location,
  picturePath,
  userPicturePath,
  likes,
  comments,
}) => {
  const [isComments, setIsComments] = useState(false);
  const [commentText, setCommentText] = useState(""); // State to store the comment text
  const dispatch = useDispatch();
  const token = useSelector((state) => state.token);
  const loggedInUserId = useSelector((state) => state.user._id);
  const user = useSelector((state) => state.user);
  const fullName = `${user.firstName} ${user.lastName}`;
  const isLiked = Boolean(likes[loggedInUserId]);
  const likeCount = Object.keys(likes).length;
  const { palette } = useTheme();
  const main = palette.neutral.main;
  const primary = palette.primary.main;

  const patchLike = async () => {
    const response = await fetch(`http://localhost:3001/posts/${postId}/like`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId: loggedInUserId }),
    });
    const updatedPost = await response.json();
    dispatch(setPost({ post: updatedPost }));
    if (isLiked) {
      toast.info(`Post Disliked by ${fullName}`);
    } else {
      toast.success(`Post Liked by ${fullName}`);
    }
  };

  const handleCommentSubmit = async () => {
    try {
      const response = await fetch(
        `http://localhost:3001/posts/${postId}/comment`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: loggedInUserId,
            userName: fullName,
            comment: commentText,
          }),
        }
      );

      if (response.ok) {
        const responseData = await response.json();
        // Check if the comment was flagged for profanity
        if (responseData.isProfanity) {
          // Display an alert indicating that the comment contains profanity
          const flaggedClasses = responseData.flaggedClasses.map(cls => `${cls.class} (${cls.score})`).join(', ');
          toast.warning(`This Comment Is Classified as Toxic (${flaggedClasses}). So It's Filtered Out...`);
        } else {
          // Process the response and update the post state
          dispatch(setPost({ post: responseData }));
          // Clear the comment input field after submission
          setCommentText("");
          // Display a success toast
          toast.success(`Comment posted by ${fullName}!`, { autoClose: 2000 });
        }
      } else if (response.status === 403) {
        // Comment contains profanity
        const responseData = await response.json();
        const flaggedClasses = responseData.flaggedClasses.map(cls => `${cls.class} (${cls.score})`).join(', ');
        setCommentText("");
        toast.warning(`This Comment Is Classified as Toxic (${flaggedClasses}). So It's Filtered Out...`);
      } else {
        // Handle other error cases, if any
        console.error("Failed to post comment:", response.statusText);
        toast.error("Failed to post comment. Please try again later.");
      }
    } catch (error) {
      console.error("Error posting comment:", error);
      toast.error("An error occurred. Please try again later.");
    }
  };

  return (
    <>
      <WidgetWrapper m="2rem 0">
        <Friend
          friendId={postUserId}
          name={name}
          subtitle={location}
          userPicturePath={userPicturePath}
        />
        <Typography color={main} sx={{ mt: "1rem" }}>
          {description}
        </Typography>
        {picturePath && (
          <img
            width="100%"
            height="auto"
            alt="post"
            style={{ borderRadius: "0.75rem", marginTop: "0.75rem" }}
            src={`http://localhost:3001/assets/${picturePath}`}
          />
        )}
        <FlexBetween mt="0.25rem">
          <FlexBetween gap="1rem">
            <FlexBetween gap="0.3rem">
              <IconButton onClick={patchLike}>
                {isLiked ? (
                  <FavoriteOutlined sx={{ color: primary }} />
                ) : (
                  <FavoriteBorderOutlined />
                )}
              </IconButton>
              <Typography>{likeCount}</Typography>
            </FlexBetween>

            <FlexBetween gap="0.3rem">
              <IconButton onClick={() => setIsComments(!isComments)}>
                <ChatBubbleOutlineOutlined />
              </IconButton>
              <Typography>{comments.length}</Typography>
            </FlexBetween>
          </FlexBetween>

          <IconButton>
            <ShareOutlined />
          </IconButton>
        </FlexBetween>
        {isComments && (
          <Box mt="0.5rem">
            {comments.map((comment, i) => (
              <Box key={`${comment._id}-${i}`}>
                <Divider />
                <Typography sx={{ color: main, m: "0.5rem 0", pl: "1rem" }}>
                  <b>{comment.userName}</b>: {comment.comment}
                </Typography>
              </Box>
            ))}
            <Divider />
            {/* New section for adding comments */}
            <Box mt="0.5rem" display="flex" alignItems="center">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                style={{ flex: 1, marginRight: "0.5rem", padding: "0.5rem" }}
              />
              <IconButton onClick={handleCommentSubmit}>
                <SendOutlined />
              </IconButton>
            </Box>
          </Box>
        )}
      </WidgetWrapper>
    </>
  );
};

export default PostWidget;
