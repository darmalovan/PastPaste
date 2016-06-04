const {clipboard} = require('electron');
const osa = require('node-osascript');
const $ = require('jquery');
const storage = require('electron-json-storage');

let clipboardList = document.getElementById('clipboard-history');
let lastClipText = clipboard.readText();
let currentClipText = clipboard.readText();

function createNewClipItem(clipText) {
  var listItem = document.createElement('li');
  $(listItem).addClass('clip-item list-group-item').attr('text', clipText);

  var clipItem = document.createElement('div');
  $(clipItem).addClass('media-body clip-item-text').text(clipText);

  listItem.appendChild(clipItem);
  $('.clip-item-text:contains("' + clipText + '")').parent().remove(); // remove duplicates
  clipboardList.insertBefore(listItem, clipboardList.firstElementChild);
  return listItem;
}
function getActiveItem() {
  return $('.active').length === 0 ? null : $($('.active')[0]);
}

function pasteText(text) {
  clipboard.writeText(text.trim());
  osa.executeFile('appleScript.script');
}

function checkNewDataOnClipboard() {
  if (lastClipText !== currentClipText) {
    let newClipItem = createNewClipItem(currentClipText);
    storage.set(newClipItem.innerText, {
      text: newClipItem.innerText,
      date: Date.now()
    }, function (error) { // TODO add limit for data
      if (error) throw error;
    });

    lastClipText = currentClipText;
  }
  updateItemCount();
  currentClipText = clipboard.readText();
}

function updateItemCount() {
  $('#showing-item-count').text($('.clip-item:visible').length);
  $('#total-item-count').text($('.clip-item').length);
}

function initFromStorage() {
  storage.keys((e, keys) => {
    keys.forEach((el) => {
      storage.has(el, (err, has) => {
        if (has) {
          createNewClipItem(el);
        }
      });
      console.log(el + ' date:' + el.date);
    });
    updateItemCount();
  });
}

function addAppEventHandlers() {
  $('body').on('keydown', function (event) {
    var activeItem = getActiveItem();
    if (activeItem === null && (event.which === 40 || event.which === 38)) {
      $('.clip-item').first().addClass('active');
    }
    else if (event.which === 40) { // on arrow down go to the next clip item
      activeItem.removeClass('active');
      activeItem.nextAll(':visible').first().addClass('active');
    }
    else if (event.which === 38) { // on arrow up go to the prev clip item
      activeItem.removeClass('active');
      activeItem.prevAll(':visible').first().addClass('active');
    }
    else if (event.which === 13) { // clicking enter on an item
      pasteText(activeItem.text());
    }
  });

  $('body').on('click', '.clip-item', function (event) {
    pasteText($(event.target).text());
  })
}

function createSearchEventHandler() {
  $('#search').on('keyup', function () {
    var searchedText = this.value;
    $('.clip-item').each((i, el) => {
      // if the clip item doesn't contain the text hide it
      var $el = $(el);
      if ($el.attr('text').indexOf(searchedText) === -1) {
        $el.hide();
      } else {
        $el.show()
      }
    });
    updateItemCount();
  });

  $('body').on('keyup', function () {
    if (event.which === 83) { // on pressing s go to the search box
      $('#search').focus();
    }
  });
}

function loadApp() {
  initFromStorage();
  setInterval(checkNewDataOnClipboard, 500);
  addAppEventHandlers();
  createSearchEventHandler();
}

loadApp();