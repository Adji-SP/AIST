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
      // Note: __dirname is App/config, so:
      //   '..' points to App/
      //   '../..' points to project root
      webpackConfig.resolve.alias = {
        ...webpackConfig.resolve.alias,
        '@root': path.resolve(__dirname, '..', '..'),              // Host project root
        '@app': path.resolve(__dirname, '..'),                     // App/ framework directory
        '@modules': path.resolve(__dirname, '..', 'modules'),      // App/modules/
        '@lib': path.resolve(__dirname, '..', 'modules', 'lib'),   // App/modules/lib/
      };

      return webpackConfig;
    },
  },
};