import React, { useRef, useEffect, useState } from 'react';
import './Board.css';

const Board = ({ socket }) => {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [tool, setTool] = useState('pen');
  const [color, setColor] = useState('#000000');
  const [text, setText] = useState('');
  const [rectStart, setRectStart] = useState({ x: 0, y: 0 });

  const drawText = (x, y, text, textColor) => {
    contextRef.current.font = '18px Arial';
    contextRef.current.fillStyle = textColor;
    contextRef.current.fillText(text, x, y);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = 1900;
    canvas.height = 760;
    const context = canvas.getContext('2d');
    contextRef.current = context;

    socket.emit('getDrawHistory');

    socket.on('drawHistory', (drawings) => {
      drawings.forEach((data) => {
        const { offsetX, offsetY, tool, color, text } = data;
        switch (tool) {
          case 'pen':
            drawPen(offsetX, offsetY, color);
            break;
          case 'rectangle':
            drawRectangle(offsetX, offsetY, color);
            break;
          case 'circle':
            drawCircle(offsetX, offsetY, color);
            break;
          case 'eraser':
            erase(offsetX, offsetY);
            break;
          case 'text':
            drawText(offsetX, offsetY, text, color);
            break;
          default:
            break;
        }
      });
    });

    socket.on('draw', (data) => {
      const { offsetX, offsetY, tool, color, text } = data;
      switch (tool) {
        case 'pen':
          drawPen(offsetX, offsetY, color);
          break;
        case 'rectangle':
          drawRectangle(offsetX, offsetY, color);
          break;
        case 'circle':
          drawCircle(offsetX, offsetY, color);
          break;
        case 'eraser':
          erase(offsetX, offsetY);
          break;
        case 'text':
          drawText(offsetX, offsetY, text, color);
          break;
        default:
          break;
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [socket]);

  const startDrawing = ({ nativeEvent }) => {
    const { offsetX, offsetY } = nativeEvent;
    setDrawing(true);

    switch (tool) {
      case 'text':
        setTextPrompt(offsetX, offsetY);
        break;
      case 'rectangle':
        setRectStart({ x: offsetX, y: offsetY });
        break;
      default:
        contextRef.current.beginPath();
        contextRef.current.moveTo(offsetX, offsetY);
        break;
    }
  };

  const draw = ({ nativeEvent }) => {
    if (!drawing) return;
    const { offsetX, offsetY } = nativeEvent;

    switch (tool) {
      case 'pen':
        drawPen(offsetX, offsetY);
        break;
      case 'rectangle':
        drawRectangle(offsetX, offsetY);
        break;
      case 'circle':
        drawCircle(offsetX, offsetY);
        break;
      case 'eraser':
        erase(offsetX, offsetY);
        break;
      default:
        break;
    }

    socket.emit('draw', { offsetX, offsetY, tool, color, text });
  };

  const drawPen = (x, y) => {
    contextRef.current.lineJoin = 'round';
    contextRef.current.lineCap = 'round';
    contextRef.current.strokeStyle = color;
    contextRef.current.lineWidth = 2;
    contextRef.current.lineTo(x, y);
    contextRef.current.stroke();
  };

  const drawRectangle = (x, y) => {
    const width = x - rectStart.x;
    const height = y - rectStart.y;
    contextRef.current.clearRect(0, 0, window.innerWidth, window.innerHeight);
    contextRef.current.fillStyle = color;
    contextRef.current.fillRect(rectStart.x, rectStart.y, width, height);
  };

  const drawCircle = (x, y) => {
    const radius = Math.sqrt((x - rectStart.x) ** 2 + (y - rectStart.y) ** 2);
    contextRef.current.clearRect(0, 0, window.innerWidth, window.innerHeight);
    contextRef.current.beginPath();
    contextRef.current.arc(rectStart.x, rectStart.y, radius, 0, 2 * Math.PI);
    contextRef.current.fillStyle = color;
    contextRef.current.fill();
  };

  const erase = (x, y) => {
    contextRef.current.clearRect(x - 5, y - 5, 10, 10);
  };

  const setTextPrompt = (x, y) => {
    const userInput = window.prompt('Enter text:');
    if (userInput !== null) {
      setText(userInput);
      contextRef.current.font = '18px Arial';
      contextRef.current.fillStyle = color;
      contextRef.current.fillText(userInput, x, y);
    }
  };

  const finishDrawing = () => {
    setDrawing(false);
    setText('');
    setRectStart({ x: 0, y: 0 });
  };

  const exportToJPEG = () => {
    const canvas = canvasRef.current;
    const imageData = canvas.toDataURL('image/jpeg');
    const link = document.createElement('a');
    link.href = imageData;
    link.download = 'drawing.jpg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className='canvas-container'>
      <canvas ref={canvasRef} onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={finishDrawing} />
      <div className='tool-container'>
        <label>Tool:</label>
        <select value={tool} onChange={(e) => setTool(e.target.value)}>
          <option value='pen'>Pen</option>
          <option value='text'>Text</option>
          <option value='rectangle'>Rectangle</option>
          <option value='circle'>Circle</option>
          <option value='eraser'>Eraser</option>
        </select>
        <input type='color' value={color} onChange={(e) => setColor(e.target.value)} />
        <button onClick={exportToJPEG}>Export to JPEG</button>
      </div>
    </div>
  );
};

export default Board;


