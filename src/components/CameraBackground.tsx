import { useEffect, useRef, useState } from "react";

const CameraBackground = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasCamera, setHasCamera] = useState(false);

  useEffect(() => {
    let currentStream: MediaStream | null = null;
    let cancelled = false;

    const isLive = () => {
      const s = videoRef.current?.srcObject as MediaStream | null;
      return !!s && s.getTracks().some((t) => t.readyState === "live");
    };

    const startCamera = async () => {
      if (cancelled || isLive()) return;
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        currentStream = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          try { await videoRef.current.play(); } catch { /* ignore */ }
          setHasCamera(true);
        }
      } catch {
        setHasCamera(false);
      }
    };

    const restartSoon = () => {
      // iOS needs a small delay after returning from AR Quick Look
      setTimeout(() => {
        if (document.visibilityState === "visible") startCamera();
      }, 300);
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible") restartSoon();
    };
    const onPageShow = () => restartSoon();
    const onFocus = () => restartSoon();
    const onArReturned = () => restartSoon();

    startCamera();

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pageshow", onPageShow);
    window.addEventListener("focus", onFocus);
    window.addEventListener("ar-returned", onArReturned);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pageshow", onPageShow);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("ar-returned", onArReturned);
      currentStream?.getTracks().forEach((t) => t.stop());
      const live = videoRef.current?.srcObject as MediaStream | null;
      live?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  return (
    <>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`absolute inset-0 w-full h-full object-cover ${hasCamera ? "opacity-100" : "opacity-0"}`}
        style={{ zIndex: 0, filter: "blur(4px)" }}
      />
      <div
        className="absolute inset-0"
        style={{ zIndex: 1, backgroundColor: "rgba(0, 0, 0, 0.6)" }}
      />
    </>
  );
};

export default CameraBackground;
