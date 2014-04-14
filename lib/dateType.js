function getToday()
{
    var now = new Date();
    var usNow = new Date();
    var nowMs = now.getTime();
    var usMs = nowMs - 43200000*2;
    usNow.setTime(usMs);
    var nowYear = usNow.getFullYear().toString();
    var nowMonth = usNow.getMonth()+1;
    if (nowMonth < 10) 
        nowMonth = '0'+nowMonth.toString();
    var nowDate = usNow.getDate(); //compare to USA
    if (nowDate < 10) 
        nowDate = '0'+nowDate.toString();
    var todayDate = nowMonth + '/' + nowDate + '/' + nowYear;
    return todayDate;

}
exports.getToday = getToday;
