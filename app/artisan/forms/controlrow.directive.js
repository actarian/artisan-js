
    app.directive('controlRow', ['$http', '$templateCache', '$compile', function($http, $templateCache, $compile) {
        var aid = 0;

        function _format(string, prepend, expression) {
            string = string || '';
            prepend = prepend || '';
            var splitted = string.split(',');
            if (splitted.length > 1) {
                var formatted = splitted.shift();
                angular.forEach(splitted, function(value, index) {
                    if (expression) {
                        formatted = formatted.split('{' + index + '}').join('\' + ' + prepend + value + ' + \'');
                    } else {
                        formatted = formatted.split('{' + index + '}').join(prepend + value);
                    }
                });
                if (expression) {
                    return '\'' + formatted + '\'';
                } else {
                    return formatted;
                }
            } else {
                return prepend + string;
            }
        }

        function templateFunction(element, attributes) {
            var form = attributes.form || 'Form';
            var title = attributes.title || 'Untitled';
            var placeholder = attributes.placeholder || title;
            var name = title.replace(/[^0-9a-zA-Z]/g, "").split(' ').join('') + (++aid);
            var formKey = form + '.' + name;
            var formFocus = ' ng-focus="' + formKey + '.hasFocus=true" ng-blur="' + formKey + '.hasFocus=false"';
            var message = '',
                decoration = '',
                disabled = '';
            var label = (attributes.label ? attributes.label : 'name');
            var key = (attributes.key ? attributes.key : 'id');
            var model = attributes.model;
            var change = (attributes.onChange ? ' ng-change="' + attributes.onChange + '"' : '');
            var focus = (attributes.onFocus ? ' ng-focus="' + attributes.onFocus + '"' : '');
            var blur = (attributes.onBlur ? ' ng-blur="' + attributes.onBlur + '"' : '');
            var inputCols = attributes.cols ? 6 : 9;
            var colInput = 'col-lg-' + inputCols;
            var colLabel = 'col-lg-' + (12 - inputCols);
            if (attributes.cols === '12') {
                colLabel = colInput = 'col-lg-12';
            }
            var required = (attributes.required ? ' required="true"' : '');
            var readonly = (attributes.readonly ? ' readonly' : '');
            var options = (attributes.options ? ' ng-model-options="' + attributes.options + '" ' : '');
            var validate = (attributes.validate ? ' validate="' + attributes.validate + '" ' : '');
            var format = (attributes.format ? ' format="' + attributes.format + '" ' : '');
            var precision = (attributes.precision ? ' precision="' + attributes.precision + '" ' : '');
            if (attributes.disabled) {
                disabled = ' disabled';
            }
            if (attributes.ngDisabled) {
                disabled = ' ng-disabled="' + attributes.ngDisabled + '"';
            }
            if (attributes.required) {
                decoration = attributes.readonly || attributes.disabled ? '' : '<sup>âœ½</sup>';
            }
            message = '<span ng-messages="' + (attributes.readonly ? '' : '(' + form + '.$submitted || ' + formKey + '.$touched) && ') + formKey + '.$error" role="alert">';
            message = message + '<span ng-message="required" class="label-error animated flash">obbligatorio â¤´</span>';
            switch (attributes.controlRow) {
                case 'password':
                    message = message + '<span ng-message="minlength" class="label-error animated flash">almeno 6 caratteri â¤´</span>';
                    break;
                case 'email':
                    message = message + '<span ng-message="email" class="label-error animated flash">valore non corretto â¤´</span>';
                    break;
                case 'number':
                case 'range':
                    message = message + '<span ng-message="positive" class="label-error animated flash">solo valori positivi â¤´</span>';
                    message = message + '<span ng-message="number" class="label-error animated flash">solo valori numerici â¤´</span>';
                    break;
            }
            if (attributes.match !== undefined) {
                message = message + '<span ng-message="match" class="label-error animated flash">non corrispondente â¤´</span>';
            }
            message = message + '</span>';
            var validation = ' ng-class="{ \'control-focus\': ' + formKey + '.hasFocus, \'control-success\': ' + formKey + '.$valid, \'control-error\': ' + formKey + '.$invalid && (' + form + '.$submitted || ' + formKey + '.$touched), \'control-empty\': !' + formKey + '.$viewValue }"';
            var template = '<div class="row" ' + validation + '><label for="' + name + '" class="' + colLabel + ' col-form-label">' + title + decoration + '</label><div class="' + colInput + ' col-' + attributes.controlRow + '">';
            switch (attributes.controlRow) {
                case 'static':
                    var click = (attributes.click ? ' ng-click="' + attributes.click + '"' : '');
                    var mouseover = (attributes.mouseover ? ' ng-mouseover="' + attributes.mouseover + '"' : '');
                    var mouseout = (attributes.mouseout ? ' ng-mouseover="' + attributes.mouseout + '"' : '');
                    var icon = (attributes.icon ? '<i class="pull-xs-right ' + attributes.icon + '"></i>' : '');
                    template += '<p class="form-control" ' + click + mouseover + mouseout + '><span ng-bind-html="' + model + ' || \'&nbsp;\'"></span>' + icon + '</p>';
                    break;
                case 'checkbox':
                    template = '<div class="' + colInput + '"' + validation + '><div class="col-xs-12"><label class="custom-control custom-checkbox">';
                    template += '   <input type="checkbox" class="custom-control-input" ng-model="' + model + '">';
                    template += '   <span class="custom-control-indicator"></span>';
                    template += '   <span class="custom-control-description">' + title + '</span>';
                    template += '</label>';
                    // template += '<input id="' + name + '" name="' + name + '" type="checkbox" ng-model="' + model + '" ' + change + focus + blur + required + ' class="toggle toggle-round-flat">';
                    /*
                    template = '<div class="checkbox">';
                    template += '<span class="checkbox-label">' + title + required +'</span>';
                    template += '<span class="switch"><input id="' + name + '" name="' + name + '" type="checkbox" ng-model="' + model + '" ' + change + focus + blur + required + ' class="toggle toggle-round-flat"><label for="' + name + '"></label></span>';
                    template += '</div>';
                    */
                    break;
                case 'yesno':
                    template = '<div class="row" ' + validation + '><label class="col-lg-6 custom-control custom-checkbox">' + title + decoration + '</label>';
                    template += '<div class="' + colLabel + '"><label class="custom-control custom-checkbox">';
                    template += '   <input type="checkbox" class="custom-control-input" ng-model="' + model + '" ng-change="' + model + 'No=!' + model + '">';
                    template += '   <span class="custom-control-indicator"></span>';
                    template += '   <span class="custom-control-description">SÃ¬</span>';
                    template += '</label></div>';
                    template += '<div class="' + colLabel + '"><label class="custom-control custom-checkbox">';
                    template += '   <input type="checkbox" class="custom-control-input" ng-model="' + model + 'No" ng-change="' + model + '=!' + model + 'No">';
                    template += '   <span class="custom-control-indicator"></span>';
                    template += '   <span class="custom-control-description">No</span>';
                    template += '</label>';
                    // template += '<input id="' + name + '" name="' + name + '" type="checkbox" ng-model="' + model + '" ' + change + focus + blur + required + ' class="toggle toggle-round-flat">';
                    /*
                    template = '<div class="checkbox">';
                    template += '<span class="checkbox-label">' + title + required +'</span>';
                    template += '<span class="switch"><input id="' + name + '" name="' + name + '" type="checkbox" ng-model="' + model + '" ' + change + focus + blur + required + ' class="toggle toggle-round-flat"><label for="' + name + '"></label></span>';
                    template += '</div>';
                    */
                    break;
                case 'switch':
                    if (attributes.disabled) {
                        disabled = ' disabled="true"';
                    }
                    if (attributes.ngDisabled) {
                        disabled = ' disabled="' + attributes.ngDisabled + '"';
                    }
                    template = '<div class="row control-switch" ' + validation + '><label for="' + name + '" class="' + colLabel + ' col-form-label">' + title + decoration + '</label>';
                    template += '<div class="' + colInput + '">';
                    template += '<switch name="' + name + '" ng-model="' + model + '" ' + change + focus + blur + options + ' on="SÃ¬" off="No" ' + required + disabled + readonly + formFocus + '></switch>';
                    break;
                case 'range':
                    validate = ' validate="number"';
                    var nameHi = name + 'Hi';
                    var formKeyHi = form + '.' + nameHi;
                    var modelHi = attributes.modelHi;
                    var validationHi = ' ng-class="{ \'control-focus\': ' + formKeyHi + '.hasFocus, \'control-success\': ' + formKeyHi + '.$valid, \'control-error\': ' + formKeyHi + '.$invalid && (' + form + '.$submitted || ' + formKeyHi + '.$touched), \'control-empty\': !' + formKeyHi + '.$viewValue }"';
                    var requiredHi = required;
                    if (attributes.requiredHi == 'true') {
                        requiredHi = ' required="true"';
                    } else if (attributes.requiredHi == 'false') {
                        requiredHi = '';
                    }
                    var messageHi = ' ',
                        decorationHi = ' ';
                    if (attributes.required && attributes.requiredHi !== 'false') {
                        decorationHi = attributes.readonly || attributes.disabled ? '' : '<sup>âœ½</sup>';
                    }
                    messageHi = '<span ng-messages="' + (attributes.readonly ? '' : '(' + form + '.$submitted || ' + formKeyHi + '.$touched) && ') + formKeyHi + '.$error" role="alert">';
                    messageHi = messageHi + '<span ng-message="required" class="label-error animated flash">obbligatorio â¤´</span>';
                    switch (attributes.controlRow) {
                        case 'password':
                            messageHi = messageHi + '<span ng-message="minlength" class="label-error animated flash">almeno 3 caratteri â¤´</span>';
                            break;
                        case 'email':
                            messageHi = messageHi + '<span ng-message="email" class="label-error animated flash">valore non corretto â¤´</span>';
                            break;
                        case 'number':
                        case 'range':
                            messageHi = messageHi + '<span ng-message="positive" class="label-error animated flash">solo valori positivi â¤´</span>';
                            messageHi = messageHi + '<span ng-message="number" class="label-error animated flash">solo valori numerici â¤´</span>';
                            break;
                    }
                    if (attributes.match !== undefined) {
                        messageHi = messageHi + '<span ng-message="match" class="label-error animated flash">non corrispondente â¤´</span>';
                    }
                    messageHi = messageHi + '</span>';
                    template = '<div class="row"><label for="' + name + '" class="' + colLabel + ' col-form-label">' + title + '</label><div class="' + colInput + ' col-' + attributes.controlRow + '">';
                    template += '<div class="form-control-range form-control-range-min" ' + validation + '>' + decoration + '<input class="form-control" name="' + name + '" ng-model="' + model + '" ' + change + focus + blur + options + ' placeholder="' + placeholder + '" type="text"' + required + disabled + readonly + formFocus + validate + format + precision + '>' + message + '</div>';
                    template += '<div class="form-control-range form-control-range-max" ' + validationHi + '>' + decorationHi + '<input class="form-control" name="' + nameHi + '" ng-model="' + modelHi + '" ' + change + focus + blur + options + ' placeholder="' + placeholder + '" type="text"' + requiredHi + disabled + readonly + formFocus + validate + format + precision + '>' + messageHi + '</div>';
                    return template + '</div></div>';
                case 'range-slider':
                    var himodel = (attributes.himodel ? ' rz-slider-high="' + attributes.himodel + '" ' : '');
                    options = (attributes.options ? ' rz-slider-options="' + attributes.options + '" ' : '');
                    template += '<rzslider rz-slider-model="' + model + '" ' + himodel + options + '"></rzslider>';
                    break;
                case 'select':
                    var filter = (attributes.min ? ' | filter:gte(\'' + key + '\', ' + attributes.min + ')' : '');
                    var optionLabel = _format(label, 'item.', true);
                    var options = attributes.number ?
                        'item.' + key + ' as ' + optionLabel + ' disable when item.disabled for item in ' + attributes.source + filter :
                        optionLabel + ' disable when item.disabled for item in ' + attributes.source + filter + ' track by item.' + key;
                    template += '<select name="' + name + '" class="form-control" ng-model="' + model + '" ' + change + focus + blur + ' ng-options="' + options + '" ' + (attributes.number ? 'convert-to-number' : '') + required + disabled + '><option value="" disabled selected hidden>' + placeholder + '</option></select>';
                    break;
                case 'autocomplete':
                    var canCreate = (attributes.canCreate ? attributes.canCreate : false);
                    var flatten = (attributes.flatten ? attributes.flatten : false);
                    var queryable = (attributes.queryable ? attributes.queryable : false);
                    var onSelected = (attributes.onSelected ? ' on-selected="' + attributes.onSelected + '"' : '');
                    template += '<input name="' + name + '" ng-model="' + model + '" type="hidden" ' + (attributes.required ? 'required' : '') + '>';
                    template += '<div control-autocomplete="' + attributes.source + '" model="' + model + '" label="' + label + '"  key="' + key + '" can-create="' + canCreate + '" flatten="' + flatten + '" queryable="' + queryable + '" placeholder="' + placeholder + '" on-focus="' + formKey + '.hasFocus=true" on-blur="' + formKey + '.hasFocus=false"' + onSelected + '></div>';
                    break;
                case 'textarea':
                    var rows = (attributes.rows ? attributes.rows : '1');
                    template += '<textarea name="' + name + '" class="form-control" ng-model="' + model + '" ' + change + focus + blur + options + ' placeholder="' + placeholder + '" ' + required + disabled + ' rows="' + rows + '"' + formFocus + '></textarea>';
                    break;
                case 'htmltext':
                    var taDisabled = '';
                    if (attributes.disabled) {
                        taDisabled = ' ta-disabled="true"';
                    }
                    if (attributes.ngDisabled) {
                        taDisabled = ' ta-disabled="' + attributes.ngDisabled + '"';
                    }
                    template += '<div text-angular name="' + name + '" ta-paste="doStripHtml($html)" ng-model="' + model + '" ' + change + focus + blur + options + ' placeholder="' + placeholder + '" ' + required + taDisabled + readonly + formFocus + (attributes.required ? ' ta-min-text="1"' : '') + '></div>';
                    break;
                case 'password':
                    template += '<div class="input-group"><input name="' + name + '" class="form-control" ng-model="' + model + '" ' + change + focus + blur + options + ' placeholder="' + placeholder + '" type="{{form.' + name + ' ? \'password\' : \'text\'}}" ng-minlength="6" ' + required + disabled + formFocus + '><span class="input-group-addon" ng-if="' + model + '"><span class="icon-eye" ng-click="form.' + name + ' = !form.' + name + '"></span></span></div>';
                    break;
                case 'email':
                    template += '<input name="' + name + '" class="form-control" ng-model="' + model + '" ' + change + focus + blur + options + ' placeholder="' + placeholder + '" type="email" ' + required + disabled + formFocus + '>';
                    break;
                case 'number-picker':
                    validate = ' validate="anynumber"';
                    /*
                    var doSub = model + ' = ' + model + ' -1';
                    if (attributes.min) {
                        validate += ' min="' + attributes.min + '"';
                        doSub = model + ' = Math.max(' + attributes.min + ', ' + model + ' -1)';
                    }
                    var doAdd = model + ' = ' + model + ' +1';
                    if (attributes.max) {
                        validate += ' max="' + attributes.max + '"';
                        doAdd = model + ' = Math.min(' + attributes.max + ', ' + model + ' +1)';
                    }
                    template += '<div class="input-group">';
                    template += '   <span class="input-group-btn"><button class="btn btn-outline-primary" type="button" ng-click="(' + doSub + ')">-</button></span>';
                    template += '   <input name="' + name + '" class="form-control" ng-model="' + model + '" ' + change + focus + blur + options + ' placeholder="' + placeholder + '" type="text"' + required + disabled + readonly + formFocus + validate + format + precision + '>';
                    template += '   <span class="input-group-btn"><button class="btn btn-outline-primary" type="button" ng-click="(' + doAdd + ')">+</button></span>';
                    template += '</div>';
                    */
                    template += '<div number-picker="' + model + '" min="' + attributes.min + '" max="' + attributes.max + '">';
                    template += '   <input name="' + name + '" class="form-control" ng-model="' + model + '" ' + change + focus + blur + options + ' placeholder="' + placeholder + '" type="text"' + required + disabled + readonly + formFocus + validate + format + precision + '>';
                    template += '</div>';
                    break;
                case 'number':
                    validate = ' validate="number"';
                    template += '<input name="' + name + '" class="form-control" ng-model="' + model + '" ' + change + focus + blur + options + ' placeholder="' + placeholder + '" type="text"' + required + disabled + readonly + formFocus + validate + format + precision + '>';
                    break;
                case 'anynumber':
                    validate = ' validate="anynumber"';
                    template += '<input name="' + name + '" class="form-control" ng-model="' + model + '" ' + change + focus + blur + options + ' placeholder="' + placeholder + '" type="text"' + required + disabled + readonly + formFocus + validate + format + precision + '>';
                    break;
                case 'date':
                    validate = ' validate="date"';
                    format = ' format="dd-MM-yyyy"';
                    if (attributes.disabled || attributes.readonly) {
                        template += '<div class="input-group"><input type="text" class="form-control" name="' + name + '" ng-model="' + model + '" placeholder="' + placeholder + '" ' + required + disabled + readonly + formFocus + validate + format + '><span class="input-group-addon"><i class="icon-calendar"></i></span></div>';
                    } else {
                        template += '<input type="date" name="' + name + '" class="form-control form-control-hidden" is-open="flags.' + name + '" ng-model="' + model + '" placeholder="dd-MM-yyyy" ' + required + disabled + readonly + formFocus + ' uib-datepicker-popup datepicker-options="sources.datepickerOptions" datepicker-template-url="uib/template/datepicker/datepicker.html" show-button-bar="false" current-text="Oggi" clear-text="Rimuovi" close-text="Chiudi">';
                        template += '<div ng-click="(flags.' + name + ' = true)" class="input-group disabled"><input type="text" class="form-control" name="' + name + '" ng-model="' + model + '" placeholder="' + placeholder + '" ' + required + disabled + readonly + formFocus + validate + format + '><span class="input-group-addon"><i class="icon-calendar"></i></span></div>';
                    }
                    break;
                    /*
        case 'date':
            placeholder = placeholder || 'dd-MM-yyyy';
            template += '<input name="' + name + '" class="form-control" ng-model="' + model + '" ' + change + focus + blur + options + ' placeholder="' + placeholder + '" type="date"' + required + disabled + readonly + formFocus + '>';
            break;
            */
                case 'datetime-local':
                    placeholder = placeholder || 'dd-MM-yyyyTHH:mm:ss';
                    // placeholder == title ? placeholder = 'dd/MM/yyyyTHH:mm:ss' : null;
                    template += '<input name="' + name + '" class="form-control" ng-model="' + model + '" ' + change + focus + blur + options + ' placeholder="' + placeholder + '" type="datetime-local"' + required + disabled + readonly + formFocus + '>';
                    break;
                default:
                    template += '<input name="' + name + '" class="form-control" ng-model="' + model + '" ' + change + focus + blur + options + ' placeholder="' + placeholder + '" type="text"' + required + disabled + readonly + formFocus + validate + format + precision + '>';
                    break;
            }
            return template + message + '</div></div>';
        }
        return {
            restrict: 'A',
            replace: true,
            compile: function(templateElement, templateAttributes) {
                return function(scope, element, attributes) {
                    element.html(templateFunction(templateElement, templateAttributes));
                    $compile(element.contents())(scope);
                };
            }
        };
    }]);
