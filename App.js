
import React, { useState } from 'react';
import { Copy, Link, CheckCircle, XCircle } from 'lucide-react';
import './App.css';

const App = () => {
  const [longUrl, setLongUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copyMessage, setCopyMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setShortUrl('');

    try {
      const response = await fetch('http://localhost:5000/api/shorten', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ longUrl }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to shorten URL.');
      }

      const data = await response.json();
      setShortUrl(data.shortUrl);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    const fullUrl = `http://localhost:5000/${shortUrl}`;
    const tempInput = document.createElement('input');
    tempInput.value = fullUrl;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);
    
    setCopyMessage('Copied to clipboard!');
    setTimeout(() => setCopyMessage(''), 2000);
  };

  return (
    <div className="app-container">
      <div className="card">
        <div className="header">
          <Link size={56} className="header-icon" />
          <h1 className="header-title">URL Shortener</h1>
          <p className="header-subtitle">Paste a long URL to get a simple, shareable shortened link.</p>
        </div>

        <form onSubmit={handleSubmit} className="form-container">
          <div className="input-group">
            <input
              type="url"
              value={longUrl}
              onChange={(e) => setLongUrl(e.target.value)}
              placeholder="https://www.example.com/a-very-long-url"
              required
              className="form-input"
            />
            <div className="input-icon">
              <Link size={24} className="icon" />
            </div>
          </div>
          <div className="button-group">
            <button
              type="submit"
              className="button-primary"
              disabled={loading}
            >
              {loading ? (
                <div className="spinner"></div>
              ) : (
                'Shorten URL'
              )}
            </button>
          </div>
        </form>
        
        {shortUrl && (
          <div className="short-url-output">
            <div className="short-url-link-group">
              <span className="short-url-title">Your short link:</span>
              <a href={`http://localhost:5000/${shortUrl}`} target="_blank" rel="noopener noreferrer" className="short-url-link">
                {`http://localhost:5000/${shortUrl}`}
              </a>
            </div>
            <button
              onClick={copyToClipboard}
              className="copy-button"
            >
              <Copy size={16} className="copy-icon" /> Copy
            </button>
          </div>
        )}

        {copyMessage && (
            <div className="status-message success-message">
                <CheckCircle size={20} className="status-icon" /> {copyMessage}
            </div>
        )}
        {error && (
          <div className="status-message error-message">
            <XCircle size={20} className="status-icon" /> {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
