module.exports = function(api) {
  api.cache(true);

  const presets = [
    [
      "@babel/preset-env",
      {
        loose: true,
        modules: false
      }
    ],
    [
      "@babel/preset-react",
      {
        pragma: "createElement",
        pragmaFrag: "Fragment"
      }
    ]
  ];

  const plugins = [];

  return {
    presets,
    plugins
  };
};
