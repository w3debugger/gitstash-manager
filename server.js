const express = require('express');
const simpleGit = require('simple-git');
const cors = require('cors');
const path = require('path');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Initialize git
const git = simpleGit();

// API Routes
app.get('/api/stashes', async (req, res) => {
  try {
    const stashList = await git.stashList();
    res.json(stashList);
  } catch (error) {
    console.error('Error getting stash list:', error);
    res.status(500).json({ error: 'Failed to get stash list' });
  }
});

app.get('/api/stash/:index', async (req, res) => {
  try {
    const index = req.params.index;
    const stashShow = await git.show([`stash@{${index}}`]);
    res.json({ content: stashShow });
  } catch (error) {
    console.error('Error showing stash:', error);
    res.status(500).json({ error: 'Failed to show stash content' });
  }
});

app.post('/api/stash/:index/apply', async (req, res) => {
  try {
    const index = req.params.index;
    await git.stash(['apply', `stash@{${index}}`]);
    res.json({ success: true, message: `Applied stash@{${index}}` });
  } catch (error) {
    console.error('Error applying stash:', error);
    res.status(500).json({ error: 'Failed to apply stash' });
  }
});

app.post('/api/stash/:index/drop', async (req, res) => {
  try {
    const index = req.params.index;
    await git.stash(['drop', `stash@{${index}}`]);
    res.json({ success: true, message: `Dropped stash@{${index}}` });
  } catch (error) {
    console.error('Error dropping stash:', error);
    res.status(500).json({ error: 'Failed to drop stash' });
  }
});

app.get('/api/status', async (req, res) => {
  try {
    const status = await git.status();
    res.json(status);
  } catch (error) {
    console.error('Error getting git status:', error);
    res.status(500).json({ error: 'Failed to get git status' });
  }
});

app.listen(port, () => {
  console.log(`Git Stash Election app listening at http://localhost:${port}`);
});