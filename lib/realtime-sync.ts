"use client";

import * as React from "react";

export const CHANNEL_NAME = "finflow_realtime_sync_channel";
export const EVENT_NAME = "finflow:realtime_updated";

/**
 * Phát tín hiệu cập nhật thời gian thực tới tất cả các tab và component
 */
export function triggerRealtimeSync(source: string = "unknown") {
  if (typeof window === "undefined") return;

  // 1. Gửi CustomEvent trong cùng cửa sổ
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { source, timestamp: Date.now() } }));

  // 2. Gửi qua BroadcastChannel tới các tab/cửa sổ khác
  try {
    if ("BroadcastChannel" in window) {
      const channel = new BroadcastChannel(CHANNEL_NAME);
      channel.postMessage({ type: "SYNC", source, timestamp: Date.now() });
      channel.close();
    }
  } catch (err) {
    console.debug("[RealtimeSync] BroadcastChannel error:", err);
  }
}

/**
 * Hook lắng nghe và đồng bộ dữ liệu thời gian thực (Real-time Live Sync)
 * - Tự động đồng bộ ngay khi nhận sự kiện từ các trang khác
 * - Tự động đồng bộ khi chuyển tab / focus lại cửa sổ
 * - Tự động polling định kỳ (mặc định mỗi 4 giây khi tab đang mở)
 */
export function useRealtimeSync(onSync: () => void, intervalMs: number = 20000) {
  const savedCallback = React.useRef(onSync);

  React.useEffect(() => {
    savedCallback.current = onSync;
  }, [onSync]);

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    let isBusy = false;
    const handleEvent = async () => {
      if (isBusy) return;
      isBusy = true;
      try {
        await savedCallback.current();
      } finally {
        isBusy = false;
      }
    };

    // 1. Lắng nghe CustomEvent cùng tab (chỉ khi có CRUD event thực sự)
    window.addEventListener(EVENT_NAME, handleEvent);

    // 2. Lắng nghe BroadcastChannel khác tab (khi tab khác có CRUD event)
    let channel: BroadcastChannel | null = null;
    try {
      if ("BroadcastChannel" in window) {
        channel = new BroadcastChannel(CHANNEL_NAME);
        channel.onmessage = (event) => {
          if (event.data?.type === "SYNC") {
            handleEvent();
          }
        };
      }
    } catch (e) {
      console.debug("[useRealtimeSync] BroadcastChannel error:", e);
    }

    // 3. Polling chu kỳ dài (mặc định 20s) để tránh lag server dev
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") {
        handleEvent();
      }
    }, intervalMs);

    return () => {
      window.removeEventListener(EVENT_NAME, handleEvent);
      clearInterval(timer);
      if (channel) {
        channel.close();
      }
    };
  }, [intervalMs]);
}

