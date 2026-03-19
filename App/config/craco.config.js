const path = require('path');

function removeReactRefreshBabelPlugin(webpackConfig) {
  const oneOfRule = webpackConfig?.module?.rules?.find(rule => Array.isArray(rule.oneOf));
  if (!oneOfRule) return;

  oneOfRule.oneOf.forEach(rule => {
    const useEntries = Array.isArray(rule.use)
      ? rule.use
      : rule.use
        ? [rule.use]
        : [];

    useEntries.forEach(use => {
      if (!use?.loader || !use.loader.includes('babel-loader')) return;

      if (use.options && Array.isArray(use.options.plugins)) {
        use.options.plugins = use.options.plugins.filter(plugin => {
          const pluginName = Array.isArray(plugin) ? plugin[0] : plugin;
          return !(
            typeof pluginName === 'string' &&
            pluginName.includes('react-refresh/babel')
          );
        });
      }
    });
  });
}

module.exports = {
  webpack: {
    configure: (webpackConfig, { env }) => {
      // Disable React Refresh only in production
      if (env === 'production') {
        webpackConfig.plugins = (webpackConfig.plugins || []).filter(
          plugin => plugin?.constructor?.name !== 'ReactRefreshWebpackPlugin'
        );

        removeReactRefreshBabelPlugin(webpackConfig);
      }

      // Allow imports from outside src/
      const scopePluginIndex = webpackConfig.resolve.plugins.findIndex(
        ({ constructor }) => constructor && constructor.name === 'ModuleScopePlugin'
      );

      if (scopePluginIndex !== -1) {
        webpackConfig.resolve.plugins.splice(scopePluginIndex, 1);
      }

      // IMPORTANT:
      // __dirname here is App/config
      // Keep the original alias base so @lib => App/modules/lib
      webpackConfig.resolve.alias = {
        ...webpackConfig.resolve.alias,
        '@root': path.resolve(__dirname, '..', '..'),
        '@app': path.resolve(__dirname, '..'),
        '@modules': path.resolve(__dirname, '..', 'modules'),
        '@lib': path.resolve(__dirname, '..', 'modules', 'lib'),
      };

      return webpackConfig;
    },
  },
};