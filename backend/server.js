import express from "express";
import axios from "axios";
const app = express();


const PORT = process.env.PORT || 3000;
const TEST_SERVER_BASE_URL = 'http://20.244.56.144/evaluation-service';

const userData = {
    userPostCounts: new Map(), 
    userIds: new Set(), 
    topUsers: [] 
  };
  
  const postData = {
    allPosts: [],
    postCommentCounts: new Map(),
    latestPosts: [],
    popularPosts: [] 
  };
  
  async function fetchUsers() {
    try {
      const response = await axios.get(`${TEST_SERVER_BASE_URL}/users`);
      return response.data;
    } catch (error) {
      console.error('Error fetching users', error.message);
      return [];
    }
  }
  

  async function fetchUserPosts(userId) {
    try {
      const response = await axios.get(`${TEST_SERVER_BASE_URL}/users/${userId}/posts`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching posts`, error.message);
      return [];
    }
  }
  

  async function fetchPostComments(postId) {
    try {
      const response = await axios.get(`${TEST_SERVER_BASE_URL}/posts/${postId}/comments`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching comments`, error.message);
      return [];
    }
  }

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});