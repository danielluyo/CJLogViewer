# 🚀 CJLogViewer

A premium, high-performance desktop application built with Electron and React to analyze and visualize **CJ/Claude chat logs**. 

Designed for developers who need to review their AI interactions with clarity, depth, and a modern aesthetic.

---

## ✨ Key Features

- **🧠 Advanced Log Parsing**: Supports the complex, nested JSONL schema used by modern CJ/Claude logs.
- **📦 Conversation Grouping**: Automatically groups fragmented log lines (text, thinking, and tool use) into cohesive "Conversation Cards" using internal Request IDs.
- **💭 Thinking Process**: Dedicated collapsible sections for the AI's internal "Thinking" monologue, allowing for deep dives without cluttering the main flow.
- **🛠️ Tool Use Visualization**: Beautifully formatted blocks for tool calls (Bash, Search, etc.) showing exactly what parameters were used.
- **🔍 Real-time Search**: Instant client-side filtering across user prompts, assistant answers, and even internal thinking processes.
- **💎 Premium UI/UX**:
  - **Glassmorphism Design**: Sleek, transculent backgrounds with smooth blurs.
  - **Dark Mode**: Optimized for high-contrast readability in dark environments.
  - **Fluid Animations**: Smooth transitions and layouts.
  - **Custom Scrollbar**: Seamlessly integrated dark-themed scrollbars.

---

## 🛠️ Tech Stack

- **Framework**: Electron (Main/Renderer Architecture)
- **Frontend**: React.js (Vite-powered)
- **Styling**: Vanilla CSS with Modern Variables & Glassmorphism
- **Icons**: Lucide React
- **Markdown**: React Markdown + Remark GFM (GitHub Flavored Markdown)

---

## 🚀 Getting Started

### 1. Installation

Clone the repository and install dependencies:

```bash
npm install
```

### 2. Running the App

Start the development server (Vite + Electron):

```bash
npm start
```

> [!NOTE]
> The application runs on port **5188** to avoid conflicts with other development servers. If you encounter a "Port in use" error, ensure no other processes are hanging on that port.

---

## 📂 Usage

1. Launch the application.
2. Click the **"Open Log"** button in the header.
3. Select any `.jsonl` CJ log file (e.g., `CursorLog02.jsonl`).
4. Use the **Search Bar** to filter specific commands, concepts, or thinking blocks.
5. Click **"Thinking Process"** on any assistant message to see the AI's internal reasoning.

---

## 🔧 Troubleshooting

If the app fails to launch because of a "Port already in use" error on MacOS:

```bash
lsof -i :5188 | grep LISTEN | awk '{print $2}' | xargs kill -9
npm start
```

---

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

---
