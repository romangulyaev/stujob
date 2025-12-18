// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    
    // Для Next.js 16 (у вас эта версия)
    swcMinify: true,
    
    images: {
      domains: ['localhost'],
      unoptimized: true, // Для Vercel это часто нужно
    },
    
    // Важно для Next.js 16 + App Router
    experimental: {
      // Уберите если вызывает ошибки
    }
  }
  
  module.exports = nextConfig