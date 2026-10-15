import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
  },
  // Разрешаем открывать dev-сервер с других устройств в локальной сети
  // (например, http://192.168.1.5:3000 с телефона). Без этого Next 16 блокирует
  // загрузку JS в dev-режиме — страница видна, но анимации и блоки не работают.
  allowedDevOrigins: ["192.168.*.*", "10.*.*.*", "172.*.*.*", "*.local", "127.0.0.1"],
  // не генерировать AGENTS.md при `next dev`
  agentRules: false,
};

export default nextConfig;
