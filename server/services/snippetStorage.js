const mongoose = require('mongoose');
const Snippet = require('../models/Snippet');
const seedSnippets = require('../seeds/seedData');

let isConnectedToMongo = false;
let memoryStore = [];

// Initialize memory store with seed data
function initMemoryStore() {
  memoryStore = seedSnippets.map((s, index) => ({
    _id: `seed-${index + 1}-${Date.now()}`,
    ...s,
    createdAt: s.createdAt || new Date(),
    updatedAt: new Date(),
  }));
}

// Check MongoDB connection status
function setMongoConnected(status) {
  isConnectedToMongo = status;
}

function getMongoConnected() {
  return isConnectedToMongo;
}

// Seed MongoDB if empty
async function seedMongoIfEmpty() {
  if (!isConnectedToMongo) return;
  try {
    const count = await Snippet.countDocuments();
    if (count === 0) {
      console.log('Seeding MongoDB with 3 realistic developer entries...');
      await Snippet.insertMany(seedSnippets);
      console.log('Seeding completed successfully.');
    }
  } catch (err) {
    console.error('Failed to seed MongoDB:', err.message);
  }
}

// Get all snippets sorted by isPinned desc, createdAt desc
async function getAllSnippets({ category, language, search } = {}) {
  if (isConnectedToMongo) {
    const query = {};
    if (category && category !== 'All') {
      query.category = category;
    }
    if (language && language !== 'All') {
      query.language = { $regex: new RegExp(`^${language}$`, 'i') };
    }
    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: regex },
        { code: regex },
        { tags: regex },
        { language: regex },
      ];
    }
    return await Snippet.find(query).sort({ isPinned: -1, createdAt: -1 });
  }

  // In-memory fallback
  let list = [...memoryStore];
  if (category && category !== 'All') {
    list = list.filter((s) => s.category === category);
  }
  if (language && language !== 'All') {
    list = list.filter((s) => s.language.toLowerCase() === language.toLowerCase());
  }
  if (search && search.trim()) {
    const sTerm = search.trim().toLowerCase();
    list = list.filter(
      (s) =>
        s.title.toLowerCase().includes(sTerm) ||
        s.code.toLowerCase().includes(sTerm) ||
        s.language.toLowerCase().includes(sTerm) ||
        (Array.isArray(s.tags) && s.tags.some((t) => t.toLowerCase().includes(sTerm)))
    );
  }

  // Sort pinned first, then createdAt desc
  return list.sort((a, b) => {
    if (a.isPinned !== b.isPinned) {
      return a.isPinned ? -1 : 1;
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

// Get single snippet
async function getSnippetById(id) {
  if (isConnectedToMongo && mongoose.Types.ObjectId.isValid(id)) {
    return await Snippet.findById(id);
  }
  return memoryStore.find((s) => s._id.toString() === id.toString()) || null;
}

// Create new snippet
async function createSnippet(data) {
  const normalizedData = {
    title: data.title,
    code: data.code,
    language: data.language || 'JavaScript',
    category: data.category || 'Snippet',
    tags: Array.isArray(data.tags)
      ? data.tags.filter(Boolean).map((t) => t.trim())
      : typeof data.tags === 'string'
      ? data.tags.split(',').map((t) => t.trim()).filter(Boolean)
      : [],
    aiInsights: {
      summary: data.aiInsights?.summary || '',
      bugCheck: data.aiInsights?.bugCheck || '',
      complexity: data.aiInsights?.complexity || '',
    },
    isPinned: Boolean(data.isPinned),
    createdAt: new Date(),
  };

  if (isConnectedToMongo) {
    const snippet = new Snippet(normalizedData);
    return await snippet.save();
  }

  const memoryItem = {
    _id: `mem-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    ...normalizedData,
    updatedAt: new Date(),
  };
  memoryStore.unshift(memoryItem);
  return memoryItem;
}

// Update snippet
async function updateSnippet(id, updates) {
  if (isConnectedToMongo && mongoose.Types.ObjectId.isValid(id)) {
    return await Snippet.findByIdAndUpdate(
      id,
      {
        ...updates,
        ...(updates.tags && {
          tags: Array.isArray(updates.tags)
            ? updates.tags.map((t) => t.trim()).filter(Boolean)
            : typeof updates.tags === 'string'
            ? updates.tags.split(',').map((t) => t.trim()).filter(Boolean)
            : [],
        }),
      },
      { new: true, runValidators: true }
    );
  }

  const index = memoryStore.findIndex((s) => s._id.toString() === id.toString());
  if (index === -1) return null;

  const existing = memoryStore[index];
  const updatedItem = {
    ...existing,
    ...updates,
    tags: updates.tags
      ? Array.isArray(updates.tags)
        ? updates.tags.map((t) => t.trim()).filter(Boolean)
        : typeof updates.tags === 'string'
        ? updates.tags.split(',').map((t) => t.trim()).filter(Boolean)
        : existing.tags
      : existing.tags,
    aiInsights: updates.aiInsights ? { ...existing.aiInsights, ...updates.aiInsights } : existing.aiInsights,
    updatedAt: new Date(),
  };
  memoryStore[index] = updatedItem;
  return updatedItem;
}

// Toggle pin
async function togglePin(id) {
  const item = await getSnippetById(id);
  if (!item) return null;
  return await updateSnippet(id, { isPinned: !item.isPinned });
}

// Delete snippet
async function deleteSnippet(id) {
  if (isConnectedToMongo && mongoose.Types.ObjectId.isValid(id)) {
    return await Snippet.findByIdAndDelete(id);
  }

  const index = memoryStore.findIndex((s) => s._id.toString() === id.toString());
  if (index === -1) return null;
  const deleted = memoryStore.splice(index, 1);
  return deleted[0];
}

// Reset / reload seed data
function resetSeedData() {
  initMemoryStore();
  return memoryStore;
}

// Initialize on boot
initMemoryStore();

module.exports = {
  setMongoConnected,
  getMongoConnected,
  seedMongoIfEmpty,
  getAllSnippets,
  getSnippetById,
  createSnippet,
  updateSnippet,
  togglePin,
  deleteSnippet,
  resetSeedData,
};
