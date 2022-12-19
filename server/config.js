module.exports = {
  db: {
    url: process.env.DB_URL,
  },
  server: {
    port: process.env.SERVER_PORT,
    secret: process.env.SERVER_SECRET,
  },
  modules: {
    halo: {
      token: process.env.AUTO_CODE_TOKEN,
    },
  },
};
