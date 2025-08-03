# 🗳️ Git Stash Election

A modern Electron desktop application for managing git stashes across multiple repositories with an intuitive, election-style interface built with React 19.

![Git Stash Election](https://img.shields.io/badge/Electron-App-47848F?style=for-the-badge&logo=electron)
![React](https://img.shields.io/badge/React-19.1.0-61DAFB?style=for-the-badge&logo=react)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.0-06B6D4?style=for-the-badge&logo=tailwindcss)
![Platform](https://img.shields.io/badge/Platform-macOS%20%7C%20Windows%20%7C%20Linux-lightgrey?style=for-the-badge)

## ✨ Features

- **🏆 Election-Style Interface** - Vote on your favorite stashes with an intuitive browsing experience
- **📂 Multi-Repository Support** - Manage stashes across all your git repositories from one place
- **⚡ Quick Actions** - Apply or drop stashes with single-click actions
- **📁 File-Level Preview** - Browse changed files with status indicators before applying
- **🔍 Diff Viewer** - View detailed code changes with syntax highlighting
- **📏 Resizable Panels** - Drag to resize repository and files panels for optimal workflow
- **🌙 Theme Toggle** - Switch between light and dark modes with manual override of system preferences
- **💾 Persistent Storage** - Remembers your repositories, panel sizes, and theme preference between sessions
- **🎨 Modern UI** - Clean, responsive interface built with React 19 and Tailwind CSS v4
- **⚡ Optimized Performance** - React 19 features with automatic batching and optimized state management

## 📥 Downloads

### 🚀 Latest Release: v1.0.0
*Clean git workflows made beautiful*

---

### 🍎 **macOS**
Choose your Mac architecture for optimal performance:

| **Apple Silicon** | **Intel Mac** |
|:---:|:---:|
| ![Apple Silicon](https://img.shields.io/badge/M1%2FM2%2FM3-Ready-FF6B35?style=for-the-badge&logo=apple) | ![Intel](https://img.shields.io/badge/Intel-Compatible-0071C5?style=for-the-badge&logo=intel) |
| [**Download DMG**](https://github.com/w3debugger/gitstash-manager/releases/download/1.0.0/GitStash.Manager-1.0.0-arm64.dmg) | [**Download DMG**](https://github.com/w3debugger/gitstash-manager/releases/download/1.0.0/GitStash.Manager-1.0.0-x64.dmg) |
| `106 MB` | `111 MB` |

---

### 🪟 **Windows**
*Compatible with Windows 10 & 11*

![Windows](https://img.shields.io/badge/Windows-10%20%7C%2011-0078D4?style=for-the-badge&logo=windows)

[**📦 Download Installer**](https://github.com/w3debugger/gitstash-manager/releases/download/1.0.0/GitStash.Manager-1.0.0-x64.exe)

`84 MB • 64-bit`

---

### 🐧 **Linux**
*Universal AppImage - works on any distribution*

![Linux](https://img.shields.io/badge/Linux-Universal-FCC624?style=for-the-badge&logo=linux&logoColor=black)

[**🔥 Download AppImage**](https://github.com/w3debugger/gitstash-manager/releases/download/1.0.0/gitstash-manager-1.0.0.AppImage)

`113 MB • No installation required`

**Quick Setup:**
```bash
# Make executable and run
chmod +x gitstash-manager-1.0.0.AppImage
./gitstash-manager-1.0.0.AppImage

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- Git installed and accessible from command line

### Installation & Development

```bash
# Clone the repository
git clone https://github.com/w3debugger/gitstash-manager.git
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

This application uses a modern tech stack with React 19 optimizations:

- **Frontend**: React 19.1 with new `use()` hook, automatic batching, and optimized Context API
- **Styling**: Tailwind CSS v4 with `@theme` directive and utility-first approach (no config file needed)
- **Build Tool**: Vite for fast development and optimized builds
- **Desktop**: Electron 28 for cross-platform desktop functionality
- **Git Operations**: simple-git for reliable git command execution
- **Storage**: electron-store for persistent repository management
- **State Management**: React 19 useReducer with batch updates and memoization patterns

### Project Structure

```
gitstash-manager/
├── src/                          # React application source
│   ├── components/              # React components
│   │   ├── GitStashElectionApp.jsx    # Main app component with React 19 features
│   │   ├── RepositoriesPanel.jsx      # Repository management panel
│   │   ├── FilesPanel.jsx             # Files browser panel
│   │   ├── StashList.jsx             # Stash list with batch operations
│   │   ├── StashDetailsView.jsx      # Code diff viewer
│   │   ├── ThemeToggle.jsx           # Light/dark mode toggle
│   │   └── ui/                       # Reusable UI components
│   │       ├── Button.jsx            # Button component with variants
│   │       ├── IconButton.jsx        # Icon button component
│   │       ├── Column.jsx            # Resizable column wrapper
│   │       └── ResizeHandle.jsx      # Drag-to-resize handle
│   ├── context/                 # React Context for state management
│   │   └── AppContext.jsx           # Centralized app state with React 19 optimizations
│   ├── main.jsx                 # React entry point
│   └── index.css               # Tailwind v4 imports with @theme directive
├── main.js                      # Electron main process
├── preload.js                   # Electron preload script
├── index.html                   # HTML entry point
├── vite.config.mjs             # Vite configuration (ESM)
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

### Customizing Layout & Theme
- **Resize Repository Panel**: Drag the blue handle on the right edge of the repository panel
- **Resize Files Panel**: Drag the blue handle on the right edge of the files panel
- **Theme Toggle**: Click the 🌙/🌞 button in the top-right corner to switch between light and dark modes
- **Responsive Content**: All text and file lists automatically adapt to panel sizes
- **Persistent Preferences**: Your panel widths and theme choice are remembered between sessions

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

The app uses React 19 Context with optimized useReducer for centralized state management:

```javascript
const {
  repositories,           // Array of added repositories
  selectedRepository,     // Currently selected repository
  selectedStash,         // Currently selected stash index
  files,                 // Files in the selected stash
  columns,               // Panel width configurations
  batchUpdate,           // React 19 batch update function
  setRepositories,       // Optimized action creators
  setSelectedRepository
} = useApp()

// React 19 patterns used:
// - use() hook instead of useContext()
// - Automatic batching for multiple state updates
// - Memoized action creators for better performance
// - Conditional dispatch exposure for advanced use cases
```

## 🎨 UI Components

- **RepositoriesPanel**: Repository management with expandable stash lists and batch operations
- **FilesPanel**: File browser with change status indicators and optimized rendering
- **StashDetailsView**: Code diff viewer with syntax highlighting and adaptive layout
- **ThemeToggle**: Light/dark mode toggle with system preference override
- **Column**: Resizable column wrapper with drag-to-resize handles
- **UI Components**: Consistent design system with Button, IconButton, and ResizeHandle components
- **React 19 Optimizations**: Memoized components, batch updates, and performance-optimized rendering

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
- Styled with [Tailwind CSS v4](https://tailwindcss.com/) for utility-first styling
- Uses [simple-git](https://github.com/steveukx/git-js) for reliable git operations
- Bundled with [Vite](https://vitejs.dev/) for fast development experience

---

**Made with ❤️ for developers who love clean git workflows**