const express = require('express');
const router = express.Router();
const snippetStorage = require('../services/snippetStorage');

// GET /api/snippets - Get all snippets (sorted by isPinned desc, createdAt desc)
router.get('/', async (req, res) => {
  try {
    const { category, language, search } = req.query;
    const snippets = await snippetStorage.getAllSnippets({ category, language, search });
    res.status(200).json({
      success: true,
      count: snippets.length,
      data: snippets,
      isMongo: snippetStorage.getMongoConnected(),
    });
  } catch (error) {
    console.error('Error fetching snippets:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve snippets.',
      details: error.message,
    });
  }
});

// GET /api/snippets/:id - Get a single snippet by ID
router.get('/:id', async (req, res) => {
  try {
    const snippet = await snippetStorage.getSnippetById(req.params.id);
    if (!snippet) {
      return res.status(404).json({
        success: false,
        error: `Snippet with id "${req.params.id}" not found.`,
      });
    }
    res.status(200).json({ success: true, data: snippet });
  } catch (error) {
    console.error('Error retrieving snippet:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve snippet.',
      details: error.message,
    });
  }
});

// POST /api/snippets - Create a new snippet
router.post('/', async (req, res) => {
  try {
    const { title, code, language, category, tags, aiInsights, isPinned } = req.body;

    // Validation
    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Title is required.',
      });
    }

    if (!code || !code.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Code is required.',
      });
    }

    const validCategories = ['Snippet', 'Bug Fix'];
    if (category && !validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        error: `Invalid category: "${category}". Must be "Snippet" or "Bug Fix".`,
      });
    }

    const newSnippet = await snippetStorage.createSnippet({
      title: title.trim(),
      code,
      language: language ? language.trim() : 'JavaScript',
      category: category || 'Snippet',
      tags: tags || [],
      aiInsights: aiInsights || {},
      isPinned: Boolean(isPinned),
    });

    res.status(201).json({
      success: true,
      message: 'Snippet created successfully.',
      data: newSnippet,
    });
  } catch (error) {
    console.error('Error creating snippet:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create snippet.',
      details: error.message,
    });
  }
});

// PUT /api/snippets/:id - Update snippet by ID
router.put('/:id', async (req, res) => {
  try {
    const { title, code, language, category, tags, aiInsights, isPinned } = req.body;

    const updates = {};
    if (title !== undefined) updates.title = title.trim();
    if (code !== undefined) updates.code = code;
    if (language !== undefined) updates.language = language.trim();
    if (category !== undefined) {
      if (!['Snippet', 'Bug Fix'].includes(category)) {
        return res.status(400).json({
          success: false,
          error: `Invalid category: "${category}". Must be "Snippet" or "Bug Fix".`,
        });
      }
      updates.category = category;
    }
    if (tags !== undefined) updates.tags = tags;
    if (aiInsights !== undefined) updates.aiInsights = aiInsights;
    if (isPinned !== undefined) updates.isPinned = Boolean(isPinned);

    const updated = await snippetStorage.updateSnippet(req.params.id, updates);
    if (!updated) {
      return res.status(404).json({
        success: false,
        error: `Snippet with id "${req.params.id}" not found.`,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Snippet updated successfully.',
      data: updated,
    });
  } catch (error) {
    console.error('Error updating snippet:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update snippet.',
      details: error.message,
    });
  }
});

// PATCH /api/snippets/:id/pin - Toggle pin status
router.patch('/:id/pin', async (req, res) => {
  try {
    const updated = await snippetStorage.togglePin(req.params.id);
    if (!updated) {
      return res.status(404).json({
        success: false,
        error: `Snippet with id "${req.params.id}" not found.`,
      });
    }

    res.status(200).json({
      success: true,
      message: `Snippet ${updated.isPinned ? 'pinned' : 'unpinned'} successfully.`,
      data: updated,
    });
  } catch (error) {
    console.error('Error toggling pin:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to toggle pin state.',
      details: error.message,
    });
  }
});

// DELETE /api/snippets/:id - Delete snippet by ID
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await snippetStorage.deleteSnippet(req.params.id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: `Snippet with id "${req.params.id}" not found.`,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Snippet deleted successfully.',
      data: deleted,
    });
  } catch (error) {
    console.error('Error deleting snippet:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete snippet.',
      details: error.message,
    });
  }
});

// POST /api/snippets/reset-seed - Reset demo seed data (helpful for testing)
router.post('/reset-seed', (req, res) => {
  const resetList = snippetStorage.resetSeedData();
  res.status(200).json({
    success: true,
    message: 'Reset back to 3 seed entries successfully.',
    data: resetList,
  });
});

module.exports = router;
