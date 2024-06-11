import { useEffect, useRef } from "react";
import './Room.css';

const ROTATE_SPEED = 0.25;
const SWAP_ANGLE = 90;

const Room = (props) => {
//   const { imageData } = props;
  const el = useRef(null);

  // requestAnimationFrame handler
  const animId = useRef(0);

  // Transition states variables
  let currentAngle = 0;
  let nextAngle = SWAP_ANGLE;
  let swapIndex = 0;
  let nextIndex = 4;

  useEffect(() => {
    // Reset current state angles
    currentAngle = 0;
    nextAngle = SWAP_ANGLE;

    // Construct wall items
    const walls = el.current.children;

    for (let i = 0; i < 1; i++) {
      const wall = walls[i];

      // Create wall item
      if (wall.children.length === 0) {
        const item = document.createElement('div');
        item.className = 'wall-item';
        wall.appendChild(item);
      }

      // Apply image background
    //   const item = wall.firstChild;
    //   item.style.backgroundImage = `url(${imageData[i]})`;
    }
  }, []);

  return (
    <div className="room">
      <div className="photo-room" ref={el}>
        <div className="room-wall back-wall"></div>
        <div className="room-wall right-wall"></div>
        <div className="room-wall front-wall"></div>
        <div className="room-wall left-wall"></div>
        <div className="room-wall top-wall"></div>
        <div className="room-wall bottom-wall"></div>
      </div>
    </div>
  );
};

export default Room;
