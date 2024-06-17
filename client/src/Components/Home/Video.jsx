import React from 'react';

const VideoEmbed = () => {
  return (
    <div className="home-video">
      <iframe
        src="https://player.vimeo.com/video/959562773?badge=0&autopause=0&player_id=0&app_id=58479"
        frameBorder="0"
        allow="autoplay; fullscreen; picture-in-picture; clipboard-write"
        title="KotGreener"
      ></iframe>
    </div>
  );
};

export default VideoEmbed;
