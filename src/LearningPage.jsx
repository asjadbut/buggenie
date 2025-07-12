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
    <Box sx={{ width: '100%', minHeight: '100vh', display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'stretch', p: { xs: 0, sm: 3 } }}>
      {/* Left: Searchable List */}
      <Box
        sx={{
          width: { xs: '100%', md: 320 },
          minWidth: 240,
          maxWidth: 400,
          flexShrink: 0,
          borderRight: { md: '1px solid #333' },
          background: '#23272f',
          p: { xs: 2, md: 3 },
          position: { md: 'sticky' },
          top: { md: 0 },
          height: { md: '100vh' },
          overflowY: { md: 'auto' },
          zIndex: 1,
        }}
      >
        <Button startIcon={<ArrowBackIcon />} onClick={onBack} sx={{ mb: 2 }}>
          Back to App
        </Button>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>Vulnerability Types</Typography>
        <TextField
          label="Search Vulnerability Type"
          variant="outlined"
          fullWidth
          value={search}
          onChange={e => setSearch(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Paper elevation={1} sx={{ maxHeight: { xs: 300, md: 'calc(100vh - 200px)' }, overflow: 'auto', mb: 2 }}>
          {filtered.length === 0 && (
            <Typography sx={{ p: 2 }}>No results found.</Typography>
          )}
          {filtered.slice(0, 50).map(vuln => (
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
      </Box>
      {/* Right: Learning Card */}
      <Box sx={{ flex: 1, p: { xs: 2, md: 4 }, display: 'flex', flexDirection: 'column', alignItems: 'stretch', justifyContent: 'flex-start', minHeight: '100vh' }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, display: { xs: 'block', md: 'none' } }}>Vulnerability Learning Cards</Typography>
        <Typography variant="body1" sx={{ mb: 3, display: { xs: 'block', md: 'none' } }}>
          Search and select a vulnerability type to view an AI-generated learning card with practical info, examples, and remediation tips.
        </Typography>
        <LearningCard card={card} loading={loading} error={error} />
      </Box>
    </Box>
  );
};

export default LearningPage; 