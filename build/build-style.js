const gulp = require('gulp');
const cleanCSS = require('gulp-clean-css');
const less = require('gulp-less');
const rename = require('gulp-rename');
const autoprefixer = require('gulp-autoprefixer');
const pkg = require('../package.json');

// 编译less
function lessFmt() {
    return gulp.src('../src/styles/index.less')
        .pipe(less())
        .pipe(autoprefixer({
            browsers: ['last 2 versions', 'ie > 8']
        }))
        .pipe(cleanCSS())
        .pipe(rename(`iview${pkg.version}.css`))
        .pipe(gulp.dest('../dist'));
}

// 拷贝字体文件
function fontsFmt() {
    return gulp.src('../src/styles/common/iconfont/fonts/*.*')
        .pipe(gulp.dest('../dist/styles/fonts'));
}

gulp.task('default', gulp.series(lessFmt));
