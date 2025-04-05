
export const getUserAvatar = (userId) => {

  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`;
};


export const getPostImage = (postId) => {

  return `https://picsum.photos/seed/${postId}/800/600`;
}; 