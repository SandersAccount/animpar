import React, { useState } from 'react';

interface BackgroundRemoverProps {
  imageUrl: string;
  onRemoveBackground: (newImageUrl: string) => void;
}

const BackgroundRemover: React.FC<BackgroundRemoverProps> = ({ imageUrl, onRemoveBackground }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const removeBackground = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.src = imageUrl;

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Unable to get canvas context');
      }

      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Find the most common color (assuming it's the background)
      const colorCounts: { [key: string]: number } = {};
      let maxCount = 0;
      let backgroundColor = '';

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const color = `${r},${g},${b}`;

        colorCounts[color] = (colorCounts[color] || 0) + 1;
        if (colorCounts[color] > maxCount) {
          maxCount = colorCounts[color];
          backgroundColor = color;
        }
      }

      const [bgR, bgG, bgB] = backgroundColor.split(',').map(Number);

      // Remove background color
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // If the color is close to the background color, make it transparent
        if (
          Math.abs(r - bgR) < 30 &&
          Math.abs(g - bgG) < 30 &&
          Math.abs(b - bgB) < 30
        ) {
          data[i + 3] = 0; // Set alpha to 0
        }
      }

      ctx.putImageData(imageData, 0, 0);

      const newImageUrl = canvas.toDataURL('image/png');
      onRemoveBackground(newImageUrl);
      console.log('Background removal process completed');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Failed to remove background: ${errorMessage}`);
      console.error('Error in background removal process:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-2">
      <button
        onClick={removeBackground}
        disabled={isLoading}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
      >
        {isLoading ? 'Removing Background...' : 'Remove Background'}
      </button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
      {isLoading && <p className="text-blue-500 mt-2">Processing... This may take a few moments.</p>}
    </div>
  );
};

export default BackgroundRemover;