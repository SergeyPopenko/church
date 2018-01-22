"use strict";
// options = {
//   elem: DOM-Object - элемент меню,
//   btn: "любой синтаксис разрешенный в querySelector" - кнопка для открытия/закрытия меню,
//   opened: true/false - меню открыто/закрыто по умолчанию

//   Меню генерирует событие onchange в котором есть объект .detail - с свойством opened - показывающее состояние меню открыто/закрыто
//   Меню реагирует на нажатие клавиши esc - закрывая меню
//   Когда меню отркывается - то на body навешивается класс body-popup - убирающий полосу прокрутки
// }

function Menu(options) {
  this._elem = options.elem;

  this._btn = options.btn || "[data-btn]";

  this._elem.onclick = this._onClick.bind(this);

  this._opened = options.opened || false;

  this._defaultOpen(this._opened);

  window.addEventListener("keydown", (e) => {
    if (e.which == "27") {
      this.close();
    }
  });
}

// Функция обработки клика по элементу
Menu.prototype._onClick = function(e){
  if (e.target.closest(this._btn)) {
    this.toggle();
  }
}

// Функция установки меню в состояние открыто/закрыто - по умолчанию
Menu.prototype._defaultOpen = function(value) {
  if (value == true) {
    this.open();
  } else {
    this.close();
  }
}

// Функция открытия меню
Menu.prototype.open = function(e) {
  this._menuPosition();
  this._elem.classList.add("menu--open");
  this._opened = true;
  this._onchange();
}

// Функция закрытия меню
Menu.prototype.close = function(e) {
  this._elem.classList.remove("menu--open");
  this._opened = false;
  this._onchange();
}

// Функция переключения меню из одного состояния в другое
Menu.prototype.toggle = function() {
  if (this._opened) {
    this.close();
  } else {
    this.open();
  }
}

// Функция генерации события открытия/закрытия
Menu.prototype._onchange = function() {
  let event = new CustomEvent("menuChange", {
    bubbles: true,
    detail: {
      opened: this._opened
    }
  });

  this._elem.dispatchEvent(event);
}

// Функция задания позиции меню при его открытии/закрытии/ресайзе
Menu.prototype._menuPosition = function() {
  let menuWrap = this._elem.querySelector(".menu__list-wrap"),
      headerHeight = getComputedStyle(this._elem.closest(".header")).height;

  menuWrap.style.top = headerHeight;
}

if(document.querySelector("#menu")) {
  var menu = new Menu({
    elem: document.querySelector("#menu")
  });
}