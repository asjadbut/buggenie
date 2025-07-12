import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, MenuItem, Button, Paper, FormControl, InputLabel, Select, CircularProgress, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { PLATFORMS } from './platforms';
import GeminiService from './services/gemini';
import LearningCard from './components/LearningCard';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const LearningPage = ({ onBack }) => {
  const [platform, setPlatform] = useState('');
  const [bugcrowdCategories, setBugcrowdCategories] = useState([]);
  const [bugcrowdCategory, setBugcrowdCategory] = useState('');
  const [bugcrowdSubcategories, setBugcrowdSubcategories] = useState([]);
  const [bugcrowdSubcategory, setBugcrowdSubcategory] = useState('');
  const [bugcrowdVariants, setBugcrowdVariants] = useState([]);
  const [bugcrowdVariant, setBugcrowdVariant] = useState('');
  const [category, setCategory] = useState('');
  const [vrtOptions, setVrtOptions] = useState([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState('');
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [vrtLoading, setVrtLoading] = useState(false);
  const [mode, setMode] = useState('concise'); // 'concise' or 'detailed'

  // Load VRT options for HackerOne/Google
  useEffect(() => {
    const selectedPlatform = PLATFORMS.find((p) => p.key === platform);
    setVrtOptions(selectedPlatform ? selectedPlatform.categories : []);
    setCategory('');
  }, [platform]);

  // Load Bugcrowd VRT JSON
  useEffect(() => {
    if (platform === 'bugcrowd') {
      setVrtLoading(true);
      fetch('/bugcrowd-vrt.json')
        .then(res => res.json())
        .then(data => {
          setBugcrowdCategories(data.content || []);
          setVrtLoading(false);
        });
      setBugcrowdCategory('');
      setBugcrowdSubcategory('');
      setBugcrowdVariant('');
      setBugcrowdSubcategories([]);
      setBugcrowdVariants([]);
    } else {
      setBugcrowdCategories([]);
      setBugcrowdCategory('');
      setBugcrowdSubcategory('');
      setBugcrowdVariant('');
      setBugcrowdSubcategories([]);
      setBugcrowdVariants([]);
    }
  }, [platform]);

  // When Bugcrowd category changes, update subcategories
  useEffect(() => {
    if (platform === 'bugcrowd' && bugcrowdCategory) {
      const cat = bugcrowdCategories.find(c => c.name === bugcrowdCategory);
      setBugcrowdSubcategories(cat?.children || []);
      setBugcrowdSubcategory('');
      setBugcrowdVariant('');
      setBugcrowdVariants([]);
    }
  }, [platform, bugcrowdCategory, bugcrowdCategories]);

  // When Bugcrowd subcategory changes, update variants
  useEffect(() => {
    if (platform === 'bugcrowd' && bugcrowdSubcategory) {
      const cat = bugcrowdCategories.find(c => c.name === bugcrowdCategory);
      const subcat = cat?.children?.find(s => s.name === bugcrowdSubcategory);
      setBugcrowdVariants(subcat?.children || []);
      setBugcrowdVariant('');
    }
  }, [platform, bugcrowdCategory, bugcrowdSubcategory, bugcrowdCategories]);

  // Determine the most specific selection (only when complete for Bugcrowd)
  let mostSpecific = '';
  let bugcrowdSelectionComplete = false;
  if (platform === 'bugcrowd') {
    if (bugcrowdCategory) {
      const cat = bugcrowdCategories.find(c => c.name === bugcrowdCategory);
      if (bugcrowdSubcategory) {
        const subcat = cat?.children?.find(s => s.name === bugcrowdSubcategory);
        if (subcat && subcat.children && subcat.children.length > 0) {
          // Variants exist for this subcategory
          if (bugcrowdVariant) {
            mostSpecific = `${bugcrowdCategory} > ${bugcrowdSubcategory} > ${bugcrowdVariant}`;
            bugcrowdSelectionComplete = true;
          }
        } else {
          // No variants for this subcategory
          mostSpecific = `${bugcrowdCategory} > ${bugcrowdSubcategory}`;
          bugcrowdSelectionComplete = true;
        }
      } else if (cat && (!cat.children || cat.children.length === 0)) {
        // No subcategories for this category
        mostSpecific = bugcrowdCategory;
        bugcrowdSelectionComplete = true;
      }
    }
  } else if ((platform === 'hackerone' || platform === 'google') && category) {
    mostSpecific = category;
  }

  // Fetch learning card when most specific selection or mode changes
  useEffect(() => {
    if (platform === 'bugcrowd' && !bugcrowdSelectionComplete) {
      setCard(null);
      setLoading(false);
      setError('');
      return;
    }
    if (!mostSpecific) return;
    setCard(null);
    setError('');
    setLoading(true);
    GeminiService.initialize(localStorage.getItem('buggenie_api_key'));
    GeminiService.getLearningCard(mostSpecific, mode)
      .then(result => setCard(result))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [mostSpecific, mode, platform, bugcrowdSelectionComplete]);

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'stretch', p: { xs: 0, sm: 3 } }}>
      {/* Left: Platform & VRT Selection */}
      <Box
        sx={{
          width: { xs: '100%', md: 340 },
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
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>Vulnerability Type</Typography>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel id="platform-label">Platform</InputLabel>
          <Select
            labelId="platform-label"
            value={platform}
            label="Platform"
            onChange={e => setPlatform(e.target.value)}
          >
            {PLATFORMS.map((p) => (
              <MenuItem key={p.key} value={p.key}>{p.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
        {/* Bugcrowd VRT Hierarchy */}
        {platform === 'bugcrowd' && vrtLoading && (
          <Box sx={{ textAlign: 'center', py: 2 }}><CircularProgress size={28} /></Box>
        )}
        {platform === 'bugcrowd' && !vrtLoading && (
          <>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="bugcrowd-category-label">Category</InputLabel>
              <Select
                labelId="bugcrowd-category-label"
                value={bugcrowdCategory}
                label="Category"
                onChange={e => setBugcrowdCategory(e.target.value)}
              >
                {bugcrowdCategories.map(cat => (
                  <MenuItem key={cat.id} value={cat.name}>{cat.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            {bugcrowdSubcategories.length > 0 && (
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel id="bugcrowd-subcategory-label">Subcategory</InputLabel>
                <Select
                  labelId="bugcrowd-subcategory-label"
                  value={bugcrowdSubcategory}
                  label="Subcategory"
                  onChange={e => setBugcrowdSubcategory(e.target.value)}
                >
                  {bugcrowdSubcategories.map(subcat => (
                    <MenuItem key={subcat.id} value={subcat.name}>{subcat.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            {bugcrowdVariants.length > 0 && (
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel id="bugcrowd-variant-label">Variant</InputLabel>
                <Select
                  labelId="bugcrowd-variant-label"
                  value={bugcrowdVariant}
                  label="Variant"
                  onChange={e => setBugcrowdVariant(e.target.value)}
                >
                  {bugcrowdVariants.map(variant => (
                    <MenuItem key={variant.id} value={variant.name}>{variant.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </>
        )}
        {/* HackerOne/Google VRT */}
        {(platform === 'hackerone' || platform === 'google') && (
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="vrt-label">VRT Category</InputLabel>
            <Select
              labelId="vrt-label"
              value={category}
              label="VRT Category"
              onChange={e => setCategory(e.target.value)}
            >
              {vrtOptions.map((cat) => (
                <MenuItem key={cat} value={cat}>{cat}</MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
        <Typography variant="body2" sx={{ color: '#888', mt: 2 }}>
          Select the most specific vulnerability type to view a learning card.
        </Typography>
      </Box>
      {/* Right: Learning Card */}
      <Box sx={{ flex: 1, p: { xs: 2, md: 4 }, display: 'flex', flexDirection: 'column', alignItems: 'stretch', justifyContent: 'flex-start', minHeight: '100vh' }}>
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <ToggleButtonGroup
            value={mode}
            exclusive
            onChange={(_, value) => value && setMode(value)}
            size="small"
            color="primary"
            aria-label="Learning card mode"
          >
            <ToggleButton value="concise">Concise</ToggleButton>
            <ToggleButton value="detailed">Detailed</ToggleButton>
          </ToggleButtonGroup>
        </Box>
        <LearningCard card={card} loading={loading} error={error} mode={mode} />
      </Box>
    </Box>
  );
};

export default LearningPage; 