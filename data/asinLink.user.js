(function(){
    if(window.location.href != window.parent.location.href) {
        return;
    }

    var extension = new Extension();

    if(!document.getElementById('ASIN')) {
        return;
    }

    var asin = document.getElementById('ASIN').value;

    var td = document.evaluate('//form[@id="handleBuy"]/table[last()]/tbody/tr[1]/td[1]', document, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null).iterateNext();

    var selected = document.evaluate('//select[@id="searchDropdownBox"]/option[@selected="selected"]', document, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null).iterateNext();

    var category = selected ? selected.text : undefined;

    extension.postMessage('loaded', { asin: asin, category: category }, function(res) {
        var links = res.links;

        for (var i = 0, len = links.length; i < len; i++) {
            var div = document.createElement('div');
            div.innerHTML = links[i];
            td.appendChild(div);
        }
    });
})();
