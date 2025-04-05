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
  Divider,
} from '@mui/material';
import { Comment as CommentIcon, AccessTime as AccessTimeIcon } from '@mui/icons-material';
import { fetchLatestPosts } from '../services/api';
import { getUserAvatar, getPostImage } from '../utils/imageUtils';

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        setLoading(true);
        const data = await fetchLatestPosts();
        setPosts(data);
        setError(null);
      } catch (err) {
        setError('Failed to load feed. Please try again later.');
        console.error('Error loading feed:', err);
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
    const intervalId = setInterval(loadPosts, 15000);

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
        <AccessTimeIcon color="primary" sx={{ mr: 1, fontSize: 32 }} />
        <Typography variant="h4">Feed</Typography>
      </Box>
      <Typography variant="subtitle1" color="text.secondary" paragraph>
        Latest posts in real-time
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
          <Grid item xs={12} key={post.id}>
            <Card 
              sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', md: 'row' },
                transition: 'transform 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: 6,
                },
              }}
            >
              <CardMedia
                component="img"
                sx={{ 
                  width: { xs: '100%', md: 300 },
                  height: { xs: 200, md: 'auto' },
                  objectFit: 'cover',
                }}
                image={getPostImage(post.id)}
                alt={post.title}
              />
              <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                <CardContent sx={{ flex: '1 0 auto' }}>
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
                  <Typography variant="h5" component="div" gutterBottom>
                    {post.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" paragraph>
                    {post.content}
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
                    <Chip
                      icon={<CommentIcon />}
                      label={`${post.commentCount || 0} ${(post.commentCount || 0) === 1 ? 'Comment' : 'Comments'}`}
                      color="primary"
                      variant="outlined"
                      size="small"
                    />
                    <Typography variant="caption" color="text.secondary">
                      {new Date(post.timestamp).toLocaleString()}
                    </Typography>
                  </Box>
                </CardContent>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {posts.length === 0 && !loading && !error && (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="body1">No posts found in the feed.</Typography>
        </Box>
      )}
    </Box>
  );
};

export default Feed; 