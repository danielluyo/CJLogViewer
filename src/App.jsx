import React, { useState, useEffect, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Search, FolderOpen, Terminal, Sparkles, Brain, Wrench, ChevronDown, ChevronRight } from 'lucide-react';
import './index.css';

const ThinkingBlock = ({ content }) => {
  const [isOpen, setIsOpen] = useState(false);
  if (!content) return null;
  return (
    <div className="thinking-container">
      <button className="thinking-header" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        <Brain size={14} />
        <span>Thinking Process</span>
      </button>
      {isOpen && <div className="thinking-content">{content}</div>}
    </div>
  );
};

const ToolBlock = ({ tool }) => {
  if (!tool) return null;
  return (
    <div className="tool-container">
      <div className="tool-header">
        <Wrench size={14} />
        <span>Tool Use: {tool.name}</span>
      </div>
      <div className="tool-input">
        <pre><code>{JSON.stringify(tool.input, null, 2)}</code></pre>
      </div>
    </div>
  );
};

function App() {
  const [logs, setLogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [filePath, setFilePath] = useState('');

  const parseLogFile = (content) => {
    const lines = content.split('\n').filter(line => line.trim());
    const groupedData = {}; // requestId -> entries

    lines.forEach(line => {
      try {
        const data = JSON.parse(line);
        let requestId = data.requestId || (data.data?.message?.requestId) || data.uuid;

        if (!requestId) return;

        if (!groupedData[requestId]) {
          groupedData[requestId] = {
            id: requestId,
            userContent: '',
            assistantText: [],
            thinkings: [],
            toolUses: [],
            timestamp: data.timestamp
          };
        }

        const group = groupedData[requestId];

        // Extract User Content
        if (data.type === 'user') {
          const content = typeof data.message?.content === 'string'
            ? data.message.content
            : Array.isArray(data.message?.content)
              ? data.message.content.map(c => c.text).filter(Boolean).join('\n')
              : '';
          group.userContent = content;
        }

        // Also check progress messages for more user content
        if (data.type === 'progress' && data.data?.message?.message?.role === 'user') {
          const content = data.data.message.message.content;
          const text = Array.isArray(content) ? content.map(c => c.text).join('\n') : content;
          if (text) group.userContent = text;
        }

        // Extract Assistant Content
        if (data.type === 'assistant') {
          const contents = Array.isArray(data.message?.content) ? data.message.content : [];
          contents.forEach(c => {
            if (c.type === 'text' && c.text.trim()) group.assistantText.push(c.text);
            if (c.type === 'thinking') group.thinkings.push(c.thinking);
            if (c.type === 'tool_use') group.toolUses.push(c);
          });
        }

        // Handle Legacy Format
        if (data.prompt && data.answer) {
          group.userContent = data.prompt;
          group.assistantText.push(data.answer);
        }

      } catch (e) {
        console.error('Failed to parse line', e);
      }
    });

    return Object.values(groupedData)
      .filter(g => g.userContent || g.assistantText.length > 0 || g.toolUses.length > 0)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  };

  const handleOpenFile = async () => {
    try {
      setLoading(true);
      const result = await window.electronAPI.openFile();
      if (result) {
        setFilePath(result.path);
        const parsedLogs = parseLogFile(result.content);
        setLogs(parsedLogs);
      }
    } catch (err) {
      console.error('Error opening file:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = useMemo(() => {
    if (!searchQuery) return logs;
    const query = searchQuery.toLowerCase();
    return logs.filter(log => {
      const textToSearch = [
        log.userContent,
        log.assistantText.join(' '),
        log.thinkings.join(' '),
        log.toolUses.map(t => t.name).join(' ')
      ].join(' ').toLowerCase();
      return textToSearch.includes(query);
    });
  }, [logs, searchQuery]);

  return (
    <div className="app-container">
      <header className="header">
        <div className="header-title">CJLogViewer</div>
        <div className="controls">
          <button className="btn" onClick={handleOpenFile} disabled={loading}>
            <FolderOpen size={16} />
            {loading ? 'Opening...' : 'Open Log'}
          </button>
        </div>
      </header>

      <div className="search-container">
        <div className="search-wrapper">
          <Search size={18} className="search-icon" />
          <input
            className="search-input"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>


      <div className="log-list">
        {filteredLogs.length > 0 ? (
          filteredLogs.map((log) => (
            <div key={log.id} className="chat-entry">
              {log.userContent && (
                <div className="chat-prompt">
                  <div className="prompt-label"><Terminal size={12} /> User</div>
                  <div className="markdown-content">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{log.userContent}</ReactMarkdown>
                  </div>
                </div>
              )}

              {(log.assistantText.length > 0 || log.thinkings.length > 0 || log.toolUses.length > 0) && (
                <div className="chat-answer">
                  <div className="answer-label"><Sparkles size={12} /> Assistant</div>
                  {log.thinkings.map((t, idx) => <ThinkingBlock key={idx} content={t} />)}
                  {log.toolUses.map((t, idx) => <ToolBlock key={idx} tool={t} />)}
                  {log.assistantText.map((t, idx) => (
                    <div key={idx} className="markdown-content" style={{ marginBottom: idx < log.assistantText.length - 1 ? '16px' : 0 }}>
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{t}</ReactMarkdown>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="empty-state">
            <Search size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
            {logs.length === 0 ? 'Pick a .jsonl log file to begin.' : 'No matches found.'}
          </div>
        )}
      </div>

      {filePath && (
        <div className="footer-info">
          Viewing: {filePath} • {logs.length} Conversations
        </div>
      )}
    </div>
  );
}

export default App;
