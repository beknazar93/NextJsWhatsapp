module.exports = {
  async rewrites() {
    return [
      {
        source: "/api/socket",
        destination: "/api/socket",
      },
    ];
  },
};
