import { useEffect, useRef, useState } from "react";

export default function WebSocketStream() {
  const imgRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isMounted, setIsMounted] = useState(false);

  const wsUrl = process.env.NEXT_PUBLIC_ESP32_WS_URL;

  useEffect(() => {
    setIsMounted(true);
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!wsUrl) {
      console.warn("WebSocket URL not provided. Camera will not connect.");
      return;
    }

    console.log("WebSocket connecting to:", wsUrl);

    const isHttps = typeof window !== "undefined" && window.location.protocol === "https:";
    const isInsecure = wsUrl.startsWith("ws://");

    if (isHttps && isInsecure) {
      console.error(
        "Cannot connect to insecure WebSocket (ws://) from HTTPS page. Use wss:// instead."
      );
      return;
    }

    const ws = new WebSocket(wsUrl);
    ws.binaryType = "blob";

    ws.onopen = () => {
      console.log("WebSocket connected.");
      setConnected(true);
    };

    ws.onclose = () => {
      console.warn("WebSocket disconnected.");
      setConnected(false);
    };

    ws.onerror = (err) => {
      console.error("WebSocket error:", err);
      setConnected(false);
    };

    ws.onmessage = (event) => {
      const imageUrl = URL.createObjectURL(event.data);
      if (imgRef.current) imgRef.current.src = imageUrl;
    };

    return () => ws.close();
  }, [wsUrl]);

  const formatDate = (date) =>
    date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const formatTime = (date) => date.toLocaleTimeString();

  return (
    <div
      style={{
        textAlign: "center",
        padding: "30px",
        backgroundColor: "#f4f4f4",
        borderRadius: "16px",
        maxWidth: "700px",
        margin: "40px auto",
        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        animation: "fadeIn 1s ease-in-out",
      }}
    >
      <h2 style={{ fontSize: "28px", marginBottom: "16px" }}>
        ESP32-CAM Stream{" "}
        <span
          style={{
            padding: "5px 12px",
            borderRadius: "20px",
            backgroundColor: connected ? "#28a745" : "#dc3545",
            color: "#fff",
            fontSize: "16px",
          }}
        >
          {connected ? "Connected" : "Disconnected"}
        </span>
      </h2>

      {connected && wsUrl ? (
        <img
          ref={imgRef}
          alt="ESP32-CAM Stream"
          width={600}
          height={400}
          style={{
            backgroundColor: "black",
            objectFit: "contain",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            marginTop: "20px",
            transition: "transform 0.3s",
          }}
          onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
          onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
        />
      ) : (
        <p style={{ color: "#888", marginTop: "40px", fontSize: "18px" }}>
          Camera stream is not available.
        </p>
      )}

      {isMounted && (
        <p style={{ marginTop: "20px", fontSize: "18px", color: "#333" }}>
          {formatDate(currentTime)} | {formatTime(currentTime)}
        </p>
      )}
    </div>
  );
}
