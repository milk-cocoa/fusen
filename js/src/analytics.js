$(function(){
  if(prompt("Admin password?") != "mochi") location.href = "/";

  milkcocoa.dataStore("rooms").stream().size(999).next(function(err, data){
    $("body").append("<ul></ul>");

    // 部屋を回す

    $("body").append(data.length);
    data.map(function(datum, i){

      // 部屋名から付箋をとる
      var room = "fusen";
      if(datum.id != "__root__") room += "/"+datum.id;
      milkcocoa.dataStore(room).stream().size(999).next(function(err, fusens){
        $("body ul").append("<li data-board_id='"+htmlEscape(datum.id)+"'>"+htmlEscape(datum.id)+"(c:"+datum.value.connection+", a:"+datum.value.access+", p:"+fusens.length+") ----------------------- "+jptime( new Date(datum.timestamp) )+", "+jptime( new Date( datum.value.updated_at ) )+"</li>");
      });
      return "";
    });
  });
});

function jptime(myD){
  myMonth=myD.getMonth() + 1;
  myDate=myD.getDate();

  myHours=myD.getHours();
  myMinutes=myD.getMinutes();

  return myMonth+"/"+myDate+" "+myHours+":"+myMinutes;
}

function sum(arr) {
  if (arr.length > 0) {
    return arr.reduce(function(prev, current, i, arr) {
      return prev+current;
    });
  } else return 0;
};

function htmlEscape(s) {
  s=s.replace(/&/g,'&amp;');
  s=s.replace(/>/g,'&gt;');
  s=s.replace(/</g,'&lt;');
  return s;
}
