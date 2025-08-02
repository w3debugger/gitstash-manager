# Git Stash Election 🗳️

A **desktop Electron app** for managing git stashes across multiple repositories with an election-style interface! Like Slack for your git stashes.

## Features

- 📂 **Multi-Repository Management**: Add and manage multiple git repositories
- 🏆 **Election-Style Stash Browser**: See all your stashes as voting candidates
- 📊 **Real-time Repository Status**: Live git status for each repository
- 🔍 **Stash Preview**: Click any stash to view its full diff content
- ✅ **Apply Stashes**: Apply selected stashes to your working directory
- 🗑️ **Drop Stashes**: Safely remove stashes you no longer need
- 💻 **Native Desktop App**: Built with Electron for macOS, Windows, and Linux
- 🎨 **Slack-like Interface**: Clean sidebar with repository list and main content area

## Installation

1. Clone the repository:
```bash
git clone <repo-url>
cd git-stash-election
```

2. Install dependencies:
```bash
npm install
```

3. Start the desktop app:
```bash
npm start
```

For development with hot reload:
```bash
npm run dev
```

## Usage

### Getting Started
1. **Launch the App**: Run `npm start` to open the desktop application
2. **Add Repositories**: Click the ➕ button or use `Cmd/Ctrl+N` to add git repositories
3. **Select Repository**: Click on any repository in the sidebar to view its stashes
4. **Browse Stashes**: See all stashes displayed as election candidates

### Managing Stashes
1. **View Stash Content**: Click on any stash card to see its detailed diff
2. **Apply a Stash**: Select a stash and click "Apply Selected Stash"
3. **Drop a Stash**: Select a stash and click "Drop Selected Stash" (permanent!)
4. **Refresh**: Use `Cmd/Ctrl+R` or the refresh button to reload data

### Keyboard Shortcuts
- `Cmd/Ctrl+N`: Add new repository
- `Cmd/Ctrl+R`: Refresh current repository
- `Cmd/Ctrl+Q`: Quit application

## Application Structure

```
git-stash-election/
├── main.js              # Electron main process
├── preload.js           # Secure IPC bridge
├── renderer/            # Frontend application
│   ├── index.html       # Main UI
│   ├── styles.css       # Application styling
│   └── script.js        # Frontend logic
├── package.json         # Dependencies and scripts
└── README.md           # This file
```

## How It Works

The app uses **Electron** to create a native desktop experience:

- **Main Process** (`main.js`): Manages windows, menus, and file dialogs
- **Renderer Process** (`renderer/`): Handles the UI and user interactions
- **IPC Communication**: Secure bridge between main and renderer processes
- **simple-git Library**: Interfaces with git repositories
- **electron-store**: Persists repository list between sessions

## Building for Distribution

Build standalone executables:

```bash
# Build for current platform
npm run build

# Build and package for distribution
npm run dist
```

This creates distributables in the `dist/` folder for:
- **macOS**: `.dmg` and `.app`
- **Windows**: `.exe` installer
- **Linux**: `.AppImage`

## Requirements

- **Node.js** (v16 or higher)
- **Git** repositories you want to manage
- **macOS 10.13+**, **Windows 10+**, or **Linux** (Ubuntu 18.04+)

## Development

The app is built with:
- **Electron 28+**: For cross-platform desktop support
- **simple-git**: For git operations
- **electron-store**: For settings persistence
- **Modern CSS**: No external UI frameworks

## Security

The app follows Electron security best practices:
- Context isolation enabled
- Node.js integration disabled in renderer
- Secure IPC communication via preload script
- No remote module usage

## Contributing

Feel free to submit issues and enhancement requests! The app is designed to be:
- Cross-platform compatible
- Secure and performant
- Easy to extend with new features

## License

MIT License - feel free to use and modify!