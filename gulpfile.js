"use strict";

var gulp = require("gulp");
var sass = require("gulp-sass");
var plumber = require("gulp-plumber"); //продолжает работу автоматизации при ошибке выполнения
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var server = require("browser-sync").create();
var rimraf = require("rimraf"); //очистка
var imagemin = require("gulp-imagemin"); //минимизация изображений
var sourcemaps = require("gulp-sourcemaps"); //sourcemaps
var uglify = require("gulp-uglify"); //минификация js
var babel = require("gulp-babel");
var rename = require("gulp-rename"); //переименвоание файлов
var htmlmin = require("gulp-htmlmin");// минификация html
var runSequence = require("run-sequence");
var svgmin = require("gulp-svgmin");
var svgstore = require("gulp-svgstore");
var minify = require("gulp-csso");
var concat = require("gulp-concat");
var fileinclude = require("gulp-file-include");
var csscomb = require("gulp-csscomb");
var inlinesource = require("gulp-inline-source");
var cheerio = require("gulp-cheerio");
var webp = require("gulp-webp");

var path = {
  build: { //Тут мы укажем куда складывать готовые после сборки файлы
    html: "build/",
    pages: "build/*.html",
    serverRoot: "./build/",
    js: "build/js/",
    css: "build/css/",
    img: "build/img/",
    fonts: "build/fonts/",
    favicon: "build/img/favicon/",
    sprite: "build/img/sprite/",
    svgSprite: "build/img/svg",
    webmanifest: "build/"
  },
  src: { //Пути откуда брать исходники
    html: ["src/**/*.html", "!src/_blocks/**/*.html"], //Синтаксис src/*.html все файлы с расширением .html в папке src.
    js: ["src/_blocks/**/*.js", "!src/_blocks/**/jq-*.js"],//в папке src все папки, а в них все файлы .js
    jsJq: "src/_blocks/**/jq-*.js",//в папке src все папки, а в них все файлы .js
    plagjs: "src/js/*.js", //скрипты плагинов
    css: "src/scss/main.scss", // в папке src все папки, а в них все файлы .css
    img: "src/img/_blocks/**/*.{png,jpg,gif}",
    imgWebp: "src/img/_blocks/**/*.{webp}",
    blocksvg: "src/img/_blocks/**/*.svg",
    fonts: ["src/fonts/**/*.*", "!src/fonts/**/*.scss"],
    favicon: "src/img/favicon/*",
    sprite: "src/img/sprite/*",
    svg: "src/img/svg/*.svg",
    webmanifest: "src/*.webmanifest.json"
  },
  watch: { //Тут мы укажем, за изменением каких файлов мы хотим наблюдать
    html: "src/**/*.html",
    js: "src/**/*.js",
    css: "src/**/*.scss",
    img: "src/img/_blocks/**/*.{png,jpg,gif}",
    fonts: "src/fonts/**/*.*",
    favicon: "src/img/favicon/*",
    sprite: "src/img/sprite/*",
    blocksvg: "src/img/_blocks/**/*.svg",
    svg: "src/img/svg/*.svg",
    webmanifest: "src/*.webmanifest.json"
  },
  clean: "./build", //директории которые могут очищаться
};



//  Таск для чистки папки build
gulp.task("clean", function (cb) {
  return rimraf(path.clean, cb);
});
//-----------------------------------

// Таск для генерации изображений в формате webp
gulp.task("webp", function(){
  return gulp.src("src/img/_blocks/**/*.{png,jpg}")
  .pipe(webp({quality: 90}))
  .pipe(gulp.dest("src/img/_blocks/"));
});
//-----------------------------------

