import React from 'react';
import { Composition } from 'remotion';
import { RecipeVideo } from './RecipeVideo';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="RecipeVideo"
        component={RecipeVideo as React.FC<any>}
        durationInFrames={300}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          title: 'Scrappy Stir-Fry',
          ingredients: ['2 cups wilted spinach', '1 cup stale bread cubes'],
          instructions: 'Toast bread cubes. Sauté spinach. Combine and enjoy!',
        }}
      />
    </>
  );
};
