import { useState, useEffect } from "react";

function HealthCheckIndicator({ online }) {
  return (
    <div className="flex items-center">
      <div
        className={`w-3 h-3 rounded-full mr-2 ${
          online ? "bg-green-500" : "bg-red-500"
        }`}
      />
      <p className="text-sm">{online ? "rpsAPI Available" : "rpsAPI Offline"}</p>
    </div>
  );
}

function HealthCheck() {
  const [online, setOnline] = useState(false);

  useEffect(() => {
    fetch("/api/healthcheck")
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 200) setOnline(true);
        if (data.status === 500) setOnline(false);
      })
      .catch((err) => {
        setOnline(false);
      });
  }, []);

  return (
    <div className="fixed bottom-0 right-0 m-4">
      <HealthCheckIndicator online={online} />
    </div>
  );
}

export default HealthCheck;