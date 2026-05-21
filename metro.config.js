const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");

const projectRoot = __dirname;

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(projectRoot);

const defaultResolveRequest = config.resolver.resolveRequest;

/**
 * Força entrada única por plataforma para evitar "dual package hazard"
 * e falha ao resolver @firebase/firestore/dist/index.esm.js no Metro.
 * @see https://github.com/expo/expo/issues/36588
 */
const FIREBASE_PACKAGES = {
  app: {
    web: "dist/esm/index.esm.js",
    native: "dist/index.cjs.js",
  },
  auth: {
    web: "dist/esm/index.js",
    native: "dist/rn/index.js",
  },
  firestore: {
    web: "dist/index.esm.js",
    native: "dist/index.rn.js",
  },
};

const MODULE_TO_PKG = {
  "@firebase/app": "app",
  "firebase/app": "app",
  "@firebase/auth": "auth",
  "firebase/auth": "auth",
  "@firebase/firestore": "firestore",
  "firebase/firestore": "firestore",
};

function resolveFirebaseEntry(moduleName, platform) {
  const pkg = MODULE_TO_PKG[moduleName];
  if (!pkg) return null;

  const rel =
    platform === "web"
      ? FIREBASE_PACKAGES[pkg].web
      : FIREBASE_PACKAGES[pkg].native;

  return path.join(projectRoot, "node_modules", "@firebase", pkg, rel);
}

config.resolver = {
  ...config.resolver,
  sourceExts: [...config.resolver.sourceExts, "cjs"],
  unstable_enablePackageExports: false,
  resolveRequest: (context, moduleName, platform) => {
    const filePath = resolveFirebaseEntry(moduleName, platform);
    if (filePath) {
      return { type: "sourceFile", filePath };
    }

    if (defaultResolveRequest) {
      return defaultResolveRequest(context, moduleName, platform);
    }

    return context.resolveRequest(context, moduleName, platform);
  },
};

module.exports = config;
