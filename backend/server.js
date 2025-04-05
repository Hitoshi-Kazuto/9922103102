import express from "express";
import axios from "axios";
import dotenv from 'dotenv';
import cors from 'cors';

// Load environment variables
dotenv.config();

const app = express();

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5173;
const TEST_SERVER_BASE_URL = 'http://20.244.56.144/evaluation-service'; 
const REFRESH_INTERVAL = 10000; 
const AUTH_TOKEN = process.env.AUTH_TOKEN;

if (!AUTH_TOKEN) {
  console.error('AUTH_TOKEN is not set in environment variables');
  process.exit(1);
}

// Create a default axios instance with the authorization header
const api = axios.create({
  baseURL: TEST_SERVER_BASE_URL,
  headers: {
    'Authorization': `Bearer ${AUTH_TOKEN}`
  }
});

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

async function initializeService() {
  try {
    await refreshData();
    setInterval(refreshData, REFRESH_INTERVAL);
  } catch (error) {
    console.error('Failed to initialize service', error.message);
  }
}

async function refreshData() {
  try {
    const usersResponse = await fetchUsers();
    const users = usersResponse.users ? Object.entries(usersResponse.users).map(([id, name]) => ({
      id,
      name
    })) : [];
    
    console.log('Processed users:', users);
    
    const allPosts = [];
    for (const user of users) {
      userData.userIds.add(user.id);
      const userPostsResponse = await fetchUserPosts(user.id);
      
      const userPosts = userPostsResponse.posts ? Object.entries(userPostsResponse.posts).map(([id, post]) => ({
        id,
        ...post
      })) : [];
      allPosts.push(...userPosts);
      
      userData.userPostCounts.set(user.id, userPosts.length);
    }
    updateTopUsers(users);
    
    await processPosts(allPosts);    
    console.log('Data refreshed successfully');
  } catch (error) {
    console.error('Error refreshing data', error.message);
  }
}

async function fetchUsers() {
  try {
    const response = await api.get('/users');
    return response.data;
  } catch (error) {
    console.error('Error fetching users', error.message);
    return { users: {} };
  }
}

async function fetchUserPosts(userId) {
  try {
    const response = await api.get(`/users/${userId}/posts`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching posts for user ${userId}`, error.message);
    return { posts: {} };
  }
}

async function fetchPostComments(postId) {
  try {
    const response = await api.get(`/posts/${postId}/comments`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching comments for post ${postId}`, error.message);
    return { comments: {} };
  }
}

function updateTopUsers(users) {
  if (!Array.isArray(users)) {
    console.error('Invalid users data received');
    return;
  }
  userData.topUsers = [...userData.userPostCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([userId, postCount]) => {
      const user = users.find(u => u.id === userId) || { id: userId, name: 'Unknown User' };
      return {
        id: user.id,
        name: user.name,
        postCount: postCount
      };
    });
}

async function processPosts(posts) {
  if (!Array.isArray(posts)) {
    console.error('Invalid posts data received');
    return;
  }
  
  postData.allPosts = posts;
  
  // Get 5 most recent posts
  postData.latestPosts = [...posts]
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 5);
  
  postData.postCommentCounts.clear();
  
  // Fetch comments for all posts in batches
  const MAX_CONCURRENT_REQUESTS = 5;
  const postBatches = [];
  
  for (let i = 0; i < posts.length; i += MAX_CONCURRENT_REQUESTS) {
    postBatches.push(posts.slice(i, i + MAX_CONCURRENT_REQUESTS));
  }
  
  for (const batch of postBatches) {
    await Promise.all(batch.map(async (post) => {
      const commentsResponse = await fetchPostComments(post.id);
      const comments = commentsResponse.comments ? Object.entries(commentsResponse.comments).map(([id, comment]) => ({
        id,
        ...comment
      })) : [];
      postData.postCommentCounts.set(post.id, comments.length);
    }));
  }
  
  const maxCommentCount = Math.max(...postData.postCommentCounts.values(), 0);
  postData.popularPosts = posts.filter(post => 
    postData.postCommentCounts.get(post.id) === maxCommentCount
  );
}

app.get('/users', (req, res) => {
  res.json(userData.topUsers);
});

app.get('/posts', (req, res) => {
  const { type } = req.query;
  
  if (type === 'latest') {
    return res.json(postData.latestPosts);
  } else if (type === 'popular') {
    const enhancedPopularPosts = postData.popularPosts.map(post => ({
      ...post,
      commentCount: postData.postCommentCounts.get(post.id) || 0
    }));
    return res.json(enhancedPopularPosts);
  } else {
    return res.status(400).json({ error: 'Invalid type parameter. Use "latest" or "popular".' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  initializeService();
});