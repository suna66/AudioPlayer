const gulp = require('gulp');
const concat = require("gulp-concat");
const uglify = require("gulp-uglify");
const rename = require('gulp-rename');
const htmlmin = require('gulp-htmlmin');
 
gulp.task('js' , async () => {
  gulp.src([
        'node_modules/waveform-data/dist/waveform-data.min.js',
        'src/Constants.js',
        'src/Element.js',
        'src/Button.js',
        'src/ImgButton.js',
        'src/SoundObject.js',
        'src/TextBox.js',
        'src/SelectBox.js',
        'src/View.js',
        'src/Player.js',
        'src/index.js'
    ])
    .pipe(concat('bandle.js'))
    .pipe(uglify())
    .pipe(rename('bandle.min.js'))
    .pipe(gulp.dest('dist/'));
});

gulp.task('html' , async () => {
  gulp.src('src/index.html')
    .pipe(htmlmin({
        collapseWhitespace : true,
        removeComments : true
    }))
    .pipe(gulp.dest('dist/'));
});

 
gulp.task('watch' , async () => {
  gulp.watch('src/*.js' , ['js']);
});
 
gulp.task('default' , async () => {
  console.log("default task start");
});
