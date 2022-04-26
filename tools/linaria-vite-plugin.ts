const path = require("path");
const { createFilter } = require("@rollup/pluginutils");
const { transform, slugify } = require("@linaria/babel-preset");

const runtimePublicPath = "/@linaria-cache/";

export default (options: any = {}) => {
  let {
    include,
    exclude,
    sourceMap,
    preprocessor,
    extension = ".css",
    ...rest
  } = options;
  if (!include) include = ["**/*.ts", "**/*.tsx"];
  const filter = createFilter(include, exclude);
  const cssLookup = {};

  return {
    name: "linaria",
    load: (id) => cssLookup[id],
    resolveId: (importee) => cssLookup[importee] && importee,
    transform: (code, id) => {
      if (
        !filter(id) ||
        id in cssLookup ||
        /^(?:.*[\\\/])?node_modules(?:[\\\/].*)?$/.test(id)
      )
        return;

      const result = transform(code, {
        filename: id,
        preprocessor,
        pluginOptions: rest,
      });

      if (!result.cssText) return;

      let { cssText } = result;
      const slug = slugify(cssText);

      const basename = path.basename(id);
      const filename = runtimePublicPath
        .concat(basename.replace(/(\.js|\.jsx|\.tsx|\.ts)$/, ""), "_")
        .concat(slug, extension);

      if (sourceMap && result.cssSourceMapText) {
        const map = Buffer.from(result.cssSourceMapText).toString("base64");
        cssText += `/*# sourceMappingURL=data:application/json;base64,${map}*/`;
      }

      cssLookup[filename] = cssText;
      result.code += `\nimport ${JSON.stringify(filename)};\n`;

      return { code: result.code, map: result.sourceMap };
    },
  };
};
