import React, { useState } from 'react';
import { Calculator as CalculatorIcon, X, History } from 'lucide-react';

export default function Calculator({ onClose }) {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState(null);
  const [operation, setOperation] = useState(null);
  const [history, setHistory] = useState([]);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  const handleNumber = (num) => {
    if (waitingForOperand) {
      setDisplay(String(num));
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? String(num) : display + num);
    }
  };

  const handleDecimal = () => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
    } else if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const handleOperation = (nextOperation) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const result = calculate(previousValue, inputValue, operation);
      setDisplay(String(result));
      setPreviousValue(result);
      setHistory([...history, `${previousValue} ${operation} ${inputValue} = ${result}`]);
    }

    setWaitingForOperand(true);
    setOperation(nextOperation);
  };

  const calculate = (a, b, op) => {
    switch (op) {
      case '+': return a + b;
      case '-': return a - b;
      case '×': return a * b;
      case '÷': return b !== 0 ? a / b : 'Error';
      case '^': return Math.pow(a, b);
      case '%': return a % b;
      default: return b;
    }
  };

  const handleEquals = () => {
    if (!operation || previousValue === null) return;

    const inputValue = parseFloat(display);
    const result = calculate(previousValue, inputValue, operation);
    setDisplay(String(result));
    setHistory([...history, `${previousValue} ${operation} ${inputValue} = ${result}`]);
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(true);
  };

  const handleClear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  };

  const handleClearEntry = () => {
    setDisplay('0');
    setWaitingForOperand(false);
  };

  const handleToggleSign = () => {
    setDisplay(String(parseFloat(display) * -1));
  };

  const handlePercent = () => {
    setDisplay(String(parseFloat(display) / 100));
  };

  const handleSquareRoot = () => {
    const value = parseFloat(display);
    setDisplay(String(Math.sqrt(value)));
    setHistory([...history, `√${value} = ${Math.sqrt(value)}`]);
  };

  const handleSquare = () => {
    const value = parseFloat(display);
    setDisplay(String(value * value));
    setHistory([...history, `${value}² = ${value * value}`]);
  };

  const handleInverse = () => {
    const value = parseFloat(display);
    setDisplay(String(1 / value));
    setHistory([...history, `1/${value} = ${1 / value}`]);
  };

  const handleSin = () => {
    const value = parseFloat(display);
    setDisplay(String(Math.sin(value)));
    setHistory([...history, `sin(${value}) = ${Math.sin(value)}`]);
  };

  const handleCos = () => {
    const value = parseFloat(display);
    setDisplay(String(Math.cos(value)));
    setHistory([...history, `cos(${value}) = ${Math.cos(value)}`]);
  };

  const handleTan = () => {
    const value = parseFloat(display);
    setDisplay(String(Math.tan(value)));
    setHistory([...history, `tan(${value}) = ${Math.tan(value)}`]);
  };

  const handleLog = () => {
    const value = parseFloat(display);
    setDisplay(String(Math.log10(value)));
    setHistory([...history, `log(${value}) = ${Math.log10(value)}`]);
  };

  const handleLn = () => {
    const value = parseFloat(display);
    setDisplay(String(Math.log(value)));
    setHistory([...history, `ln(${value}) = ${Math.log(value)}`]);
  };

  const handlePi = () => {
    setDisplay(String(Math.PI));
  };

  const handleE = () => {
    setDisplay(String(Math.E));
  };

  const scientificButtons = [
    { label: 'sin', action: handleSin },
    { label: 'cos', action: handleCos },
    { label: 'tan', action: handleTan },
    { label: 'log', action: handleLog },
    { label: 'ln', action: handleLn },
    { label: '√', action: handleSquareRoot },
    { label: 'x²', action: handleSquare },
    { label: '1/x', action: handleInverse },
    { label: 'π', action: handlePi },
    { label: 'e', action: handleE },
  ];

  const basicButtons = [
    { label: '7', action: () => handleNumber(7) },
    { label: '8', action: () => handleNumber(8) },
    { label: '9', action: () => handleNumber(9) },
    { label: '÷', action: () => handleOperation('÷'), operator: true },
    { label: '4', action: () => handleNumber(4) },
    { label: '5', action: () => handleNumber(5) },
    { label: '6', action: () => handleNumber(6) },
    { label: '×', action: () => handleOperation('×'), operator: true },
    { label: '1', action: () => handleNumber(1) },
    { label: '2', action: () => handleNumber(2) },
    { label: '3', action: () => handleNumber(3) },
    { label: '-', action: () => handleOperation('-'), operator: true },
    { label: '0', action: () => handleNumber(0) },
    { label: '.', action: handleDecimal },
    { label: '±', action: handleToggleSign },
    { label: '+', action: () => handleOperation('+'), operator: true },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <CalculatorIcon className="w-5 h-5 text-violet-400" />
            <h2 className="text-white font-semibold">Scientific Calculator</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Display */}
        <div className="p-6 bg-gradient-to-br from-slate-800 to-slate-900">
          {history.length > 0 && (
            <div className="text-right text-slate-500 text-sm mb-2 h-6 overflow-hidden">
              {history[history.length - 1]}
            </div>
          )}
          <div className="text-right text-4xl font-bold text-white mb-2 overflow-x-auto">
            {display}
          </div>
          {operation && (
            <div className="text-right text-violet-400 text-sm">
              {previousValue} {operation}
            </div>
          )}
        </div>

        {/* Scientific Buttons */}
        <div className="p-4 grid grid-cols-5 gap-2 bg-slate-800/50">
          {scientificButtons.map((btn) => (
            <button
              key={btn.label}
              onClick={btn.action}
              className="p-3 rounded-xl bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 font-medium transition-all hover:scale-105"
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* Basic Buttons */}
        <div className="p-4 grid grid-cols-4 gap-2">
          {basicButtons.map((btn) => (
            <button
              key={btn.label}
              onClick={btn.action}
              className={`p-4 rounded-xl font-semibold text-lg transition-all hover:scale-105 ${
                btn.operator
                  ? 'bg-violet-600 hover:bg-violet-700 text-white'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* Function Buttons */}
        <div className="p-4 grid grid-cols-4 gap-2 bg-slate-800/50">
          <button
            onClick={handleClear}
            className="p-3 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-400 font-medium transition-all"
          >
            C
          </button>
          <button
            onClick={handleClearEntry}
            className="p-3 rounded-xl bg-orange-600/20 hover:bg-orange-600/30 text-orange-400 font-medium transition-all"
          >
            CE
          </button>
          <button
            onClick={handlePercent}
            className="p-3 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 font-medium transition-all"
          >
            %
          </button>
          <button
            onClick={handleEquals}
            className="p-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-lg transition-all"
          >
            =
          </button>
        </div>

        {/* History Toggle */}
        {history.length > 0 && (
          <div className="p-4 border-t border-white/10">
            <button
              onClick={() => setHistory([])}
              className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
            >
              <History className="w-4 h-4" />
              Clear History
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
