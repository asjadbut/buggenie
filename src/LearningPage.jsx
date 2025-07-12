import React, { useState } from 'react';
import { Box, Typography, TextField, MenuItem, Button, Paper } from '@mui/material';
import { PLATFORMS } from './platforms';
import GeminiService from './services/gemini';
import LearningCard from './components/LearningCard';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const getAllVulnTypes = () => {
  // Flatten all categories from all platforms
  const all = new Set();
  PLATFORMS.forEach(p => p.categories.forEach(c => all.add(c)));
  return Array.from(all).sort();
};

const vulnTypes = getAllVulnTypes();

const LearningPage = ({ onBack }) => {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState('');
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSelect = async (vuln) => {
    setSelected(vuln);
    setCard(null);
    setError('');
    setLoading(true);
    try {
      GeminiService.initialize(localStorage.getItem('buggenie_api_key'));
      const result = await GeminiService.getLearningCard(vuln);
      setCard(result);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const filtered = vulnTypes.filter(v => v.toLowerCase().includes(search.toLowerCase()));

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', p: { xs: 1, sm: 3 }, minHeight: '100vh' }}>
      <Button startIcon={<ArrowBackIcon />} onClick={onBack} sx={{ mb: 2 }}>
        Back to App
      </Button>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>Vulnerability Learning Cards</Typography>
      <Typography variant="body1" sx={{ mb: 3 }}>
        Search and select a vulnerability type to view an AI-generated learning card with practical info, examples, and remediation tips.
      </Typography>
      <TextField
        label="Search Vulnerability Type"
        variant="outlined"
        fullWidth
        value={search}
        onChange={e => setSearch(e.target.value)}
        sx={{ mb: 2 }}
      />
      <Paper elevation={1} sx={{ maxHeight: 300, overflow: 'auto', mb: 3 }}>
        {filtered.length === 0 && (
          <Typography sx={{ p: 2 }}>No results found.</Typography>
        )}
        {filtered.slice(0, 30).map(vuln => (
          <MenuItem
            key={vuln}
            selected={vuln === selected}
            onClick={() => handleSelect(vuln)}
            sx={{ fontWeight: vuln === selected ? 700 : 400 }}
          >
            {vuln}
          </MenuItem>
        ))}
      </Paper>
      <LearningCard card={card} loading={loading} error={error} />
    </Box>
  );
};

export default LearningPage; 