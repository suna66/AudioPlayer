const gulp = require('gulp');
const concat = require("gulp-concat");
const uglify = require("gulp-uglify");
const rename = require('gulp-rename');
const htmlmin = require('gulp-htmlmin');
 
gulp.task('js' , (done) => {
  gulp.src([
        'node_modules/waveform-data/dist/waveform-data.min.js',
        'src/audiobuffer-to-wav/audiobuffer-to-wav.min.js',
        'src/Common.js',
        'src/Element.js',
        'src/Button.js',
        'src/PlayButton.js',
        'src/StopButton.js',
        'src/ImgButton.js',
        'src/SoundObject.js',
        'src/TextBox.js',
        'src/SelectBox.js',
        'src/View.js',
        'src/Player.js',
        'src/Mixing.js',
        'src/index.js'
    ])
    .pipe(concat('bandle.js'))
    .pipe(uglify())
    .pipe(rename('bandle.min.js'))
    .pipe(gulp.dest('dist/'));
  done();
});

gulp.task('debugjs' , (done) => {
  gulp.src([
        'node_modules/waveform-data/dist/waveform-data.min.js',
        'src/audiobuffer-to-wav/audiobuffer-to-wav.min.js',
        'src/Common.js',
        'src/Element.js',
        'src/Button.js',
        'src/PlayButton.js',
        'src/StopButton.js',
        'src/ImgButton.js',
        'src/SoundObject.js',
        'src/TextBox.js',
        'src/SelectBox.js',
        'src/View.js',
        'src/Player.js',
        'src/Mixing.js',
        'src/index.js'
    ])
    .pipe(gulp.dest('debug/'));
  done();
});


gulp.task('debughtml' , (done) => {
  gulp.src([
        'src/head.html',
        'src/body.html',
        'src/debug.html',
        'src/foot.html'
    ])
    .pipe(concat('index.html'))
    .pipe(gulp.dest('debug/'));
  done();
});

gulp.task('debug' , gulp.series('debugjs', 'debughtml', (done) => {
  console.log("done");
  done();
}));

gulp.task('html', (done) => {
  gulp.src([
        'src/head.html',
        'src/body.html',
        'src/release.html',
        'src/foot.html'
    ])
    .pipe(concat('index.html'))
    .pipe(htmlmin({
        collapseWhitespace : true,
        removeComments : true
    }))
    .pipe(gulp.dest('dist/'));
  done();
});

gulp.task('build' , gulp.series('js', 'html', (done) => {
  console.log("done");
  done();
}));

gulp.task('watch' , async () => {
  gulp.watch('src/*.js' , ['js']);
});
 
gulp.task('default' , async () => {
  console.log("default task start");
});
