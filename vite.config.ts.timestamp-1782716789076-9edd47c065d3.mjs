// vite.config.ts
import path5 from "node:path";
import process5 from "node:process";
import Uni from "file:///D:/study/myGithub/blog-home-uniapp/node_modules/.pnpm/@uni-helper+plugin-uni@0.1.0_@dcloudio+vite-plugin-uni@3.0.0-5000720260410001_postcss@8.5.6_r_rwudv6y2lx32lidweoct5is3zm/node_modules/@uni-helper/plugin-uni/src/index.js";
import { isMpWeixin } from "file:///D:/study/myGithub/blog-home-uniapp/node_modules/.pnpm/@uni-helper+uni-env@0.1.8/node_modules/@uni-helper/uni-env/dist/index.mjs";
import UniComponents from "file:///D:/study/myGithub/blog-home-uniapp/node_modules/.pnpm/@uni-helper+vite-plugin-uni-components@0.2.3_rollup@4.50.0/node_modules/@uni-helper/vite-plugin-uni-components/dist/index.mjs";
import UniLayouts from "file:///D:/study/myGithub/blog-home-uniapp/node_modules/.pnpm/@uni-helper+vite-plugin-uni-layouts@0.1.11_rollup@4.50.0/node_modules/@uni-helper/vite-plugin-uni-layouts/dist/index.mjs";
import UniManifest from "file:///D:/study/myGithub/blog-home-uniapp/node_modules/.pnpm/@uni-helper+vite-plugin-uni-manifest@0.2.12_vite@5.2.8_@types+node@20.19.11_less@4.5.1_sass@1.77.8_terser@5.43.1_/node_modules/@uni-helper/vite-plugin-uni-manifest/dist/index.mjs";
import UniPages from "file:///D:/study/myGithub/blog-home-uniapp/node_modules/.pnpm/@uni-helper+vite-plugin-uni-pages@0.3.23_vite@5.2.8_@types+node@20.19.11_less@4.5.1_sass@1.77.8_terser@5.43.1_/node_modules/@uni-helper/vite-plugin-uni-pages/dist/index.mjs";

// wot-ui-resolver.ts
import { kebabCase } from "file:///D:/study/myGithub/blog-home-uniapp/node_modules/.pnpm/@uni-helper+vite-plugin-uni-components@0.2.3_rollup@4.50.0/node_modules/@uni-helper/vite-plugin-uni-components/dist/index.mjs";
function WotResolver() {
  return {
    type: "component",
    resolve: (name) => {
      if (name.match(/^Wd[A-Z]/)) {
        const compName = kebabCase(name);
        return {
          name,
          from: `@wot-ui/ui/components/${compName}/${compName}.vue`
        };
      }
      if (name.startsWith("wd-")) {
        return {
          name,
          from: `@wot-ui/ui/components/${name}/${name}.vue`
        };
      }
    }
  };
}

// vite.config.ts
import UniPlatform from "file:///D:/study/myGithub/blog-home-uniapp/node_modules/.pnpm/@uni-helper+vite-plugin-uni-platform@0.0.5/node_modules/@uni-helper/vite-plugin-uni-platform/dist/index.mjs";
import UniOptimization from "file:///D:/study/myGithub/blog-home-uniapp/node_modules/.pnpm/@uni-ku+bundle-optimizer@1.3.15-beta.2_postcss@8.5.6_rollup@4.50.0_vite@5.2.8_@types+node@20._hgzc5lqyzhxzvqmuiufxrhw2bu/node_modules/@uni-ku/bundle-optimizer/dist/index.mjs";
import UniKuRoot from "file:///D:/study/myGithub/blog-home-uniapp/node_modules/.pnpm/@uni-ku+root@1.4.1_vite@5.2.8_@types+node@20.19.11_less@4.5.1_sass@1.77.8_terser@5.43.1_/node_modules/@uni-ku/root/dist/index.mjs";
import dayjs from "file:///D:/study/myGithub/blog-home-uniapp/node_modules/.pnpm/dayjs@1.11.10/node_modules/dayjs/dayjs.min.js";
import { visualizer } from "file:///D:/study/myGithub/blog-home-uniapp/node_modules/.pnpm/rollup-plugin-visualizer@6.0.3_rollup@4.50.0/node_modules/rollup-plugin-visualizer/dist/plugin/index.js";
import UnoCSS from "file:///D:/study/myGithub/blog-home-uniapp/node_modules/.pnpm/unocss@66.0.0_postcss@8.5.6_vite@5.2.8_@types+node@20.19.11_less@4.5.1_sass@1.77.8_terser@5.4_icnga4hwnwqtofasym3prfkbhi/node_modules/unocss/dist/vite.mjs";
import AutoImport from "file:///D:/study/myGithub/blog-home-uniapp/node_modules/.pnpm/unplugin-auto-import@20.1.0/node_modules/unplugin-auto-import/dist/vite.js";
import { defineConfig, loadEnv } from "file:///D:/study/myGithub/blog-home-uniapp/node_modules/.pnpm/vite@5.2.8_@types+node@20.19.11_less@4.5.1_sass@1.77.8_terser@5.43.1/node_modules/vite/dist/node/index.js";
import ViteRestart from "file:///D:/study/myGithub/blog-home-uniapp/node_modules/.pnpm/vite-plugin-restart@1.0.0_vite@5.2.8_@types+node@20.19.11_less@4.5.1_sass@1.77.8_terser@5.43.1_/node_modules/vite-plugin-restart/dist/index.js";

// scripts/open-dev-tools.js
import { exec } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
function _openDevTools(env = "dev", options = {}) {
  const { wechatDevtoolsCliPath, alipayDevtoolsPath } = options;
  const platform = process.platform;
  const { UNI_PLATFORM } = process.env;
  const uniPlatformText = UNI_PLATFORM === "mp-weixin" ? "\u5FAE\u4FE1\u5C0F\u7A0B\u5E8F" : UNI_PLATFORM === "mp-alipay" ? "\u652F\u4ED8\u5B9D\u5C0F\u7A0B\u5E8F" : UNI_PLATFORM === "mp-lark" ? "\u6296\u97F3\u5C0F\u7A0B\u5E8F" : "\u5C0F\u7A0B\u5E8F";
  const outputDir = env === "build" ? `dist/build/${UNI_PLATFORM}` : `dist/dev/${UNI_PLATFORM}`;
  const projectPath = path.resolve(process.cwd(), outputDir);
  if (!fs.existsSync(projectPath)) {
    console.log(`\u274C ${uniPlatformText}\u6784\u5EFA\u76EE\u5F55\u4E0D\u5B58\u5728:`, projectPath);
    return;
  }
  console.log(`\u{1F680} \u6B63\u5728\u6253\u5F00${uniPlatformText}\u5F00\u53D1\u8005\u5DE5\u5177...`);
  let command = "";
  if (platform === "darwin") {
    if (UNI_PLATFORM === "mp-weixin") {
      const cliPath = wechatDevtoolsCliPath || "/Applications/wechatwebdevtools.app/Contents/MacOS/cli";
      command = `"${cliPath}" -o "${projectPath}"`;
    } else if (UNI_PLATFORM === "mp-alipay") {
      const appPath = alipayDevtoolsPath || "/Applications/\u5C0F\u7A0B\u5E8F\u5F00\u53D1\u8005\u5DE5\u5177.app/Contents/MacOS/\u5C0F\u7A0B\u5E8F\u5F00\u53D1\u8005\u5DE5\u5177";
      command = `"${appPath}" --p "${projectPath}"`;
    } else if (UNI_PLATFORM === "mp-lark") {
      command = `/Applications/\u6296\u97F3\u5F00\u53D1\u8005\u5DE5\u5177.app/Contents/MacOS/\u6296\u97F3\u5F00\u53D1\u8005\u5DE5\u5177 --p "${projectPath}"`;
    }
  } else if (platform === "win32" || platform === "win64") {
    if (UNI_PLATFORM === "mp-weixin") {
      const cliPath = wechatDevtoolsCliPath || "D:\\softwares\\\u5FAE\u4FE1web\u5F00\u53D1\u8005\u5DE5\u5177\\cli.bat";
      command = `"${cliPath}" -o "${projectPath}"`;
    } else if (UNI_PLATFORM === "mp-alipay") {
      const installPath = alipayDevtoolsPath || "D:\\softwares\\\u652F\u4ED8\u5B9D\u5F00\u53D1\u8005\u5DE5\u5177\\\u5C0F\u7A0B\u5E8F\u5F00\u53D1\u8005\u5DE5\u5177";
      const exePath = path.join(installPath, "\u5C0F\u7A0B\u5E8F\u5F00\u53D1\u8005\u5DE5\u5177.exe");
      command = `"${exePath}" --p "${projectPath}"`;
    }
  } else {
    console.log(`\u274C \u5F53\u524D\u7CFB\u7EDF\u4E0D\u652F\u6301\u81EA\u52A8\u6253\u5F00${uniPlatformText}\u5F00\u53D1\u8005\u5DE5\u5177`);
    return;
  }
  if (!command) {
    console.log(`\u274C \u5F53\u524D\u5E73\u53F0\u6682\u4E0D\u652F\u6301\u81EA\u52A8\u6253\u5F00${uniPlatformText}\u5F00\u53D1\u8005\u5DE5\u5177`);
    return;
  }
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.log(`\u274C \u6253\u5F00${uniPlatformText}\u5F00\u53D1\u8005\u5DE5\u5177\u5931\u8D25:`, error.message);
      if (UNI_PLATFORM === "mp-weixin") {
        console.log("\u{1F4A1} \u5F53\u524D\u4F7F\u7528\u7684\u5FAE\u4FE1\u5F00\u53D1\u8005\u5DE5\u5177 CLI \u547D\u4EE4:", command);
        console.log("\u{1F4A1} \u5982\u679C\u5B89\u88C5\u4F4D\u7F6E\u4E0D\u540C\uFF0C\u53EF\u4EE5\u5728 env/.env \u914D\u7F6E WECHAT_DEVTOOLS_CLI_PATH \u4E3A\u672C\u673A\u5B9E\u9645 CLI \u8DEF\u5F84");
      } else if (UNI_PLATFORM === "mp-alipay") {
        console.log("\u{1F4A1} \u5F53\u524D\u4F7F\u7528\u7684\u652F\u4ED8\u5B9D\u5F00\u53D1\u8005\u5DE5\u5177\u547D\u4EE4:", command);
        console.log("\u{1F4A1} \u5982\u679C\u5B89\u88C5\u4F4D\u7F6E\u4E0D\u540C\uFF0C\u53EF\u4EE5\u5728 env/.env \u914D\u7F6E ALIPAY_DEVTOOLS_PATH \u4E3A\u672C\u673A\u5B9E\u9645\u5B89\u88C5\u76EE\u5F55");
      }
      console.log(`\u{1F4A1} \u8BF7\u786E\u4FDD${uniPlatformText}\u5F00\u53D1\u8005\u5DE5\u5177\u670D\u52A1\u7AEF\u53E3\u5DF2\u542F\u7528`);
      console.log(`\u{1F4A1} \u53EF\u4EE5\u624B\u52A8\u6253\u5F00${uniPlatformText}\u5F00\u53D1\u8005\u5DE5\u5177\u5E76\u5BFC\u5165\u9879\u76EE:`, projectPath);
      return;
    }
    if (stderr) {
      console.log("\u26A0\uFE0F \u8B66\u544A:", stderr);
    }
    console.log(`\u2705 ${uniPlatformText}\u5F00\u53D1\u8005\u5DE5\u5177\u5DF2\u6253\u5F00`);
    if (stdout) {
      console.log(stdout);
    }
  });
}
function openDevTools(options = {}) {
  const { mode = "development", wechatDevtoolsCliPath, alipayDevtoolsPath } = options;
  const env = mode === "production" ? "build" : "dev";
  let isFirstBuild = true;
  return {
    name: "uni-devtools",
    writeBundle() {
      if (isFirstBuild && process.env.UNI_PLATFORM?.includes("mp")) {
        isFirstBuild = false;
        _openDevTools(env, { wechatDevtoolsCliPath, alipayDevtoolsPath });
      }
    }
  };
}

// scripts/vite-plugin-eruda.js
function vitePluginEruda(options = {}) {
  const { open = true, erudaOptions = {}, erudaUrl = "https://cdn.jsdelivr.net/npm/eruda" } = options;
  return {
    name: "vite-plugin-eruda",
    transformIndexHtml(html) {
      const tags = [
        {
          tag: "script",
          attrs: {
            src: erudaUrl
          },
          injectTo: "head"
        },
        {
          tag: "script",
          children: `eruda.init(${JSON.stringify(erudaOptions)});`,
          injectTo: "head"
        }
      ];
      if (!open) {
        return html;
      }
      return { html, tags };
    }
  };
}

// vite-plugins/copy-native-resources.ts
import path2 from "node:path";
import process2 from "node:process";
import fs2 from "file:///D:/study/myGithub/blog-home-uniapp/node_modules/.pnpm/fs-extra@7.0.1/node_modules/fs-extra/lib/index.js";
var DEFAULT_OPTIONS = {
  enable: true,
  sourceDir: "nativeplugins",
  targetDirName: "nativeplugins",
  verbose: true,
  logPrefix: "[copy-native-resources]"
};
function copyNativeResources(options = {}) {
  const config = { ...DEFAULT_OPTIONS, ...options };
  if (!config.enable) {
    return {
      name: "copy-native-resources-disabled",
      apply: "build",
      writeBundle() {
      }
    };
  }
  return {
    name: "copy-native-resources",
    apply: "build",
    // 只在构建时应用
    enforce: "post",
    // 在其他插件执行完毕后执行
    async writeBundle() {
      const { sourceDir, targetDirName, verbose, logPrefix } = config;
      try {
        const projectRoot = process2.cwd();
        const sourcePath = path2.resolve(projectRoot, sourceDir);
        const buildMode = process2.env.NODE_ENV === "production" ? "build" : "dev";
        const platform = process2.env.UNI_PLATFORM || "app";
        const targetPath = path2.resolve(
          projectRoot,
          "dist",
          buildMode,
          platform,
          targetDirName
        );
        const sourceExists = await fs2.pathExists(sourcePath);
        if (!sourceExists) {
          if (verbose) {
            console.warn(`${logPrefix} \u6E90\u76EE\u5F55\u4E0D\u5B58\u5728\uFF0C\u8DF3\u8FC7\u590D\u5236\u64CD\u4F5C`);
            console.warn(`${logPrefix} \u6E90\u76EE\u5F55\u8DEF\u5F84: ${sourcePath}`);
            console.warn(`${logPrefix} \u5982\u9700\u4F7F\u7528\u672C\u5730\u539F\u751F\u63D2\u4EF6\uFF0C\u8BF7\u5728\u9879\u76EE\u6839\u76EE\u5F55\u521B\u5EFA nativeplugins \u76EE\u5F55`);
            console.warn(`${logPrefix} \u5E76\u6309\u7167\u5B98\u65B9\u6587\u6863\u653E\u5165\u539F\u751F\u63D2\u4EF6\u6587\u4EF6`);
            console.warn(`${logPrefix} \u53C2\u8003: https://uniapp.dcloud.net.cn/plugin/native-plugin.html`);
          }
          return;
        }
        const sourceFiles = await fs2.readdir(sourcePath);
        if (sourceFiles.length === 0) {
          if (verbose) {
            console.warn(`${logPrefix} \u6E90\u76EE\u5F55\u4E3A\u7A7A\uFF0C\u8DF3\u8FC7\u590D\u5236\u64CD\u4F5C`);
            console.warn(`${logPrefix} \u6E90\u76EE\u5F55\u8DEF\u5F84: ${sourcePath}`);
            console.warn(`${logPrefix} \u8BF7\u5728 nativeplugins \u76EE\u5F55\u4E2D\u653E\u5165\u539F\u751F\u63D2\u4EF6\u6587\u4EF6`);
          }
          return;
        }
        await fs2.ensureDir(targetPath);
        if (verbose) {
          console.log(`${logPrefix} \u5F00\u59CB\u590D\u5236 UniApp \u672C\u5730\u539F\u751F\u63D2\u4EF6...`);
          console.log(`${logPrefix} \u6E90\u76EE\u5F55: ${sourcePath}`);
          console.log(`${logPrefix} \u76EE\u6807\u76EE\u5F55: ${targetPath}`);
          console.log(`${logPrefix} \u6784\u5EFA\u6A21\u5F0F: ${buildMode}`);
          console.log(`${logPrefix} \u76EE\u6807\u5E73\u53F0: ${platform}`);
          console.log(`${logPrefix} \u53D1\u73B0 ${sourceFiles.length} \u4E2A\u539F\u751F\u63D2\u4EF6\u6587\u4EF6/\u76EE\u5F55`);
        }
        await fs2.copy(sourcePath, targetPath, {
          overwrite: true,
          // 覆盖已存在的文件，确保使用最新版本
          errorOnExist: false,
          // 如果目标文件存在不报错
          preserveTimestamps: true
          // 保持文件的时间戳
        });
        console.log(`${logPrefix} \u2705 UniApp \u672C\u5730\u539F\u751F\u63D2\u4EF6\u590D\u5236\u5B8C\u6210: ${sourcePath} -> ${targetPath}`);
        console.log(`${logPrefix} \u5DF2\u6210\u529F\u590D\u5236 ${sourceFiles.length} \u4E2A\u6587\u4EF6/\u76EE\u5F55\u5230\u6784\u5EFA\u76EE\u5F55`);
      } catch (error) {
        console.error(`${config.logPrefix} \u274C \u590D\u5236 UniApp \u672C\u5730\u539F\u751F\u63D2\u4EF6\u5931\u8D25:`, error);
        console.error(`${config.logPrefix} \u9519\u8BEF\u8BE6\u60C5:`, error instanceof Error ? error.message : String(error));
        console.error(`${config.logPrefix} \u8BF7\u68C0\u67E5\u6E90\u76EE\u5F55\u6743\u9650\u548C\u78C1\u76D8\u7A7A\u95F4`);
      }
    }
  };
}
function createCopyNativeResourcesPlugin(enable = true, options = {}) {
  return copyNativeResources({ enable, ...options });
}

