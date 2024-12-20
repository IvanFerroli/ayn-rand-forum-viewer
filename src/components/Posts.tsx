import React, { useEffect, useState, ChangeEvent, useCallback } from 'react';
import { 
  Box,
  Paper,
  Typography,
  CircularProgress,
  Pagination,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  InputAdornment,
  SelectChangeEvent,
  Alert,
  AlertTitle,
  Chip,
  IconButton,
  Collapse,
  Button
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { ForumPost, Comment, ApiResponse, CommentsResponse, SortValue } from '../types';

interface CommentProps {
  comment: Comment;
}

const CommentRow: React.FC<CommentProps> = React.memo(({ comment }) => {
  const [open, setOpen] = useState(false);
  const [answers, setAnswers] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAnswers = async () => {
    if (!open) {
      setOpen(true);
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:5000/api/posts/${comment.id}/comments`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: CommentsResponse = await response.json();
        setAnswers(data.comments.filter(c => c.node_type === 'answer'));
      } catch (error) {
        console.error('Error fetching answers:', error);
      } finally {
        setLoading(false);
      }
    } else {
      setOpen(false);
    }
  };

  return (
    <Paper
      elevation={1}
      sx={{
        p: 2,
        bgcolor: 'background.paper',
        borderLeft: (theme) => `4px solid ${
          comment.node_type === 'answer' 
            ? theme.palette.success.main
            : theme.palette.grey[300]
        }`
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {comment.node_type === 'answer' ? ' Answer' : ' Comment'}
        </Typography>
        <Chip 
          label={`Score: ${comment.score}`}
          size="small"
          color={comment.score > 0 ? "success" : comment.score < 0 ? "error" : "default"}
        />
        {comment.node_type === 'comment' && (
          <IconButton
            size="small"
            onClick={fetchAnswers}
            sx={{ ml: 'auto' }}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        )}
      </Stack>
      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
        {comment.body}
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
        Posted on {new Date(comment.added_at).toLocaleDateString()}
      </Typography>

      <Collapse in={open}>
        <Box sx={{ pl: 2, mt: 2 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
              <CircularProgress size={24} />
            </Box>
          ) : answers.length > 0 ? (
            <Stack spacing={2}>
              {answers.map((answer) => (
                <CommentRow key={answer.id} comment={answer} />
              ))}
            </Stack>
          ) : (
            <Typography variant="body2" color="text.secondary" align="center">
              No answers yet
            </Typography>
          )}
        </Box>
      </Collapse>
    </Paper>
  );
});

interface RowProps {
  post: ForumPost;
}

const Row: React.FC<RowProps> = React.memo(({ post }) => {
  const [open, setOpen] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchComments = async () => {
    if (!open) {
      setOpen(true);
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:5000/api/posts/${post.id}/comments`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: CommentsResponse = await response.json();
        setComments(data.comments);
      } catch (error) {
        console.error('Error fetching comments:', error);
      } finally {
        setLoading(false);
      }
    } else {
      setOpen(false);
    }
  };

  return (
    <Paper elevation={2} sx={{ mb: 2, overflow: 'hidden' }}>
      <Box sx={{ p: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Stack direction="column" spacing={1} sx={{ flex: 1 }}>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
              <Typography 
                variant="body1" 
                color="primary.main"
                sx={{ fontWeight: 500 }}
              >
                ❓ Question
              </Typography>
              <Chip 
                label={`Score: ${post.score}`}
                size="small"
                color={post.score > 0 ? "success" : post.score < 0 ? "error" : "default"}
              />
              <Stack direction="row" spacing={1}>
                <Chip 
                  label={`${post.answer_count} answer${post.answer_count !== 1 ? 's' : ''}`}
                  size="small"
                  color="success"
                />
                <Chip 
                  label={`${post.comment_count} comment${post.comment_count !== 1 ? 's' : ''}`}
                  size="small"
                  color="info"
                />
              </Stack>
            </Stack>
            
            <Typography variant="h6" sx={{ mt: 1 }}>
              {post.title || 'Untitled Question'}
            </Typography>
            
            <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
              {post.body}
            </Typography>

            <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
              <Typography variant="caption" color="text.secondary">
                Posted on {new Date(post.added_at).toLocaleDateString()}
              </Typography>
              {post.tags && post.tags.length > 0 && (
                <Stack direction="row" spacing={1}>
                  {post.tags.map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      size="small"
                      variant="outlined"
                      color="primary"
                    />
                  ))}
                </Stack>
              )}
              {(post.comment_count > 0 || post.answer_count > 0) && (
                <IconButton
                  size="small"
                  onClick={fetchComments}
                  sx={{ ml: 'auto' }}
                >
                  {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                </IconButton>
              )}
            </Stack>
          </Stack>
        </Stack>
      </Box>

      <Collapse in={open}>
        <Box sx={{ p: 2, bgcolor: 'grey.50' }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
              <CircularProgress size={24} />
            </Box>
          ) : comments.length > 0 ? (
            <Stack spacing={2}>
              {comments.map((comment) => (
                <CommentRow key={comment.id} comment={comment} />
              ))}
            </Stack>
          ) : (
            <Typography variant="body2" color="text.secondary" align="center">
              No responses yet
            </Typography>
          )}
        </Box>
      </Collapse>
    </Paper>
  );
});

