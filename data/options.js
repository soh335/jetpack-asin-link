var form = document.getElementById('setting');
var textarea = document.getElementById('link_setting');

form.addEventListener('submit', function(evt) {
    postMessage({ name: 'updateSettings', data: textarea.value });
    evt.preventDefault();

}, false);

onMessage = function(mes) {
    if (mes.name == 'settings') {
        var setting = mes.data;
        textarea.value = setting;
    }
};

postMessage({ name: 'loadedSettings' });
