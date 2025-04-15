import React, { useState } from 'react';
import { Box, TextField, Button, Paper, Typography } from '@mui/material';
import axios from 'axios';
import Navbar from '../components/Navbar';

interface Msg { from: 'user' | 'bot'; text: string }

export default function ChatPage() {
  const [input, setInput] = useState('');
  const [msgs, setMsgs] = useState<Msg[]>([]);

  const send = async () => {
    if (!input.trim()) return;
    

    const myMsg: Msg = { from: 'user', text: input };

    setMsgs(prev => [...prev, myMsg]);   // ✅ now prev is Msg[] and the result is Msg[]
    setInput('');
    
    try {
      const res = await axios.post('http://localhost:8000/chat', { message: input }) as any;
      setMsgs(prev => [...prev, { from: 'bot', text: res.data.reply }]);
    } catch {
      setMsgs(prev => [...prev, { from: 'bot', text: '❌ Error contacting Tayb.ai' }]);
    }
    
  };

  return (
    <div>
      <Navbar />
      <Box sx={{ bg:'rgb(252,251,241)', minHeight:'100vh', p:3, pt:10, display:'flex', flexDirection:'column' }}>
        <Paper sx={{ flex:1, p:2, overflowY:'auto', mb:2 }}>
          {msgs.map((m,i) => (
            <Typography key={i} sx={{ textAlign: m.from==='user'?'right':'left', my:1 }}>
              <b>{m.from==='user'?'You':'Tayb.ai'}:</b> {m.text}
            </Typography>
          ))}
        </Paper>

        <Box sx={{ display:'flex', gap:1 }}>
          <TextField
            fullWidth size="small" placeholder="Ask Tayb.ai…"
            value={input} onChange={e=>setInput(e.target.value)}
            onKeyDown={e=>e.key==='Enter' && send()}
          />
          <Button variant="contained" onClick={send}>Send</Button>
        </Box>
      </Box>
    </div>
  );
}
