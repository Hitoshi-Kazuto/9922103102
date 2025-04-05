import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
  Avatar,
  Chip,
} from '@mui/material';
import { People as PeopleIcon, PostAdd as PostAddIcon } from '@mui/icons-material';
import { fetchTopUsers } from '../services/api';
import { getUserAvatar } from '../utils/imageUtils';

const TopUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        const data = await fetchTopUsers();
        // Ensure data is an array before setting it
        setUsers(Array.isArray(data) ? data : []);
        setError(null);
      } catch (err) {
        setError('Failed to load top users. Please try again later.');
        console.error('Error loading top users:', err);
        setUsers([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
    const intervalId = setInterval(loadUsers, 30000);

    return () => clearInterval(intervalId);
  }, []);

  if (loading && users.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && users.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <PeopleIcon color="primary" sx={{ mr: 1, fontSize: 32 }} />
        <Typography variant="h4">Top Users</Typography>
      </Box>
      <Typography variant="subtitle1" color="text.secondary" paragraph>
        Users with the most posts
      </Typography>

      {loading && users.length > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
          <CircularProgress size={24} />
        </Box>
      )}

      {error && users.length > 0 && (
        <Typography color="error" sx={{ my: 2 }}>
          {error}
        </Typography>
      )}

      <Grid container spacing={3}>
        {users.map((user) => (
          <Grid item xs={12} sm={6} md={4} key={user.id}>
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
              <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                <Avatar
                  src={getUserAvatar(user.id)}
                  alt={user.name}
                  sx={{ 
                    width: 80, 
                    height: 80, 
                    mx: 'auto', 
                    mb: 2,
                    border: '3px solid',
                    borderColor: 'primary.main',
                  }}
                />
                <Typography variant="h6" gutterBottom>
                  {user.name}
                </Typography>
                <Chip
                  icon={<PostAddIcon />}
                  label={`${user.postCount} ${user.postCount === 1 ? 'Post' : 'Posts'}`}
                  color="primary"
                  variant="outlined"
                  sx={{ mt: 1 }}
                />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {users.length === 0 && !loading && !error && (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="body1">No users found.</Typography>
        </Box>
      )}
    </Box>
  );
};

export default TopUsers; 