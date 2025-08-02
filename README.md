# Git Stash Election 🗳️

An election-style web interface for viewing and managing your git stashes! Vote for your favorite stash and see what's inside.

## Features

- 🏆 **Visual Stash Browser**: See all your stashes in an election-style candidate grid
- 📊 **Repository Status**: Real-time git status information
- 🔍 **Stash Preview**: Click any stash to view its full content
- ✅ **Apply Stashes**: Apply selected stashes to your working directory
- 🗑️ **Drop Stashes**: Safely remove stashes you no longer need
- 📱 **Responsive Design**: Works on desktop and mobile

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser to `http://localhost:3000`

## Usage

1. **View Stashes**: The app automatically loads all your git stashes and displays them as "candidates"
2. **Select a Stash**: Click on any stash card to see its detailed content
3. **Apply a Stash**: Click "Apply Selected Stash" to apply it to your working directory
4. **Drop a Stash**: Click "Drop Selected Stash" to permanently remove it
5. **Refresh**: Use the refresh button to reload stashes and status

## How It Works

The app uses a Node.js backend with Express and the `simple-git` library to interact with your git repository. The frontend provides an intuitive election-themed interface for browsing and managing stashes.

## Requirements

- Node.js (v14 or higher)
- Git repository with stashes
- Modern web browser

## API Endpoints

- `GET /api/stashes` - List all stashes
- `GET /api/stash/:index` - Get specific stash content
- `POST /api/stash/:index/apply` - Apply a stash
- `POST /api/stash/:index/drop` - Drop a stash
- `GET /api/status` - Get repository status

## Development

For development with auto-reload:
```bash
npm run dev
```

For production:
```bash
npm start
```

## Contributing

Feel free to submit issues and enhancement requests!