// vite-plugins/mp-atob-polyfill-inject.ts
import fs3 from "node:fs";
import path3 from "node:path";
import process3 from "node:process";
var MARKER = "/* mp-atob-polyfill-injected */";
var POLYFILL = `${MARKER}(function(){var g=typeof globalThis!="undefined"?globalThis:typeof global!="undefined"?global:{};if(typeof g.atob=="function")return;var C="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";g.atob=function(i){var s=String(i).replace(/[=]+$/,""),o="";if(s.length%4==1)throw new Error("Invalid base64");for(var n=0,b=0,c=0;n<s.length;)b=b<<6|C.indexOf(s.charAt(n++)),c+=6,c>=8&&(o+=String.fromCharCode(b>>>(c-=8)&255));return o}})();
`;
var VENDOR_REL = ["dist/dev/mp-weixin/common/vendor.js", "dist/build/mp-weixin/common/vendor.js"];
function mpAtobPolyfillInject() {
  return {
    name: "mp-atob-polyfill-inject",
    apply: "build",
    enforce: "post",
    closeBundle() {
      if (process3.env.UNI_PLATFORM !== "mp-weixin")
        return;
      for (const rel of VENDOR_REL) {
        const vendorPath = path3.resolve(process3.cwd(), rel);
        if (!fs3.existsSync(vendorPath))
          continue;
        const content = fs3.readFileSync(vendorPath, "utf8");
        if (content.includes(MARKER))
          continue;
        fs3.writeFileSync(vendorPath, POLYFILL + content);
      }
    }
  };
}

// vite-plugins/sync-manifest-plugins.ts
import fs4 from "node:fs";
import path4 from "node:path";
import process4 from "node:process";
function syncManifestPlugin() {
  return {
    name: "sync-manifest",
    apply: "build",
    enforce: "post",
    writeBundle: {
      order: "post",
      handler() {
        const srcManifestPath = path4.resolve(process4.cwd(), "./src/manifest.json");
        const distAppPath = path4.resolve(process4.cwd(), "./dist/dev/app/manifest.json");
        try {
          const srcManifest = JSON.parse(fs4.readFileSync(srcManifestPath, "utf8"));
          const distAppDir = path4.dirname(distAppPath);
          if (!fs4.existsSync(distAppDir)) {
            fs4.mkdirSync(distAppDir, { recursive: true });
          }
          let distManifest = {};
          if (fs4.existsSync(distAppPath)) {
            distManifest = JSON.parse(fs4.readFileSync(distAppPath, "utf8"));
          }
          if (srcManifest["app-plus"]?.distribute?.plugins) {
            if (!distManifest.plus)
              distManifest.plus = {};
            if (!distManifest.plus.distribute)
              distManifest.plus.distribute = {};
            distManifest.plus.distribute.plugins = srcManifest["app-plus"].distribute.plugins;
            fs4.writeFileSync(distAppPath, JSON.stringify(distManifest, null, 2));
            console.log("\u2705 Manifest plugins \u540C\u6B65\u6210\u529F");
          }
        } catch (error) {
          console.error("\u274C \u540C\u6B65 manifest plugins \u5931\u8D25:", error);
        }
      }
    }
  };
}

