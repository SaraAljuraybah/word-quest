import { motion } from "framer-motion";
import { GameTile } from "./GameTile";

export function GameBoard({ rows, shakeRowId, status, wordLength = 5 }) {
  const isSuccess = status === "won";
  const maxWidth = wordLength === 3 ? "252px" : wordLength === 4 ? "304px" : "356px";

  return (
    <motion.div
      animate={isSuccess ? { scale: [1, 1.025, 1] } : { scale: 1 }}
      transition={{ duration: 0.6 }}
      className="game-board mx-auto grid w-full gap-1.5 sm:gap-3"
      data-word-length={wordLength}
      style={{ maxWidth: `min(100%, ${maxWidth})` }}
    >
      {rows.map((row) => (
        <motion.div
          key={row.id}
          animate={shakeRowId === row.id ? { x: [0, -10, 10, -8, 8, 0] } : { x: 0 }}
          transition={{ duration: 0.45 }}
          className="game-board-row grid gap-1.5 sm:gap-3"
          style={{ gridTemplateColumns: `repeat(${wordLength}, minmax(0, 1fr))` }}
        >
          {row.letters.map((tile) => (
            <GameTile key={`${row.id}-${tile.index}`} tile={tile} rowStatus={row.status} />
          ))}
        </motion.div>
      ))}
    </motion.div>
  );
}
