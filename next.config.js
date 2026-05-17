/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/nurburgring-predictor',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
}

module.exports = nextConfig