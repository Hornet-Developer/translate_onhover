$(function() {
  var tooltip = new Tooltip();

  $(document).bind('mousestop', function(e) {

    //TODO skip entirely if user is selecting text (so that selection is not dropped)
    //TODO make it not messing around with links

    function getHitWord(e) {
      var hit_word = '';
      var hit_elem = $(document.elementFromPoint(e.clientX, e.clientY));

      //text contents of hit element
      var text_nodes = hit_elem.contents().filter(function(){
        return this.nodeType == Node.TEXT_NODE && this.nodeValue.match(/[a-zA-Z]{2,}/)
      });

      //bunch of text under cursor? break it into words
      if (text_nodes.length > 0) {
        var original_content = hit_elem.clone();

        //wrap every word in every node in a dom element (real magic happens here)
        text_nodes.replaceWith(function(i) {
          return $(this).text().replace(/([a-zA-Z-]*)/g, "<transover>$1</transover>")
        });

        //get the exact word under cursor (and here)
        var hit_word_elem = document.elementFromPoint(e.clientX, e.clientY);

        //no word under cursor? we are done
        if (hit_word_elem.nodeName != 'TRANSOVER') {
          console.log("missed!");
        }
        else  {
          hit_word = $(hit_word_elem).text();
          console.log("got it: "+hit_word);
        }

        hit_elem.replaceWith(original_content);
      }
      return hit_word;
    }

    function translate_and_show(word, e) {
      chrome.extension.sendRequest({word: word}, function(response){
        console.log('response: '+response.translation);
        tooltip.show(e.clientX, e.clientY, response.translation);
        setTimeout(function() { tooltip.hide() }, 6000);
      });
    }

    var word = getHitWord(e);

    if (word == '') { return }

    //little gap between mousestop and translation
    setTimeout(function() {
      //moved away from the word during gap? halt translation
      if (last_x != e.clientX && last_y != e.clientY) { return }

      translate_and_show(word, e);
    }, 1000);

  });

  var timer25;

  // setup mousestop event
  $(document).mousemove(function(e){
    clearTimeout(timer25);

    timer25 = setTimeout(function() {
      var mousestop = new $.Event("mousestop");
      mousestop.clientX = e.clientX;
      mousestop.clientY = e.clientY;
      $(document).trigger(mousestop);
    }, 25);
  });

  var last_x, last_y;

  // hide translation on any move
  $(document).mousemove(function(e) {
    if (last_x != e.clientX || last_y != e.clientY) {
      tooltip.hide();
    }
    last_x = e.clientX;
    last_y = e.clientY;
  });
})