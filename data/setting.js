function AsinLinkSetting() {
}

AsinLinkSetting.prototype.text2data = function (text) {
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

AsinLinkSetting.prototype.data2text = function(data) {
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

AsinLinkSetting.prototype.getValues = function(asin, category, setting) {
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
