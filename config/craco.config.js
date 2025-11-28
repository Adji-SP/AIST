const path = require('path');

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Allow imports from outside src/ directory
      // This lets us import from App/modules/lib without copying files
      const scopePluginIndex = webpackConfig.resolve.plugins.findIndex(
        ({ constructor }) => constructor && constructor.name === 'ModuleScopePlugin'
      );

      if (scopePluginIndex !== -1) {
        webpackConfig.resolve.plugins.splice(scopePluginIndex, 1);
      }

      // Add App directory to resolve paths (optional aliases for cleaner imports)
      webpackConfig.resolve.alias = {
        ...webpackConfig.resolve.alias,
        '@app': path.resolve(__dirname, '..', 'App'),
        '@modules': path.resolve(__dirname, '..', 'App/modules'),
        '@lib': path.resolve(__dirname, '..', 'App/modules/lib'),
      };

      return webpackConfig;
    },
  },
};