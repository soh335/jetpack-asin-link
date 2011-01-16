/*
 * author: soh335
 * license: MIT License
 */

var widgets = require("widget");
var pageMod = require("page-mod");
var self = require("self");
var panels = require("panel");
var localStorage = require('simple-storage').storage;

exports.main = function (options, callbacks) {

    pageMod.PageMod({
        include: ["http://www.amazon.co.jp/*"],
        contentScriptWhen: 'ready',
        contentScriptFile: [self.data.url('extension.js/extension.js'), self.data.url('asinLink.user.js')],
        onAttach: function(worker) {
            worker.on('message', function(mes) {
                if (mes.name == 'loaded') {
                    console.log('loaded');
                    var data = localStorage.setting || [];
                    var links = AsinLinkSetting.getValues(mes.data.asin, mes.data.category, data);
                    worker.postMessage({name:'loaded', data: { links: links }});
                }
            });
        }
    });

    var configPanel = panels.Panel({
        contentURL: self.data.url("options.html"),
        contentScriptFile: self.data.url("options.js"),
        contentScriptWhen: 'ready',
        width: 530,
        height: 330,
        onMessage: function(mes) {
            if (mes.name == 'loadedSettings') {
                configPanel.postMessage({ 
                    name: 'settings', 
                    data: localStorage.setting ? AsinLinkSetting.data2text(localStorage.setting) : []
                });
            }
            else if (mes.name == 'updateSettings') {
                localStorage.setting = AsinLinkSetting.text2data(mes.data);
            }
        }
    });

    widgets.Widget({
        label: "asin-link",
        contentURL: self.data.url('asin-link.png'),
        onClick: function() {
            console.log("click");
            configPanel.show();
        }
    });

};

AsinLinkSetting = {};

AsinLinkSetting.text2data = function (text) {
    console.log("text2data");
    var split_setting = text.split(/$/gm);
    var options = [];

    for (var i = 0, len = split_setting.length; i < len; i++) {
        split_setting[i] = split_setting[i].replace(/(\n|\r)/, '');
        console.log(split_setting[i]);
        var hash = {};
        var rows = split_setting[i].split(/\s/);

        if (rows.length === 3) {
            var categories = rows.pop();
            if (categories.substr(0, 1) === '!') {
                hash.cond = 'deny';
                categories = categories.substr(1);
            }
            else {
                hash.cond = 'allow';
            }
            hash.categories = categories.split(',');
        }
        else {
            hash.cond = 'all';
        }
        console.log(hash.cond);
        hash.name = rows[0];
        hash.url = rows[1];
        options.push(hash);
    }

    return options;
};

AsinLinkSetting.data2text = function(data) {
    console.log("data2text");
    var res;
    for (var i = 0, len = data.length; i < len; i++) {
        var str = data[i].name+" "+data[i].url;
        switch(data[i].cond) {
            case 'all':
                break;
            case 'deny':
                str += ' !'+data[i].categories.join(',');
                break;
            case 'allow':
                str += ' '+data[i].categories.join(',');
                break;
        }
        res += str + "\n";
    }

    return res;
};

AsinLinkSetting.getValues = function(asin, category, setting) {
    var res = [];

    for (var i = 0, len = setting.length; i < len; i++) {
        if (category === undefined) {
            setting[i].cond = 'all';
        }

        switch(setting[i].cond) {
            case 'allow':
                if (setting[i].categories.indexOf(category) == -1) {
                    continue;
                }
                break;
            case 'deny':
                if (setting[i].categories.indexOf(category) != -1) {
                    continue;
                }
                break;
            case 'all':
            default:
        }
        res.push('<a href="'+setting[i].url.replace(/{ASIN}/, asin)+'">'+setting[i].name+'</a>');
    }

    return res;
};
