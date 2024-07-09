import React, { useState, useEffect } from 'react';
import './App.css';
import logoImage from './assets/logo.png';
import Confetti from 'react-confetti';
import axios from 'axios';

function Exercise({ exercise, onDelete, isActive, showDeleteButton, showGif }) {
  return (
    <li className={`exercise-item ${isActive ? 'active' : ''}`}>
      <span>{exercise.name} - {exercise.duration} seconds</span>
      {showDeleteButton && <button className="delete-btn" onClick={onDelete}>Delete</button>}
      {showGif && exercise.gifUrl && (
        <img src={exercise.gifUrl} alt={`${exercise.name} form`} className="exercise-gif" />
      )}
    </li>
  );
}

function CongratulationsPopup({ onClose }) {
  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <h2>Congratulations!</h2>
        <p>You completed your workout!</p>
        <button className="close-btn" onClick={onClose}>Close</button>
      </div>
      <Confetti />
    </div>
  );
}

function WorkoutGenerator({ onGenerate, onCancel }) {
  const [muscle, setMuscle] = useState('');
  const [duration, setDuration] = useState(10);
  const [intensity, setIntensity] = useState('medium');

  const handleSubmit = (e) => {
    e.preventDefault();
    onGenerate(muscle, duration, intensity);
  };

  return (
    <form onSubmit={handleSubmit} className="workout-generator">
      <h2>Generate Custom Workout</h2>
      <div>
        <label htmlFor="muscle">Muscle/Body Part:</label>
        <select
          id="muscle"
          value={muscle}
          onChange={(e) => setMuscle(e.target.value)}
          required
        >
          <option value="">Select muscle</option>
          <option value="chest">Chest</option>
          <option value="back">Back</option>
          <option value="legs">Legs</option>
          <option value="arms">Arms</option>
          <option value="core">Core</option>
          <option value="fullBody">Full Body</option>
        </select>
      </div>
      <div>
        <label htmlFor="duration">Workout Duration (minutes):</label>
        <select
          id="duration"
          value={duration}
          onChange={(e) => setDuration(parseInt(e.target.value))}
          required
        >
          <option value="10">10 minutes</option>
          <option value="20">20 minutes</option>
          <option value="30">30 minutes</option>
          <option value="40">40 minutes</option>
          <option value="50">50 minutes</option>
          <option value="60">60 minutes</option>
        </select>
      </div>
      <div>
        <label htmlFor="intensity">Workout Intensity:</label>
        <select
          className='dropdown'
          id="intensity"
          value={intensity}
          onChange={(e) => setIntensity(e.target.value)}
          required
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>
      <div className="action-buttons">
        <button className="generate2-btn" type="submit">Generate Workout</button>
        <button className="cancel-btn" type="button" onClick={onCancel}>Cancel</button>
      </div>
    </form>
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
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [showGifs, setShowGifs] = useState(false);
  const [currentExerciseGif, setCurrentExerciseGif] = useState(null);
  const [showWorkoutGenerator, setShowWorkoutGenerator] = useState(false);

  const TENOR_API_KEY = process.env.REACT_APP_TENOR_API_KEY;

  const searchGif = async (exerciseName) => {
    try {
      const response = await axios.get('https://tenor.googleapis.com/v2/search?', {
        params: {
          q: `${exerciseName} exercise`,
          key: TENOR_API_KEY,
          limit: 1
        }
      });

      if (response.data.results && response.data.results.length > 0) {
        return response.data.results[0].media_formats.gif.url;
      }
      return null;
    } catch (error) {
      console.error('Error fetching GIF:', error);
      return null;
    }
  };

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
              return exercises[nextIndex].duration;
            } else {
              stopWorkout();
              setShowCongratulations(true);
              return 0;
            }
          }
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isWorkoutRunning, currentExerciseIndex, exercises]);

  useEffect(() => {
    if (isWorkoutRunning && exercises[currentExerciseIndex]) {
      speakExercise(exercises[currentExerciseIndex]);
      if (showGifs) {
        loadExerciseGif(exercises[currentExerciseIndex].name);
      }
    } else {
      setCurrentExerciseGif(null);
    }
  }, [currentExerciseIndex, isWorkoutRunning, exercises, showGifs]);

  const loadExerciseGif = async (exerciseName) => {
    try {
      const gifUrl = await searchGif(exerciseName);
      setCurrentExerciseGif(gifUrl);
    } catch (error) {
      console.error('Error loading exercise GIF:', error);
      setCurrentExerciseGif(null);
    }
  };

  const addExercise = () => {
    if (exerciseName && exerciseDuration) {
      setExercises([...exercises, { name: exerciseName, duration: parseInt(exerciseDuration) }]);
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

  const generateCustomWorkout = (muscle, duration, intensity) => {
    const exerciseDatabase = {
      chest: ['Pushups', 'Chest Press', 'Chest Flyes', 'Incline Pushups'],
      back: ['Pullups', 'Rows', 'Lat Pulldowns', 'Superman'],
      legs: ['Squats', 'Lunges', 'Leg Press', 'Calf Raises'],
      arms: ['Bicep Curls', 'Tricep Extensions', 'Hammer Curls', 'Dips'],
      core: ['Planks', 'Crunches', 'Russian Twists', 'Leg Raises'],
      fullBody: ['Burpees', 'Mountain Climbers', 'Jumping Jacks', 'High Knees']
    };

    const restTimes = {
      low: 25,
      medium: 15,
      high: 5
    };

    const exercises = exerciseDatabase[muscle];
    const totalDurationInSeconds = duration * 60;
    const restTime = restTimes[intensity];
    const generatedWorkout = [];

    let remainingTime = totalDurationInSeconds;
    let exerciseIndex = 0;

    while (remainingTime > 0) {
      const exercise = exercises[exerciseIndex % exercises.length];
      const exerciseDuration = Math.min(60, remainingTime - restTime);

      if (exerciseDuration > 0) {
        generatedWorkout.push({ name: exercise, duration: exerciseDuration });
        remainingTime -= exerciseDuration;

        if (remainingTime >= restTime) {
          generatedWorkout.push({ name: 'Rest', duration: restTime });
          remainingTime -= restTime;
        }
      }

      exerciseIndex++;
    }

    setExercises(generatedWorkout);
    setShowWorkoutGenerator(false);
    setIsEditing(false);
  };

  const startWorkout = async () => {
    if (exercises.length === 0) return;
    
    if (showGifs) {
      const exercisesWithGifs = await Promise.all(
        exercises.map(async (exercise) => ({
          ...exercise,
          gifUrl: exercise.name !== 'Rest' ? await searchGif(exercise.name) : null
        }))
      );
      setExercises(exercisesWithGifs);
    }
    
    setIsWorkoutRunning(true);
    setCurrentExerciseIndex(0);
    setRemainingTime(exercises[0].duration);
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

  const closeCongratulations = () => {
    setShowCongratulations(false);
    setIsEditing(true);
  };

  return (
    <div className="App">
      <img src={logoImage} alt="Logo" className="logo" />
      {isEditing && !showWorkoutGenerator && (
        <div className="action-buttons">
          <button className="generate-btn" onClick={() => setShowWorkoutGenerator(true)}>Generate Custom Workout</button>
        </div>
      )}
      {showWorkoutGenerator && (
        <WorkoutGenerator
          onGenerate={generateCustomWorkout}
          onCancel={() => setShowWorkoutGenerator(false)}
        />
      )}
      {isEditing && !showWorkoutGenerator && (
        <div className="input-container">
          <input
            type="text"
            value={exerciseName}
            onChange={(e) => setExerciseName(e.target.value)}
            placeholder="Enter Exercise Name"
            className="exercise-input"
          />
          <div className="duration-input-container">
            <input
              type="number"
              value={exerciseDuration}
              onChange={(e) => setExerciseDuration(e.target.value)}
              min="10"
              max="600"
              className="duration-input"
            />
            <span className="duration-label">s</span>
          </div>
          <button className="add-btn" onClick={addExercise}>Add Exercise</button>
          <div className="gif-toggle">
            <label>
              <input
                type="checkbox"
                checked={showGifs}
                onChange={() => setShowGifs(!showGifs)}
              />
              <span className="slider round"></span>
              Show Exercise Gif <br/>
            </label>
          </div>
        </div>
      )}
      <ul className="exercise-list">
        {exercises.map((exercise, index) => (
          <Exercise
            key={index}
            exercise={exercise}
            onDelete={() => deleteExercise(index)}
            isActive={isWorkoutRunning && index === currentExerciseIndex}
            showDeleteButton={!isWorkoutRunning}
            showGif={showGifs && exercise.name !== 'Rest'}
          />
        ))}
      </ul>
      <div className="action-buttons">
        {!isEditing ? (
          isWorkoutRunning ? (
            <button className="stop-btn" onClick={stopWorkout}>Stop Workout</button>
          ) : (
            <button className="start-btn" onClick={startWorkout}>Start Workout</button>
          )
        ) : (
          <button className="save-btn" onClick={saveExercises}>Save Workout</button>
        )}
      </div>
      {isWorkoutRunning && (
        <React.Fragment>
          <div className="timer">{formatTime(remainingTime)}</div>
          {currentExerciseGif && <img src={currentExerciseGif} alt="Exercise GIF" className="exercise-gif" />}
        </React.Fragment>
      )}
      {showCongratulations && <CongratulationsPopup onClose={closeCongratulations} />}
    </div>
  );
}

export default App;