import React, { useState, useEffect } from "react";

const images = [
  { src: "/search.png", alt: "Google", size: "w-7" },
  { src: "/abhislogo.png", alt: "Figma", size: "w-7" },
  { src: "/social.png", alt: "Indeed", size: "w-7" },
  { src: "/instagram.png", alt: "Microsoft", size: "w-7" },
  { src: "/HCL.png", alt: "HCL", size: "w-10" },
  { src: "/facesync.png", alt: "FaceSync", size: "w-7" },
  { src: "/figma.png", alt: "Figma", size: "w-7" },
  { src: "/infosys.png", alt: "Infosys", size: "w-10" },
  { src: "/microsoft.png", alt: "Microsoft", size: "w-7" },
];

// Throttling function to reduce event triggers
const throttle = (func, limit) => {
  let lastFunc;
  let lastRan;
  return function (...args) {
    if (!lastRan) {
      func.apply(this, args);
      lastRan = Date.now();
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(() => {
        if (Date.now() - lastRan >= limit) {
          func.apply(this, args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  };
};

// Function to generate random positions, avoiding restricted areas
const getRandomPosition = (restrictedAreas) => {
  let top, left;

  do {
    top = Math.random() * 100; // 0% to 100% for top
    left = Math.random() * 100; // 0% to 100% for left
  } while (isInRestrictedArea(top, left, restrictedAreas));

  return { top, left };
};

// Function to check if the generated position is in a restricted area
const isInRestrictedArea = (top, left, areas) => {
  return areas.some(({ top: areaTop, left: areaLeft, width, height }) => {
    return (
      top >= areaTop && top <= areaTop + height &&
      left >= areaLeft && left <= areaLeft + width
    );
  });
};

// Function to check if the new image is too close to others
const isTooClose = (newPos, existingPos, minDistance = 15) => {
  return existingPos.some((pos) => {
    const distance = Math.sqrt(
      Math.pow(newPos.top - pos.top, 2) + Math.pow(newPos.left - pos.left, 2)
    );
    return distance < minDistance;
  });
};

const RandomImageGrid = ({
  showPosition = false,
  restrictedAreas = [
  { top: 20, left: 20, width: 60, height: 50 },
  { top: 47, left: 22, width: 55, height: 20 },
  { top: 65, left: 40, width: 20, height: 20 },
]
}) => {

  const [positions, setPositions] = useState([]);

  useEffect(() => {
    const newPositions = [];

    images.forEach(() => {
      let newPos;
      // Keep generating a new position until it's not too close to others
      do {
        newPos = getRandomPosition(restrictedAreas);
      } while (isTooClose(newPos, newPositions));
      newPositions.push(newPos);
    });

    setPositions(newPositions);
  }, []);

  useEffect(() => {
    const handleMouseMove = throttle((e) => {
      const elements = document.querySelectorAll(".parallax");
      const moveFactor = 60;
      const rotateFactor = 1;

      elements.forEach((element) => {
        const rect = element.getBoundingClientRect();
        const elementCenterX = rect.left + rect.width / 2;
        const elementCenterY = rect.top + rect.height / 2;

        const offsetX = (e.clientX - elementCenterX) / moveFactor;
        const offsetY = (e.clientY - elementCenterY) / moveFactor;
        const rotateX = ((e.clientY - elementCenterY) / element.offsetHeight) * rotateFactor;
        const rotateY = ((e.clientX - elementCenterX) / element.offsetWidth) * rotateFactor;

        requestAnimationFrame(() => {
          element.style.transform = `translate(${offsetX}px, ${offsetY}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });
      });
    }, 50); // Throttling the event to run every 50ms

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div className="relative w-full h-full">
      {/* Draw restricted areas */}
      {showPosition&&restrictedAreas.map((area, index) => (
        <div
          key={index}
          style={{
            position: "absolute",
            top: `${area.top}%`,
            left: `${area.left}%`,
            width: `${area.width}%`,
            height: `${area.height}%`,
            backgroundColor: "rgba(255, 0, 0, 0.5)",
            border: "2px dashed red",
          }}
        />
      ))}
      {images.map((image, index) => {
        const positionStyle = {
          top: `${positions[index]?.top}%`,
          left: `${positions[index]?.left}%`,
        };
        return (
          <img
            key={index}
            src={image.src}
            alt={image.alt}
            className={`${image.size} parallax absolute`}
            style={positionStyle}
            loading="lazy"  // Lazy loading
          />
        );
      })}
    </div>
  );
};

export default RandomImageGrid;
