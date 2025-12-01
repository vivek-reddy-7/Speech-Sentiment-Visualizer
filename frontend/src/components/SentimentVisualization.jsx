import React from "react";
import { ReactP5Wrapper } from "@p5-wrapper/react";

function sketch(p5) {
  let sentimentScore = 0;
  const NUM_PARTICLES = 4000;      // increasing affects performance
  const particles = [];
  let noiseZ = 0;

  class Particle {
    constructor() {
      this.pos = p5.createVector(p5.random(p5.width), p5.random(p5.height));
      this.prev = this.pos.copy();
      this.age = 0; // track age to periodically reset
    }

    update(speed, noiseScale) {
      const n = p5.noise(
        this.pos.x * noiseScale,
        this.pos.y * noiseScale,
        noiseZ
      );

      // angle range to spread flow more
      const angle = n * p5.TWO_PI * 4.0;
      const v = p5.createVector(p5.cos(angle), p5.sin(angle));
      v.mult(speed);

      // Add slight random drift to prevent total convergence
      v.x += p5.random(-0.15, 0.15);
      v.y += p5.random(-0.15, 0.15);

      this.prev.set(this.pos);
      this.pos.add(v);
      this.age++;

      // Reset particles that get too old to prevent permanent clustering
      if (this.age > 5000) {
        this.pos.x = p5.random(p5.width);
        this.pos.y = p5.random(p5.height);
        this.prev.set(this.pos);
        this.age = 0;
      }

      this.wrap();
    }

    wrap() {
      // Instead of just checking bounds, smoothly wrap
      if (this.pos.x < 0) {
        this.pos.x = p5.width;
        this.prev.x = p5.width;
      }
      if (this.pos.x > p5.width) {
        this.pos.x = 0;
        this.prev.x = 0;
      }
      if (this.pos.y < 0) {
        this.pos.y = p5.height;
        this.prev.y = p5.height;
      }
      if (this.pos.y > p5.height) {
        this.pos.y = 0;
        this.prev.y = 0;
      }
    }

    show(r, g, b, alpha) {
      p5.stroke(r, g, b, alpha);
      p5.line(this.prev.x, this.prev.y, this.pos.x, this.pos.y);
    }
  }

  p5.updateWithProps = (props) => {
    if (props && typeof props.sentimentScore === "number") {
      sentimentScore = props.sentimentScore;
    }
  };

  p5.setup = () => {
    p5.createCanvas(window.innerWidth, window.innerHeight);
    p5.background(255);
    p5.strokeWeight(1.2);
    p5.noFill();

    for (let i = 0; i < NUM_PARTICLES; i++) {
      particles.push(new Particle());
    }
  };

  p5.windowResized = () => {
    p5.resizeCanvas(window.innerWidth, window.innerHeight);
  };

  p5.draw = () => {
    p5.noStroke();
    p5.fill(255, 255, 255, 18);
    p5.rect(0, 0, p5.width, p5.height);

    const absScore = Math.abs(sentimentScore);
    const speed = p5.lerp(0.6, 3.0, absScore);

    // Slightly higher base noise scale for more varied flow
    const noiseScale = p5.lerp(0.002, 0.007, absScore);
    noiseZ += 0.003 + absScore * 0.012;

    let r = 40,
      g = 40,
      b = 40;
    const alpha = 50; // slightly higher opacity

    if (sentimentScore > 0.25) {
      const intensity = 60 + ((sentimentScore - 0.25) / 0.75) * 180;
      g = intensity;
      r = 30;
      b = 30;
    } else if (sentimentScore < -0.25) {
      const intensity = 60 + ((-sentimentScore - 0.25) / 0.75) * 180;
      r = intensity;
      g = 30;
      b = 30;
    } else {
      const blueIntensity = 200 * (1 - absScore / 0.25);
      r = 30;
      g = 40;
      b = 80 + blueIntensity * 0.6;
    }

    for (const p of particles) {
      p.update(speed, noiseScale);
      p.show(r, g, b, alpha);
    }
  };
}

export default function SentimentVisualization(props) {
  return <ReactP5Wrapper sketch={sketch} {...props} />;
}
