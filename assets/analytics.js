/* Baidu Tongji — acidev.cc
 * Site id: ab8d061e95e56502e5b60f2df3fd1fd1
 * Loaded once per page; kept in one file so the id only lives here.
 */
(function () {
  if (window.__baiduTongjiLoaded) return;
  window.__baiduTongjiLoaded = true;

  window._hmt = window._hmt || [];

  var hm = document.createElement("script");
  hm.src = "https://hm.baidu.com/hm.js?ab8d061e95e56502e5b60f2df3fd1fd1";
  hm.async = true;

  var first = document.getElementsByTagName("script")[0];
  if (first && first.parentNode) {
    first.parentNode.insertBefore(hm, first);
  } else {
    (document.head || document.documentElement).appendChild(hm);
  }
})();
