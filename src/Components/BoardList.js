import React from 'react';

const BoardList = ({ boards }) => {
  return (
    <div>
      <h2>Board List</h2>
      <ul>
        {boards.map((board) => (
          <li key={board.id}>
            <img src={board.thumbnail} alt={`Board ${board.id}`} />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BoardList;
