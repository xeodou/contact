window.CRAWLER = window.CRAWLER || {};
CRAWLER.cache = {
  connStat: "ready"
};
CRAWLER.dom = {};
CRAWLER.getState = function () {
  if (CRAWLER.cache.connStat !== "ready") return;
  var crawlerBtn = CRAWLER.dom.ctrBtn;
  $.ajax({
    type: "GET",
    url: "/crawler/state",
    dataType: "JSON",
    cache: false,
    beforeSend: function () {
      crawlerBtn.attr("disabled", true);
      CRAWLER.cache.connStat = "pending";
    },
    success: function (resp) {
      CRAWLER.cache.connStat = "ready";
      if (!resp || !resp.stat || resp.stat !== 1) {
        return alert("Error");
      }
      if (resp.crawler) {
        crawlerBtn.removeClass("btn-success").addClass("btn-danger").html("停止");
      } else {
        crawlerBtn.removeClass("btn-danger").addClass("btn-success").html("启动");
      }
      crawlerBtn.attr("disabled", false);
    },
    error: function () {
      CRAWLER.cache.connStat = "ready";
      return alert("Error");
    }
  });
};
CRAWLER.control = function (action) {
  if (CRAWLER.cache.connStat !== "ready") return;
  var crawlerBtn = CRAWLER.dom.ctrBtn;
  if (!action) action = "stop";
  $.ajax({
    type: "GET",
    url: "/crawler/control",
    data: {action: action},
    dataType: "JSON",
    cache: false,
    beforeSend: function () {
      crawlerBtn.attr("disabled", true);
      CRAWLER.cache.connStat = "pending";
    },
    success: function (resp) {
      CRAWLER.cache.connStat = "ready";
      if (!resp || !resp.stat || resp.stat !== 1) {
        return alert("Error");
      }
      if (action === "start") {
        crawlerBtn.removeClass("btn-success").addClass("btn-danger").html("停止");
      } else if (action === "stop") {
        crawlerBtn.removeClass("btn-danger").addClass("btn-success").html("启动");
      }
      crawlerBtn.attr("disabled", false);
    },
    error: function () {
      CRAWLER.cache.connStat = "ready";
      return alert("Error");
    }
  });
};
$(function () {
  CRAWLER.dom.ctrBtn = $("#crawler_btn");
  if (!CRAWLER.dom.ctrBtn) {
    alert("Init Error");
    return false;
  }
  CRAWLER.getState();
  CRAWLER.dom.ctrBtn.click(function () {
    var o = $(this);
    if (o.hasClass("btn-success")) {
      CRAWLER.control("start");
    } else {
      CRAWLER.control("stop");
    }
    return false;
  });
});