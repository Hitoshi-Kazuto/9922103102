import express from "express";
import axios from "axios";
const app = express();



const PORT = process.env.PORT || 3000;
const TEST_SERVER_BASE_URL = 'http://20.244.56.144/evaluation-service'; 
const REFRESH_INTERVAL = 1000000; 
const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzQzODM1NjAyLCJpYXQiOjE3NDM4MzUzMDIsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6IjRjYTMwYmQ1LWQ2ZjUtNGJkMC1iMzBiLTRiNjQ3YTE5ZDVkMyIsInN1YiI6InNocmV5YXMuZGJnQGdtYWlsLmNvbSJ9LCJlbWFpbCI6InNocmV5YXMuZGJnQGdtYWlsLmNvbSIsIm5hbWUiOiJzaHJleWFzIiwicm9sbE5vIjoiOTkyMjEwMzEwMiIsImFjY2Vzc0NvZGUiOiJTck1RcVIiLCJjbGllbnRJRCI6IjRjYTMwYmQ1LWQ2ZjUtNGJkMC1iMzBiLTRiNjQ3YTE5ZDVkMyIsImNsaWVudFNlY3JldCI6IkJaREZCUGRqcFJyUEh5cGIifQ.ugkJeJW-uA6y7Owsms_06AKXzC2sm2PVuUAasiMYOpE';


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

// Initialize the service
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
    console.log('Users response:', usersResponse);
    
    // Convert the users object to an array of user objects
    const users = usersResponse.users ? Object.entries(usersResponse.users).map(([id, name]) => ({
      id,
      name
    })) : [];
    
    console.log('Processed users:', users);
    
    const allPosts = [];
    for (const user of users) {
      userData.userIds.add(user.id);
      const userPostsResponse = await fetchUserPosts(user.id);
      console.log(`Posts for user ${user.id}:`, userPostsResponse);
      
      // Handle posts response format
      const userPosts = userPostsResponse.posts ? Object.entries(userPostsResponse.posts).map(([id, post]) => ({
        id,
        ...post
      })) : [];
      
      console.log(`Processed posts for user ${user.id}:`, userPosts);
      allPosts.push(...userPosts);
      
      userData.userPostCounts.set(user.id, userPosts.length);
    }
    
    console.log('All posts:', allPosts);
    console.log('User post counts:', Object.fromEntries(userData.userPostCounts));
    updateTopUsers(users);
    console.log('Top users:', userData.topUsers);
    
    await processPosts(allPosts);
    console.log('Latest posts:', postData.latestPosts);
    console.log('Popular posts:', postData.popularPosts);
    
    console.log('Data refreshed successfully');
  } catch (error) {
    console.error('Error refreshing data', error.message);
  }
}

async function fetchUsers() {
  try {
    const response = await axios.get(`${TEST_SERVER_BASE_URL}/users`, {
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching users', error.message);
    return { users: {} };
  }
}

async function fetchUserPosts(userId) {
  try {
    const response = await axios.get(`${TEST_SERVER_BASE_URL}/users/${userId}/posts`, {
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`
      }
    });
    console.log(`Raw posts response for user ${userId}:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`Error fetching posts for user ${userId}`, error.message);
    return [];
  }
}

async function fetchPostComments(postId) {
  try {
    const response = await axios.get(`${TEST_SERVER_BASE_URL}/posts/${postId}/comments`, {
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`
      }
    });
    console.log(`Raw comments response for post ${postId}:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`Error fetching comments for post ${postId}`, error.message);
    return [];
  }
}

function updateTopUsers(users) {
  if (!Array.isArray(users)) {
    console.error('Invalid users data received');
    return;
  }
  
  // Sort users by post count and take top 5
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
    
  console.log('Computed top users:', userData.topUsers);
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
      // Handle comments response format
      const comments = commentsResponse.comments ? Object.entries(commentsResponse.comments).map(([id, comment]) => ({
        id,
        ...comment
      })) : [];
      postData.postCommentCounts.set(post.id, comments.length);
    }));
  }
  
  // Find posts with maximum comment count
  const maxCommentCount = Math.max(...postData.postCommentCounts.values(), 0);
  postData.popularPosts = posts.filter(post => 
    postData.postCommentCounts.get(post.id) === maxCommentCount
  );
  
  console.log('Computed latest posts:', postData.latestPosts);
  console.log('Computed popular posts:', postData.popularPosts);
  console.log('Post comment counts:', Object.fromEntries(postData.postCommentCounts));
}

app.get('/users', (req, res) => {
  console.log('GET /users - Returning top users:', userData.topUsers);
  res.json(userData.topUsers);
});

app.get('/posts', (req, res) => {
  const { type } = req.query;
  console.log('GET /posts - Type:', type);
  
  if (type === 'latest') {
    console.log('Returning latest posts:', postData.latestPosts);
    return res.json(postData.latestPosts);
  } else if (type === 'popular') {
    const enhancedPopularPosts = postData.popularPosts.map(post => ({
      ...post,
      commentCount: postData.postCommentCounts.get(post.id) || 0
    }));
    console.log('Returning popular posts:', enhancedPopularPosts);
    return res.json(enhancedPopularPosts);
  } else {
    return res.status(400).json({ error: 'Invalid type parameter. Use "latest" or "popular".' });
  }
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  initializeService();
});