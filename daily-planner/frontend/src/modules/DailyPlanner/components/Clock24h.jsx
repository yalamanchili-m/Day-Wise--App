import React, { useEffect, useState, useRef } from "react";

export default function Clock24h({ tasks = [] }) {
  const [time, setTime] = useState(new Date());
  const canvasRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    drawClock();
  }, [time, tasks]);

  const size = 420;
  const center = size / 2;
  const radius = size / 2 - 30;

  const drawClock = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = size;
    canvas.height = size;
    ctx.clearRect(0, 0, size, size);

    // YOUR ORIGINAL BACKGROUND GRADIENT - NOT CHANGED
    const gradient = ctx.createRadialGradient(center, center, 50, center, center, radius);
    gradient.addColorStop(0, "#ffffff");
    gradient.addColorStop(1, "#ffffff");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, Math.PI * 2);
    ctx.fill();

    // Outer border
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, Math.PI * 2);
    ctx.strokeStyle = "#d1d5db";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Inner ring
    ctx.beginPath();
    ctx.arc(center, center, radius - 35, 0, Math.PI * 2);
    ctx.strokeStyle = "#e5e7eb";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Hour labels (0–23)
    for (let h = 0; h < 24; h++) {
      const angle = (h * 15 - 90) * Math.PI / 180;
      const x = center + (radius - 20) * Math.cos(angle);
      const y = center + (radius - 20) * Math.sin(angle);
      ctx.fillStyle = "#78716c";
      ctx.font = "500 12px 'Inter', sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(h, x, y);
    }

    // Tick marks
    for (let h = 0; h < 24; h++) {
      const angle = (h * 15 - 90) * Math.PI / 180;
      const x1 = center + (radius - 8) * Math.cos(angle);
      const y1 = center + (radius - 8) * Math.sin(angle);
      const x2 = center + (radius - 2) * Math.cos(angle);
      const y2 = center + (radius - 2) * Math.sin(angle);
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = "#d6d3d1";
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    const colors = ["#6366F1", "#8B5CF6", "#14B8A6", "#F59E0B", "#EF4444", "#3B82F6", "#EC4899", "#06B6D4"];

    tasks.forEach((task, index) => {
      if (task.start_time !== undefined && task.end_time !== undefined) {
        const startAngle = (task.start_time * 15 - 90) * Math.PI / 180;
        const endAngle = (task.end_time * 15 - 90) * Math.PI / 180;
        ctx.beginPath();
        ctx.moveTo(center, center);
        ctx.arc(center, center, radius - 28, startAngle, endAngle);
        ctx.closePath();
        ctx.fillStyle = task.color || colors[index % colors.length];
        ctx.globalAlpha = 0.75;
        ctx.fill();
        ctx.globalAlpha = 1;

        const midAngle = (startAngle + endAngle) / 2;
        const textX = center + (radius - 70) * Math.cos(midAngle);
        const textY = center + (radius - 70) * Math.sin(midAngle);
        ctx.fillStyle = "#1c1917";
        ctx.font = "500 10px 'Inter', sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const label = task.name.length > 12 ? task.name.slice(0, 10) + ".." : task.name;
        ctx.fillText(label, textX, textY);
      }
    });

    const h = time.getHours();
    const m = time.getMinutes();
    const s = time.getSeconds();
    const hourAngle = (h * 15 + m * 0.25 - 90) * Math.PI / 180;
    const minuteAngle = (m * 6 - 90) * Math.PI / 180;
    const secondAngle = (s * 6 - 90) * Math.PI / 180;

    const drawHand = (angle, length, width, color) => {
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.lineTo(center + length * Math.cos(angle), center + length * Math.sin(angle));
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.lineCap = "round";
      ctx.stroke();
    };

    drawHand(hourAngle, radius - 100, 5, "#292524");
    drawHand(minuteAngle, radius - 70, 3, "#57534e");
    drawHand(secondAngle, radius - 50, 1.5, "#ef4444");

    ctx.beginPath();
    ctx.arc(center, center, 5, 0, Math.PI * 2);
    ctx.fillStyle = "#292524";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(center, center, 2, 0, Math.PI * 2);
    ctx.fillStyle = "#fef3c7";
    ctx.fill();
  };

  // Digital time format
  const hours = time.getHours();
  const minutes = time.getMinutes();
  const seconds = time.getSeconds();
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;

  return (
    <div className="flex flex-col items-center">
      {/* DIGITAL CLOCK - ONLY ADDED THIS, NOTHING ELSE CHANGED */}
      <div className="mb-4 text-center">
        <div className="text-4xl font-mono font-bold text-stone-700 dark:text-stone-200 tracking-wider">
          {displayHours.toString().padStart(2, "0")}:{minutes.toString().padStart(2, "0")}:{seconds.toString().padStart(2, "0")}
          <span className="text-xl ml-2 text-stone-500">{period}</span>
        </div>
        <div className="text-xs text-stone-400 mt-1">
          {time.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* YOUR ORIGINAL ANALOG CLOCK - UNCHANGED */}
      <canvas ref={canvasRef} width={size} height={size} className="rounded-full shadow-xl bg-amber-50" />
      
      <div className="mt-4 text-center">
        <p className="text-xs text-stone-500 italic">24-hour compass</p>
        <p className="text-[11px] text-stone-400 mt-1">colored arcs = your day's thread</p>
      </div>
    </div>
  );
}