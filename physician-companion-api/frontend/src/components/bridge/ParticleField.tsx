export function ParticleField() {
  const dots = Array.from({ length: 40 });
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
      {dots.map((_, i) => {
        const size = Math.random() * 8 + 4;
        return (
          <div
            key={i}
            className="absolute rounded-full bg-foreground"
            style={{
              width: size,
              height: size,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: 0.04,
              animation: `drift ${20 + Math.random() * 20}s ease-in-out infinite`,
              animationDelay: `${Math.random() * -20}s`,
            }}
          />
        );
      })}
    </div>
  );
}