const SORT_OPTIONS = [
  { value: 'date_desc', label: 'Newest First' },
  { value: 'date_asc', label: 'Oldest First' },
  { value: 'score_desc', label: 'Highest Score' },
  { value: 'score_asc', label: 'Lowest Score' },
  { value: 'interactions_desc', label: 'Most Interactions' },
  { value: 'interactions_asc', label: 'Least Interactions' },
] as const;

export const Posts: React.FC = () => {
  // Group all useState hooks at the top
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortValue>('date_desc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [posts, setPosts] = useState<ForumPost[]>([]);

  // Define fetchPosts first since it's used in useEffect
  const fetchPosts = useCallback(async (pageNumber: number, searchTerm: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const queryParams = new URLSearchParams({
        page: pageNumber.toString(),
        limit: '10',
        search: searchTerm.trim(), // Trim whitespace from search
        nodeType: 'question',
        sortBy,
      });

      const response = await fetch(`http://localhost:5000/api/posts?${queryParams}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: ApiResponse<ForumPost[]> = await response.json();
      setPosts(data.data);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [sortBy]);

  // useEffect hooks after fetchPosts is defined
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchPosts(1, search);
    }, 300); // 300ms debounce for search

    return () => clearTimeout(timer);
  }, [search, sortBy, fetchPosts]);

  useEffect(() => {
    if (page > 1) {
      fetchPosts(page, search);
    }
  }, [page, search, fetchPosts]);

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "ARIFV-2024*") {
      setIsAuthenticated(true);
      setPasswordError("");
    } else {
      setPasswordError("Incorrect password");
    }
  };

  // Password screen render
  if (!isAuthenticated) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: 2
        }}
      >
        <Paper elevation={3} sx={{ p: 4, maxWidth: 400, width: '100%' }}>
          <Typography variant="h5" component="h1" gutterBottom textAlign="center">
            Password Required
          </Typography>
          <form onSubmit={handlePasswordSubmit}>
            <TextField
              fullWidth
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              label="Enter Password"
              error={!!passwordError}
              helperText={passwordError}
            />
            <Button
              fullWidth
              variant="contained"
              type="submit"
              sx={{ mt: 2 }}
            >
              Submit
            </Button>
          </form>
        </Paper>
      </Box>
    );
  }

  const handleSortChange = (event: SelectChangeEvent<SortValue>) => {
    setSortBy(event.target.value as SortValue);
  };

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  if (error) {
    return (
      <Box sx={{ maxWidth: 1200, margin: '0 auto', padding: 2 }}>
        <Alert severity="error">
          <AlertTitle>Error</AlertTitle>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, margin: '0 auto', padding: 2 }}>
      <Typography variant="h4" gutterBottom align="center" sx={{ mb: 4 }}>
        Ayn Rand Forum Explorer
      </Typography>

      <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          spacing={2} 
          alignItems="center"
          justifyContent="space-between"
        >
          <TextField
            label="Search questions"
            variant="outlined"
            value={search}
            onChange={handleSearchChange}
            size="small"
            sx={{ minWidth: { xs: '100%', sm: 300 } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: loading && (
                <InputAdornment position="end">
                  <CircularProgress size={20} />
                </InputAdornment>
              ),
            }}
          />

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Sort By</InputLabel>
            <Select<SortValue>
              value={sortBy}
              label="Sort By"
              onChange={handleSortChange}
            >
              {SORT_OPTIONS.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Paper>

      {loading && posts.length === 0 ? (
        <Stack spacing={2}>
          {[1, 2, 3].map((i) => (
            <Paper key={i} elevation={2} sx={{ p: 2 }}>
              <Stack spacing={1}>
                <Box sx={{ width: 120, height: 24, bgcolor: 'grey.200', borderRadius: 1 }} />
                <Box sx={{ width: '60%', height: 32, bgcolor: 'grey.200', borderRadius: 1 }} />
                <Box sx={{ width: '100%', height: 80, bgcolor: 'grey.200', borderRadius: 1 }} />
              </Stack>
            </Paper>
          ))}
        </Stack>
      ) : posts.length > 0 ? (
        <>
          <Stack spacing={2}>
            {posts.map((post) => (
              <Row key={post.id} post={post} />
            ))}
          </Stack>
          
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              color="primary"
              size="large"
            />
          </Box>
        </>
      ) : (
        <Paper elevation={1} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No questions found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Try adjusting your search
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default Posts;