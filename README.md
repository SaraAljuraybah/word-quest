# Word Quest

Word Quest is a Wordle-inspired web game built with React and Supabase.  
Players guess words, earn points, level up, and use their points to buy in-game boosts.

## Features

- User authentication with Supabase
- Word guessing game
- Points system
- Player profile
- Store for boosts
- Leaderboard
- Light and dark mode
- Responsive modern UI

## Tech Stack

- React
- Vite
- Supabase
- Tailwind CSS
- React Router

## Game Rules

- The player has 6 attempts to guess the correct 5-letter word.
- Green letters are correct and in the right position.
- Yellow letters are correct but in the wrong position.
- Gray letters are not in the word.

## Points System

| Attempt | Points |
|--------|--------|
| 1st attempt | 100 |
| 2nd attempt | 80 |
| 3rd attempt | 60 |
| 4th attempt | 40 |
| 5th attempt | 25 |
| 6th attempt | 10 |
| Lose | 0 |

## Store Items

| Item | Cost |
|------|------|
| Reveal Letter | 50 |
| Remove Wrong Letter | 40 |
| Extra Attempt | 80 |
| New Word | 120 |
| Custom Theme | 200 |

## Project Structure

```bash
src/
  components/
  pages/
  hooks/
  lib/
  data/
  styles/
