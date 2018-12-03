//HEAD 
(function(app) {
try { app = angular.module("artisan"); }
catch(err) { app = angular.module("artisan", []); }
app.run(["$templateCache", function($templateCache) {
"use strict";

$templateCache.put("artisan/components/calendar/calendar","<section class=\"container-fluid shadow section-bordered\">\n" +
    "	<div class=\"calendar calendar-planner\">\n" +
    "		<div class=\"month\">\n" +
    "			<h6 class=\"flex-row\">\n" +
    "				<span class=\"w100\">\n" +
    "					<button type=\"button\" class=\"btn btn-xs btn-primary\" ng-click=\"doNavMonth(-1)\">\n" +
    "						<i class=\"icon-prev\"></i> <span><i class=\"icon-prev\"></i> <span ng-bind=\"sources.month.getDiff(-1).getShortName()\"></span></span>\n" +
    "					</button>\n" +
    "				</span>\n" +
    "				<span class=\"wmax text-center\">\n" +
    "					<b ng-bind=\"sources.month.getName()\"></b>\n" +
    "				</span>\n" +
    "				<span class=\"w100 text-right\">\n" +
    "					<button type=\"button\" class=\"btn btn-xs btn-primary\" ng-click=\"doNavMonth(1)\">\n" +
    "						<i class=\"icon-next\"></i> <span><span ng-bind=\"sources.month.getDiff(1).getShortName()\"></span> <i class=\"icon-next\"></i></span>\n" +
    "					</button>\n" +
    "				</span>\n" +
    "			</h6>\n" +
    "			<ul class=\"nav\">\n" +
    "				<li class=\"week\">\n" +
    "					<span class=\"cell\">week</span>\n" +
    "					<span class=\"cell\">lun</span>\n" +
    "					<span class=\"cell\">mar</span>\n" +
    "					<span class=\"cell\">mer</span>\n" +
    "					<span class=\"cell\">gio</span>\n" +
    "					<span class=\"cell\">ven</span>\n" +
    "					<span class=\"cell\">sab</span>\n" +
    "					<span class=\"cell\">dom</span>\n" +
    "				</li>\n" +
    "				<li class=\"week\" ng-repeat=\"week in sources.calendar.month.weeks track by $index\">\n" +
    "					<div class=\"cell weekNum\" ng-click=\"onWeekSelect(week.date)\">\n" +
    "						<span class=\"num\" ng-bind=\"week.date | isoWeek : 1\"></span>\n" +
    "					</div>\n" +
    "					<div class=\"cell\" ng-class=\"{ selected: day && sources.day.isCurrent(day.date), day: day, workable: day.workable, holiday: day.holiday, vacation: day.vacation, working: day.working, available: day.available, full: day.full, today: day.$today }\" ng-click=\"onDaySelect(day)\" ng-repeat=\"day in week.days track by $index\">\n" +
    "						<span class=\"num\" ng-bind=\"day.d\"></span>\n" +
    "						<span class=\"hours\" ng-bind=\"day.hours\" ng-if=\"day.hours\"></span>\n" +
    "						<div class=\"activities\" ng-if=\"day.workable\">\n" +
    "							<span class=\"activity tag-pill\" ng-class=\"appearance.activityClass(activity.activity.id)\" ng-repeat=\"activity in day.activities track by $index\" ng-style=\"{ 'flex-basis': (activity.hours / day.availableHours * 100) + '%', 'max-width': (activity.hours / day.availableHours * 100) + '%' }\" title=\"{{(activity.hours | customNumber : 2 : 'H ' + activity.task.id) + ' ' + activity.customer.name}}\">\n" +
    "								<span ng-bind=\"activity.customer.name\"></span>\n" +
    "							</span>\n" +
    "						</div>\n" +
    "						<div class=\"records\" ng-if=\"day.wasWorkable\">\n" +
    "							<span class=\"record tag-pill\" ng-class=\"{ 'status-green': day.recordedHours >= day.availableHours, 'status-orange': day.recordedHours < day.availableHours }\" ng-style=\"{ 'flex-basis': (day.recordedHours / day.availableHours * 100) + '%', 'max-width': (day.recordedHours / day.availableHours * 100) + '%' }\" title=\"{{day.recordedHours | customNumber : 2 : 'H'}}\">\n" +
    "								<span ng-bind=\"day.recordedHours\"></span> / <span ng-bind=\"day.availableHours\"></span>\n" +
    "							</span>\n" +
    "						</div>\n" +
    "					</div>\n" +
    "				</li>\n" +
    "			</ul>\n" +
    "		</div>\n" +
    "	</div>\n" +
    "</section>\n" +
    "")

$templateCache.put("artisan/components/modals/modal","<div class=\"modal-header\">\n" +
    "	<button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-label=\"Chiudi\" ng-click=\"modal.reject()\">\n" +
    "		<span aria-hidden=\"true\">&times;</span>\n" +
    "	</button>\n" +
    "	<h4 class=\"modal-title\" ng-bind=\"modal.title\"></h4>\n" +
    "</div>\n" +
    "<div class=\"modal-body\">\n" +
    "</div>\n" +
    "<div class=\"modal-footer\">\n" +
    "	<button type=\"button\" class=\"btn btn-secondary\" data-dismiss=\"modal\" ng-click=\"modal.reject()\">Close</button>\n" +
    "</div>\n" +
    "")

$templateCache.put("artisan/components/modals/modals","<div class=\"modals\" ng-class=\"{ visible: modals.length }\">\n" +
    "</div>\n" +
    "<div class=\"modal fade {{modal.customClass ? modal.customClass : ''}}\" ng-repeat=\"modal in modals\" ng-class=\"{ in: modal.active }\" ng-if=\"$last\">\n" +
    "	<div class=\"modal-dialog\" role=\"document\">\n" +
    "		<div class=\"modal-content\" modal-view=\"modal\"></div>\n" +
    "	</div>\n" +
    "</div>\n" +
    "")

$templateCache.put("artisan/components/errors/partial/errors","<ul class=\"nav padding-bottom-lg-20\" ng-if=\"state.isError\">\n" +
    "	<li class=\"nav-item\" ng-repeat=\"item in state.errors track by $index\">\n" +
    "		<div class=\"alert alert-danger\" role=\"alert\">\n" +
    "			<b ng-bind=\"'Error ' + item.status\"></b> <span ng-bind=\"item.message\"></span>\n" +
    "		</div>\n" +
    "	</li>\n" +
    "</ul>\n" +
    "")

$templateCache.put("artisan/components/forms/partial/checkbox","<input type=\"hidden\" name=\"{{field}}\" ng-model=\"ngModel\" ng-required=\"required\" />\n" +
    "<div class=\"form-check form-group form-group-{{type}}\" ng-class=\"getClasses()\">\n" +
    "	<label for=\"{{field}}\" class=\"form-label\">\n" +
    "		<span ng-bind-html=\"placeholder\"></span><sup ng-if=\"required\">✽</sup>\n" +
    "	</label>\n" +
    "	<control-messages></control-messages>\n" +
    "	<div class=\"input-group\" ng-repeat=\"item in source\">\n" +
    "		<label class=\"form-check-label\">\n" +
    "			<input type=\"radio\" class=\"form-check-input\" ng-model=\"$parent.ngModel\" name=\"input-{{field}}\" ng-value=\"item.id\" />\n" +
    "			{{item.name}}\n" +
    "		</label>\n" +
    "	</div>\n" +
    "</div>\n" +
    "")

$templateCache.put("artisan/components/forms/partial/file","<div class=\"form-group form-group-{{type}}\" ng-class=\"getClasses()\">\n" +
    "	<label for=\"{{field}}\" class=\"form-label\">\n" +
    "		<span ng-bind=\"title\"></span><sup ng-if=\"required\">✽</sup>\n" +
    "		<span ng-bind=\"ngModel.name\"></span>\n" +
    "	</label>\n" +
    "	<input type=\"{{getType()}}\" name=\"{{field}}\" class=\"form-control\" file-model=\"ngModel\" ng-model=\"ngModel\" validate=\"file\" ng-model-options=\"options\" placeholder=\"{{placeholder}}\" ng-required=\"required\" on-busy=\"onBusy()\" on-complete=\"onComplete()\" accept=\"{{accept}}\" maxsize=\"{{maxsize}}\" ng-focus=\"focus = true\" ng-blur=\"focus = false\">\n" +
    "	<control-messages></control-messages>\n" +
    "</div>\n" +
    "")

$templateCache.put("artisan/components/forms/partial/messages","<span ng-messages=\"getMessages()\" role=\"alert\">\n" +
    "	<span ng-message=\"required\" class=\"label-error animated flash\">obbligatorio</span>\n" +
    "	<span ng-message=\"minlength\" class=\"label-error animated flash\" ng-if=\"type == 'password'\">almeno 6 caratteri</span>\n" +
    "	<span ng-message=\"email\" class=\"label-error animated flash\" ng-if=\"type == 'email'\">valore non corretto</span>\n" +
    "	<span ng-message=\"date\" class=\"label-error animated flash\" ng-if=\"type == 'date'\">formato non corretto</span>\n" +
    "	<span ng-message=\"min\" class=\"label-error animated flash\" ng-if=\"type == 'date'\">intervallo non corretto</span>\n" +
    "	<span ng-message=\"max\" class=\"label-error animated flash\" ng-if=\"type == 'date'\">intervallo non corretto</span>\n" +
    "	<span ng-message=\"maxsize\" class=\"label-error animated flash\" ng-if=\"type == 'file'\">dimensione massima superata</span>\n" +
    "	<span ng-message=\"accept\" class=\"label-error animated flash\" ng-if=\"type == 'file'\">estensione non consentita</span>\n" +
    "	<span ng-message=\"positive\" class=\"label-error animated flash\" ng-if=\"validate == 'number' || validate == 'range'\">solo valori positivi</span>\n" +
    "	<span ng-message=\"number\" class=\"label-error animated flash\" ng-if=\"validate == 'number' || validate == 'range'\">solo valori numerici</span>\n" +
    "	<span ng-message=\"match\" class=\"label-error animated flash\" ng-if=\"match\">non corrispondente</span>\n" +
    "</span>\n" +
    "")

$templateCache.put("artisan/components/forms/partial/radio","<input type=\"hidden\" name=\"{{field}}\" ng-model=\"ngModel\" ng-required=\"required\" />\n" +
    "<div class=\"form-check form-group form-group-{{type}}\" ng-class=\"getClasses()\">\n" +
    "	<label for=\"{{field}}\" class=\"form-label\">\n" +
    "		<span ng-bind-html=\"placeholder\"></span><sup ng-if=\"required\">✽</sup>\n" +
    "	</label>\n" +
    "	<control-messages></control-messages>\n" +
    "	<div class=\"input-group\" ng-repeat=\"item in source\">\n" +
    "		<label class=\"form-check-label\">\n" +
    "			<input type=\"radio\" class=\"form-check-input\" ng-model=\"$parent.ngModel\" name=\"input-{{field}}\" ng-value=\"item.id\" />\n" +
    "			{{item.name}}\n" +
    "		</label>\n" +
    "	</div>\n" +
    "</div>\n" +
    "")

$templateCache.put("artisan/components/forms/partial/select","<div class=\"form-group form-group-{{type}}\" ng-class=\"getClasses()\">\n" +
    "	<label for=\"{{field}}\" class=\"form-label\">\n" +
    "		<span ng-bind=\"title\"></span><sup ng-if=\"required\">✽</sup>\n" +
    "	</label>\n" +
    "	<select name=\"{{field}}\" class=\"form-control\" ng-model=\"ngModel\" ng-options=\"{{getOptions()}}\" ng-required=\"required\" ng-disabled=\"disabled\" ng-readonly=\"readonly\" ng-change=\"onChange()\" ng-focus=\"focus = true\" ng-blur=\"focus = false\">\n" +
    "		<option value=\"\" disabled selected hidden>{{placeholder}}</option>\n" +
    "	</select>\n" +
    "	<control-messages></control-messages>\n" +
    "</div>\n" +
    "")

$templateCache.put("artisan/components/forms/partial/text","<div class=\"form-group form-group-{{type}}\" ng-class=\"getClasses()\">\n" +
    "	<label for=\"{{field}}\" class=\"form-label\" ng-if=\"title != 'untitled'\">\n" +
    "		<span ng-bind=\"title\"></span><sup ng-if=\"required\">✽</sup>\n" +
    "	</label>\n" +
    "	<div class=\"input-group\">\n" +
    "		<input type=\"{{getType()}}\" name=\"{{field}}\" class=\"{{class || 'form-control'}}\" ng-model=\"ngModel\" ng-model-options=\"options\" placeholder=\"{{placeholder}}\" ng-minlength=\"minLength\" ng-maxlength=\"maxLength\" min=\"{{min}}\" max=\"{{max}}\" ng-required=\"required\" ng-disabled=\"disabled\" ng-readonly=\"readonly\" ng-change=\"onChange\" ng-focus=\"focus = true\" ng-blur=\"focus = false\">\n" +
    "		<span class=\"input-group-addon\" ng-if=\"type == 'password' && ngModel\">\n" +
    "			<span class=\"icon-eye\" ng-click=\"toggleVisibility()\"></span>\n" +
    "		</span>\n" +
    "	</div>\n" +
    "	<control-messages></control-messages>\n" +
    "</div>\n" +
    "")

$templateCache.put("artisan/components/header/partial/header","<nav class=\"navbar\">\n" +
    "	<a class=\"navbar-brand\" href=\"#\" ng-href=\"\">\n" +
    "		<img class=\"hidden-print\" width=\"34\" src=\"img/logo_websolute.png\" title=\"Websolute\" alt=\"Digital Agency\">\n" +
    "		<img class=\"visible-print-inline-block\" width=\"34\" src=\"img/logo_websolute_positive.png\" title=\"Websolute\" alt=\"Digital Agency\">\n" +
    "	</a>\n" +
    "	<ul class=\"nav navbar-nav hidden-xs-down\" ng-transclude=\"header\"></ul>\n" +
    "</nav>\n" +
    "")

$templateCache.put("artisan/components/nav/partial/nav-item","<a class=\"nav-link\" href=\"#\" ng-href=\"{{item.$nav.path}}\"><span ng-bind=\"item.name\"></span></a>\n" +
    "<ul class=\"nav nav-{{item.$nav.level}}\" ng-if=\"item.items\">\n" +
    "	<li class=\"nav-item\" ng-class=\"item.$nav.state\" nav-item=\"item\" ng-repeat=\"item in item.items track by $index\"></li>\n" +
    "</ul>\n" +
    "")

$templateCache.put("artisan/components/nav/partial/nav","<ul class=\"nav nav-{{item.$nav.level}}\" ng-if=\"item.items\">\n" +
    "	<li class=\"nav-item\" ng-class=\"item.$nav.state\" nav-item=\"item\" ng-repeat=\"item in item.items track by $index\"></li>\n" +
    "</ul>\n" +
    "")

$templateCache.put("artisan/components/video/partial/video-player","<div class=\"video-player\" ng-class=\"{ playing: playing }\">\n" +
    "	<div class=\"video-item\" ng-click=\"toggle()\">\n" +
    "		<img ng-src=\"{{image}}\" ng-if=\"image\" />\n" +
    "		<video></video>\n" +
    "	</div>\n" +
    "</div>\n" +
    "")
}]);
})();