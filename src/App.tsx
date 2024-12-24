import { useState } from 'react';

const App = () => {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [trustImage, setTrustImage] = useState('/images/trust-5.png'); // Start with trust level 5 image

  const trustLevels = [
    { range: [1, 3], image: '/images/trust-1-3.png' },
    { range: [5, 5], image: '/images/trust-5.png' },
    { range: [7, 8], image: '/images/trust-7-8.png' },
    { range: [9, 10], image: '/images/trust-9-10.png' },
  ];

  const detectTrustLevel = (content: string) => {
    const match = content.match(/nivel de confianza: (\d+)/i);
    if (match) {
      const trust = parseInt(match[1], 10);
      const trustLevel = trustLevels.find((level) =>
        level.range.includes(trust)
      );
      if (trustLevel) {
        setTrustImage(trustLevel.image); // Update the image
      }
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);

    // Send message to serverless function
    try {
      const res = await fetch('/.netlify/functions/sendMessage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });

      if (!res.ok) throw new Error('Server error');

      const data = await res.json();
      const assistantMessage = { role: 'assistant', content: data.response };
      setMessages((prev) => [...prev, assistantMessage]);

      // Detect trust level and update the image
      detectTrustLevel(data.response);
    } catch (error) {
      console.error('Error:', error);
    }

    setInput(''); // Clear input
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6">Vampire Persuasion Game</h1>
      <div className="w-full max-w-md space-y-4">
        <img
          src={trustImage}
          alt="Trust level visualization"
          className="w-full rounded shadow-md mb-4"
        />
        <div className="border rounded p-4 bg-white shadow-md max-h-64 overflow-y-auto">
          {messages.map((msg, idx) => (
            <div key={idx} className={`mb-2 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
              <p className={`p-2 rounded ${msg.role === 'user' ? 'bg-blue-100' : 'bg-gray-200'}`}>
                {msg.content}
              </p>
            </div>
          ))}
        </div>
        <div className="flex">
          <input
            type="text"
            className="flex-grow p-2 border rounded-l"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            className="p-2 bg-blue-500 text-white rounded-r"
            onClick={sendMessage}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
