const { src, dest, watch } = require("gulp");
const babel = require("gulp-babel");

function javascript (cb) {
  return src("src/**/*.js")
    .pipe(babel())
    .pipe(dest("dist"));
}

exports.default = function () {
  watch('src/**/*.js', javascript)
}
