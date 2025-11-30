import React from "react";
import { ReactP5Wrapper } from "@p5-wrapper/react";

function sketch(p5) {
  let sentimentScore = 0;
  let t = 0;

  p5.updateWithProps = (props) => {
    if (typeof props.sentimentScore === "number") {
      sentimentScore = props.sentimentScore;
    }
  };

  p5.setup = () => {
    p5.createCanvas(window.innerWidth, window.innerHeight);
    p5.noiseDetail(4, 0.5);
  };

  p5.windowResized = () => {
    p5.resizeCanvas(window.innerWidth, window.innerHeight);
  };

  p5.draw = () => {
      const absScore = Math.abs(sentimentScore);
    if (absScore > 0.25) {
      p5.background(255, 75);
    } else {
      p5.background(0, 15);
    }

    const speed = 0.005 + absScore * 0.015;
    t += speed;

    const nx = p5.noise(t);
    const ny = p5.noise(t + 5);
    const x = p5.width * nx;
    const y = p5.height * ny;

    let r = 0, g = 0, b = 0;
    if (sentimentScore > 0.25) {
      g = 180
    } else if (sentimentScore < -0.25) {
      r = 180
    } else {
      const whiteIntensity = 255
      r = g = b = whiteIntensity;
    }

    p5.noStroke();
    p5.fill(r, g, b, 220);
    p5.ellipse(x, y, 120, 120);

    p5.fill(r * 0.4, g * 0.4, b * 0.4, 80);
    p5.ellipse(x, y, 160, 160);
  };
}


export default function SentimentVisualization(props) {
  return <ReactP5Wrapper sketch={sketch} {...props} />;
}
