import confetti from 'canvas-confetti';

export function fireGoalConfetti(): void {
  const duration = 1500;
  const end = Date.now() + duration;

  const frame = (): void => {
    confetti({
      particleCount: 4,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.7 },
      colors: ['#ffd166', '#ef476f', '#06d6a0', '#118ab2', '#9b5de5'],
    });
    confetti({
      particleCount: 4,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.7 },
      colors: ['#ffd166', '#ef476f', '#06d6a0', '#118ab2', '#9b5de5'],
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  };

  frame();
}

export function fireWinConfetti(): void {
  confetti({
    particleCount: 120,
    spread: 100,
    origin: { y: 0.6 },
    colors: ['#ffd166', '#ef476f', '#06d6a0', '#f72585', '#4cc9f0'],
  });
}
