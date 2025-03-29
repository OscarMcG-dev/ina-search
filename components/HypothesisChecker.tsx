import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  Container,
  FormControl,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  Typography,
  CircularProgress,
  Chip,
  Grid,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';

interface ResearchPaper {
  id: string;
  title: string;
  abstract: string;
  authors: string[];
  year: number;
  relevanceScore: number;
  url: string;
}

interface HypothesisCheckerProps {
  onSearch: (hypothesis: string) => Promise<ResearchPaper[]>;
}

export const HypothesisChecker: React.FC<HypothesisCheckerProps> = ({ onSearch }) => {
  const [hypothesis, setHypothesis] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<ResearchPaper[]>([]);

  const handleSearch = async () => {
    if (!hypothesis.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const papers = await onSearch(hypothesis);
      setResults(papers);
    } catch (err) {
      setError('Failed to search for papers. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Research Hypothesis Checker
        </Typography>
        
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <FormControl fullWidth>
            <TextField
              label="Enter your research hypothesis"
              variant="outlined"
              multiline
              rows={3}
              value={hypothesis}
              onChange={(e) => setHypothesis(e.target.value)}
              placeholder="Example: Higher levels of mindfulness practice lead to reduced stress levels in college students"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleSearch}
                      disabled={isLoading}
                      edge="end"
                    >
                      {isLoading ? <CircularProgress size={24} /> : <SearchIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </FormControl>

          <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              startIcon={<FilterListIcon />}
              size="small"
            >
              Filter
            </Button>
            <Button
              variant="outlined"
              startIcon={<SortIcon />}
              size="small"
            >
              Sort
            </Button>
          </Box>
        </Paper>

        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        <Grid container spacing={3}>
          {results.map((paper) => (
            <Grid item xs={12} key={paper.id}>
              <Card sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="h6" component="h2">
                    {paper.title}
                  </Typography>
                  <Chip 
                    label={`Relevance: ${Math.round(paper.relevanceScore * 100)}%`}
                    color={paper.relevanceScore > 0.7 ? 'success' : 'default'}
                  />
                </Box>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {paper.authors.join(', ')} • {paper.year}
                </Typography>
                
                <Typography variant="body1" paragraph>
                  {paper.abstract}
                </Typography>
                
                <Button 
                  variant="outlined" 
                  href={paper.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Paper
                </Button>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};

export default HypothesisChecker; 