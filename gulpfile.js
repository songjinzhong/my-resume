// 引入 gulp
var gulp = require('gulp'); 

// 引入组件
var jshint=require('gulp-jshint');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var minifycss = require('gulp-minify-css');
var stylus = require('gulp-stylus');
var handlebars = require('gulp-compile-handlebars');

//读取json文件
var fs = require('fs');
var path = require('path');
var resume_path = path.join(__dirname, 'public/data/resume.json');

var paths={
    gulp_js:'public/gulpjs/*.js',
    css:'build/css',
    js:'public/js/',
    stylus:'public/stylus/resume.styl',
    hbs:'views/index.hbs',
    build:'build'
}

// 检查脚本
gulp.task('jshint', function() {
    gulp.src(paths.gulp_js)
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

gulp.task('stylus', function () {
    return gulp.src(paths.stylus)
        .pipe(stylus())
        .pipe(gulp.dest(paths.css))
        .pipe(rename({suffix: '.min'}))
        .pipe(minifycss())
        .pipe(gulp.dest(paths.css));
});

// 合并，压缩文件
gulp.task('scripts', function() {
    gulp.src(paths.gulp_js)
        .pipe(concat('all.js'))
        .pipe(gulp.dest(paths.js))
        .pipe(rename({suffix: '.min'}))
        .pipe(uglify())
        .pipe(gulp.dest(paths.js));
});

//生成 html文件
gulp.task('hbs',function(){
    var resume_data = {};
    //读文件
    fs.readFile(resume_path, function(err, data) {
        if (err) {
            console.error(err);
            process.exit(1);
        }
        resume_data = JSON.parse(data);
        options = {
            batch : ['views/partials'],
            helpers : {
                descript : function(list){
                    return list.join("/");
                },
                render: function(obj){
                    if(obj.source && obj.source_url){
                        return ''
                    }
                    return 'none'
                },
                renderd: function(obj){
                    if(obj.demo && obj.demo_url){
                        return ''
                    }
                    return 'none'
                },
                strong: function(str){
                    return str.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/`(.+?)`/g, '<strong>$1</strong>');
                }
            }
        };
        gulp.src(paths.hbs)
            .pipe(handlebars(resume_data,options))
            .pipe(rename("index.html"))
            .pipe(gulp.dest(paths.build));
    });
});

//监听文件变化
gulp.task('watch',function(){
        gulp.watch(paths.gulpjs, ['scripts']);
        gulp.watch([paths.stylus, 'public/stylus/part/*.styl', 'public/stylus/userful/*.styl'],['stylus']);
        gulp.watch(["views/*.hbs","views/*/*.hbs","public/data/resume.json"],['hbs']);
});

//default
gulp.task('default',['jshint','scripts','stylus','hbs','watch'])