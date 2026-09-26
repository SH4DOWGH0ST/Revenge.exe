import React, { useEffect, useRef, useMemo } from 'react';

interface SkullMatrixProps {
  color?: 'red' | 'blue';
  stage?: 'streaming' | 'skull' | 'idle';
  isGlitching?: boolean;
}

const CLEAN_SKULL = `
                  uuuuuuu
              uu$$$$$$$$$$$uu
           uu$$$$$$$$$$$$$$$$$uu
          u$$$$$$$$$$$$$$$$$$$$$u
         u$$$$$$$$$$$$$$$$$$$$$$$u
        u$$$$$$"   "$$$"   "$$$$$$u
        "$$$$"      u$u       $$$$"
         $$$u       u$u       u$$$
         $$$u      u$$$u      u$$$
          "$$$$uu$$$   $$$uu$$$$"
           "$$$$$$$"   "$$$$$$$"
             u$$$$$$$u$$$$$$$u
              u$"$"$"$"$"$"$u
   uuu        $$u$ $ $ $ $u$$       uuu
  u$$$$        $$$$$u$u$u$$$       u$$$$
   $$$$$uu      "$$$$$$$$$"     uu$$$$$$
 u$$$$$$$$$$$uu    """""    uuuu$$$$$$$$$$
 $$$$" " $$$$$$$$$uuu   uu$$$$$$$$$   "$$$"
  """      ""$$$$$$$$$$$uu ""$"""
            uuuu ""$$$$$$$$$$uuu
   u$$$uuu$$$$$$$$$uu ""$$$$$$$$$$$uuu$$$
   $$$$$$$$$$""""           ""$$$$$$$$$$$"
    "$$$$$"                      ""$$$$""
      $$$"                         $$$$"
`;

const CODE_CHARS = '0123456789ABCDEF<>{}[]/\\$#@!%*+=~|;:_-N3VERF0RG3T_REVENGE.EXE_DESERTEAGLE_PAYLOAD';

export const SkullMatrix: React.FC<SkullMatrixProps> = ({
  color = 'red',
  stage = 'skull',
  isGlitching = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Skull mask from the original CLEAN_SKULL preserving line indentation
  const skullMask = useMemo(() => {
    const rawLines = CLEAN_SKULL.split('\n');
    const lines = rawLines.filter((l) => l.trim().length > 0);
    const height = lines.length;
    const width = Math.max(...lines.map((l) => l.length));
    const grid: boolean[][] = [];

    for (let y = 0; y < height; y++) {
      grid[y] = [];
      const line = lines[y] || '';
      for (let x = 0; x < width; x++) {
        const char = line[x] || ' ';
        grid[y][x] = char !== ' ' && char !== '"';
      }
    }
    return { grid, width, height };
  }, []);

  const colorStyles = useMemo(() => {
    if (color === 'blue') {
      return {
        text: 'text-cyan-400',
        skullColor: '#00e5ff',
        skullGlow: 'rgba(6, 182, 212, 0.95)',
      };
    }
    return {
      text: 'text-red-600',
      skullColor: '#ff2222',
      skullGlow: 'rgba(239, 68, 68, 0.95)',
    };
  }, [color]);

  // Horizontal matrix rain with original skull appearance
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const charSize = 13;
    const rows = Math.ceil(canvas.height / charSize);
    const cols = Math.ceil(canvas.width / charSize);

    interface StreamRow {
      offset: number;
      speed: number;
      chars: string[];
    }

    const streamRows: StreamRow[] = Array.from({ length: rows }, () => {
      const rowLen = cols + 40;
      const chars = Array.from({ length: rowLen }, () =>
        CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)],
      );
      return {
        offset: Math.random() * 200,
        speed: 1.5 + Math.random() * 3.5,
        chars,
      };
    });

    const draw = () => {
      ctx.fillStyle = 'rgba(2, 6, 8, 0.22)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `${charSize}px "Fira Code", monospace`;

      const skullStartX = Math.floor((cols - skullMask.width) / 2);
      const skullStartY = Math.floor((rows - skullMask.height) / 2) - 3;

      for (let r = 0; r < rows; r++) {
        const rowData = streamRows[r];
        rowData.offset = (rowData.offset + rowData.speed) % (cols * charSize);

        const y = r * charSize;

        for (let c = 0; c < cols; c++) {
          const charIndex = Math.floor((c * charSize + rowData.offset) / charSize) % rowData.chars.length;
          const char = rowData.chars[charIndex];
          const x = c * charSize;

          const skullX = c - skullStartX;
          const skullY = r - skullStartY;

          const isSkullPart =
            stage === 'skull' &&
            skullY >= 0 &&
            skullY < skullMask.height &&
            skullX >= 0 &&
            skullX < skullMask.width &&
            skullMask.grid[skullY][skullX];

          if (isSkullPart) {
            ctx.font = `bold ${charSize + 2}px "Fira Code", monospace`;
            ctx.fillStyle = colorStyles.skullColor;
            ctx.shadowColor = colorStyles.skullGlow;
            ctx.shadowBlur = 12;
            ctx.fillText(char, x, y);
            ctx.shadowBlur = 0;
            ctx.font = `${charSize}px "Fira Code", monospace`;
          } else {
            ctx.shadowBlur = 0;
            const isHead = (c * charSize + Math.floor(rowData.offset)) % 80 < charSize;
            if (isHead) {
              ctx.fillStyle = '#86efac';
            } else if (Math.random() > 0.92) {
              ctx.fillStyle = '#4ade80';
            } else {
              ctx.fillStyle = '#16a34a';
            }
            ctx.fillText(char, x, y);
          }
        }
      }

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animId);
    };
  }, [stage, skullMask, colorStyles]);

  return (
    <div className="absolute inset-0 w-full h-full bg-[#030706] overflow-hidden select-none pointer-events-none">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block mix-blend-screen" />
      <div className="absolute inset-0 scanlines-overlay pointer-events-none" />
      <div className="absolute inset-0 crt-bloom pointer-events-none" />
    </div>
  );
};
