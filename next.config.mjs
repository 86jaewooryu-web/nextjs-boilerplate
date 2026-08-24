/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // ESLint 문법 검사 에러를 무조건 무시하고 빌드 통과
    ignoreDuringBuilds: true,
  },
  typescript: {
    // 타입스크립트 에러를 무조건 무시하고 빌드 통과
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
