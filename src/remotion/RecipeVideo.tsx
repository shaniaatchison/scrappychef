import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';
import '../index.css';

export interface RecipeVideoProps {
  title: string;
  ingredients: string[];
  instructions: string;
}

export const RecipeVideo: React.FC<RecipeVideoProps> = ({ title, ingredients, instructions }) => {
  const frame = useCurrentFrame();

  const titleOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: 'clamp',
  });

  const ingredientsStart = 40;
  const instructionsStart = 120;

  return (
    <AbsoluteFill className="bg-[#7DA084] text-white p-10 font-sans">
      {/* Title */}
      <div 
        className="text-8xl font-bold mb-5"
        style={{ opacity: titleOpacity }}
      >
        {title}
      </div>

      {/* Ingredients */}
      {frame > ingredientsStart && (
        <div className="mb-5">
          <h2 className="text-5xl text-[#E8A856] font-bold mb-4">Ingredients:</h2>
          <ul className="text-4xl space-y-3">
            {ingredients.map((ing, i) => (
              <li key={i}>• {ing}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Instructions */}
      {frame > instructionsStart && (
        <div className="mt-5">
          <h2 className="text-4xl text-[#E8A856] font-bold mb-4">Instructions:</h2>
          <p className="text-3xl leading-relaxed">{instructions}</p>
        </div>
      )}
      
      {/* Branding */}
      <div className="absolute bottom-10 right-10 text-2xl opacity-70 italic">
        @ScrappyChefApp
      </div>
    </AbsoluteFill>
  );
};
