'use client'

import { Box, Button, Stack, TextField } from '@mui/material'
import { useState } from 'react'

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm the AI support assistant. How can I help you today?",
    },
  ])
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const logQuery = async (query) => {
    try {
      await fetch('/api/log-query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, timestamp: new Date().toISOString() }),
      });
    } catch (error) {
      console.error('Error logging query:', error);
    }
  };

  const express = require('express');
  const app = express();
  app.use(express.json());

  const queryLogs = [];
  const ratings = [];

  // Log Query Endpoint
  app.post('/api/log-query', (req, res) => {
    const { query, timestamp } = req.body;
    queryLogs.push({ query, timestamp });
    res.status(200).send({ success: true });
  });

  // Rate Response Endpoint
  app.post('/api/rate-response', (req, res) => {
    const { rating, messageIndex, timestamp } = req.body;
    ratings.push({ rating, messageIndex, timestamp });
    res.status(200).send({ success: true });
  });

  // Retrieve Analytics Data Endpoint
  app.get('/api/get-analytics', (req, res) => {
    res.status(200).json({
      queryLogs,
      ratings,
    });
  });

  app.listen(3000, () => console.log('Server running on port 3000'));


  const sendMessage = async () => {
    if (!message.trim()) return;  // Don't send empty messages

    setMessage('')
    setMessages((messages) => [
      ...messages,
      { role: 'user', content: message },
      { role: 'assistant', content: '' },
    ])

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([...messages, { role: 'user', content: message }]),
      })

      if (!response.ok) {
        throw new Error('Network response was not ok')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const text = decoder.decode(value, { stream: true })
        setMessages((messages) => {
          let lastMessage = messages[messages.length - 1]
          let otherMessages = messages.slice(0, messages.length - 1)
          return [
            ...otherMessages,
            { ...lastMessage, content: lastMessage.content + text },
          ]
        })
      }
    } catch (error) {
      console.error('Error:', error)
      setMessages((messages) => [
        ...messages,
        { role: 'assistant', content: "I'm sorry, but I encountered an error. Please try again later." },
      ])
    }
  }
  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      sendMessage()
    }
  }

  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }



  const rateResponse = async (rating, messageIndex) => {
    try {
      await fetch('/api/rate-response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rating, messageIndex, timestamp: new Date().toISOString() }),
      });
    } catch (error) {
      console.error('Error rating response:', error);
    }
  };

  useEffect(() => {
    scrollToBottom()
  }, [messages])
  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
    >
      <Stack
        direction={'column'}
        width="500px"
        height="700px"
        border="1px solid black"
        p={2}
        spacing={3}
      >
        <Stack
          direction={'column'}
          spacing={2}
          flexGrow={1}
          overflow="auto"
          maxHeight="100%"
        >
          {messages.map((message, index) => (
            <Box
              key={index}
              display="flex"
              justifyContent={
                message.role === 'assistant' ? 'flex-start' : 'flex-end'
              }
            >
              <Box
                bgcolor={
                  message.role === 'assistant'
                    ? 'primary.main'
                    : 'secondary.main'
                }
                color="white"
                borderRadius={16}
                p={3}
              >
                {message.content}
                {message.role === 'assistant' && (
                  <Stack direction="row" spacing={1} mt={1}>
                    <Button variant="outlined" size="small" onClick={() => rateResponse('helpful', index)}>Helpful</Button>
                    <Button variant="outlined" size="small" onClick={() => rateResponse('not helpful', index)}>Not Helpful</Button>
                  </Stack>)}
              </Box>
            </Box>
          ))}

        </Stack>
        <Stack direction={'row'} spacing={2}>
          <TextField
            label="Message"
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <Button variant="contained" onClick={sendMessage}>
            Send
          </Button>
        </Stack>
      </Stack>
    </Box>
  )
}