/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración de exportación estática
  output: "export",
  trailingSlash: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  assetPrefix: "/",
  basePath: "",

  // ==========================================
  // BLOQUE NECESARIO PARA PERMITIR IFRAMES
  // ==========================================
  async headers() {
    return [
      {
        // Aplicar esta regla a todas las rutas del juego
        source: '/:path*',
        headers: [
          // 1. ANULA X-FRAME-OPTIONS: Permite que UDIPSAI (o cualquier sitio) lo incruste
          { key: 'X-Frame-Options', value: 'ALLOWALL' },
          // 2. CSP (Content Security Policy): Permite incrustación en todos los orígenes (*)
          { key: 'Content-Security-Policy', value: "frame-ancestors *" }
        ],
      },
    ];
  },
  // ==========================================
}

module.exports = nextConfig