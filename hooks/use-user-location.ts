"use client";

import { useCallback, useEffect, useState } from "react";
import type { LatLng } from "@/lib/geo";

export type GeolocationStatus =
  | "idle"
  | "locating"
  | "ready"
  | "denied"
  | "unavailable"
  | "error";

type GeolocationState = {
  status: GeolocationStatus;
  position: LatLng | null;
  accuracy: number | null;
  errorMessage: string | null;
  request: () => void;
};

const GEO_OPTIONS: PositionOptions = {
  enableHighAccuracy: false,
  timeout: 12000,
  maximumAge: 60_000,
};

export function useUserLocation(autoRequest = true): GeolocationState {
  const [status, setStatus] = useState<GeolocationStatus>("idle");
  const [position, setPosition] = useState<LatLng | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const request = useCallback(() => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      setStatus("unavailable");
      setErrorMessage("此裝置不支援定位。");
      return;
    }

    setStatus("locating");
    setErrorMessage(null);

    navigator.geolocation.getCurrentPosition(
      (result) => {
        setPosition({
          lat: result.coords.latitude,
          lng: result.coords.longitude,
        });
        setAccuracy(result.coords.accuracy);
        setStatus("ready");
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setStatus("denied");
          setErrorMessage("定位權限被拒絕。");
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          setStatus("unavailable");
          setErrorMessage("暫時無法取得位置。");
        } else {
          setStatus("error");
          setErrorMessage(error.message || "定位失敗。");
        }
      },
      GEO_OPTIONS,
    );
  }, []);

  useEffect(() => {
    if (autoRequest) request();
  }, [autoRequest, request]);

  return { status, position, accuracy, errorMessage, request };
}