// Таск для склеивания SVG-спраита
gulp.task("symbols", function () {
  return gulp.src(path.src.svg)
    .pipe(svgmin())
    .pipe(svgstore({
      inlineSvg: true
    }))
    .pipe(cheerio({
      run: function ($) {
        $("svg").attr("style", "display:none");
      },
      parserOptions: { xmlMode: true }
    }))
    .pipe(rename("symbols.svg"))
    .pipe(gulp.dest(path.build.svgSprite))
    .pipe(server.reload({stream: true}));
});
//------------------------------------

// Таск для вставки ресурсов инлайн в html
gulp.task("inlinesource", function () {
  var options = {
      compress: false
  };

  return gulp.src(path.build.pages)
      .pipe(inlinesource(options))
      .pipe(gulp.dest(path.build.html));
});
//-------------------------------------

//Копируем шрифты
gulp.task("fonts", function () {
  return gulp.src(path.src.fonts)
    .pipe(gulp.dest(path.build.fonts))
    .pipe(server.reload({stream: true}));
});
//-------------------------------------

//Копируем svg, которые размещены в папке img/_blocks (build)
gulp.task("blocksvg:build", function () {
  return gulp.src(path.src.blocksvg)
    .pipe(gulp.dest(path.build.img))
    .pipe(server.reload({stream: true}));
});
//-------------------------------------

//Копируем svg, которые размещены в папке img/_blocks (production)
gulp.task("blocksvg", function () {
  return gulp.src(path.src.blocksvg)
    .pipe(svgmin())
    .pipe(gulp.dest(path.build.img))
    .pipe(server.reload({stream: true}));
});
//-------------------------------------

//Копируем фавиконы
gulp.task("copyfavicon", function () {
  return gulp.src(path.src.favicon)
    .pipe(gulp.dest(path.build.favicon))
    .pipe(server.reload({stream: true}));
});
//-------------------------------------

//Копируем webmanifest
gulp.task("copywebmanifest", function () {
  return gulp.src(path.src.webmanifest)
    .pipe(gulp.dest(path.build.webmanifest))
    .pipe(server.reload({stream: true}));
});
//-------------------------------------

//Копируем спраиты
gulp.task("copysprite", function () {
  return gulp.src(path.src.sprite)
    .pipe(gulp.dest(path.build.sprite))
    .pipe(server.reload({stream: true}));
});
//-------------------------------------

// таск для копирования js для сторонних плагинов
gulp.task("copyjs", function () {
  return gulp.src(path.src.plagjs)
    .pipe(gulp.dest(path.build.js))
    .pipe(server.reload({stream: true}));
});
//------------------------------------

// Таск для инклудов html (build)
gulp.task("fileinclude:build", function() {
  gulp.src(path.src.html)
    .pipe(fileinclude({
      prefix: "@@",
      basepath: "@file"
    }))
    .pipe(gulp.dest(path.build.html))
    .pipe(server.reload({stream: true}));
});
//---------------------------------------

// Таск для инклудов html (production)
gulp.task("fileinclude", function() {
  gulp.src(path.src.html)
    .pipe(fileinclude({
      prefix: "@@",
      basepath: "@file"
    }))
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest(path.build.html));
});
//---------------------------------------

// Таск для работы с css (Production)
gulp.task("style", function () {
  gulp.src(path.src.css)
    .pipe(plumber())
    .pipe(csscomb())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(minify())
    .pipe(gulp.dest(path.build.css))
});
//------------------------------------

// Таск для работы с css (build)
gulp.task("style:build", function () {
  gulp.src(path.src.css)
    .pipe(plumber())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer({
        browsers: [
          "last 2 versions"
        ]
      })
    ]))
    .pipe(gulp.dest(path.build.css))
    .pipe(server.reload({stream: true}));
});
//------------------------------------

// Таск для сбора JS в один файл (build)
gulp.task("scripts:build", function() {
  return gulp.src(path.src.js)
    // .pipe(sourcemaps.init())
    // .pipe(sourcemaps.write())
    .pipe(concat("script.js"))
    .pipe(babel({
      presets: ["env"]
    }))
    .pipe(gulp.dest(path.build.js))
    .pipe(server.reload({stream: true}));
});
//-------------------------------------

