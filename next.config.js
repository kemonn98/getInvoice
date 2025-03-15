/** @type {import('next').NextConfig} */
const config = {
  experimental: {
    serverActions: {
      allowedOrigins: ['*']
    }
  }
}

module.exports = config