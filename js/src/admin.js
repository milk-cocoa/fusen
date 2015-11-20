$(function(){
  milkcocoa.dataStore("rooms").stream().size(999).next(function(err, data){
    $("body").append("<ul></ul>");
    data.map(function(datum, i){
      $("body ul").append("<li>"+(i+1)+". "+datum.id+"("+datum.value.connection+"/"+datum.value.access+")   made: "+jptime( new Date(datum.timestamp) )+", updated: "+jptime( new Date(datum.value.updated_at) )+"</li>");
      return "";
    });
  });
});

function jptime(myD){
  myTbl=new Array("日","月","火","水","木","金","土");
  myYear=myD.getYear();
  myYear4=(myYear < 2000) ? myYear+1900 : myYear;
  myMonth=myD.getMonth() + 1;
  myDate=myD.getDate();
  myDay=myD.getDay();
  myHours=myD.getHours();
  myMinutes=myD.getMinutes();
  mySeconds=myD.getSeconds();
  myMess1=myYear4 + "年" + myMonth + "月" + myDate + "日";
  myMess2=myTbl[myDay] + "曜日";
  myMess3=myHours + "時" + myMinutes + "分";
  myMess=myMess1 + " " + myMess2 + " " + myMess3;
  return myMess;
}
