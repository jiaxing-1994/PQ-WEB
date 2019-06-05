import http from './http'

const getFormalDate = function (time, type) {
  var a = new Date(time);
  var year = a.getFullYear();
  var month = a.getMonth() + 1;
  if (month < 10) {
    month = "0" + month;
  }
  var day = a.getDate();
  if (day < 10) {
    day = "0" + day;
  }
  var hour = a.getHours();
  if (hour < 10) {
    hour = "0" + hour;
  }
  var min = a.getMinutes();
  if (min < 10) {
    min = "0" + min;
  }
  var sec = a.getSeconds();
  if (sec < 10) {
    sec = "0" + sec;
  }
  var dateString = '';
  switch (type) {
    case 'yyyy/mm/dd hh:mm:ss':
      dateString = year + '/' + month + '/' + day + ' ' + hour + ':' + min + ':' + sec;
      break;
    case 'yyyy/mm/dd hh:mm':
      dateString = year + '/' + month + '/' + day + ' ' + hour + ':' + min;
      break;
    case 'yyyy/mm/dd hh':
      dateString = year + '/' + month + '/' + day + ' ' + hour;
      break;
    case 'yyyy-mm-dd':
      dateString = year + '-' + month + '-' + day;
      break;
    case 'yyyy/mm/dd':
      dateString = year + '/' + month + '/' + day;
      break;
    case 'hh:mm:ss':
      dateString = hour + ':' + min + ':' + sec;
      break;
    case 'hh:mm':
      dateString = hour + ':' + min;
      break;
    default:
      break;
  }
  ;
  return dateString;
}

//当前节点后面插入新的兄弟节点
const inserAfter = function (newElement, targetElement) {
  var parent = targetElement.parentNode;
  if (parent.lastChild == targetElement) {
    parent.appendChild(newElement);
  } else {
    parent.insertBefore(newElement, targetElement.nextSibling)
  }
}
//删除下一个兄弟节点
const removeAfter = function (targetElement) {
  var parent = targetElement.parentNode;
  parent.removeChild(targetElement.nextSibling)
}
export {
  http,
  getFormalDate,
  inserAfter,
  removeAfter
}
