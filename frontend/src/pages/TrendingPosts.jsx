import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Grid,
  CircularProgress,
  Chip,
  Avatar,
} from '@mui/material';
import { Comment as CommentIcon, TrendingUp as TrendingUpIcon } from '@mui/icons-material';
import { fetchPopularPosts } from '../services/api';
import { getUserAvatar, getPostImage } from '../utils/imageUtils';

const TrendingPosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        setLoading(true);
        const data = await fetchPopularPosts();
        setPosts(Array.isArray(data) ? data : []);
        setError(null);
      } catch (err) {
        setError('Failed to load trending posts. Please try again later.');
        console.error('Error loading trending posts:', err);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    loadPosts();

    const intervalId = setInterval(loadPosts, 30000);


    return () => clearInterval(intervalId);
  }, []);

  if (loading && posts.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && posts.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <TrendingUpIcon color="primary" sx={{ mr: 1, fontSize: 32 }} />
        <Typography variant="h4">Trending Posts</Typography>
      </Box>
      <Typography variant="subtitle1" color="text.secondary" paragraph>
        Posts with the most comments
      </Typography>

      {loading && posts.length > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
          <CircularProgress size={24} />
        </Box>
      )}

      {error && posts.length > 0 && (
        <Typography color="error" sx={{ my: 2 }}>
          {error}
        </Typography>
      )}

      <Grid container spacing={3}>
        {posts.map((post) => (
          <Grid item xs={12} sm={6} md={4} key={post.id}>
            <Card 
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: 6,
                },
              }}
            >
              <CardMedia
                component="img"
                height="200"
                image={getPostImage(post.id)}
                alt={post.title}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar 
                    src={getUserAvatar(post.userId)} 
                    alt="User" 
                    sx={{ mr: 1 }}
                  />
                  <Typography variant="subtitle2" color="text.secondary">
                    Posted by User {post.userId}
                  </Typography>
                </Box>
                <Typography variant="h6" gutterBottom>
                  {post.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {post.content}
                </Typography>
                <Chip
                  icon={<CommentIcon />}
                  label={`${post.commentCount || 0} ${(post.commentCount || 0) === 1 ? 'Comment' : 'Comments'}`}
                  color="primary"
                  variant="outlined"
                />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {posts.length === 0 && !loading && !error && (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="body1">No trending posts found.</Typography>
        </Box>
      )}
    </Box>
  );
};

export default TrendingPosts; 