// vite.config.ts
var vite_config_default = defineConfig(({ command, mode }) => {
  console.log("command, mode -> ", command, mode);
  const { UNI_PLATFORM, SKIP_OPEN_DEVTOOLS } = process5.env;
  console.log("UNI_PLATFORM -> ", UNI_PLATFORM);
  const envDir = path5.resolve(process5.cwd(), "env");
  const env = loadEnv(mode, envDir);
  const localEnv = loadEnv(mode, envDir, "");
  const {
    VITE_APP_PORT,
    VITE_SERVER_BASEURL,
    VITE_APP_TITLE,
    VITE_DELETE_CONSOLE,
    VITE_APP_PUBLIC_BASE,
    VITE_APP_PROXY_ENABLE,
    VITE_APP_PROXY_PREFIX,
    VITE_WS_ORIGIN,
    VITE_COPY_NATIVE_RES_ENABLE
  } = env;
  const { WECHAT_DEVTOOLS_CLI_PATH, ALIPAY_DEVTOOLS_PATH } = localEnv;
  console.log("\u73AF\u5883\u53D8\u91CF env -> ", env);
  function buildH5DevProxy() {
    const apiUrl = new URL(VITE_SERVER_BASEURL);
    const apiPathPrefix = apiUrl.pathname.replace(/\/$/, "");
    const zoneOrigin = (VITE_WS_ORIGIN || apiUrl.origin).replace(/\/$/, "");
    return {
      [VITE_APP_PROXY_PREFIX]: {
        target: apiUrl.origin,
        changeOrigin: true,
        rewrite: (p) => apiPathPrefix + p.replace(new RegExp(`^${VITE_APP_PROXY_PREFIX}`), "")
      },
      "/x-zone": {
        target: zoneOrigin,
        changeOrigin: true
      }
    };
  }
  return defineConfig({
    envDir: "./env",
    // 自定义env目录
    base: VITE_APP_PUBLIC_BASE,
    plugins: [
      // UniXXX 需要在 Uni 之前引入
      UniLayouts(),
      UniPlatform(),
      UniManifest(),
      UniComponents({
        extensions: ["vue"],
        deep: true,
        // 是否递归扫描子目录，
        directoryAsNamespace: false,
        // 是否把目录名作为命名空间前缀，true 时组件名为 目录名+组件名，
        dts: "src/types/components.d.ts",
        // 自动生成的组件类型声明文件路径（用于 TypeScript 支持）
        resolvers: [WotResolver()]
      }),
      UniPages({
        exclude: ["**/components/**/**.*", "**/sections/**/**.*"],
        // pages 目录为 src/pages，分包目录不能配置在pages目录下！！
        // 是个数组，可以配置多个，但是不能为pages里面的目录！！
        subPackages: ["src/pages-blog", "src/pages-rpg", "src/pages-tool"],
        dts: "src/types/uni-pages.d.ts"
      }),
      // UniOptimization 插件需要 page.json 文件，故应在 UniPages 插件之后执行
      UniOptimization({
        enable: isMpWeixin,
        dts: {
          base: "src/types"
        },
        logger: false
      }),
      // 若存在改变 pages.json 的插件，请将 UniKuRoot 放置其后
      UniKuRoot({
        excludePages: ["**/components/**/**.*", "**/sections/**/**.*"]
      }),
      Uni(),
      {
        // 临时解决 dcloudio 官方的 @dcloudio/uni-mp-compiler 出现的编译 BUG
        // 参考 github issue: https://github.com/dcloudio/uni-app/issues/4952
        // 自定义插件禁用 vite:vue 插件的 devToolsEnabled，强制编译 vue 模板时 inline 为 true
        name: "fix-vite-plugin-vue",
        configResolved(config) {
          const plugin = config.plugins.find((p) => p.name === "vite:vue");
          if (plugin && plugin.api && plugin.api.options) {
            plugin.api.options.devToolsEnabled = false;
          }
        }
      },
      UnoCSS(),
      AutoImport({
        imports: ["vue", "uni-app"],
        dts: "src/types/auto-import.d.ts",
        dirs: ["src/hooks"],
        // 自动导入 hooks
        vueTemplate: true
        // default false
      }),
      ViteRestart({
        // 通过这个插件，在修改vite.config.js文件则不需要重新运行也生效配置
        restart: ["vite.config.js"]
      }),
      // h5环境增加 BUILD_TIME 和 BUILD_BRANCH
      UNI_PLATFORM === "h5" && {
        name: "html-transform",
        transformIndexHtml(html) {
          return html.replace("%BUILD_TIME%", dayjs().format("YYYY-MM-DD HH:mm:ss")).replace("%VITE_APP_TITLE%", VITE_APP_TITLE);
        }
      },
      // 打包分析插件，h5 + 生产环境才弹出
      UNI_PLATFORM === "h5" && mode === "production" && visualizer({
        filename: "./node_modules/.cache/visualizer/stats.html",
        open: true,
        gzipSize: true,
        brotliSize: true
      }),
      // 原生插件资源复制插件 - 仅在 app 平台且启用时生效
      createCopyNativeResourcesPlugin(
        UNI_PLATFORM === "app" && VITE_COPY_NATIVE_RES_ENABLE === "true",
        {
          verbose: mode === "development"
          // 开发模式显示详细日志
        }
      ),
      syncManifestPlugin(),
      mpAtobPolyfillInject(),
      vitePluginEruda({
        open: UNI_PLATFORM === "h5" && mode === "development"
      }),
      // 自动打开开发者工具插件 (必须修改 .env 文件中的 VITE_WX_APPID)
      // 上传时通过 SKIP_OPEN_DEVTOOLS=true 跳过
      SKIP_OPEN_DEVTOOLS !== "true" && openDevTools({
        mode,
        wechatDevtoolsCliPath: WECHAT_DEVTOOLS_CLI_PATH,
        alipayDevtoolsPath: ALIPAY_DEVTOOLS_PATH
      })
    ],
    define: {
      __VITE_APP_PROXY__: JSON.stringify(VITE_APP_PROXY_ENABLE)
    },
    css: {
      postcss: {
        plugins: [
          // autoprefixer({
          //   // 指定目标浏览器
          //   overrideBrowserslist: ['> 1%', 'last 2 versions'],
          // }),
        ]
      }
    },
    resolve: {
      alias: {
        "@": path5.join(process5.cwd(), "./src"),
        "@img": path5.join(process5.cwd(), "./src/static/images")
      }
    },
    server: {
      host: "0.0.0.0",
      hmr: true,
      port: Number.parseInt(VITE_APP_PORT, 10),
      // 仅 H5 端生效，其他端不生效（其他端走build，不走devServer)
      proxy: JSON.parse(VITE_APP_PROXY_ENABLE) ? buildH5DevProxy() : void 0
    },
    esbuild: {
      drop: VITE_DELETE_CONSOLE === "true" ? ["console", "debugger"] : []
    },
    build: {
      sourcemap: false,
      // 方便非h5端调试
      // sourcemap: VITE_SHOW_SOURCEMAP === 'true', // 默认是false
      target: "es6",
      // 开发环境不用压缩
      minify: mode === "development" ? false : "esbuild"
    }
  });
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAid290LXVpLXJlc29sdmVyLnRzIiwgInNjcmlwdHMvb3Blbi1kZXYtdG9vbHMuanMiLCAic2NyaXB0cy92aXRlLXBsdWdpbi1lcnVkYS5qcyIsICJ2aXRlLXBsdWdpbnMvY29weS1uYXRpdmUtcmVzb3VyY2VzLnRzIiwgInZpdGUtcGx1Z2lucy9tcC1hdG9iLXBvbHlmaWxsLWluamVjdC50cyIsICJ2aXRlLXBsdWdpbnMvc3luYy1tYW5pZmVzdC1wbHVnaW5zLnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiRDpcXFxcc3R1ZHlcXFxcbXlHaXRodWJcXFxcYmxvZy1ob21lLXVuaWFwcFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRDpcXFxcc3R1ZHlcXFxcbXlHaXRodWJcXFxcYmxvZy1ob21lLXVuaWFwcFxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRDovc3R1ZHkvbXlHaXRodWIvYmxvZy1ob21lLXVuaWFwcC92aXRlLmNvbmZpZy50c1wiO2ltcG9ydCBwYXRoIGZyb20gJ25vZGU6cGF0aCdcclxuaW1wb3J0IHByb2Nlc3MgZnJvbSAnbm9kZTpwcm9jZXNzJ1xyXG5pbXBvcnQgVW5pIGZyb20gJ0B1bmktaGVscGVyL3BsdWdpbi11bmknXHJcbmltcG9ydCB7IGlzTXBXZWl4aW4gfSBmcm9tICdAdW5pLWhlbHBlci91bmktZW52J1xyXG5pbXBvcnQgVW5pQ29tcG9uZW50cyBmcm9tICdAdW5pLWhlbHBlci92aXRlLXBsdWdpbi11bmktY29tcG9uZW50cydcclxuLy8gQHNlZSBodHRwczovL3VuaS1oZWxwZXIuanMub3JnL3ZpdGUtcGx1Z2luLXVuaS1sYXlvdXRzXHJcbmltcG9ydCBVbmlMYXlvdXRzIGZyb20gJ0B1bmktaGVscGVyL3ZpdGUtcGx1Z2luLXVuaS1sYXlvdXRzJ1xyXG4vLyBAc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS91bmktaGVscGVyL3ZpdGUtcGx1Z2luLXVuaS1tYW5pZmVzdFxyXG5pbXBvcnQgVW5pTWFuaWZlc3QgZnJvbSAnQHVuaS1oZWxwZXIvdml0ZS1wbHVnaW4tdW5pLW1hbmlmZXN0J1xyXG4vLyBAc2VlIGh0dHBzOi8vdW5pLWhlbHBlci5qcy5vcmcvdml0ZS1wbHVnaW4tdW5pLXBhZ2VzXHJcbmltcG9ydCBVbmlQYWdlcyBmcm9tICdAdW5pLWhlbHBlci92aXRlLXBsdWdpbi11bmktcGFnZXMnXHJcbmltcG9ydCB7IFdvdFJlc29sdmVyIH0gZnJvbSAnLi93b3QtdWktcmVzb2x2ZXInXHJcbi8vIEBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3VuaS1oZWxwZXIvdml0ZS1wbHVnaW4tdW5pLXBsYXRmb3JtXHJcbi8vIFx1OTcwMFx1ODk4MVx1NEUwRSBAdW5pLWhlbHBlci92aXRlLXBsdWdpbi11bmktcGFnZXMgXHU2M0QyXHU0RUY2XHU0RTAwXHU4RDc3XHU0RjdGXHU3NTI4XHJcbmltcG9ydCBVbmlQbGF0Zm9ybSBmcm9tICdAdW5pLWhlbHBlci92aXRlLXBsdWdpbi11bmktcGxhdGZvcm0nXHJcblxyXG4vKipcclxuICogXHU1MjA2XHU1MzA1XHU0RjE4XHU1MzE2XHUzMDAxXHU2QTIxXHU1NzU3XHU1RjAyXHU2QjY1XHU4REU4XHU1MzA1XHU4QzAzXHU3NTI4XHUzMDAxXHU3RUM0XHU0RUY2XHU1RjAyXHU2QjY1XHU4REU4XHU1MzA1XHU1RjE1XHU3NTI4XHJcbiAqIEBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3VuaS1rdS9idW5kbGUtb3B0aW1pemVyXHJcbiAqL1xyXG5pbXBvcnQgVW5pT3B0aW1pemF0aW9uIGZyb20gJ0B1bmkta3UvYnVuZGxlLW9wdGltaXplcidcclxuLy8gaHR0cHM6Ly9naXRodWIuY29tL3VuaS1rdS9yb290XHJcbmltcG9ydCBVbmlLdVJvb3QgZnJvbSAnQHVuaS1rdS9yb290J1xyXG5pbXBvcnQgZGF5anMgZnJvbSAnZGF5anMnXHJcbmltcG9ydCB7IHZpc3VhbGl6ZXIgfSBmcm9tICdyb2xsdXAtcGx1Z2luLXZpc3VhbGl6ZXInXHJcbmltcG9ydCBVbm9DU1MgZnJvbSAndW5vY3NzL3ZpdGUnXHJcbmltcG9ydCBBdXRvSW1wb3J0IGZyb20gJ3VucGx1Z2luLWF1dG8taW1wb3J0L3ZpdGUnXHJcbmltcG9ydCB7IGRlZmluZUNvbmZpZywgbG9hZEVudiB9IGZyb20gJ3ZpdGUnXHJcbmltcG9ydCBWaXRlUmVzdGFydCBmcm9tICd2aXRlLXBsdWdpbi1yZXN0YXJ0J1xyXG5pbXBvcnQgb3BlbkRldlRvb2xzIGZyb20gJy4vc2NyaXB0cy9vcGVuLWRldi10b29scydcclxuaW1wb3J0IHZpdGVQbHVnaW5FcnVkYSBmcm9tICcuL3NjcmlwdHMvdml0ZS1wbHVnaW4tZXJ1ZGEnXHJcbmltcG9ydCB7IGNyZWF0ZUNvcHlOYXRpdmVSZXNvdXJjZXNQbHVnaW4gfSBmcm9tICcuL3ZpdGUtcGx1Z2lucy9jb3B5LW5hdGl2ZS1yZXNvdXJjZXMnXHJcbmltcG9ydCBtcEF0b2JQb2x5ZmlsbEluamVjdCBmcm9tICcuL3ZpdGUtcGx1Z2lucy9tcC1hdG9iLXBvbHlmaWxsLWluamVjdCdcclxuaW1wb3J0IHN5bmNNYW5pZmVzdFBsdWdpbiBmcm9tICcuL3ZpdGUtcGx1Z2lucy9zeW5jLW1hbmlmZXN0LXBsdWdpbnMnXHJcblxyXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHsgY29tbWFuZCwgbW9kZSB9KSA9PiB7XHJcbiAgLy8gQHNlZSBodHRwczovL3Vub2Nzcy5kZXYvXHJcbiAgLy8gY29uc3QgVW5vQ1NTID0gKGF3YWl0IGltcG9ydCgndW5vY3NzL3ZpdGUnKSkuZGVmYXVsdFxyXG4gIC8vIGNvbnNvbGUubG9nKG1vZGUgPT09IHByb2Nlc3MuZW52Lk5PREVfRU5WKSAvLyB0cnVlXHJcblxyXG4gIC8vIG1vZGU6IFx1NTMzQVx1NTIwNlx1NzUxRlx1NEVBN1x1NzNBRlx1NTg4M1x1OEZEOFx1NjYyRlx1NUYwMFx1NTNEMVx1NzNBRlx1NTg4M1xyXG4gIGNvbnNvbGUubG9nKCdjb21tYW5kLCBtb2RlIC0+ICcsIGNvbW1hbmQsIG1vZGUpXHJcbiAgLy8gcG5wbSBkZXY6aDUgXHU2NUY2XHU1Rjk3XHU1MjMwID0+IHNlcnZlIGRldmVsb3BtZW50XHJcbiAgLy8gcG5wbSBidWlsZDpoNSBcdTY1RjZcdTVGOTdcdTUyMzAgPT4gYnVpbGQgcHJvZHVjdGlvblxyXG4gIC8vIHBucG0gZGV2Om1wLXdlaXhpbiBcdTY1RjZcdTVGOTdcdTUyMzAgPT4gYnVpbGQgZGV2ZWxvcG1lbnQgKFx1NkNFOFx1NjEwRlx1NTMzQVx1NTIyQlx1RkYwQ2NvbW1hbmRcdTRFM0FidWlsZClcclxuICAvLyBwbnBtIGJ1aWxkOm1wLXdlaXhpbiBcdTY1RjZcdTVGOTdcdTUyMzAgPT4gYnVpbGQgcHJvZHVjdGlvblxyXG4gIC8vIHBucG0gZGV2OmFwcCBcdTY1RjZcdTVGOTdcdTUyMzAgPT4gYnVpbGQgZGV2ZWxvcG1lbnQgKFx1NkNFOFx1NjEwRlx1NTMzQVx1NTIyQlx1RkYwQ2NvbW1hbmRcdTRFM0FidWlsZClcclxuICAvLyBwbnBtIGJ1aWxkOmFwcCBcdTY1RjZcdTVGOTdcdTUyMzAgPT4gYnVpbGQgcHJvZHVjdGlvblxyXG4gIC8vIGRldiBcdTU0OEMgYnVpbGQgXHU1NDdEXHU0RUU0XHU1M0VGXHU0RUU1XHU1MjA2XHU1MjJCXHU0RjdGXHU3NTI4IC5lbnYuZGV2ZWxvcG1lbnQgXHU1NDhDIC5lbnYucHJvZHVjdGlvbiBcdTc2ODRcdTczQUZcdTU4ODNcdTUzRDhcdTkxQ0ZcclxuICAvLyBcdTk3NUUgSDUgXHU3QUVGIGRldiBcdTRFNUZcdTY2MkYgYnVpbGQgY29tbWFuZFx1RkYwQ1x1NjcwMFx1N0VDOFx1NTJBMFx1OEY3RFx1NTRFQVx1NEUyQSBlbnYgXHU2NTg3XHU0RUY2XHU0RUU1XHU1QjlFXHU5NjQ1IG1vZGUgXHU0RTNBXHU1MUM2XHUzMDAyXHJcblxyXG4gIGNvbnN0IHsgVU5JX1BMQVRGT1JNLCBTS0lQX09QRU5fREVWVE9PTFMgfSA9IHByb2Nlc3MuZW52XHJcbiAgY29uc29sZS5sb2coJ1VOSV9QTEFURk9STSAtPiAnLCBVTklfUExBVEZPUk0pIC8vIFx1NUY5N1x1NTIzMCBtcC13ZWl4aW4sIGg1LCBhcHAgXHU3QjQ5XHJcblxyXG4gIGNvbnN0IGVudkRpciA9IHBhdGgucmVzb2x2ZShwcm9jZXNzLmN3ZCgpLCAnZW52JylcclxuICBjb25zdCBlbnYgPSBsb2FkRW52KG1vZGUsIGVudkRpcilcclxuICBjb25zdCBsb2NhbEVudiA9IGxvYWRFbnYobW9kZSwgZW52RGlyLCAnJylcclxuICBjb25zdCB7XHJcbiAgICBWSVRFX0FQUF9QT1JULFxyXG4gICAgVklURV9TRVJWRVJfQkFTRVVSTCxcclxuICAgIFZJVEVfQVBQX1RJVExFLFxyXG4gICAgVklURV9ERUxFVEVfQ09OU09MRSxcclxuICAgIFZJVEVfQVBQX1BVQkxJQ19CQVNFLFxyXG4gICAgVklURV9BUFBfUFJPWFlfRU5BQkxFLFxyXG4gICAgVklURV9BUFBfUFJPWFlfUFJFRklYLFxyXG4gICAgVklURV9XU19PUklHSU4sXHJcbiAgICBWSVRFX0NPUFlfTkFUSVZFX1JFU19FTkFCTEUsXHJcbiAgfSA9IGVudlxyXG4gIGNvbnN0IHsgV0VDSEFUX0RFVlRPT0xTX0NMSV9QQVRILCBBTElQQVlfREVWVE9PTFNfUEFUSCB9ID0gbG9jYWxFbnZcclxuICBjb25zb2xlLmxvZygnXHU3M0FGXHU1ODgzXHU1M0Q4XHU5MUNGIGVudiAtPiAnLCBlbnYpXHJcblxyXG4gIC8qKiBINSBkZXZTZXJ2ZXIgXHU0RUUzXHU3NDA2XHVGRjFBXHU2MkZDXHU1QjhDXHU2NTc0IEFQSSBcdThERUZcdTVGODRcdUZGMDhcdTUxN0NcdTVCQjkgL2FwaS92MSBcdTRFMEUgL3gtYmxvZy9hcGkvdjFcdUZGMDkgKi9cclxuICBmdW5jdGlvbiBidWlsZEg1RGV2UHJveHkoKSB7XHJcbiAgICBjb25zdCBhcGlVcmwgPSBuZXcgVVJMKFZJVEVfU0VSVkVSX0JBU0VVUkwpXHJcbiAgICBjb25zdCBhcGlQYXRoUHJlZml4ID0gYXBpVXJsLnBhdGhuYW1lLnJlcGxhY2UoL1xcLyQvLCAnJylcclxuICAgIGNvbnN0IHpvbmVPcmlnaW4gPSAoVklURV9XU19PUklHSU4gfHwgYXBpVXJsLm9yaWdpbikucmVwbGFjZSgvXFwvJC8sICcnKVxyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgIFtWSVRFX0FQUF9QUk9YWV9QUkVGSVhdOiB7XHJcbiAgICAgICAgdGFyZ2V0OiBhcGlVcmwub3JpZ2luLFxyXG4gICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcclxuICAgICAgICByZXdyaXRlOiAocDogc3RyaW5nKSA9PiBhcGlQYXRoUHJlZml4ICsgcC5yZXBsYWNlKG5ldyBSZWdFeHAoYF4ke1ZJVEVfQVBQX1BST1hZX1BSRUZJWH1gKSwgJycpLFxyXG4gICAgICB9LFxyXG4gICAgICAnL3gtem9uZSc6IHtcclxuICAgICAgICB0YXJnZXQ6IHpvbmVPcmlnaW4sXHJcbiAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxyXG4gICAgICB9LFxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIGRlZmluZUNvbmZpZyh7XHJcbiAgICBlbnZEaXI6ICcuL2VudicsIC8vIFx1ODFFQVx1NUI5QVx1NEU0OWVudlx1NzZFRVx1NUY1NVxyXG4gICAgYmFzZTogVklURV9BUFBfUFVCTElDX0JBU0UsXHJcbiAgICBwbHVnaW5zOiBbXHJcbiAgICAgIC8vIFVuaVhYWCBcdTk3MDBcdTg5ODFcdTU3MjggVW5pIFx1NEU0Qlx1NTI0RFx1NUYxNVx1NTE2NVxyXG4gICAgICBVbmlMYXlvdXRzKCksXHJcbiAgICAgIFVuaVBsYXRmb3JtKCksXHJcbiAgICAgIFVuaU1hbmlmZXN0KCksXHJcbiAgICAgIFVuaUNvbXBvbmVudHMoe1xyXG4gICAgICAgIGV4dGVuc2lvbnM6IFsndnVlJ10sXHJcbiAgICAgICAgZGVlcDogdHJ1ZSwgLy8gXHU2NjJGXHU1NDI2XHU5MDEyXHU1RjUyXHU2MjZCXHU2M0NGXHU1QjUwXHU3NkVFXHU1RjU1XHVGRjBDXHJcbiAgICAgICAgZGlyZWN0b3J5QXNOYW1lc3BhY2U6IGZhbHNlLCAvLyBcdTY2MkZcdTU0MjZcdTYyOEFcdTc2RUVcdTVGNTVcdTU0MERcdTRGNUNcdTRFM0FcdTU0N0RcdTU0MERcdTdBN0FcdTk1RjRcdTUyNERcdTdGMDBcdUZGMEN0cnVlIFx1NjVGNlx1N0VDNFx1NEVGNlx1NTQwRFx1NEUzQSBcdTc2RUVcdTVGNTVcdTU0MEQrXHU3RUM0XHU0RUY2XHU1NDBEXHVGRjBDXHJcbiAgICAgICAgZHRzOiAnc3JjL3R5cGVzL2NvbXBvbmVudHMuZC50cycsIC8vIFx1ODFFQVx1NTJBOFx1NzUxRlx1NjIxMFx1NzY4NFx1N0VDNFx1NEVGNlx1N0M3Qlx1NTc4Qlx1NThGMFx1NjYwRVx1NjU4N1x1NEVGNlx1OERFRlx1NUY4NFx1RkYwOFx1NzUyOFx1NEU4RSBUeXBlU2NyaXB0IFx1NjUyRlx1NjMwMVx1RkYwOVxyXG4gICAgICAgIHJlc29sdmVyczogW1dvdFJlc29sdmVyKCldLFxyXG4gICAgICB9KSxcclxuICAgICAgVW5pUGFnZXMoe1xyXG4gICAgICAgIGV4Y2x1ZGU6IFsnKiovY29tcG9uZW50cy8qKi8qKi4qJywgJyoqL3NlY3Rpb25zLyoqLyoqLionXSxcclxuICAgICAgICAvLyBwYWdlcyBcdTc2RUVcdTVGNTVcdTRFM0Egc3JjL3BhZ2VzXHVGRjBDXHU1MjA2XHU1MzA1XHU3NkVFXHU1RjU1XHU0RTBEXHU4MEZEXHU5MTREXHU3RjZFXHU1NzI4cGFnZXNcdTc2RUVcdTVGNTVcdTRFMEJcdUZGMDFcdUZGMDFcclxuICAgICAgICAvLyBcdTY2MkZcdTRFMkFcdTY1NzBcdTdFQzRcdUZGMENcdTUzRUZcdTRFRTVcdTkxNERcdTdGNkVcdTU5MUFcdTRFMkFcdUZGMENcdTRGNDZcdTY2MkZcdTRFMERcdTgwRkRcdTRFM0FwYWdlc1x1OTFDQ1x1OTc2Mlx1NzY4NFx1NzZFRVx1NUY1NVx1RkYwMVx1RkYwMVxyXG4gICAgICAgIHN1YlBhY2thZ2VzOiBbJ3NyYy9wYWdlcy1ibG9nJywgJ3NyYy9wYWdlcy1ycGcnLCAnc3JjL3BhZ2VzLXRvb2wnXSxcclxuICAgICAgICBkdHM6ICdzcmMvdHlwZXMvdW5pLXBhZ2VzLmQudHMnLFxyXG4gICAgICB9KSxcclxuICAgICAgLy8gVW5pT3B0aW1pemF0aW9uIFx1NjNEMlx1NEVGNlx1OTcwMFx1ODk4MSBwYWdlLmpzb24gXHU2NTg3XHU0RUY2XHVGRjBDXHU2NTQ1XHU1RTk0XHU1NzI4IFVuaVBhZ2VzIFx1NjNEMlx1NEVGNlx1NEU0Qlx1NTQwRVx1NjI2N1x1ODg0Q1xyXG4gICAgICBVbmlPcHRpbWl6YXRpb24oe1xyXG4gICAgICAgIGVuYWJsZTogaXNNcFdlaXhpbixcclxuICAgICAgICBkdHM6IHtcclxuICAgICAgICAgIGJhc2U6ICdzcmMvdHlwZXMnLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgbG9nZ2VyOiBmYWxzZSxcclxuICAgICAgfSksXHJcbiAgICAgIC8vIFx1ODJFNVx1NUI1OFx1NTcyOFx1NjUzOVx1NTNEOCBwYWdlcy5qc29uIFx1NzY4NFx1NjNEMlx1NEVGNlx1RkYwQ1x1OEJGN1x1NUMwNiBVbmlLdVJvb3QgXHU2NTNFXHU3RjZFXHU1MTc2XHU1NDBFXHJcbiAgICAgIFVuaUt1Um9vdCh7XHJcbiAgICAgICAgZXhjbHVkZVBhZ2VzOiBbJyoqL2NvbXBvbmVudHMvKiovKiouKicsICcqKi9zZWN0aW9ucy8qKi8qKi4qJ10sXHJcbiAgICAgIH0pLFxyXG4gICAgICBVbmkoKSxcclxuICAgICAge1xyXG4gICAgICAgIC8vIFx1NEUzNFx1NjVGNlx1ODlFM1x1NTFCMyBkY2xvdWRpbyBcdTVCOThcdTY1QjlcdTc2ODQgQGRjbG91ZGlvL3VuaS1tcC1jb21waWxlciBcdTUxRkFcdTczQjBcdTc2ODRcdTdGMTZcdThCRDEgQlVHXHJcbiAgICAgICAgLy8gXHU1M0MyXHU4MDAzIGdpdGh1YiBpc3N1ZTogaHR0cHM6Ly9naXRodWIuY29tL2RjbG91ZGlvL3VuaS1hcHAvaXNzdWVzLzQ5NTJcclxuICAgICAgICAvLyBcdTgxRUFcdTVCOUFcdTRFNDlcdTYzRDJcdTRFRjZcdTc5ODFcdTc1Mjggdml0ZTp2dWUgXHU2M0QyXHU0RUY2XHU3Njg0IGRldlRvb2xzRW5hYmxlZFx1RkYwQ1x1NUYzQVx1NTIzNlx1N0YxNlx1OEJEMSB2dWUgXHU2QTIxXHU2NzdGXHU2NUY2IGlubGluZSBcdTRFM0EgdHJ1ZVxyXG4gICAgICAgIG5hbWU6ICdmaXgtdml0ZS1wbHVnaW4tdnVlJyxcclxuICAgICAgICBjb25maWdSZXNvbHZlZChjb25maWcpIHtcclxuICAgICAgICAgIGNvbnN0IHBsdWdpbiA9IGNvbmZpZy5wbHVnaW5zLmZpbmQocCA9PiBwLm5hbWUgPT09ICd2aXRlOnZ1ZScpXHJcbiAgICAgICAgICBpZiAocGx1Z2luICYmIHBsdWdpbi5hcGkgJiYgcGx1Z2luLmFwaS5vcHRpb25zKSB7XHJcbiAgICAgICAgICAgIHBsdWdpbi5hcGkub3B0aW9ucy5kZXZUb29sc0VuYWJsZWQgPSBmYWxzZVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgIH0sXHJcbiAgICAgIFVub0NTUygpLFxyXG4gICAgICBBdXRvSW1wb3J0KHtcclxuICAgICAgICBpbXBvcnRzOiBbJ3Z1ZScsICd1bmktYXBwJ10sXHJcbiAgICAgICAgZHRzOiAnc3JjL3R5cGVzL2F1dG8taW1wb3J0LmQudHMnLFxyXG4gICAgICAgIGRpcnM6IFsnc3JjL2hvb2tzJ10sIC8vIFx1ODFFQVx1NTJBOFx1NUJGQ1x1NTE2NSBob29rc1xyXG4gICAgICAgIHZ1ZVRlbXBsYXRlOiB0cnVlLCAvLyBkZWZhdWx0IGZhbHNlXHJcbiAgICAgIH0pLFxyXG4gICAgICBWaXRlUmVzdGFydCh7XHJcbiAgICAgICAgLy8gXHU5MDFBXHU4RkM3XHU4RkQ5XHU0RTJBXHU2M0QyXHU0RUY2XHVGRjBDXHU1NzI4XHU0RkVFXHU2NTM5dml0ZS5jb25maWcuanNcdTY1ODdcdTRFRjZcdTUyMTlcdTRFMERcdTk3MDBcdTg5ODFcdTkxQ0RcdTY1QjBcdThGRDBcdTg4NENcdTRFNUZcdTc1MUZcdTY1NDhcdTkxNERcdTdGNkVcclxuICAgICAgICByZXN0YXJ0OiBbJ3ZpdGUuY29uZmlnLmpzJ10sXHJcbiAgICAgIH0pLFxyXG4gICAgICAvLyBoNVx1NzNBRlx1NTg4M1x1NTg5RVx1NTJBMCBCVUlMRF9USU1FIFx1NTQ4QyBCVUlMRF9CUkFOQ0hcclxuICAgICAgVU5JX1BMQVRGT1JNID09PSAnaDUnICYmIHtcclxuICAgICAgICBuYW1lOiAnaHRtbC10cmFuc2Zvcm0nLFxyXG4gICAgICAgIHRyYW5zZm9ybUluZGV4SHRtbChodG1sKSB7XHJcbiAgICAgICAgICByZXR1cm4gaHRtbFxyXG4gICAgICAgICAgICAucmVwbGFjZSgnJUJVSUxEX1RJTUUlJywgZGF5anMoKS5mb3JtYXQoJ1lZWVktTU0tREQgSEg6bW06c3MnKSlcclxuICAgICAgICAgICAgLnJlcGxhY2UoJyVWSVRFX0FQUF9USVRMRSUnLCBWSVRFX0FQUF9USVRMRSlcclxuICAgICAgICB9LFxyXG4gICAgICB9LFxyXG4gICAgICAvLyBcdTYyNTNcdTUzMDVcdTUyMDZcdTY3OTBcdTYzRDJcdTRFRjZcdUZGMENoNSArIFx1NzUxRlx1NEVBN1x1NzNBRlx1NTg4M1x1NjI0RFx1NUYzOVx1NTFGQVxyXG4gICAgICBVTklfUExBVEZPUk0gPT09ICdoNSdcclxuICAgICAgJiYgbW9kZSA9PT0gJ3Byb2R1Y3Rpb24nXHJcbiAgICAgICYmIHZpc3VhbGl6ZXIoe1xyXG4gICAgICAgIGZpbGVuYW1lOiAnLi9ub2RlX21vZHVsZXMvLmNhY2hlL3Zpc3VhbGl6ZXIvc3RhdHMuaHRtbCcsXHJcbiAgICAgICAgb3BlbjogdHJ1ZSxcclxuICAgICAgICBnemlwU2l6ZTogdHJ1ZSxcclxuICAgICAgICBicm90bGlTaXplOiB0cnVlLFxyXG4gICAgICB9KSxcclxuICAgICAgLy8gXHU1MzlGXHU3NTFGXHU2M0QyXHU0RUY2XHU4RDQ0XHU2RTkwXHU1OTBEXHU1MjM2XHU2M0QyXHU0RUY2IC0gXHU0RUM1XHU1NzI4IGFwcCBcdTVFNzNcdTUzRjBcdTRFMTRcdTU0MkZcdTc1MjhcdTY1RjZcdTc1MUZcdTY1NDhcclxuICAgICAgY3JlYXRlQ29weU5hdGl2ZVJlc291cmNlc1BsdWdpbihcclxuICAgICAgICBVTklfUExBVEZPUk0gPT09ICdhcHAnICYmIFZJVEVfQ09QWV9OQVRJVkVfUkVTX0VOQUJMRSA9PT0gJ3RydWUnLFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIHZlcmJvc2U6IG1vZGUgPT09ICdkZXZlbG9wbWVudCcsIC8vIFx1NUYwMFx1NTNEMVx1NkEyMVx1NUYwRlx1NjYzRVx1NzkzQVx1OEJFNlx1N0VDNlx1NjVFNVx1NUZEN1xyXG4gICAgICAgIH0sXHJcbiAgICAgICksXHJcbiAgICAgIHN5bmNNYW5pZmVzdFBsdWdpbigpLFxyXG4gICAgICBtcEF0b2JQb2x5ZmlsbEluamVjdCgpLFxyXG4gICAgICB2aXRlUGx1Z2luRXJ1ZGEoe1xyXG4gICAgICAgIG9wZW46IFVOSV9QTEFURk9STSA9PT0gJ2g1JyAmJiBtb2RlID09PSAnZGV2ZWxvcG1lbnQnLFxyXG4gICAgICB9KSxcclxuICAgICAgLy8gXHU4MUVBXHU1MkE4XHU2MjUzXHU1RjAwXHU1RjAwXHU1M0QxXHU4MDA1XHU1REU1XHU1MTc3XHU2M0QyXHU0RUY2IChcdTVGQzVcdTk4N0JcdTRGRUVcdTY1MzkgLmVudiBcdTY1ODdcdTRFRjZcdTRFMkRcdTc2ODQgVklURV9XWF9BUFBJRClcclxuICAgICAgLy8gXHU0RTBBXHU0RjIwXHU2NUY2XHU5MDFBXHU4RkM3IFNLSVBfT1BFTl9ERVZUT09MUz10cnVlIFx1OERGM1x1OEZDN1xyXG4gICAgICBTS0lQX09QRU5fREVWVE9PTFMgIT09ICd0cnVlJyAmJiBvcGVuRGV2VG9vbHMoe1xyXG4gICAgICAgIG1vZGUsXHJcbiAgICAgICAgd2VjaGF0RGV2dG9vbHNDbGlQYXRoOiBXRUNIQVRfREVWVE9PTFNfQ0xJX1BBVEgsXHJcbiAgICAgICAgYWxpcGF5RGV2dG9vbHNQYXRoOiBBTElQQVlfREVWVE9PTFNfUEFUSCxcclxuICAgICAgfSksXHJcbiAgICBdLFxyXG4gICAgZGVmaW5lOiB7XHJcbiAgICAgIF9fVklURV9BUFBfUFJPWFlfXzogSlNPTi5zdHJpbmdpZnkoVklURV9BUFBfUFJPWFlfRU5BQkxFKSxcclxuICAgIH0sXHJcbiAgICBjc3M6IHtcclxuICAgICAgcG9zdGNzczoge1xyXG4gICAgICAgIHBsdWdpbnM6IFtcclxuICAgICAgICAgIC8vIGF1dG9wcmVmaXhlcih7XHJcbiAgICAgICAgICAvLyAgIC8vIFx1NjMwN1x1NUI5QVx1NzZFRVx1NjgwN1x1NkQ0Rlx1ODlDOFx1NTY2OFxyXG4gICAgICAgICAgLy8gICBvdmVycmlkZUJyb3dzZXJzbGlzdDogWyc+IDElJywgJ2xhc3QgMiB2ZXJzaW9ucyddLFxyXG4gICAgICAgICAgLy8gfSksXHJcbiAgICAgICAgXSxcclxuICAgICAgfSxcclxuICAgIH0sXHJcblxyXG4gICAgcmVzb2x2ZToge1xyXG4gICAgICBhbGlhczoge1xyXG4gICAgICAgICdAJzogcGF0aC5qb2luKHByb2Nlc3MuY3dkKCksICcuL3NyYycpLFxyXG4gICAgICAgICdAaW1nJzogcGF0aC5qb2luKHByb2Nlc3MuY3dkKCksICcuL3NyYy9zdGF0aWMvaW1hZ2VzJyksXHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAgc2VydmVyOiB7XHJcbiAgICAgIGhvc3Q6ICcwLjAuMC4wJyxcclxuICAgICAgaG1yOiB0cnVlLFxyXG4gICAgICBwb3J0OiBOdW1iZXIucGFyc2VJbnQoVklURV9BUFBfUE9SVCwgMTApLFxyXG4gICAgICAvLyBcdTRFQzUgSDUgXHU3QUVGXHU3NTFGXHU2NTQ4XHVGRjBDXHU1MTc2XHU0RUQ2XHU3QUVGXHU0RTBEXHU3NTFGXHU2NTQ4XHVGRjA4XHU1MTc2XHU0RUQ2XHU3QUVGXHU4RDcwYnVpbGRcdUZGMENcdTRFMERcdThENzBkZXZTZXJ2ZXIpXHJcbiAgICAgIHByb3h5OiBKU09OLnBhcnNlKFZJVEVfQVBQX1BST1hZX0VOQUJMRSlcclxuICAgICAgICA/IGJ1aWxkSDVEZXZQcm94eSgpXHJcbiAgICAgICAgOiB1bmRlZmluZWQsXHJcbiAgICB9LFxyXG4gICAgZXNidWlsZDoge1xyXG4gICAgICBkcm9wOiBWSVRFX0RFTEVURV9DT05TT0xFID09PSAndHJ1ZScgPyBbJ2NvbnNvbGUnLCAnZGVidWdnZXInXSA6IFtdLFxyXG4gICAgfSxcclxuICAgIGJ1aWxkOiB7XHJcbiAgICAgIHNvdXJjZW1hcDogZmFsc2UsXHJcbiAgICAgIC8vIFx1NjVCOVx1NEZCRlx1OTc1RWg1XHU3QUVGXHU4QzAzXHU4QkQ1XHJcbiAgICAgIC8vIHNvdXJjZW1hcDogVklURV9TSE9XX1NPVVJDRU1BUCA9PT0gJ3RydWUnLCAvLyBcdTlFRDhcdThCQTRcdTY2MkZmYWxzZVxyXG4gICAgICB0YXJnZXQ6ICdlczYnLFxyXG4gICAgICAvLyBcdTVGMDBcdTUzRDFcdTczQUZcdTU4ODNcdTRFMERcdTc1MjhcdTUzOEJcdTdGMjlcclxuICAgICAgbWluaWZ5OiBtb2RlID09PSAnZGV2ZWxvcG1lbnQnID8gZmFsc2UgOiAnZXNidWlsZCcsXHJcbiAgICB9LFxyXG4gIH0pXHJcbn0pXHJcbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiRDpcXFxcc3R1ZHlcXFxcbXlHaXRodWJcXFxcYmxvZy1ob21lLXVuaWFwcFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRDpcXFxcc3R1ZHlcXFxcbXlHaXRodWJcXFxcYmxvZy1ob21lLXVuaWFwcFxcXFx3b3QtdWktcmVzb2x2ZXIudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Q6L3N0dWR5L215R2l0aHViL2Jsb2ctaG9tZS11bmlhcHAvd290LXVpLXJlc29sdmVyLnRzXCI7aW1wb3J0IHR5cGUgeyBDb21wb25lbnRSZXNvbHZlciB9IGZyb20gJ0B1bmktaGVscGVyL3ZpdGUtcGx1Z2luLXVuaS1jb21wb25lbnRzJ1xuaW1wb3J0IHsga2ViYWJDYXNlIH0gZnJvbSAnQHVuaS1oZWxwZXIvdml0ZS1wbHVnaW4tdW5pLWNvbXBvbmVudHMnXG5cbi8qKlxuICogbnBtIFx1NUI4OVx1ODhDNVx1NzY4NCBXb3QgVUkgXHU3RUM0XHU0RUY2XHU1NzI4IEg1IFx1N0FFRlx1OTcwMFx1OTAxQVx1OEZDNyB2aXRlLXBsdWdpbi11bmktY29tcG9uZW50cyBcdTg5RTNcdTY3OTBcdUZGMENcbiAqIFx1NjI0RFx1ODBGRFx1NkI2M1x1Nzg2RVx1NjMwMlx1OEY3RFx1N0VDNFx1NEVGNlx1NjgzN1x1NUYwRlx1MzAwMlxuICovXG5leHBvcnQgZnVuY3Rpb24gV290UmVzb2x2ZXIoKTogQ29tcG9uZW50UmVzb2x2ZXIge1xuICByZXR1cm4ge1xuICAgIHR5cGU6ICdjb21wb25lbnQnLFxuICAgIHJlc29sdmU6IChuYW1lOiBzdHJpbmcpID0+IHtcbiAgICAgIGlmIChuYW1lLm1hdGNoKC9eV2RbQS1aXS8pKSB7XG4gICAgICAgIGNvbnN0IGNvbXBOYW1lID0ga2ViYWJDYXNlKG5hbWUpXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgbmFtZSxcbiAgICAgICAgICBmcm9tOiBgQHdvdC11aS91aS9jb21wb25lbnRzLyR7Y29tcE5hbWV9LyR7Y29tcE5hbWV9LnZ1ZWAsXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChuYW1lLnN0YXJ0c1dpdGgoJ3dkLScpKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgbmFtZSxcbiAgICAgICAgICBmcm9tOiBgQHdvdC11aS91aS9jb21wb25lbnRzLyR7bmFtZX0vJHtuYW1lfS52dWVgLFxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgfVxufVxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxzdHVkeVxcXFxteUdpdGh1YlxcXFxibG9nLWhvbWUtdW5pYXBwXFxcXHNjcmlwdHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkQ6XFxcXHN0dWR5XFxcXG15R2l0aHViXFxcXGJsb2ctaG9tZS11bmlhcHBcXFxcc2NyaXB0c1xcXFxvcGVuLWRldi10b29scy5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRDovc3R1ZHkvbXlHaXRodWIvYmxvZy1ob21lLXVuaWFwcC9zY3JpcHRzL29wZW4tZGV2LXRvb2xzLmpzXCI7aW1wb3J0IHsgZXhlYyB9IGZyb20gJ25vZGU6Y2hpbGRfcHJvY2VzcydcclxuaW1wb3J0IGZzIGZyb20gJ25vZGU6ZnMnXHJcbmltcG9ydCBwYXRoIGZyb20gJ25vZGU6cGF0aCdcclxuaW1wb3J0IHByb2Nlc3MgZnJvbSAnbm9kZTpwcm9jZXNzJ1xyXG5cclxuLyoqXHJcbiAqIFx1NjI1M1x1NUYwMFx1NUYwMFx1NTNEMVx1ODAwNVx1NURFNVx1NTE3N1xyXG4gKiBAcGFyYW0ge3N0cmluZ30gZW52IC0gXHU3M0FGXHU1ODgzXHVGRjBDJ2RldicgXHU2MjE2ICdidWlsZCdcclxuICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMgLSBcdTkxNERcdTdGNkVcdTkwMDlcdTk4NzlcclxuICogQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMud2VjaGF0RGV2dG9vbHNDbGlQYXRoIC0gXHU1RkFFXHU0RkUxXHU1RjAwXHU1M0QxXHU4MDA1XHU1REU1XHU1MTc3IENMSSBcdThERUZcdTVGODRcclxuICogQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMuYWxpcGF5RGV2dG9vbHNQYXRoIC0gXHU2NTJGXHU0RUQ4XHU1QjlEXHU1QzBGXHU3QTBCXHU1RThGXHU1RjAwXHU1M0QxXHU4MDA1XHU1REU1XHU1MTc3XHU1Qjg5XHU4OEM1XHU3NkVFXHU1RjU1XHJcbiAqL1xyXG5mdW5jdGlvbiBfb3BlbkRldlRvb2xzKGVudiA9ICdkZXYnLCBvcHRpb25zID0ge30pIHtcclxuICBjb25zdCB7IHdlY2hhdERldnRvb2xzQ2xpUGF0aCwgYWxpcGF5RGV2dG9vbHNQYXRoIH0gPSBvcHRpb25zXHJcbiAgY29uc3QgcGxhdGZvcm0gPSBwcm9jZXNzLnBsYXRmb3JtIC8vIGRhcndpbiwgd2luMzIsIGxpbnV4XHJcbiAgY29uc3QgeyBVTklfUExBVEZPUk0gfSA9IHByb2Nlc3MuZW52IC8vICBtcC13ZWl4aW4sIG1wLWFsaXBheSwgbXAtbGFya1xyXG5cclxuICBjb25zdCB1bmlQbGF0Zm9ybVRleHQgPSBVTklfUExBVEZPUk0gPT09ICdtcC13ZWl4aW4nID8gJ1x1NUZBRVx1NEZFMVx1NUMwRlx1N0EwQlx1NUU4RicgOiBVTklfUExBVEZPUk0gPT09ICdtcC1hbGlwYXknID8gJ1x1NjUyRlx1NEVEOFx1NUI5RFx1NUMwRlx1N0EwQlx1NUU4RicgOiBVTklfUExBVEZPUk0gPT09ICdtcC1sYXJrJyA/ICdcdTYyOTZcdTk3RjNcdTVDMEZcdTdBMEJcdTVFOEYnIDogJ1x1NUMwRlx1N0EwQlx1NUU4RidcclxuXHJcbiAgLy8gXHU5ODc5XHU3NkVFXHU4REVGXHU1Rjg0XHVGRjA4XHU2Nzg0XHU1RUZBXHU4RjkzXHU1MUZBXHU3NkVFXHU1RjU1XHVGRjA5XHVGRjBDXHU2ODM5XHU2MzZFXHU3M0FGXHU1ODgzXHU5MDA5XHU2MkU5XHU0RTBEXHU1NDBDXHU3NkVFXHU1RjU1XHJcbiAgY29uc3Qgb3V0cHV0RGlyID0gZW52ID09PSAnYnVpbGQnID8gYGRpc3QvYnVpbGQvJHtVTklfUExBVEZPUk19YCA6IGBkaXN0L2Rldi8ke1VOSV9QTEFURk9STX1gXHJcbiAgY29uc3QgcHJvamVjdFBhdGggPSBwYXRoLnJlc29sdmUocHJvY2Vzcy5jd2QoKSwgb3V0cHV0RGlyKVxyXG5cclxuICAvLyBcdTY4QzBcdTY3RTVcdTY3ODRcdTVFRkFcdThGOTNcdTUxRkFcdTc2RUVcdTVGNTVcdTY2MkZcdTU0MjZcdTVCNThcdTU3MjhcclxuICBpZiAoIWZzLmV4aXN0c1N5bmMocHJvamVjdFBhdGgpKSB7XHJcbiAgICBjb25zb2xlLmxvZyhgXHUyNzRDICR7dW5pUGxhdGZvcm1UZXh0fVx1Njc4NFx1NUVGQVx1NzZFRVx1NUY1NVx1NEUwRFx1NUI1OFx1NTcyODpgLCBwcm9qZWN0UGF0aClcclxuICAgIHJldHVyblxyXG4gIH1cclxuXHJcbiAgY29uc29sZS5sb2coYFx1RDgzRFx1REU4MCBcdTZCNjNcdTU3MjhcdTYyNTNcdTVGMDAke3VuaVBsYXRmb3JtVGV4dH1cdTVGMDBcdTUzRDFcdTgwMDVcdTVERTVcdTUxNzcuLi5gKVxyXG5cclxuICAvLyBcdTY4MzlcdTYzNkVcdTRFMERcdTU0MENcdTY0Q0RcdTRGNUNcdTdDRkJcdTdFREZcdTYyNjdcdTg4NENcdTRFMERcdTU0MENcdTU0N0RcdTRFRTRcclxuICBsZXQgY29tbWFuZCA9ICcnXHJcblxyXG4gIGlmIChwbGF0Zm9ybSA9PT0gJ2RhcndpbicpIHtcclxuICAgIC8vIG1hY09TXHJcbiAgICBpZiAoVU5JX1BMQVRGT1JNID09PSAnbXAtd2VpeGluJykge1xyXG4gICAgICBjb25zdCBjbGlQYXRoID0gd2VjaGF0RGV2dG9vbHNDbGlQYXRoIHx8ICcvQXBwbGljYXRpb25zL3dlY2hhdHdlYmRldnRvb2xzLmFwcC9Db250ZW50cy9NYWNPUy9jbGknXHJcbiAgICAgIGNvbW1hbmQgPSBgXCIke2NsaVBhdGh9XCIgLW8gXCIke3Byb2plY3RQYXRofVwiYFxyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoVU5JX1BMQVRGT1JNID09PSAnbXAtYWxpcGF5Jykge1xyXG4gICAgICBjb25zdCBhcHBQYXRoID0gYWxpcGF5RGV2dG9vbHNQYXRoIHx8ICcvQXBwbGljYXRpb25zL1x1NUMwRlx1N0EwQlx1NUU4Rlx1NUYwMFx1NTNEMVx1ODAwNVx1NURFNVx1NTE3Ny5hcHAvQ29udGVudHMvTWFjT1MvXHU1QzBGXHU3QTBCXHU1RThGXHU1RjAwXHU1M0QxXHU4MDA1XHU1REU1XHU1MTc3J1xyXG4gICAgICBjb21tYW5kID0gYFwiJHthcHBQYXRofVwiIC0tcCBcIiR7cHJvamVjdFBhdGh9XCJgXHJcbiAgICB9XHJcbiAgICBlbHNlIGlmIChVTklfUExBVEZPUk0gPT09ICdtcC1sYXJrJykge1xyXG4gICAgICBjb21tYW5kID0gYC9BcHBsaWNhdGlvbnMvXHU2Mjk2XHU5N0YzXHU1RjAwXHU1M0QxXHU4MDA1XHU1REU1XHU1MTc3LmFwcC9Db250ZW50cy9NYWNPUy9cdTYyOTZcdTk3RjNcdTVGMDBcdTUzRDFcdTgwMDVcdTVERTVcdTUxNzcgLS1wIFwiJHtwcm9qZWN0UGF0aH1cImBcclxuICAgIH1cclxuICB9XHJcbiAgZWxzZSBpZiAocGxhdGZvcm0gPT09ICd3aW4zMicgfHwgcGxhdGZvcm0gPT09ICd3aW42NCcpIHtcclxuICAgIC8vIFdpbmRvd3NcclxuICAgIGlmIChVTklfUExBVEZPUk0gPT09ICdtcC13ZWl4aW4nKSB7XHJcbiAgICAgIGNvbnN0IGNsaVBhdGggPSB3ZWNoYXREZXZ0b29sc0NsaVBhdGggfHwgJ0Q6XFxcXHNvZnR3YXJlc1xcXFxcdTVGQUVcdTRGRTF3ZWJcdTVGMDBcdTUzRDFcdTgwMDVcdTVERTVcdTUxNzdcXFxcY2xpLmJhdCdcclxuICAgICAgY29tbWFuZCA9IGBcIiR7Y2xpUGF0aH1cIiAtbyBcIiR7cHJvamVjdFBhdGh9XCJgXHJcbiAgICB9XHJcbiAgICBlbHNlIGlmIChVTklfUExBVEZPUk0gPT09ICdtcC1hbGlwYXknKSB7XHJcbiAgICAgIGNvbnN0IGluc3RhbGxQYXRoID0gYWxpcGF5RGV2dG9vbHNQYXRoIHx8ICdEOlxcXFxzb2Z0d2FyZXNcXFxcXHU2NTJGXHU0RUQ4XHU1QjlEXHU1RjAwXHU1M0QxXHU4MDA1XHU1REU1XHU1MTc3XFxcXFx1NUMwRlx1N0EwQlx1NUU4Rlx1NUYwMFx1NTNEMVx1ODAwNVx1NURFNVx1NTE3NydcclxuICAgICAgY29uc3QgZXhlUGF0aCA9IHBhdGguam9pbihpbnN0YWxsUGF0aCwgJ1x1NUMwRlx1N0EwQlx1NUU4Rlx1NUYwMFx1NTNEMVx1ODAwNVx1NURFNVx1NTE3Ny5leGUnKVxyXG4gICAgICBjb21tYW5kID0gYFwiJHtleGVQYXRofVwiIC0tcCBcIiR7cHJvamVjdFBhdGh9XCJgXHJcbiAgICB9XHJcbiAgfVxyXG4gIGVsc2Uge1xyXG4gICAgLy8gTGludXggXHU2MjE2XHU1MTc2XHU0RUQ2XHU3Q0ZCXHU3RURGXHJcbiAgICBjb25zb2xlLmxvZyhgXHUyNzRDIFx1NUY1M1x1NTI0RFx1N0NGQlx1N0VERlx1NEUwRFx1NjUyRlx1NjMwMVx1ODFFQVx1NTJBOFx1NjI1M1x1NUYwMCR7dW5pUGxhdGZvcm1UZXh0fVx1NUYwMFx1NTNEMVx1ODAwNVx1NURFNVx1NTE3N2ApXHJcbiAgICByZXR1cm5cclxuICB9XHJcblxyXG4gIGlmICghY29tbWFuZCkge1xyXG4gICAgY29uc29sZS5sb2coYFx1Mjc0QyBcdTVGNTNcdTUyNERcdTVFNzNcdTUzRjBcdTY2ODJcdTRFMERcdTY1MkZcdTYzMDFcdTgxRUFcdTUyQThcdTYyNTNcdTVGMDAke3VuaVBsYXRmb3JtVGV4dH1cdTVGMDBcdTUzRDFcdTgwMDVcdTVERTVcdTUxNzdgKVxyXG4gICAgcmV0dXJuXHJcbiAgfVxyXG5cclxuICBleGVjKGNvbW1hbmQsIChlcnJvciwgc3Rkb3V0LCBzdGRlcnIpID0+IHtcclxuICAgIGlmIChlcnJvcikge1xyXG4gICAgICBjb25zb2xlLmxvZyhgXHUyNzRDIFx1NjI1M1x1NUYwMCR7dW5pUGxhdGZvcm1UZXh0fVx1NUYwMFx1NTNEMVx1ODAwNVx1NURFNVx1NTE3N1x1NTkzMVx1OEQyNTpgLCBlcnJvci5tZXNzYWdlKVxyXG4gICAgICBpZiAoVU5JX1BMQVRGT1JNID09PSAnbXAtd2VpeGluJykge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCdcdUQ4M0RcdURDQTEgXHU1RjUzXHU1MjREXHU0RjdGXHU3NTI4XHU3Njg0XHU1RkFFXHU0RkUxXHU1RjAwXHU1M0QxXHU4MDA1XHU1REU1XHU1MTc3IENMSSBcdTU0N0RcdTRFRTQ6JywgY29tbWFuZClcclxuICAgICAgICBjb25zb2xlLmxvZygnXHVEODNEXHVEQ0ExIFx1NTk4Mlx1Njc5Q1x1NUI4OVx1ODhDNVx1NEY0RFx1N0Y2RVx1NEUwRFx1NTQwQ1x1RkYwQ1x1NTNFRlx1NEVFNVx1NTcyOCBlbnYvLmVudiBcdTkxNERcdTdGNkUgV0VDSEFUX0RFVlRPT0xTX0NMSV9QQVRIIFx1NEUzQVx1NjcyQ1x1NjczQVx1NUI5RVx1OTY0NSBDTEkgXHU4REVGXHU1Rjg0JylcclxuICAgICAgfVxyXG4gICAgICBlbHNlIGlmIChVTklfUExBVEZPUk0gPT09ICdtcC1hbGlwYXknKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ1x1RDgzRFx1RENBMSBcdTVGNTNcdTUyNERcdTRGN0ZcdTc1MjhcdTc2ODRcdTY1MkZcdTRFRDhcdTVCOURcdTVGMDBcdTUzRDFcdTgwMDVcdTVERTVcdTUxNzdcdTU0N0RcdTRFRTQ6JywgY29tbWFuZClcclxuICAgICAgICBjb25zb2xlLmxvZygnXHVEODNEXHVEQ0ExIFx1NTk4Mlx1Njc5Q1x1NUI4OVx1ODhDNVx1NEY0RFx1N0Y2RVx1NEUwRFx1NTQwQ1x1RkYwQ1x1NTNFRlx1NEVFNVx1NTcyOCBlbnYvLmVudiBcdTkxNERcdTdGNkUgQUxJUEFZX0RFVlRPT0xTX1BBVEggXHU0RTNBXHU2NzJDXHU2NzNBXHU1QjlFXHU5NjQ1XHU1Qjg5XHU4OEM1XHU3NkVFXHU1RjU1JylcclxuICAgICAgfVxyXG4gICAgICBjb25zb2xlLmxvZyhgXHVEODNEXHVEQ0ExIFx1OEJGN1x1Nzg2RVx1NEZERCR7dW5pUGxhdGZvcm1UZXh0fVx1NUYwMFx1NTNEMVx1ODAwNVx1NURFNVx1NTE3N1x1NjcwRFx1NTJBMVx1N0FFRlx1NTNFM1x1NURGMlx1NTQyRlx1NzUyOGApXHJcbiAgICAgIGNvbnNvbGUubG9nKGBcdUQ4M0RcdURDQTEgXHU1M0VGXHU0RUU1XHU2MjRCXHU1MkE4XHU2MjUzXHU1RjAwJHt1bmlQbGF0Zm9ybVRleHR9XHU1RjAwXHU1M0QxXHU4MDA1XHU1REU1XHU1MTc3XHU1RTc2XHU1QkZDXHU1MTY1XHU5ODc5XHU3NkVFOmAsIHByb2plY3RQYXRoKVxyXG4gICAgICByZXR1cm5cclxuICAgIH1cclxuXHJcbiAgICBpZiAoc3RkZXJyKSB7XHJcbiAgICAgIGNvbnNvbGUubG9nKCdcdTI2QTBcdUZFMEYgXHU4QjY2XHU1NDRBOicsIHN0ZGVycilcclxuICAgIH1cclxuXHJcbiAgICBjb25zb2xlLmxvZyhgXHUyNzA1ICR7dW5pUGxhdGZvcm1UZXh0fVx1NUYwMFx1NTNEMVx1ODAwNVx1NURFNVx1NTE3N1x1NURGMlx1NjI1M1x1NUYwMGApXHJcblxyXG4gICAgaWYgKHN0ZG91dCkge1xyXG4gICAgICBjb25zb2xlLmxvZyhzdGRvdXQpXHJcbiAgICB9XHJcbiAgfSlcclxufVxyXG5cclxuLyoqXHJcbiAqIFx1NTIxQlx1NUVGQSBWaXRlIFx1NjNEMlx1NEVGNlx1RkYwQ1x1NzUyOFx1NEU4RVx1ODFFQVx1NTJBOFx1NjI1M1x1NUYwMFx1NUYwMFx1NTNEMVx1ODAwNVx1NURFNVx1NTE3N1xyXG4gKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyAtIFx1OTE0RFx1N0Y2RVx1OTAwOVx1OTg3OVxyXG4gKiBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy5tb2RlIC0gXHU2Nzg0XHU1RUZBXHU2QTIxXHU1RjBGXHVGRjBDJ2RldmVsb3BtZW50JyBcdTYyMTYgJ3Byb2R1Y3Rpb24nXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLndlY2hhdERldnRvb2xzQ2xpUGF0aCAtIFx1NUZBRVx1NEZFMVx1NUYwMFx1NTNEMVx1ODAwNVx1NURFNVx1NTE3NyBDTEkgXHU4REVGXHU1Rjg0XHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLmFsaXBheURldnRvb2xzUGF0aCAtIFx1NjUyRlx1NEVEOFx1NUI5RFx1NUMwRlx1N0EwQlx1NUU4Rlx1NUYwMFx1NTNEMVx1ODAwNVx1NURFNVx1NTE3N1x1NUI4OVx1ODhDNVx1NzZFRVx1NUY1NVxyXG4gKi9cclxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gb3BlbkRldlRvb2xzKG9wdGlvbnMgPSB7fSkge1xyXG4gIGNvbnN0IHsgbW9kZSA9ICdkZXZlbG9wbWVudCcsIHdlY2hhdERldnRvb2xzQ2xpUGF0aCwgYWxpcGF5RGV2dG9vbHNQYXRoIH0gPSBvcHRpb25zXHJcbiAgLy8gXHU2ODM5XHU2MzZFIG1vZGUgXHU3ODZFXHU1QjlBXHU3M0FGXHU1ODgzXHVGRjFBZGV2ZWxvcG1lbnQgLT4gZGV2LCBwcm9kdWN0aW9uIC0+IGJ1aWxkXHJcbiAgY29uc3QgZW52ID0gbW9kZSA9PT0gJ3Byb2R1Y3Rpb24nID8gJ2J1aWxkJyA6ICdkZXYnXHJcblxyXG4gIC8vIFx1OTk5Nlx1NkIyMVx1Njc4NFx1NUVGQVx1NjgwN1x1OEJCMFxyXG4gIGxldCBpc0ZpcnN0QnVpbGQgPSB0cnVlXHJcblxyXG4gIHJldHVybiB7XHJcbiAgICBuYW1lOiAndW5pLWRldnRvb2xzJyxcclxuICAgIHdyaXRlQnVuZGxlKCkge1xyXG4gICAgICBpZiAoaXNGaXJzdEJ1aWxkICYmIHByb2Nlc3MuZW52LlVOSV9QTEFURk9STT8uaW5jbHVkZXMoJ21wJykpIHtcclxuICAgICAgICBpc0ZpcnN0QnVpbGQgPSBmYWxzZVxyXG4gICAgICAgIF9vcGVuRGV2VG9vbHMoZW52LCB7IHdlY2hhdERldnRvb2xzQ2xpUGF0aCwgYWxpcGF5RGV2dG9vbHNQYXRoIH0pXHJcbiAgICAgIH1cclxuICAgIH0sXHJcbiAgfVxyXG59XHJcbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiRDpcXFxcc3R1ZHlcXFxcbXlHaXRodWJcXFxcYmxvZy1ob21lLXVuaWFwcFxcXFxzY3JpcHRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJEOlxcXFxzdHVkeVxcXFxteUdpdGh1YlxcXFxibG9nLWhvbWUtdW5pYXBwXFxcXHNjcmlwdHNcXFxcdml0ZS1wbHVnaW4tZXJ1ZGEuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Q6L3N0dWR5L215R2l0aHViL2Jsb2ctaG9tZS11bmlhcHAvc2NyaXB0cy92aXRlLXBsdWdpbi1lcnVkYS5qc1wiOy8qKlxyXG4gKiBAZGVzY3JpcHRpb24gXHU5MDFBXHU4RkM3IHZpdGUgXHU4MUVBXHU1QjlBXHU0RTQ5XHU2NzYxXHU0RUY2XHU1MkE4XHU2MDAxXHU1QkZDXHU1MTY1IGVydWRhXHJcbiAqIEBkZXNjcmlwdGlvbiBFcnVkYSBcdTkxNERcdTdGNkVcdTUzQzJcdTgwMDMgaHR0cHM6Ly9lcnVkYS5saXJpbGlyaS5pby96aC9kb2NzL1xyXG4gKiBAcGFyYW0ge29iamVjdH0gb3B0aW9uc1xyXG4gKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLm9wZW5dIC0gXHU2NjJGXHU1NDI2XHU1RjAwXHU1NDJGIGVydWRhXHJcbiAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9ucy5lcnVkYU9wdGlvbnNdIC0gZXJ1ZGEgXHU5MTREXHU3RjZFXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5lcnVkYVVybF0gLSBlcnVkYSBcdTU3MzBcdTU3NDBcclxuICovXHJcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHZpdGVQbHVnaW5FcnVkYShvcHRpb25zID0ge30pIHtcclxuICBjb25zdCB7IG9wZW4gPSB0cnVlLCBlcnVkYU9wdGlvbnMgPSB7fSwgZXJ1ZGFVcmwgPSAnaHR0cHM6Ly9jZG4uanNkZWxpdnIubmV0L25wbS9lcnVkYScgfSA9IG9wdGlvbnNcclxuXHJcbiAgcmV0dXJuIHtcclxuICAgIG5hbWU6ICd2aXRlLXBsdWdpbi1lcnVkYScsXHJcblxyXG4gICAgdHJhbnNmb3JtSW5kZXhIdG1sKGh0bWwpIHtcclxuICAgICAgY29uc3QgdGFncyA9IFtcclxuICAgICAgICB7XHJcbiAgICAgICAgICB0YWc6ICdzY3JpcHQnLFxyXG4gICAgICAgICAgYXR0cnM6IHtcclxuICAgICAgICAgICAgc3JjOiBlcnVkYVVybCxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICBpbmplY3RUbzogJ2hlYWQnLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgdGFnOiAnc2NyaXB0JyxcclxuICAgICAgICAgIGNoaWxkcmVuOiBgZXJ1ZGEuaW5pdCgke0pTT04uc3RyaW5naWZ5KGVydWRhT3B0aW9ucyl9KTtgLFxyXG4gICAgICAgICAgaW5qZWN0VG86ICdoZWFkJyxcclxuICAgICAgICB9LFxyXG4gICAgICBdXHJcblxyXG4gICAgICBpZiAoIW9wZW4pIHtcclxuICAgICAgICByZXR1cm4gaHRtbFxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiB7IGh0bWwsIHRhZ3MgfVxyXG4gICAgfSxcclxuICB9XHJcbn1cclxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxzdHVkeVxcXFxteUdpdGh1YlxcXFxibG9nLWhvbWUtdW5pYXBwXFxcXHZpdGUtcGx1Z2luc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRDpcXFxcc3R1ZHlcXFxcbXlHaXRodWJcXFxcYmxvZy1ob21lLXVuaWFwcFxcXFx2aXRlLXBsdWdpbnNcXFxcY29weS1uYXRpdmUtcmVzb3VyY2VzLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9EOi9zdHVkeS9teUdpdGh1Yi9ibG9nLWhvbWUtdW5pYXBwL3ZpdGUtcGx1Z2lucy9jb3B5LW5hdGl2ZS1yZXNvdXJjZXMudHNcIjtpbXBvcnQgdHlwZSB7IFBsdWdpbiB9IGZyb20gJ3ZpdGUnXHJcbmltcG9ydCBwYXRoIGZyb20gJ25vZGU6cGF0aCdcclxuaW1wb3J0IHByb2Nlc3MgZnJvbSAnbm9kZTpwcm9jZXNzJ1xyXG5pbXBvcnQgZnMgZnJvbSAnZnMtZXh0cmEnXHJcblxyXG4vKipcclxuICogXHU1MzlGXHU3NTFGXHU2M0QyXHU0RUY2XHU4RDQ0XHU2RTkwXHU1OTBEXHU1MjM2XHU5MTREXHU3RjZFXHU2M0E1XHU1M0UzXHJcbiAqXHJcbiAqIFx1NjgzOVx1NjM2RSBVbmlBcHAgXHU1Qjk4XHU2NUI5XHU2NTg3XHU2ODYzXHVGRjFBaHR0cHM6Ly91bmlhcHAuZGNsb3VkLm5ldC5jbi9wbHVnaW4vbmF0aXZlLXBsdWdpbi5odG1sIyVFNiU5QyVBQyVFNSU5QyVCMCVFNiU4RiU5MiVFNCVCQiVCNi0lRTklOUQlOUUlRTUlODYlODUlRTclQkQlQUUlRTUlOEUlOUYlRTclOTQlOUYlRTYlOEYlOTIlRTQlQkIlQjZcclxuICogXHU2NzJDXHU1NzMwXHU2M0QyXHU0RUY2XHU1RTk0XHU4QkU1XHU1QjU4XHU1MEE4XHU1NzI4XHU5ODc5XHU3NkVFXHU2ODM5XHU3NkVFXHU1RjU1XHU3Njg0IG5hdGl2ZXBsdWdpbnMgXHU3NkVFXHU1RjU1XHU0RTBCXHJcbiAqL1xyXG5leHBvcnQgaW50ZXJmYWNlIENvcHlOYXRpdmVSZXNvdXJjZXNPcHRpb25zIHtcclxuICAvKiogXHU2NjJGXHU1NDI2XHU1NDJGXHU3NTI4XHU2M0QyXHU0RUY2ICovXHJcbiAgZW5hYmxlPzogYm9vbGVhblxyXG4gIC8qKlxyXG4gICAqIFx1NkU5MFx1NzZFRVx1NUY1NVx1OERFRlx1NUY4NFx1RkYwQ1x1NzZGOFx1NUJGOVx1NEU4RVx1OTg3OVx1NzZFRVx1NjgzOVx1NzZFRVx1NUY1NVxyXG4gICAqIFx1OUVEOFx1OEJBNFx1NEUzQSAnbmF0aXZlcGx1Z2lucydcdUZGMENcdTdCMjZcdTU0MDggVW5pQXBwIFx1NUI5OFx1NjVCOVx1ODlDNFx1ODMwM1xyXG4gICAqIEBzZWUgaHR0cHM6Ly91bmlhcHAuZGNsb3VkLm5ldC5jbi9wbHVnaW4vbmF0aXZlLXBsdWdpbi5odG1sIyVFNiU5QyVBQyVFNSU5QyVCMCVFNiU4RiU5MiVFNCVCQiVCNi0lRTklOUQlOUUlRTUlODYlODUlRTclQkQlQUUlRTUlOEUlOUYlRTclOTQlOUYlRTYlOEYlOTIlRTQlQkIlQjZcclxuICAgKi9cclxuICBzb3VyY2VEaXI/OiBzdHJpbmdcclxuICAvKipcclxuICAgKiBcdTc2RUVcdTY4MDdcdTc2RUVcdTVGNTVcdTU0MERcdTc5RjBcdUZGMENcdTY3ODRcdTVFRkFcdTU0MEVcdTU3MjggZGlzdCBcdTc2RUVcdTVGNTVcdTRFMkRcdTc2ODRcdTY1ODdcdTRFRjZcdTU5MzlcdTU0MERcclxuICAgKiBcdTlFRDhcdThCQTRcdTRFM0EgJ25hdGl2ZXBsdWdpbnMnXHVGRjBDXHU0RTBFXHU2RTkwXHU3NkVFXHU1RjU1XHU0RkREXHU2MzAxXHU0RTAwXHU4MUY0XHJcbiAgICovXHJcbiAgdGFyZ2V0RGlyTmFtZT86IHN0cmluZ1xyXG4gIC8qKiBcdTY2MkZcdTU0MjZcdTY2M0VcdTc5M0FcdThCRTZcdTdFQzZcdTY1RTVcdTVGRDdcdUZGMENcdTRGQkZcdTRFOEVcdThDMDNcdThCRDVcdTU0OENcdTc2RDFcdTYzQTdcdTU5MERcdTUyMzZcdThGQzdcdTdBMEIgKi9cclxuICB2ZXJib3NlPzogYm9vbGVhblxyXG4gIC8qKiBcdTgxRUFcdTVCOUFcdTRFNDlcdTY1RTVcdTVGRDdcdTUyNERcdTdGMDBcdUZGMENcdTc1MjhcdTRFOEVcdTUzM0FcdTUyMDZcdTRFMERcdTU0MENcdTYzRDJcdTRFRjZcdTc2ODRcdTY1RTVcdTVGRDdcdThGOTNcdTUxRkEgKi9cclxuICBsb2dQcmVmaXg/OiBzdHJpbmdcclxufVxyXG5cclxuLyoqXHJcbiAqIFx1OUVEOFx1OEJBNFx1OTE0RFx1N0Y2RVxyXG4gKlxyXG4gKiBcdTY4MzlcdTYzNkUgVW5pQXBwIFx1NUI5OFx1NjVCOVx1NjU4N1x1Njg2M1x1ODlDNFx1ODMwM1x1OEJCRVx1N0Y2RVx1OUVEOFx1OEJBNFx1NTAzQ1x1RkYxQVxyXG4gKiAtIHNvdXJjZURpcjogJ25hdGl2ZXBsdWdpbnMnIC0gXHU3QjI2XHU1NDA4XHU1Qjk4XHU2NUI5XHU2NzJDXHU1NzMwXHU2M0QyXHU0RUY2XHU1QjU4XHU1MEE4XHU4OUM0XHU4MzAzXHJcbiAqIC0gdGFyZ2V0RGlyTmFtZTogJ25hdGl2ZXBsdWdpbnMnIC0gXHU2Nzg0XHU1RUZBXHU1NDBFXHU0RkREXHU2MzAxXHU3NkY4XHU1NDBDXHU3Njg0XHU3NkVFXHU1RjU1XHU3RUQzXHU2Nzg0XHJcbiAqL1xyXG5jb25zdCBERUZBVUxUX09QVElPTlM6IFJlcXVpcmVkPENvcHlOYXRpdmVSZXNvdXJjZXNPcHRpb25zPiA9IHtcclxuICBlbmFibGU6IHRydWUsXHJcbiAgc291cmNlRGlyOiAnbmF0aXZlcGx1Z2lucycsXHJcbiAgdGFyZ2V0RGlyTmFtZTogJ25hdGl2ZXBsdWdpbnMnLFxyXG4gIHZlcmJvc2U6IHRydWUsXHJcbiAgbG9nUHJlZml4OiAnW2NvcHktbmF0aXZlLXJlc291cmNlc10nLFxyXG59XHJcblxyXG4vKipcclxuICogVW5pQXBwIFx1NTM5Rlx1NzUxRlx1NjNEMlx1NEVGNlx1OEQ0NFx1NkU5MFx1NTkwRFx1NTIzNlx1NjNEMlx1NEVGNlxyXG4gKlxyXG4gKiBcdTUyOUZcdTgwRkRcdThCRjRcdTY2MEVcdUZGMUFcclxuICogMS4gXHU4OUUzXHU1MUIzIFVuaUFwcCBcdTRGN0ZcdTc1MjhcdTY3MkNcdTU3MzBcdTUzOUZcdTc1MUZcdTYzRDJcdTRFRjZcdTY1RjZcdUZGMENcdTYyNTNcdTUzMDVcdTU0MEVcdTUzOUZcdTc1MUZcdTYzRDJcdTRFRjZcdThENDRcdTZFOTBcdTYyN0VcdTRFMERcdTUyMzBcdTc2ODRcdTk1RUVcdTk4OThcclxuICogMi4gXHU1QzA2XHU5ODc5XHU3NkVFXHU2ODM5XHU3NkVFXHU1RjU1XHU0RTBCXHU3Njg0IG5hdGl2ZXBsdWdpbnMgXHU3NkVFXHU1RjU1XHU1OTBEXHU1MjM2XHU1MjMwXHU2Nzg0XHU1RUZBXHU4RjkzXHU1MUZBXHU3NkVFXHU1RjU1XHU0RTJEXHJcbiAqIDMuIFx1NjUyRlx1NjMwMSBBbmRyb2lkIFx1NTQ4QyBpT1MgXHU1RTczXHU1M0YwXHU3Njg0XHU1MzlGXHU3NTFGXHU2M0QyXHU0RUY2XHU4RDQ0XHU2RTkwXHU1OTBEXHU1MjM2XHJcbiAqIDQuIFx1NEVDNVx1NTcyOCBhcHAgXHU1RTczXHU1M0YwXHU2Nzg0XHU1RUZBXHU2NUY2XHU3NTFGXHU2NTQ4XHVGRjBDXHU1MTc2XHU0RUQ2XHU1RTczXHU1M0YwXHVGRjA4SDVcdTMwMDFcdTVDMEZcdTdBMEJcdTVFOEZcdUZGMDlcdTRFMERcdTYyNjdcdTg4NENcclxuICpcclxuICogXHU0RjdGXHU3NTI4XHU1NzNBXHU2NjZGXHVGRjFBXHJcbiAqIC0gXHU0RjdGXHU3NTI4XHU0RTg2IFVuaUFwcCBcdTY3MkNcdTU3MzBcdTUzOUZcdTc1MUZcdTYzRDJcdTRFRjZcdUZGMDhcdTk3NUVcdTRFOTFcdTdBRUZcdTYzRDJcdTRFRjZcdUZGMDlcclxuICogLSBcdTUzOUZcdTc1MUZcdTYzRDJcdTRFRjZcdTUzMDVcdTU0MkJcdTk4OURcdTU5MTZcdTc2ODRcdThENDRcdTZFOTBcdTY1ODdcdTRFRjZcdUZGMDhcdTU5ODIgLnNvIFx1NUU5M1x1NjU4N1x1NEVGNlx1MzAwMVx1OTE0RFx1N0Y2RVx1NjU4N1x1NEVGNlx1N0I0OVx1RkYwOVxyXG4gKiAtIFx1OTcwMFx1ODk4MVx1NTcyOFx1NjI1M1x1NTMwNVx1NTQwRVx1NEZERFx1NjMwMVx1NTM5Rlx1NzUxRlx1NjNEMlx1NEVGNlx1NzY4NFx1NUI4Q1x1NjU3NFx1NzZFRVx1NUY1NVx1N0VEM1x1Njc4NFxyXG4gKlxyXG4gKiBcdTVCOThcdTY1QjlcdTY1ODdcdTY4NjNcdTUzQzJcdTgwMDNcdUZGMUFcclxuICogQHNlZSBodHRwczovL3VuaWFwcC5kY2xvdWQubmV0LmNuL3BsdWdpbi9uYXRpdmUtcGx1Z2luLmh0bWwjJUU2JTlDJUFDJUU1JTlDJUIwJUU2JThGJTkyJUU0JUJCJUI2LSVFOSU5RCU5RSVFNSU4NiU4NSVFNyVCRCVBRSVFNSU4RSU5RiVFNyU5NCU5RiVFNiU4RiU5MiVFNCVCQiVCNlxyXG4gKiBAc2VlIGh0dHBzOi8vdW5pYXBwLmRjbG91ZC5uZXQuY24vdHV0b3JpYWwvbnZ1ZS1hcGkuaHRtbCNkb21cclxuICpcclxuICogQHBhcmFtIG9wdGlvbnMgXHU2M0QyXHU0RUY2XHU5MTREXHU3RjZFXHU5MDA5XHU5ODc5XHJcbiAqIEByZXR1cm5zIFZpdGUgXHU2M0QyXHU0RUY2XHU1QkY5XHU4QzYxXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gY29weU5hdGl2ZVJlc291cmNlcyhvcHRpb25zOiBDb3B5TmF0aXZlUmVzb3VyY2VzT3B0aW9ucyA9IHt9KTogUGx1Z2luIHtcclxuICBjb25zdCBjb25maWcgPSB7IC4uLkRFRkFVTFRfT1BUSU9OUywgLi4ub3B0aW9ucyB9XHJcblxyXG4gIC8vIFx1NTk4Mlx1Njc5Q1x1NjNEMlx1NEVGNlx1ODhBQlx1Nzk4MVx1NzUyOFx1RkYwQ1x1OEZENFx1NTZERVx1NEUwMFx1NEUyQVx1N0E3QVx1NjNEMlx1NEVGNlxyXG4gIGlmICghY29uZmlnLmVuYWJsZSkge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgbmFtZTogJ2NvcHktbmF0aXZlLXJlc291cmNlcy1kaXNhYmxlZCcsXHJcbiAgICAgIGFwcGx5OiAnYnVpbGQnLFxyXG4gICAgICB3cml0ZUJ1bmRsZSgpIHtcclxuICAgICAgICAvLyBcdTYzRDJcdTRFRjZcdTVERjJcdTc5ODFcdTc1MjhcdUZGMENcdTRFMERcdTYyNjdcdTg4NENcdTRFRkJcdTRGNTVcdTY0Q0RcdTRGNUNcclxuICAgICAgfSxcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHJldHVybiB7XHJcbiAgICBuYW1lOiAnY29weS1uYXRpdmUtcmVzb3VyY2VzJyxcclxuICAgIGFwcGx5OiAnYnVpbGQnLCAvLyBcdTUzRUFcdTU3MjhcdTY3ODRcdTVFRkFcdTY1RjZcdTVFOTRcdTc1MjhcclxuICAgIGVuZm9yY2U6ICdwb3N0JywgLy8gXHU1NzI4XHU1MTc2XHU0RUQ2XHU2M0QyXHU0RUY2XHU2MjY3XHU4ODRDXHU1QjhDXHU2QkQ1XHU1NDBFXHU2MjY3XHU4ODRDXHJcblxyXG4gICAgYXN5bmMgd3JpdGVCdW5kbGUoKSB7XHJcbiAgICAgIGNvbnN0IHsgc291cmNlRGlyLCB0YXJnZXREaXJOYW1lLCB2ZXJib3NlLCBsb2dQcmVmaXggfSA9IGNvbmZpZ1xyXG5cclxuICAgICAgdHJ5IHtcclxuICAgICAgICAvLyBcdTgzQjdcdTUzRDZcdTk4NzlcdTc2RUVcdTY4MzlcdTc2RUVcdTVGNTVcdThERUZcdTVGODRcclxuICAgICAgICBjb25zdCBwcm9qZWN0Um9vdCA9IHByb2Nlc3MuY3dkKClcclxuXHJcbiAgICAgICAgLy8gXHU2Nzg0XHU1RUZBXHU2RTkwXHU3NkVFXHU1RjU1XHU3RUREXHU1QkY5XHU4REVGXHU1Rjg0XHVGRjA4XHU5ODc5XHU3NkVFXHU2ODM5XHU3NkVFXHU1RjU1XHU0RTBCXHU3Njg0IG5hdGl2ZXBsdWdpbnMgXHU3NkVFXHU1RjU1XHVGRjA5XHJcbiAgICAgICAgY29uc3Qgc291cmNlUGF0aCA9IHBhdGgucmVzb2x2ZShwcm9qZWN0Um9vdCwgc291cmNlRGlyKVxyXG5cclxuICAgICAgICAvLyBcdTY3ODRcdTVFRkFcdTc2RUVcdTY4MDdcdThERUZcdTVGODRcdUZGMUFkaXN0L1tidWlsZHxkZXZdL1twbGF0Zm9ybV0vbmF0aXZlcGx1Z2luc1xyXG4gICAgICAgIC8vIGJ1aWxkTW9kZTogJ2J1aWxkJyAoXHU3NTFGXHU0RUE3XHU3M0FGXHU1ODgzKSBcdTYyMTYgJ2RldicgKFx1NUYwMFx1NTNEMVx1NzNBRlx1NTg4MylcclxuICAgICAgICAvLyBwbGF0Zm9ybTogJ2FwcCcgKEFwcFx1NUU3M1x1NTNGMCkgXHU2MjE2XHU1MTc2XHU0RUQ2XHU1RTczXHU1M0YwXHU2ODA3XHU4QkM2XHJcbiAgICAgICAgY29uc3QgYnVpbGRNb2RlID0gcHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09ICdwcm9kdWN0aW9uJyA/ICdidWlsZCcgOiAnZGV2J1xyXG4gICAgICAgIGNvbnN0IHBsYXRmb3JtID0gcHJvY2Vzcy5lbnYuVU5JX1BMQVRGT1JNIHx8ICdhcHAnXHJcbiAgICAgICAgY29uc3QgdGFyZ2V0UGF0aCA9IHBhdGgucmVzb2x2ZShcclxuICAgICAgICAgIHByb2plY3RSb290LFxyXG4gICAgICAgICAgJ2Rpc3QnLFxyXG4gICAgICAgICAgYnVpbGRNb2RlLFxyXG4gICAgICAgICAgcGxhdGZvcm0sXHJcbiAgICAgICAgICB0YXJnZXREaXJOYW1lLFxyXG4gICAgICAgIClcclxuXHJcbiAgICAgICAgLy8gXHU2OEMwXHU2N0U1XHU2RTkwXHU3NkVFXHU1RjU1XHU2NjJGXHU1NDI2XHU1QjU4XHU1NzI4XHJcbiAgICAgICAgLy8gXHU1OTgyXHU2NzlDXHU0RTBEXHU1QjU4XHU1NzI4IG5hdGl2ZXBsdWdpbnMgXHU3NkVFXHU1RjU1XHVGRjBDXHU4QkY0XHU2NjBFXHU5ODc5XHU3NkVFXHU2Q0ExXHU2NzA5XHU0RjdGXHU3NTI4XHU2NzJDXHU1NzMwXHU1MzlGXHU3NTFGXHU2M0QyXHU0RUY2XHJcbiAgICAgICAgY29uc3Qgc291cmNlRXhpc3RzID0gYXdhaXQgZnMucGF0aEV4aXN0cyhzb3VyY2VQYXRoKVxyXG4gICAgICAgIGlmICghc291cmNlRXhpc3RzKSB7XHJcbiAgICAgICAgICBpZiAodmVyYm9zZSkge1xyXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYCR7bG9nUHJlZml4fSBcdTZFOTBcdTc2RUVcdTVGNTVcdTRFMERcdTVCNThcdTU3MjhcdUZGMENcdThERjNcdThGQzdcdTU5MERcdTUyMzZcdTY0Q0RcdTRGNUNgKVxyXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYCR7bG9nUHJlZml4fSBcdTZFOTBcdTc2RUVcdTVGNTVcdThERUZcdTVGODQ6ICR7c291cmNlUGF0aH1gKVxyXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYCR7bG9nUHJlZml4fSBcdTU5ODJcdTk3MDBcdTRGN0ZcdTc1MjhcdTY3MkNcdTU3MzBcdTUzOUZcdTc1MUZcdTYzRDJcdTRFRjZcdUZGMENcdThCRjdcdTU3MjhcdTk4NzlcdTc2RUVcdTY4MzlcdTc2RUVcdTVGNTVcdTUyMUJcdTVFRkEgbmF0aXZlcGx1Z2lucyBcdTc2RUVcdTVGNTVgKVxyXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYCR7bG9nUHJlZml4fSBcdTVFNzZcdTYzMDlcdTcxNjdcdTVCOThcdTY1QjlcdTY1ODdcdTY4NjNcdTY1M0VcdTUxNjVcdTUzOUZcdTc1MUZcdTYzRDJcdTRFRjZcdTY1ODdcdTRFRjZgKVxyXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYCR7bG9nUHJlZml4fSBcdTUzQzJcdTgwMDM6IGh0dHBzOi8vdW5pYXBwLmRjbG91ZC5uZXQuY24vcGx1Z2luL25hdGl2ZS1wbHVnaW4uaHRtbGApXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICByZXR1cm5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFx1NjhDMFx1NjdFNVx1NkU5MFx1NzZFRVx1NUY1NVx1NjYyRlx1NTQyNlx1NEUzQVx1N0E3QVxyXG4gICAgICAgIC8vIFx1NTk4Mlx1Njc5Q1x1NzZFRVx1NUY1NVx1NUI1OFx1NTcyOFx1NEY0Nlx1NEUzQVx1N0E3QVx1RkYwQ1x1NEU1Rlx1OERGM1x1OEZDN1x1NTkwRFx1NTIzNlx1NjRDRFx1NEY1Q1xyXG4gICAgICAgIGNvbnN0IHNvdXJjZUZpbGVzID0gYXdhaXQgZnMucmVhZGRpcihzb3VyY2VQYXRoKVxyXG4gICAgICAgIGlmIChzb3VyY2VGaWxlcy5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgIGlmICh2ZXJib3NlKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgJHtsb2dQcmVmaXh9IFx1NkU5MFx1NzZFRVx1NUY1NVx1NEUzQVx1N0E3QVx1RkYwQ1x1OERGM1x1OEZDN1x1NTkwRFx1NTIzNlx1NjRDRFx1NEY1Q2ApXHJcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgJHtsb2dQcmVmaXh9IFx1NkU5MFx1NzZFRVx1NUY1NVx1OERFRlx1NUY4NDogJHtzb3VyY2VQYXRofWApXHJcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgJHtsb2dQcmVmaXh9IFx1OEJGN1x1NTcyOCBuYXRpdmVwbHVnaW5zIFx1NzZFRVx1NUY1NVx1NEUyRFx1NjUzRVx1NTE2NVx1NTM5Rlx1NzUxRlx1NjNEMlx1NEVGNlx1NjU4N1x1NEVGNmApXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICByZXR1cm5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFx1Nzg2RVx1NEZERFx1NzZFRVx1NjgwN1x1NzZFRVx1NUY1NVx1NTNDQVx1NTE3Nlx1NzIzNlx1NzZFRVx1NUY1NVx1NUI1OFx1NTcyOFxyXG4gICAgICAgIGF3YWl0IGZzLmVuc3VyZURpcih0YXJnZXRQYXRoKVxyXG5cclxuICAgICAgICBpZiAodmVyYm9zZSkge1xyXG4gICAgICAgICAgY29uc29sZS5sb2coYCR7bG9nUHJlZml4fSBcdTVGMDBcdTU5Q0JcdTU5MERcdTUyMzYgVW5pQXBwIFx1NjcyQ1x1NTczMFx1NTM5Rlx1NzUxRlx1NjNEMlx1NEVGNi4uLmApXHJcbiAgICAgICAgICBjb25zb2xlLmxvZyhgJHtsb2dQcmVmaXh9IFx1NkU5MFx1NzZFRVx1NUY1NTogJHtzb3VyY2VQYXRofWApXHJcbiAgICAgICAgICBjb25zb2xlLmxvZyhgJHtsb2dQcmVmaXh9IFx1NzZFRVx1NjgwN1x1NzZFRVx1NUY1NTogJHt0YXJnZXRQYXRofWApXHJcbiAgICAgICAgICBjb25zb2xlLmxvZyhgJHtsb2dQcmVmaXh9IFx1Njc4NFx1NUVGQVx1NkEyMVx1NUYwRjogJHtidWlsZE1vZGV9YClcclxuICAgICAgICAgIGNvbnNvbGUubG9nKGAke2xvZ1ByZWZpeH0gXHU3NkVFXHU2ODA3XHU1RTczXHU1M0YwOiAke3BsYXRmb3JtfWApXHJcbiAgICAgICAgICBjb25zb2xlLmxvZyhgJHtsb2dQcmVmaXh9IFx1NTNEMVx1NzNCMCAke3NvdXJjZUZpbGVzLmxlbmd0aH0gXHU0RTJBXHU1MzlGXHU3NTFGXHU2M0QyXHU0RUY2XHU2NTg3XHU0RUY2L1x1NzZFRVx1NUY1NWApXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBcdTYyNjdcdTg4NENcdTY1ODdcdTRFRjZcdTU5MERcdTUyMzZcdTY0Q0RcdTRGNUNcclxuICAgICAgICAvLyBcdTVDMDZcdTY1NzRcdTRFMkEgbmF0aXZlcGx1Z2lucyBcdTc2RUVcdTVGNTVcdTU5MERcdTUyMzZcdTUyMzBcdTY3ODRcdTVFRkFcdThGOTNcdTUxRkFcdTc2RUVcdTVGNTVcclxuICAgICAgICBhd2FpdCBmcy5jb3B5KHNvdXJjZVBhdGgsIHRhcmdldFBhdGgsIHtcclxuICAgICAgICAgIG92ZXJ3cml0ZTogdHJ1ZSwgLy8gXHU4OTg2XHU3NkQ2XHU1REYyXHU1QjU4XHU1NzI4XHU3Njg0XHU2NTg3XHU0RUY2XHVGRjBDXHU3ODZFXHU0RkREXHU0RjdGXHU3NTI4XHU2NzAwXHU2NUIwXHU3MjQ4XHU2NzJDXHJcbiAgICAgICAgICBlcnJvck9uRXhpc3Q6IGZhbHNlLCAvLyBcdTU5ODJcdTY3OUNcdTc2RUVcdTY4MDdcdTY1ODdcdTRFRjZcdTVCNThcdTU3MjhcdTRFMERcdTYyQTVcdTk1MTlcclxuICAgICAgICAgIHByZXNlcnZlVGltZXN0YW1wczogdHJ1ZSwgLy8gXHU0RkREXHU2MzAxXHU2NTg3XHU0RUY2XHU3Njg0XHU2NUY2XHU5NUY0XHU2MjMzXHJcbiAgICAgICAgfSlcclxuXHJcbiAgICAgICAgY29uc29sZS5sb2coYCR7bG9nUHJlZml4fSBcdTI3MDUgVW5pQXBwIFx1NjcyQ1x1NTczMFx1NTM5Rlx1NzUxRlx1NjNEMlx1NEVGNlx1NTkwRFx1NTIzNlx1NUI4Q1x1NjIxMDogJHtzb3VyY2VQYXRofSAtPiAke3RhcmdldFBhdGh9YClcclxuICAgICAgICBjb25zb2xlLmxvZyhgJHtsb2dQcmVmaXh9IFx1NURGMlx1NjIxMFx1NTI5Rlx1NTkwRFx1NTIzNiAke3NvdXJjZUZpbGVzLmxlbmd0aH0gXHU0RTJBXHU2NTg3XHU0RUY2L1x1NzZFRVx1NUY1NVx1NTIzMFx1Njc4NFx1NUVGQVx1NzZFRVx1NUY1NWApXHJcbiAgICAgIH1cclxuICAgICAgY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcihgJHtjb25maWcubG9nUHJlZml4fSBcdTI3NEMgXHU1OTBEXHU1MjM2IFVuaUFwcCBcdTY3MkNcdTU3MzBcdTUzOUZcdTc1MUZcdTYzRDJcdTRFRjZcdTU5MzFcdThEMjU6YCwgZXJyb3IpXHJcbiAgICAgICAgY29uc29sZS5lcnJvcihgJHtjb25maWcubG9nUHJlZml4fSBcdTk1MTlcdThCRUZcdThCRTZcdTYwQzU6YCwgZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpKVxyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYCR7Y29uZmlnLmxvZ1ByZWZpeH0gXHU4QkY3XHU2OEMwXHU2N0U1XHU2RTkwXHU3NkVFXHU1RjU1XHU2NzQzXHU5NjUwXHU1NDhDXHU3OEMxXHU3NkQ4XHU3QTdBXHU5NUY0YClcclxuICAgICAgICAvLyBcdTRFMERcdTYyOUJcdTUxRkFcdTk1MTlcdThCRUZcdUZGMENcdTkwN0ZcdTUxNERcdTVGNzFcdTU0Q0RcdTY1NzRcdTRFMkFcdTY3ODRcdTVFRkFcdThGQzdcdTdBMEJcdUZGMENcdTRGNDZcdTRGMUFcdThCQjBcdTVGNTVcdThCRTZcdTdFQzZcdTc2ODRcdTk1MTlcdThCRUZcdTRGRTFcdTYwNkZcclxuICAgICAgfVxyXG4gICAgfSxcclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBcdTUyMUJcdTVFRkEgVW5pQXBwIFx1NjcyQ1x1NTczMFx1NTM5Rlx1NzUxRlx1NjNEMlx1NEVGNlx1OEQ0NFx1NkU5MFx1NTkwRFx1NTIzNlx1NjNEMlx1NEVGNlx1NzY4NFx1NEZCRlx1NjM3N1x1NTFGRFx1NjU3MFxyXG4gKlxyXG4gKiBcdThGRDlcdTY2MkZcdTRFMDBcdTRFMkFcdTRGQkZcdTYzNzdcdTc2ODRcdTVERTVcdTUzODJcdTUxRkRcdTY1NzBcdUZGMENcdTc1MjhcdTRFOEVcdTVGRUJcdTkwMUZcdTUyMUJcdTVFRkFcdTYzRDJcdTRFRjZcdTVCOUVcdTRGOEJcclxuICogXHU3Mjc5XHU1MjJCXHU5MDAyXHU3NTI4XHU0RThFXHU1NzI4IHZpdGUuY29uZmlnLnRzIFx1NEUyRFx1OEZEQlx1ODg0Q1x1Njc2MVx1NEVGNlx1NjAyN1x1NjNEMlx1NEVGNlx1OTE0RFx1N0Y2RVxyXG4gKlxyXG4gKiBcdTRGN0ZcdTc1MjhcdTc5M0FcdTRGOEJcdUZGMUFcclxuICogYGBgdHlwZXNjcmlwdFxyXG4gKiAvLyBcdTU3Mjggdml0ZS5jb25maWcudHMgXHU0RTJEXHJcbiAqIHBsdWdpbnM6IFtcclxuICogICAvLyBcdTRFQzVcdTU3MjggYXBwIFx1NUU3M1x1NTNGMFx1NEUxNFx1NTQyRlx1NzUyOFx1NjVGNlx1NzUxRlx1NjU0OFxyXG4gKiAgIFVOSV9QTEFURk9STSA9PT0gJ2FwcCdcclxuICogICAgID8gY3JlYXRlQ29weU5hdGl2ZVJlc291cmNlc1BsdWdpbihcclxuICogICAgICAgICBWSVRFX0NPUFlfTkFUSVZFX1JFU19FTkFCTEUgPT09ICd0cnVlJyxcclxuICogICAgICAgICB7IHZlcmJvc2U6IG1vZGUgPT09ICdkZXZlbG9wbWVudCcgfVxyXG4gKiAgICAgICApXHJcbiAqICAgICA6IG51bGwsXHJcbiAqIF1cclxuICogYGBgXHJcbiAqXHJcbiAqIEBwYXJhbSBlbmFibGUgXHU2NjJGXHU1NDI2XHU1NDJGXHU3NTI4XHU2M0QyXHU0RUY2XHVGRjBDXHU5MDFBXHU1RTM4XHU5MDFBXHU4RkM3XHU3M0FGXHU1ODgzXHU1M0Q4XHU5MUNGXHU2M0E3XHU1MjM2XHJcbiAqIEBwYXJhbSBvcHRpb25zIFx1NTE3Nlx1NEVENlx1OTE0RFx1N0Y2RVx1OTAwOVx1OTg3OVx1RkYwQ1x1NEUwRFx1NTMwNVx1NTQyQiBlbmFibGUgXHU1QzVFXHU2MDI3XHJcbiAqIEByZXR1cm5zIFZpdGUgXHU2M0QyXHU0RUY2XHU1QkY5XHU4QzYxXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlQ29weU5hdGl2ZVJlc291cmNlc1BsdWdpbihcclxuICBlbmFibGU6IGJvb2xlYW4gPSB0cnVlLFxyXG4gIG9wdGlvbnM6IE9taXQ8Q29weU5hdGl2ZVJlc291cmNlc09wdGlvbnMsICdlbmFibGUnPiA9IHt9LFxyXG4pOiBQbHVnaW4ge1xyXG4gIHJldHVybiBjb3B5TmF0aXZlUmVzb3VyY2VzKHsgZW5hYmxlLCAuLi5vcHRpb25zIH0pXHJcbn1cclxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxzdHVkeVxcXFxteUdpdGh1YlxcXFxibG9nLWhvbWUtdW5pYXBwXFxcXHZpdGUtcGx1Z2luc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRDpcXFxcc3R1ZHlcXFxcbXlHaXRodWJcXFxcYmxvZy1ob21lLXVuaWFwcFxcXFx2aXRlLXBsdWdpbnNcXFxcbXAtYXRvYi1wb2x5ZmlsbC1pbmplY3QudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Q6L3N0dWR5L215R2l0aHViL2Jsb2ctaG9tZS11bmlhcHAvdml0ZS1wbHVnaW5zL21wLWF0b2ItcG9seWZpbGwtaW5qZWN0LnRzXCI7aW1wb3J0IHR5cGUgeyBQbHVnaW4gfSBmcm9tICd2aXRlJ1xuaW1wb3J0IGZzIGZyb20gJ25vZGU6ZnMnXG5pbXBvcnQgcGF0aCBmcm9tICdub2RlOnBhdGgnXG5pbXBvcnQgcHJvY2VzcyBmcm9tICdub2RlOnByb2Nlc3MnXG5cbi8qKiBoaWdobGlnaHQuanMgXHU4OUUzXHU1MzhCIGdyYW1tYXIgXHU0RjlEXHU4RDU2IGF0b2JcdUZGMUJcdTZDRThcdTUxNjUgdmVuZG9yIFx1NjcwMFx1NTI0RFx1RkYwQ1x1NjVFOVx1NEU4RSBjb21tb24vdmVuZG9yLmpzIFx1NTE4NVx1ODA1NFx1OEJFRFx1NkNENVx1NTJBMFx1OEY3RCAqL1xuY29uc3QgTUFSS0VSID0gJy8qIG1wLWF0b2ItcG9seWZpbGwtaW5qZWN0ZWQgKi8nXG5jb25zdCBQT0xZRklMTCA9IGAke01BUktFUn0oZnVuY3Rpb24oKXt2YXIgZz10eXBlb2YgZ2xvYmFsVGhpcyE9XCJ1bmRlZmluZWRcIj9nbG9iYWxUaGlzOnR5cGVvZiBnbG9iYWwhPVwidW5kZWZpbmVkXCI/Z2xvYmFsOnt9O2lmKHR5cGVvZiBnLmF0b2I9PVwiZnVuY3Rpb25cIilyZXR1cm47dmFyIEM9XCJBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWmFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6MDEyMzQ1Njc4OSsvPVwiO2cuYXRvYj1mdW5jdGlvbihpKXt2YXIgcz1TdHJpbmcoaSkucmVwbGFjZSgvWz1dKyQvLFwiXCIpLG89XCJcIjtpZihzLmxlbmd0aCU0PT0xKXRocm93IG5ldyBFcnJvcihcIkludmFsaWQgYmFzZTY0XCIpO2Zvcih2YXIgbj0wLGI9MCxjPTA7bjxzLmxlbmd0aDspYj1iPDw2fEMuaW5kZXhPZihzLmNoYXJBdChuKyspKSxjKz02LGM+PTgmJihvKz1TdHJpbmcuZnJvbUNoYXJDb2RlKGI+Pj4oYy09OCkmMjU1KSk7cmV0dXJuIG99fSkoKTtcXG5gXG5cbmNvbnN0IFZFTkRPUl9SRUwgPSBbJ2Rpc3QvZGV2L21wLXdlaXhpbi9jb21tb24vdmVuZG9yLmpzJywgJ2Rpc3QvYnVpbGQvbXAtd2VpeGluL2NvbW1vbi92ZW5kb3IuanMnXVxuXG4vKipcbiAqIFx1NUZBRVx1NEZFMVx1NUMwRlx1N0EwQlx1NUU4Rlx1RkYxQVx1NTcyOCBjb21tb24vdmVuZG9yLmpzIFx1NTkzNFx1OTBFOFx1NkNFOFx1NTE2NSBhdG9iXHVGRjBDXHU5MDdGXHU1MTREIGhpZ2hsaWdodC5qcyBcdThCQkZcdTk1RUUgQnVmZmVyIFx1NUJGQ1x1ODFGNFx1NjU3NFx1NTMwNVx1NzY3RFx1NUM0RlxuICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBtcEF0b2JQb2x5ZmlsbEluamVjdCgpOiBQbHVnaW4ge1xuICByZXR1cm4ge1xuICAgIG5hbWU6ICdtcC1hdG9iLXBvbHlmaWxsLWluamVjdCcsXG4gICAgYXBwbHk6ICdidWlsZCcsXG4gICAgZW5mb3JjZTogJ3Bvc3QnLFxuICAgIGNsb3NlQnVuZGxlKCkge1xuICAgICAgaWYgKHByb2Nlc3MuZW52LlVOSV9QTEFURk9STSAhPT0gJ21wLXdlaXhpbicpXG4gICAgICAgIHJldHVyblxuXG4gICAgICBmb3IgKGNvbnN0IHJlbCBvZiBWRU5ET1JfUkVMKSB7XG4gICAgICAgIGNvbnN0IHZlbmRvclBhdGggPSBwYXRoLnJlc29sdmUocHJvY2Vzcy5jd2QoKSwgcmVsKVxuICAgICAgICBpZiAoIWZzLmV4aXN0c1N5bmModmVuZG9yUGF0aCkpXG4gICAgICAgICAgY29udGludWVcblxuICAgICAgICBjb25zdCBjb250ZW50ID0gZnMucmVhZEZpbGVTeW5jKHZlbmRvclBhdGgsICd1dGY4JylcbiAgICAgICAgaWYgKGNvbnRlbnQuaW5jbHVkZXMoTUFSS0VSKSlcbiAgICAgICAgICBjb250aW51ZVxuXG4gICAgICAgIGZzLndyaXRlRmlsZVN5bmModmVuZG9yUGF0aCwgUE9MWUZJTEwgKyBjb250ZW50KVxuICAgICAgfVxuICAgIH0sXG4gIH1cbn1cbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiRDpcXFxcc3R1ZHlcXFxcbXlHaXRodWJcXFxcYmxvZy1ob21lLXVuaWFwcFxcXFx2aXRlLXBsdWdpbnNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkQ6XFxcXHN0dWR5XFxcXG15R2l0aHViXFxcXGJsb2ctaG9tZS11bmlhcHBcXFxcdml0ZS1wbHVnaW5zXFxcXHN5bmMtbWFuaWZlc3QtcGx1Z2lucy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRDovc3R1ZHkvbXlHaXRodWIvYmxvZy1ob21lLXVuaWFwcC92aXRlLXBsdWdpbnMvc3luYy1tYW5pZmVzdC1wbHVnaW5zLnRzXCI7aW1wb3J0IHR5cGUgeyBQbHVnaW4gfSBmcm9tICd2aXRlJ1xyXG5pbXBvcnQgZnMgZnJvbSAnbm9kZTpmcydcclxuaW1wb3J0IHBhdGggZnJvbSAnbm9kZTpwYXRoJ1xyXG5pbXBvcnQgcHJvY2VzcyBmcm9tICdub2RlOnByb2Nlc3MnXHJcblxyXG5pbnRlcmZhY2UgTWFuaWZlc3RUeXBlIHtcclxuICAncGx1cyc/OiB7XHJcbiAgICBkaXN0cmlidXRlPzoge1xyXG4gICAgICBwbHVnaW5zPzogUmVjb3JkPHN0cmluZywgYW55PlxyXG4gICAgfVxyXG4gIH1cclxuICAnYXBwLXBsdXMnPzoge1xyXG4gICAgZGlzdHJpYnV0ZT86IHtcclxuICAgICAgcGx1Z2lucz86IFJlY29yZDxzdHJpbmcsIGFueT5cclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHN5bmNNYW5pZmVzdFBsdWdpbigpOiBQbHVnaW4ge1xyXG4gIHJldHVybiB7XHJcbiAgICBuYW1lOiAnc3luYy1tYW5pZmVzdCcsXHJcbiAgICBhcHBseTogJ2J1aWxkJyxcclxuICAgIGVuZm9yY2U6ICdwb3N0JyxcclxuICAgIHdyaXRlQnVuZGxlOiB7XHJcbiAgICAgIG9yZGVyOiAncG9zdCcsXHJcbiAgICAgIGhhbmRsZXIoKSB7XHJcbiAgICAgICAgY29uc3Qgc3JjTWFuaWZlc3RQYXRoID0gcGF0aC5yZXNvbHZlKHByb2Nlc3MuY3dkKCksICcuL3NyYy9tYW5pZmVzdC5qc29uJylcclxuICAgICAgICBjb25zdCBkaXN0QXBwUGF0aCA9IHBhdGgucmVzb2x2ZShwcm9jZXNzLmN3ZCgpLCAnLi9kaXN0L2Rldi9hcHAvbWFuaWZlc3QuanNvbicpXHJcblxyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAvLyBcdThCRkJcdTUzRDZcdTZFOTBcdTY1ODdcdTRFRjZcclxuICAgICAgICAgIGNvbnN0IHNyY01hbmlmZXN0ID0gSlNPTi5wYXJzZShmcy5yZWFkRmlsZVN5bmMoc3JjTWFuaWZlc3RQYXRoLCAndXRmOCcpKSBhcyBNYW5pZmVzdFR5cGVcclxuXHJcbiAgICAgICAgICAvLyBcdTc4NkVcdTRGRERcdTc2RUVcdTY4MDdcdTc2RUVcdTVGNTVcdTVCNThcdTU3MjhcclxuICAgICAgICAgIGNvbnN0IGRpc3RBcHBEaXIgPSBwYXRoLmRpcm5hbWUoZGlzdEFwcFBhdGgpXHJcbiAgICAgICAgICBpZiAoIWZzLmV4aXN0c1N5bmMoZGlzdEFwcERpcikpIHtcclxuICAgICAgICAgICAgZnMubWtkaXJTeW5jKGRpc3RBcHBEaXIsIHsgcmVjdXJzaXZlOiB0cnVlIH0pXHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgLy8gXHU4QkZCXHU1M0Q2XHU3NkVFXHU2ODA3XHU2NTg3XHU0RUY2XHVGRjA4XHU1OTgyXHU2NzlDXHU1QjU4XHU1NzI4XHVGRjA5XHJcbiAgICAgICAgICBsZXQgZGlzdE1hbmlmZXN0OiBNYW5pZmVzdFR5cGUgPSB7fVxyXG4gICAgICAgICAgaWYgKGZzLmV4aXN0c1N5bmMoZGlzdEFwcFBhdGgpKSB7XHJcbiAgICAgICAgICAgIGRpc3RNYW5pZmVzdCA9IEpTT04ucGFyc2UoZnMucmVhZEZpbGVTeW5jKGRpc3RBcHBQYXRoLCAndXRmOCcpKVxyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIC8vIFx1NTk4Mlx1Njc5Q1x1NkU5MFx1NjU4N1x1NEVGNlx1NUI1OFx1NTcyOCBwbHVnaW5zXHJcbiAgICAgICAgICBpZiAoc3JjTWFuaWZlc3RbJ2FwcC1wbHVzJ10/LmRpc3RyaWJ1dGU/LnBsdWdpbnMpIHtcclxuICAgICAgICAgICAgLy8gXHU3ODZFXHU0RkREXHU3NkVFXHU2ODA3XHU2NTg3XHU0RUY2XHU0RTJEXHU2NzA5XHU1RkM1XHU4OTgxXHU3Njg0XHU1QkY5XHU4QzYxXHU3RUQzXHU2Nzg0XHJcbiAgICAgICAgICAgIGlmICghZGlzdE1hbmlmZXN0LnBsdXMpXHJcbiAgICAgICAgICAgICAgZGlzdE1hbmlmZXN0LnBsdXMgPSB7fVxyXG4gICAgICAgICAgICBpZiAoIWRpc3RNYW5pZmVzdC5wbHVzLmRpc3RyaWJ1dGUpXHJcbiAgICAgICAgICAgICAgZGlzdE1hbmlmZXN0LnBsdXMuZGlzdHJpYnV0ZSA9IHt9XHJcblxyXG4gICAgICAgICAgICAvLyBcdTU5MERcdTUyMzYgcGx1Z2lucyBcdTUxODVcdTVCQjlcclxuICAgICAgICAgICAgZGlzdE1hbmlmZXN0LnBsdXMuZGlzdHJpYnV0ZS5wbHVnaW5zID0gc3JjTWFuaWZlc3RbJ2FwcC1wbHVzJ10uZGlzdHJpYnV0ZS5wbHVnaW5zXHJcblxyXG4gICAgICAgICAgICAvLyBcdTUxOTlcdTUxNjVcdTY2RjRcdTY1QjBcdTU0MEVcdTc2ODRcdTUxODVcdTVCQjlcclxuICAgICAgICAgICAgZnMud3JpdGVGaWxlU3luYyhkaXN0QXBwUGF0aCwgSlNPTi5zdHJpbmdpZnkoZGlzdE1hbmlmZXN0LCBudWxsLCAyKSlcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ1x1MjcwNSBNYW5pZmVzdCBwbHVnaW5zIFx1NTQwQ1x1NkI2NVx1NjIxMFx1NTI5RicpXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgY29uc29sZS5lcnJvcignXHUyNzRDIFx1NTQwQ1x1NkI2NSBtYW5pZmVzdCBwbHVnaW5zIFx1NTkzMVx1OEQyNTonLCBlcnJvcilcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIH1cclxufVxyXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQWdTLE9BQU9BLFdBQVU7QUFDalQsT0FBT0MsY0FBYTtBQUNwQixPQUFPLFNBQVM7QUFDaEIsU0FBUyxrQkFBa0I7QUFDM0IsT0FBTyxtQkFBbUI7QUFFMUIsT0FBTyxnQkFBZ0I7QUFFdkIsT0FBTyxpQkFBaUI7QUFFeEIsT0FBTyxjQUFjOzs7QUNUckIsU0FBUyxpQkFBaUI7QUFNbkIsU0FBUyxjQUFpQztBQUMvQyxTQUFPO0FBQUEsSUFDTCxNQUFNO0FBQUEsSUFDTixTQUFTLENBQUMsU0FBaUI7QUFDekIsVUFBSSxLQUFLLE1BQU0sVUFBVSxHQUFHO0FBQzFCLGNBQU0sV0FBVyxVQUFVLElBQUk7QUFDL0IsZUFBTztBQUFBLFVBQ0w7QUFBQSxVQUNBLE1BQU0seUJBQXlCLFFBQVEsSUFBSSxRQUFRO0FBQUEs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QUFjO0FBQUEsUUFDL0M7QUFBQSxNQUNGO0FBQUE7QUFBQSxNQUVBLGlCQUFpQixRQUNkLFNBQVMsZ0JBQ1QsV0FBVztBQUFBLFFBQ1osVUFBVTtBQUFBLFFBQ1YsTUFBTTtBQUFBLFFBQ04sVUFBVTtBQUFBLFFBQ1YsWUFBWTtBQUFBLE1BQ2QsQ0FBQztBQUFBO0FBQUEsTUFFRDtBQUFBLFFBQ0UsaUJBQWlCLFNBQVMsZ0NBQWdDO0FBQUEsUUFDMUQ7QUFBQSxVQUNFLFNBQVMsU0FBUztBQUFBO0FBQUEsUUFDcEI7QUFBQSxNQUNGO0FBQUEsTUFDQSxtQkFBbUI7QUFBQSxNQUNuQixxQkFBcUI7QUFBQSxNQUNyQixnQkFBZ0I7QUFBQSxRQUNkLE1BQU0saUJBQWlCLFFBQVEsU0FBUztBQUFBLE1BQzFDLENBQUM7QUFBQTtBQUFBO0FBQUEsTUFHRCx1QkFBdUIsVUFBVSxhQUFhO0FBQUEsUUFDNUM7QUFBQSxRQUNBLHVCQUF1QjtBQUFBLFFBQ3ZCLG9CQUFvQjtBQUFBLE1BQ3RCLENBQUM7QUFBQSxJQUNIO0FBQUEsSUFDQSxRQUFRO0FBQUEsTUFDTixvQkFBb0IsS0FBSyxVQUFVLHFCQUFxQjtBQUFBLElBQzFEO0FBQUEsSUFDQSxLQUFLO0FBQUEsTUFDSCxTQUFTO0FBQUEsUUFDUCxTQUFTO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxRQUtUO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxJQUVBLFNBQVM7QUFBQSxNQUNQLE9BQU87QUFBQSxRQUNMLEtBQUtDLE1BQUssS0FBS0QsU0FBUSxJQUFJLEdBQUcsT0FBTztBQUFBLFFBQ3JDLFFBQVFDLE1BQUssS0FBS0QsU0FBUSxJQUFJLEdBQUcscUJBQXFCO0FBQUEsTUFDeEQ7QUFBQSxJQUNGO0FBQUEsSUFDQSxRQUFRO0FBQUEsTUFDTixNQUFNO0FBQUEsTUFDTixLQUFLO0FBQUEsTUFDTCxNQUFNLE9BQU8sU0FBUyxlQUFlLEVBQUU7QUFBQTtBQUFBLE1BRXZDLE9BQU8sS0FBSyxNQUFNLHFCQUFxQixJQUNuQyxnQkFBZ0IsSUFDaEI7QUFBQSxJQUNOO0FBQUEsSUFDQSxTQUFTO0FBQUEsTUFDUCxNQUFNLHdCQUF3QixTQUFTLENBQUMsV0FBVyxVQUFVLElBQUksQ0FBQztBQUFBLElBQ3BFO0FBQUEsSUFDQSxPQUFPO0FBQUEsTUFDTCxXQUFXO0FBQUE7QUFBQTtBQUFBLE1BR1gsUUFBUTtBQUFBO0FBQUEsTUFFUixRQUFRLFNBQVMsZ0JBQWdCLFFBQVE7QUFBQSxJQUMzQztBQUFBLEVBQ0YsQ0FBQztBQUNILENBQUM7IiwKICAibmFtZXMiOiBbInBhdGgiLCAicHJvY2VzcyIsICJwYXRoIiwgInByb2Nlc3MiLCAiZnMiLCAicHJvY2VzcyIsICJwYXRoIiwgImZzIiwgImZzIiwgInBhdGgiLCAicHJvY2VzcyIsICJwcm9jZXNzIiwgInBhdGgiLCAiZnMiLCAiZnMiLCAicGF0aCIsICJwcm9jZXNzIiwgInBhdGgiLCAicHJvY2VzcyIsICJmcyIsICJwcm9jZXNzIiwgInBhdGgiXQp9Cg==
