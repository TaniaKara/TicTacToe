import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) { 
    return (
    <button className="square" 
            onClick = {props.onClick}
            style = {props.highlight ? {background: 'rgb(239, 243, 2)'} : {background: '#fff'}}
    >
        {props.value}
    </button>
    );
  }
  
  class Board extends React.Component {
    renderSquare(i) {           
      return (
        <Square 
            value = {this.props.squares[i]} 
            onClick = {() => this.props.onClick(i)} 
            highlight = {this.props.squaresToHighlight.includes(i) ? true : false }
            key = {i}
        />);
    }

    renderBoard() {
        let board = [];           
        for(let i = 0; i < 3; i++) {
            let boardRow = []; 
            for(let j = 0; j < 3; j++){          
                boardRow.push(this.renderSquare(i * 3 + j));            
            }          
            board.push(<div className='board-row' key = {i}>{boardRow}</div>);        
        }
        return board;
    }
  
    render() {      
      return (
        <div>                      
          {this.renderBoard()}
        </div>
      );
    }
  }

  function GameHistoryMove(props) {
      return(
          <li>
              <button onClick = {props.onClick}>
                  {props.description}
              </button>
          </li>
      );
  }

  class GameHistory extends React.Component {   
    constructor(props)    {
        super(props);
        this.state = {
            sorted: 0, // 0 = ascending, 1 = descending
        };        
    }

    jumpTo(step) {
        this.props.jumpTo(step);
    }

    handleSort() {                
        this.setState({sorted: !this.state.sorted})
    }
  
    render() {
        const history = this.props.history;
        /*let sortedHistory = [];
        if(this.state.sorted === 0) {
            sortedHistory = history.slice(1).map((step) => step);
        } else {
            sortedHistory = history.slice(1).reverse();
        }
        console.log(sortedHistory);*/
        const moves = history.map((step, move) => {
            const column = step.squareClicked % 3 + 1;
            const row = Math.floor(step.squareClicked / 3) + 1; 
            const stepName = `Go to move #${move}: (${column}, ${row})`;
            const desc = move ? 
                move === this.props.stepNumber ? <b>{stepName}</b> : stepName
                : 'Go to game start';          
            return (
                <GameHistoryMove key = {move} description = {desc} onClick = {() => this.jumpTo(move)}/>                
            );
        });        

        return (
            <div>
                <button onClick = {() => this.handleSort()}>
                    {this.state.sorted ? `Sort descending` : `Sort ascending`}
                </button>
                <ol>{moves}</ol>
            </div>            
        );
    }
  }
  
  class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            history: [{
                squares: Array(9).fill(null),
                squareClicked: null,   
            }],
            stepNumber: 0,                     
            xIsNext: true,
        };
    }

    handleClick(i) {
        const history = this.state.history.slice(0, this.state.stepNumber + 1);
        const current = history[history.length - 1];
        const squares = current.squares.slice();
        if(calculateWinner(squares) || squares[i]) {
            return;
        }
        if(calculateDraw(squares)) {
            return;
        }
        squares[i] = this.state.xIsNext ? 'X' : 'O';
        this.setState({
            history: history.concat([{
                squares: squares,
                squareClicked: i,
            }]),
            stepNumber: history.length,           
            xIsNext: !this.state.xIsNext,
        });  
        this.jumpTo = this.jumpTo.bind(this);      
    }    

    jumpTo(step) {
        this.setState({
            stepNumber: step,
            xIsNext: (step % 2) === 0
          });
    }

    render() {
      const history = this.state.history;
      const current = history[this.state.stepNumber];
      const winner = calculateWinner(current.squares);
      const isDraw = calculateDraw(current.squares);
      
      let status;            
      if (winner) {
          status = 'Winner: ' + winner.winner;          
      } else if(isDraw){
          status = 'It is a DRAW';
      } else {
          status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
      }    

      return (
        <div className="game">
          <div className="game-board">
            <Board 
                squares = {current.squares} 
                squaresToHighlight = {winner ? winner.squaresToHighlight : []} 
                onClick = {(i) => this.handleClick(i)}/>
          </div>
          <div className="game-info">
            <div>{status}</div>
            <GameHistory 
                history = {this.state.history} 
                stepNumber = {this.state.stepNumber}
                jumpTo = {this.jumpTo}
                />            
          </div>
        </div>
      );
    }
  }
  
  // ========================================
  
  ReactDOM.render(
    <Game />,
    document.getElementById('root')
  );
  

  function calculateWinner(squares) {
      const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
      ];

      for(let i = 0; i < lines.length; i++){
          const [a,b,c] = lines[i];
          if(squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
              return {
                  winner: squares[a],
                  squaresToHighlight: lines[i],
                };
          }
      }
      return null;
  }

  function calculateDraw(squares) {
      if(!squares.includes(null)) {
          return true;
      } 
      return false;
  }