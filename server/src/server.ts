import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Simple response generation
const generateResponse = (message: string): string => {
  const responses = [
    "I understand you're saying: " + message,
    "That's interesting! Tell me more about: " + message,
    "I'm processing your message: " + message,
    "Here's what I think about: " + message
  ];
  return responses[Math.floor(Math.random() * responses.length)];
};

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('user-message', (message: string) => {
    console.log('Received message:', message);
    
    // Simulate processing time
    setTimeout(() => {
      const response = generateResponse(message);
      socket.emit('bot-response', response);
    }, 1000);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 