import React, { useState, useEffect } from 'react';
import './App.css';

function Exercise({ exercise, onDelete, isActive }) {
  return (
    <li className={isActive ? 'active' : ''}>
      {exercise.name} - {exercise.duration} seconds
      <button onClick={onDelete}>Delete</button>
    </li>
  );
}

function App() {
  const [exercises, setExercises] = useState([]);
  const [exerciseName, setExerciseName] = useState('');
  const [exerciseDuration, setExerciseDuration] = useState(60);
  const [isEditing, setIsEditing] = useState(true);
  const [isWorkoutRunning, setIsWorkoutRunning] = useState(false);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [remainingTime, setRemainingTime] = useState(0);

  useEffect(() => {
    let interval;
    if (isWorkoutRunning) {
      interval = setInterval(() => {
        setRemainingTime((prevTime) => {
          if (prevTime > 0) {
            return prevTime - 1;
          } else {
            const nextIndex = currentExerciseIndex + 1;
            if (nextIndex < exercises.length) {
              setCurrentExerciseIndex(nextIndex);
              speakExercise(exercises[nextIndex]);
              return exercises[nextIndex].duration;
            } else {
              stopWorkout();
              alert('Congratulations! You completed your workout!');
              return 0;
            }
          }
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isWorkoutRunning, currentExerciseIndex, exercises]);

  const addExercise = () => {
    if (exerciseName && exerciseDuration) {
      setExercises([...exercises, { name: exerciseName, duration: exerciseDuration }]);
      setExerciseName('');
      setExerciseDuration(60);
    }
  };

  const deleteExercise = (index) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const saveExercises = () => {
    setIsEditing(false);
  };

  const startWorkout = () => {
    if (exercises.length === 0) return;
    setIsWorkoutRunning(true);
    setCurrentExerciseIndex(0);
    setRemainingTime(exercises[0].duration);
    speakExercise(exercises[0]);
  };

  const stopWorkout = () => {
    setIsWorkoutRunning(false);
    setCurrentExerciseIndex(0);
    setRemainingTime(0);
  };

  const speakExercise = (exercise) => {
    const utterance = new SpeechSynthesisUtterance(`${exercise.name} for ${exercise.duration} seconds`);
    speechSynthesis.speak(utterance);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="App">
      <h1>💪 MyTrainer</h1>
      {isEditing && (
        <div>
          <input
            type="text"
            value={exerciseName}
            onChange={(e) => setExerciseName(e.target.value)}
            placeholder="Enter Exercise Name"
          />
          <input
            type="number"
            value={exerciseDuration}
            onChange={(e) => setExerciseDuration(parseInt(e.target.value))}
            min="10"
            max="600"
          />
          <button onClick={addExercise}>Add Exercise</button>
        </div>
      )}
      <ul>
        {exercises.map((exercise, index) => (
          <Exercise
            key={index}
            exercise={exercise}
            onDelete={() => deleteExercise(index)}
            isActive={isWorkoutRunning && index === currentExerciseIndex}
          />
        ))}
      </ul>
      {!isEditing ? (
        isWorkoutRunning ? (
          <button onClick={stopWorkout}>Stop Workout</button>
        ) : (
          <button onClick={startWorkout}>Start Workout</button>
        )
      ) : (
        <button onClick={saveExercises}>Save</button>
      )}
      {isWorkoutRunning && <div className="timer">{formatTime(remainingTime)}</div>}
    </div>
  );
}

export default App;