/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';

export default function App() {
  const [prompt, setPrompt] = useState('Why is the sky blue?');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTestProxy = async () => {
    setLoading(true);
    setError('');
    setResponse('');

    try {
      // We initialize the GoogleGenAI SDK but point it to our local proxy.
      // The proxy handles injecting the API key if we don't provide one.
      // Note: @google/genai SDK uses httpOptions.baseUrl to override the endpoint.
      const ai = new GoogleGenAI({ 
        apiKey: 'proxy-key', // The SDK requires an API key, but our proxy will override it with the real one
        httpOptions: {
          baseUrl: window.location.origin
        }
      });

      const res = await ai.models.generateContent({
        model: 'gemini-3.1-flash-preview',
        contents: prompt,
      });

      setResponse(res.text || 'No response text');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans text-slate-900">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <h1 className="text-2xl font-semibold mb-2">Gemini API Proxy (Vercel Ready)</h1>
        <p className="text-slate-500 mb-6">
          This app acts as a proxy for the Gemini API. It forwards requests from <code className="bg-slate-100 px-1 py-0.5 rounded">/v1beta/*</code> to the official Gemini API, automatically injecting your API key.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Test Prompt</label>
            <textarea
              className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow"
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>

          <button
            onClick={handleTestProxy}
            disabled={loading || !prompt.trim()}
            className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Generating...' : 'Test Proxy'}
          </button>

          {error && (
            <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-100">
              {error}
            </div>
          )}

          {response && (
            <div className="mt-6">
              <h2 className="text-sm font-medium text-slate-700 mb-2">Response:</h2>
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 whitespace-pre-wrap">
                {response}
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-8 pt-6 border-t border-slate-200">
          <h3 className="text-lg font-medium mb-3">How to deploy to Vercel</h3>
          <ol className="list-decimal list-inside space-y-2 text-slate-600 text-sm">
            <li>Push this repository to GitHub.</li>
            <li>Import the project in Vercel.</li>
            <li>Add <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800">GEMINI_API_KEY</code> to your Vercel Environment Variables.</li>
            <li>Deploy! Vercel will automatically use <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800">api/index.ts</code> as a serverless function.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