// Таск для сбора JS в один файл (production)
gulp.task("scripts", function() {
  return gulp.src(path.src.js)
    // .pipe(sourcemaps.init())
    // .pipe(sourcemaps.write())
    .pipe(concat("script.js"))
    .pipe(babel({
      presets: ["env"]
    }))
    .pipe(uglify())
    .pipe(gulp.dest(path.build.js));
});
//--------------------------------------

// Таск для сбора JQuery в один файл (build)
gulp.task("scriptsJq:build", function() {
  return gulp.src(path.src.jsJq)
    .pipe(concat("jq-script.js"))
    .pipe(babel({
      presets: ["env"]
    }))
    .pipe(gulp.dest(path.build.js))
    .pipe(server.reload({stream: true}));
});
//-------------------------------------

// Таск для сбора JQuery в один файл (production)
gulp.task("scriptsJq", function() {
  return gulp.src(path.src.jsJq)
    .pipe(concat("jq-script.js"))
    .pipe(babel({
      presets: ["env"]
    }))
    .pipe(uglify())
    .pipe(gulp.dest(path.build.js));
});
//--------------------------------------

//Таск для работы с изображениями (production)
gulp.task("image", function () {
  return gulp.src(path.src.img)
    .pipe(imagemin([
      imagemin.optipng({optimizationLevel: 3}),
      imagemin.jpegtran({progressive: true})
    ]))
    .pipe(gulp.dest(path.build.img));
});
//------------------------------------

//Таск для работы с изображениями (build)
gulp.task("image:build", function () {
  return gulp.src(path.src.img)
    .pipe(gulp.dest(path.build.img))
    .pipe(server.reload({stream: true}));
});

//Таск для работы с изображениями (build)
gulp.task("image:webp", function () {
  return gulp.src(path.src.imgWebp)
    .pipe(gulp.dest(path.build.img))
    .pipe(server.reload({stream: true}));
});

// Сервер
gulp.task("serve", function () {
  server.init({
    server: "build",
    notify: false,
    open: true,
    cors: true,
    ui: false
  });
});
//----------------------------------------

//Отследим изменения в файлах
gulp.task("watcher", function () {
  gulp.watch(path.watch.img, ["image:build"]);
  gulp.watch(path.watch.html, ["fileinclude:build"]);
  gulp.watch(path.watch.js, ["scripts:build"]);
  gulp.watch(path.watch.js, ["scriptsJq:build"]);
  gulp.watch(path.watch.plagjs, ["copyjs"]);
  gulp.watch(path.watch.css, ["style:build"]);
  gulp.watch(path.watch.fonts, ["fonts"]);
  gulp.watch(path.watch.favicon, ["copyfavicon"]);
  gulp.watch(path.watch.webmanifest, ["copywebmanifest"]);
  gulp.watch(path.watch.blocksvg, ["blocksvg:build"]);
  gulp.watch(path.watch.sprite, ["copysprite"]);
});
//---------------------------------------

// билдим для разработки
gulp.task("build", function (callback) {
  runSequence("clean",
    "symbols",
    [
    "image:build",
    "image:webp",
    "fileinclude:build",
    "style:build",
    "scripts:build",
    "scriptsJq:build",
    "fonts",
    "copyjs",
    "copyfavicon",
    "blocksvg:build",
    "copysprite",
    "copywebmanifest"
    ],
    "serve",
    "watcher",
    callback);
});


// билдим для продакшна
gulp.task("production", function (callback) {
  runSequence("clean",
    "symbols",
    [
    "image",
    "image:webp",
    "style",
    "scripts",
    "scriptsJq",
    "fonts",
    "copyjs",
    "copyfavicon",
    "blocksvg",
    "fileinclude",
    "copysprite",
    "copywebmanifest"
    ],
  callback);
});
