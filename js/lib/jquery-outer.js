
(function($){

  $.fn.skOuterClick = function(method) {
    var methods = {
      init : function (handler) {
        var inners = new Array();
        if (arguments.length > 1) for (i = 1; i < arguments.length; i++) {
          inners.push(arguments[i]);
        }
        return this.each(function() {
          var self = $(this);
          var _this = this;
          var isInner = false;
          // Bind click event to suppress
          function onInnerClick(e){
            isInner = true;
          };
          self.click(onInnerClick);
          for (var i = 0; i < inners.length; i++) {
            inners[i].click(onInnerClick);
          }
          // Bind click elsewhere
          $(document).click(function(e){
            if (!isInner) handler.call(_this, e);
            else isInner = false;
          });
        });
      }
    };
    if (methods[method]) {
      return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
    } else if (typeof method === 'function') {
      return methods.init.apply(this, arguments);
    } else {
      $.error('Method "' + method + '" does not exist in skOuterClick plugin!');
    }
  };
})(jQuery);