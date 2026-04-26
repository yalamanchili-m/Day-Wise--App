import React, { useEffect, useState } from "react";

export default function Clock24h({ tasks = [] }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const hours = time.getHours();
  const minutes = time.getMinutes();
  const seconds = time.getSeconds();

  return (
    <div className="text-center">

      {/* CLOCK */}
      <div className="text-3xl font-bold mb-4">
        {hours.toString().padStart(2, "0")}:
        {minutes.toString().padStart(2, "0")}:
        {seconds.toString().padStart(2, "0")}
      </div>

      {/* TASKS */}
      <div className="text-left space-y-2">
        {tasks.map((t) => (
          <div key={t.id} className="p-2 bg-gray-100 rounded">
            <div className="font-semibold">{t.name}</div>
            <div className="text-sm text-gray-600">
              {t.start_time} → {t.end_time}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}