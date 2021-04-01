/**
 * Created by simonyu
 */
(function () {
    'use strict';
    angular.module('numCommasfilters', []).filter('numCommas', function ($filter) {
        return function (input, fractionSize) {
            if (isNaN(input)) {
                return input;
            } else {
                var t_num = input;
                if (t_num >= 1 || t_num === 0) {
                    t_num = t_num.toFixed(0);
                } else {
                    t_num = t_num.toFixed(fractionSize);
                }
                var commas_num_str = t_num.toString();
                commas_num_str += '';
                var x = commas_num_str.split('.');
                var x1 = x[0];
                var x2 = x.length > 1 ? '.' + x[1] : '';
                var rgx = /(\d+)(\d{3})/;
                while (rgx.test(x1)) {
                    x1 = x1.replace(rgx, '$1' + ',' + '$2');
                }
                return x1 + x2;
            }
        };
    });
})();