import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import Board from './Components/Board';
import BoardList from './Components/BoardList';
import './App.css';

const App = () => {
  const [socket, setSocket] = useState(null);
  const [boards, setBoards] = useState([]);

  useEffect(() => {
    const newSocket = io('http://localhost:3000');
    setSocket(newSocket);

    newSocket.emit('getBoards');
    
    newSocket.on('boardList', (boardList) => {
      setBoards(boardList);
    });

    newSocket.on('drawHistory', (drawings) => {
      console.log('Received drawing history:', drawings);
    });

    return () => newSocket.disconnect();
  }, []);

  return (
    <div>
      <h1>Collaborative Drawing Board</h1>
      {socket && <Board socket={socket} />}
      <BoardList boards={boards} />
    </div>
  );
};

export default App;


