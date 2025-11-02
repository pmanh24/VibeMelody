// babel.config.js (ở root)
module.exports = function (api) {
  api.cache(true)
  return {
    presets: ['babel-preset-expo'],
  }
}