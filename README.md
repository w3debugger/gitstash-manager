# 🗳️ Git Stash Election

A modern Electron desktop application for managing git stashes across multiple repositories with an intuitive, election-style interface built with React 19.

![Git Stash Election](https://img.shields.io/badge/Electron-App-47848F?style=for-the-badge&logo=electron)
![React](https://img.shields.io/badge/React-19.1.0-61DAFB?style=for-the-badge&logo=react)
![Platform](https://img.shields.io/badge/Platform-macOS%20%7C%20Windows%20%7C%20Linux-lightgrey?style=for-the-badge)

## ✨ Features

- **🏆 Election-Style Interface** - Vote on your favorite stashes with an intuitive browsing experience
- **📂 Multi-Repository Support** - Manage stashes across all your git repositories from one place
- **⚡ Quick Actions** - Apply or drop stashes with single-click actions
- **📁 File-Level Preview** - Browse changed files with status indicators before applying
- **🔍 Diff Viewer** - View detailed code changes with syntax highlighting
- **📏 Resizable Columns** - Drag to resize sidebar and files panel for optimal workflow
- **💾 Persistent Storage** - Remembers your repositories and panel sizes between sessions
- **🎨 Modern UI** - Clean, responsive interface built with React 19

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- Git installed and accessible from command line

### Installation & Development

```bash
# Clone the repository
git clone <your-repo-url>
cd gitstash-manager

# Install dependencies
npm install

# Start development mode (React + Electron with hot reload)
npm run dev

# Or start production mode
npm start
```

### Building for Distribution

```bash
# Build React app and create distributable
npm run build
npm run dist

# Or build React app only
npm run build:react
```

## 🛠️ Architecture

This application uses a modern tech stack:

- **Frontend**: React 19.1 with Hooks and Context API
- **Build Tool**: Vite for fast development and optimized builds
- **Desktop**: Electron 28 for cross-platform desktop functionality
- **Git Operations**: simple-git for reliable git command execution
- **Storage**: electron-store for persistent repository management

### Project Structure

```
gitstash-manager/
├── src/                          # React application source
│   ├── components/              # React components
│   │   ├── GitStashElectionApp.jsx    # Main app component
│   │   ├── Sidebar.jsx               # Repository sidebar
│   │   ├── RepositoryTree.jsx        # Repository tree view
│   │   ├── StashItem.jsx             # Individual stash component
│   │   ├── FilesSidebar.jsx          # Files browser
│   │   ├── StashDetailsView.jsx      # Code diff viewer
│   │   └── ...                       # Other components
│   ├── context/                 # React Context for state management
│   │   └── AppContext.jsx           # Centralized app state
│   ├── main.jsx                 # React entry point
│   └── index.css               # Global styles
├── main.js                      # Electron main process
├── preload.js                   # Electron preload script
├── index.html                   # HTML entry point
├── vite.config.js              # Vite configuration
└── package.json                # Dependencies and scripts
```

## 🎯 Usage

### Adding Repositories
1. Click the **➕** button in the sidebar
2. Select a folder containing a git repository
3. The repository will appear in your sidebar with expandable stash list

### Managing Stashes
- **Expand Repository**: Click the repository name to see all stashes
- **Select Stash**: Click any stash to view its changes
- **Apply Stash**: Click ✅ to apply the stash to your working directory
- **Drop Stash**: Click 🗑️ to permanently delete the stash
- **Browse Files**: Select a stash to see changed files in the files sidebar
- **View Diff**: Click any file to see the detailed code changes

### Customizing Layout
- **Resize Sidebar**: Drag the blue handle on the right edge of the repository panel (200px - 600px)
- **Resize Files Panel**: Drag the blue handle on the right edge of the files panel (200px - 500px)
- **Responsive Content**: All text and file lists automatically adapt to panel sizes
- **Persistent Sizes**: Your preferred panel widths are remembered between sessions

### Keyboard Shortcuts
- `Cmd/Ctrl + N` - Add new repository
- `Cmd/Ctrl + R` - Refresh all repositories

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development mode with hot reload
- `npm run dev:react` - Start only the React dev server
- `npm run build:react` - Build React app for production
- `npm run build` - Build React app and create Electron distributable
- `npm run dist` - Create distributable packages for current platform
- `npm start` - Start Electron with production React build
- `npm run debug` - Start Electron in debug mode

### Development Workflow

1. **Development**: Use `npm run dev` for hot-reloading React + Electron
2. **Testing**: Use `npm start` to test the production build
3. **Distribution**: Use `npm run dist` to create platform-specific installers

### State Management

The app uses React Context with useReducer for centralized state management:

```javascript
const {
  repositories,           // Array of added repositories
  selectedRepository,     // Currently selected repository
  selectedStash,         // Currently selected stash index
  files,                 // Files in the selected stash
  sidebarWidth,          // Current sidebar width (resizable)
  filesSidebarWidth,     // Current files sidebar width (resizable)
  setSidebarWidth,       // Function to update sidebar width
  setFilesSidebarWidth,  // Function to update files sidebar width
  showNotification       // Function to show toast messages
} = useApp()
```

## 🎨 UI Components

- **Resizable Sidebar**: Repository management and stash navigation with drag-to-resize functionality
- **Resizable FilesSidebar**: File browser with change status indicators and flexible width
- **MainContent**: Dynamic content area with welcome screen and diff viewer that adapts to available space
- **Notification**: Toast messages for user feedback
- **WelcomeScreen**: Getting started guide for new users
- **Resize Handles**: Interactive blue handles for intuitive column resizing

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Electron](https://electronjs.org/) for cross-platform desktop development
- Powered by [React 19](https://react.dev/) for modern UI development
- Uses [simple-git](https://github.com/steveukx/git-js) for reliable git operations
- Bundled with [Vite](https://vitejs.dev/) for fast development experience

---

**Made with ❤️ for developers who love clean git workflows**