
# TestForge AI - Groq-Powered Test Case Generator

TestForge AI is an intelligent test case generation tool that leverages the speed and performance of Groq's Llama 3 models to automatically create comprehensive test scenarios from user requirements or code snippets.

## 🚀 Features

- **Instant Generation**: Uses Groq's high-speed inference engine for near-instant results.
- **Structured Output**: Generates test cases in a standardized, easy-to-read Markdown format.
- **Smart Context**: Includes test case IDs, scenarios, pre-conditions, steps, expected results, priority, and type.
- **Modern UI**: Built with React, featuring glassmorphism design, smooth animations, and a responsive layout.
- **Export Options**: Copy test cases to clipboard or download as a Markdown file.

## 🏗️ Architecture

The application is built as a Single Page Application (SPA) using the following technologies:

### Frontend
- **Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/) for fast development and build.
- **Styling**: 
  - CSS Variables for theming (Dracula-inspired dark mode).
  - [Framer Motion](https://www.framer.com/motion/) for complex animations (fade-ins, transitions).
  - [Lucide React](https://lucide.dev/) for consistent iconography.
- **Markdown Rendering**: [react-markdown](https://github.com/remarkjs/react-markdown) to safely render the AI-generated content.

### Backend / AI
- **LLM Provider**: [Groq Cloud](https://groq.com/)
- **Model**: `llama-3.3-70b-versatile` (optimized for instruction following and reasoning).
- **Integration**: Direct integration via `groq-sdk` (Client-side API calls with browser safety enabled).

### Project Structure

```
Project4_LearnAIGroq/
├── public/              # Static assets
├── src/
│   ├── assets/          # Images/SVGs
│   ├── App.jsx          # Main application logic & UI
│   ├── App.css          # Component-specific styles
│   ├── index.css        # Global styles & CSS variables
│   └── main.jsx         # Entry point
├── .env                 # Environment variables (API Keys)
├── index.html           # HTML template
├── package.json         # Dependencies and scripts
└── vite.config.js       # Vite configuration
```

## 🛠️ Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- A valid [Groq API Key](https://console.groq.com/keys)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/shobharatheesh/AITesterBlueprint_Projects.git
   cd AITesterBlueprint_Projects/Project4_LearnAIGroq
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env` file in the root directory:
   ```bash
   touch .env
   ```
   Add your Groq API key:
   ```env
   VITE_GROQ_API_KEY=gsk_your_actual_api_key_here
   ```

4. **Running the Application**
   Start the development server:
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:5173` (or the URL shown in the terminal).

## 📖 Usage

1. **Enter API Key**: If not set in `.env`, you can enter your Groq API key directly in the UI (top right).
2. **Input Requirements**: Paste your user stories, acceptance criteria, or code snippet into the input area.
3. **Generate**: Click the "Generate Test Cases" button.
4. **Review & Export**: Review the generated test cases, copy them to your clipboard, or download them as a `.md` file.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
