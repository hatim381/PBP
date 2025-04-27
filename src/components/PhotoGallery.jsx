import React from 'react';

const PhotoGallery = () => {
  const photos = [1, 2, 3, 4,5,6,7,8].map(num => `/images/Photo concours eid/${num}.jpg`);

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h2 className="text-2xl font-bold text-center mb-8">Photos du Concours</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {photos.map((photo, index) => (
          <div key={index} className="bg-white rounded-xl shadow-lg p-4 hover:shadow-xl transition-shadow">
            <img
              src={photo}
              alt={`Photo concours ${index + 1}`}
              className="w-full h-auto rounded-lg object-cover aspect-video"
              loading="lazy"
              onError={(e) => {
                console.error(`Erreur de chargement de l'image ${photo}`);
                e.target.style.display = 'none';
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default PhotoGallery;
