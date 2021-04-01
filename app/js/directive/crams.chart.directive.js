/**
 * Created by simonyu on 20/04/16.
 */
(function () {
    'use strict';
    angular.module('crams').directive('cramsChart', cramsChart);
    cramsChart.$inject = [];

    function cramsChart() {
        return {
            restrict: 'A',
            link: function ($scope, $elem, $attr) {
                var storage_prod = $scope[$attr.ngModel];
                var dt = storage_prod.usage;
                $attr.$observe("iscostview", function (costviewvalue) {
                    // alert('triggered by cost view');
                    var is_cost_view = false;
                    if (costviewvalue === 'true') {
                        dt = storage_prod.cost;
                        is_cost_view = true;
                    } else {
                        dt = storage_prod.usage;
                    }
                    drawGoogleCharts(storage_prod, dt, is_cost_view, $attr);
                });

                function drawGoogleCharts(sp, dt, is_cost_view, $attr) {
                    var unit = 'GB';
                    if (is_cost_view) {
                        unit = 'AUD';
                    }
                    var total_size = storage_prod.total.allocated_gb_size;
                    var total_used_size = storage_prod.total.used_gb_size;
                    var total_cost = storage_prod.total.allocated_cost;
                    // var total_used_cost = storage_prod.total.used_cost;
                    var dataTable = new google.visualization.DataTable();
                    dataTable.addColumn('string', 'Usage_Type');
                    dataTable.addColumn('number', 'Usage');
                    // A column for custom tooltip content
                    dataTable.addColumn({type: 'string', role: 'tooltip', 'p': {'html': true}});
                    var options = {
                        colors: ['#ddcc77', '#999933', '#cc6677', '#88ccee'],
                        pieSliceBorderColor: '#5A5A5A',
                        // Use an HTML tooltip.
                        tooltip: {
                            isHtml: true,
                            trigger: 'selection'
                        },
                        pieSliceTextStyle: {
                            color: '#000',
                            fontSize: 12
                        },
                        //remove default legend
                        legend: {
                            position: 'none'
                        }
                    };

                    if ((total_size === 0 && !is_cost_view) || (total_cost === 0 && is_cost_view)) {
                        //make a grey color graphic
                        //var info = tooltipsBox(0, 0, 0, 0, unit, is_cost_view);
                        var info = noneUsageTooltipsBox();
                        dataTable.addRows([['None', 1, info]]);
                        options.colors = ['#ffffff'];

                        //if raise error is true, set the pie chart boarder to red color.
                        if (sp.flags.raise_error) {
                            options.pieSliceBorderColor = ['#cc6677'];
                        }
                        options.pieSliceText = 'label';
                    } else {
                        var tootltip_info = tooltipsBox(dt['Used (Disk)'], dt['HSM (Tape)'], dt['Over Draft'], dt['Available'], unit, is_cost_view);
                        var used_percent = total_used_size / total_size;

                        // if overdraft
                        if (used_percent > 1) {
                            var overdraft_percent = (total_used_size - total_size) / total_size;
                            var percent = (overdraft_percent * 100).toFixed(2);
                            dataTable.addRows([['Overdraft: ' + percent + '%', (total_used_size - total_size), tootltip_info]]);
                            options.colors = ['#cc6677'];
                            options.pieSliceText = 'label';
                        } else {
                            var disk_data = dt['Used (Disk)'];
                            var tap_data = dt['HSM (Tape)'];
                            var overdraft_data = dt['Over Draft'];
                            var available_data = dt['Available'];

                            var sorted_dt = {};
                            sorted_dt['Used (Disk)'] = disk_data;
                            sorted_dt['HSM (Tape)'] = tap_data;
                            sorted_dt['Over Draft'] = overdraft_data;
                            sorted_dt['Available'] = available_data;
                            var graphic_data = _.pairs(sorted_dt);
                            angular.forEach(graphic_data, function (data, index) {
                                data.push(tootltip_info);
                            });
                            dataTable.addRows(graphic_data);
                        }
                    }

                    // Create and draw the visualization.
                    var googleChart = new google.visualization[$attr.cramsChart]($elem[0]);
                    googleChart.draw(dataTable, options);
                }

                function noneUsageTooltipsBox() {
                    return '<div style="padding: 5px; font-size: 11px; text-align: center">' +
                        '<table>' +
                        '<tr><td>&nbsp;</td></tr>' +
                        '<tr>' +
                        '<td> None </td>' +
                        '</tr>' +
                        '<tr><td>&nbsp;</td></tr>' +
                        '</table>' +
                        '</div>';
                }

                function getTBWithCommas(num) {
                    var t_num = num / 1000;
                    if (t_num >= 1 || t_num === 0) {
                        t_num = t_num.toFixed(0);
                    } else {
                        t_num = t_num.toFixed(3);
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

                function getNumWithCommas(num) {
                    var round_num = num.toFixed(2);
                    var commas_num_str = round_num.toString();
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

                // create tooltips info box
                function tooltipsBox(used, hsm, overdraft, available, unit, is_cost_view) {
                    var tooltip_label = '';

                    if (is_cost_view) {
                        var disk_tape_part = '<div style="padding: 5px 5px 5px 5px; font-size: 11px;">' +
                            '<table>' +
                            '<tr>' +
                            '<td><span style="background-color:#ddcc77; border: solid 1px #5a5a5a"> &nbsp;&nbsp;&nbsp;&nbsp;</span></td>' +
                            '<td align="right"> Used (Disk): </td>' +
                            '<td>&nbsp;</td>' +
                            '<td align="left"> ' + unit + ' </td>' +
                            '<td align="left"> &nbsp;<b>' + getNumWithCommas(used) + '</b></td>' +
                            '</tr>' +
                            '<tr>' +
                            '<td><span style="background-color:#999933; border: solid 1px #5a5a5a"> &nbsp;&nbsp;&nbsp;&nbsp;</span></td>' +
                            '<td align="right"> HSM (Tape): </td>' +
                            '<td>&nbsp;</td>' +
                            '<td align="left"> ' + unit + ' </td>' +
                            '<td align="left">  &nbsp;<b>' + getNumWithCommas(hsm) + '</b></td>' +
                            '</tr>';
                        var overdraft_part = '<tr><td><span style="background-color:#cc6677; border: solid 1px #5a5a5a">&nbsp;&nbsp;&nbsp;&nbsp;</span></td>' +
                            '<td align="right"> Overdraft: </td>' +
                            '<td>&nbsp;</td>' +
                            '<td align="left"> ' + unit + ' </td>' +
                            '<td align="left">  &nbsp;<b>' + getNumWithCommas(overdraft) + '</b></td>' +
                            '</tr>';
                        var available_part = '<tr>' +
                            '<td width="10%"><span style="background-color:#88ccee; border: solid 1px #5a5a5a">&nbsp;&nbsp;&nbsp;&nbsp;</span></td>' +
                            '<td width="35%" align="right"> Available: </td>' +
                            '<td width="5%">&nbsp;</td>' +
                            '<td width="10%" align="left"> ' + unit + ' </td>' +
                            '<td width="40%" align="left">  &nbsp;<b>' + getNumWithCommas(available) + '</b></td>' +
                            '</tr>';

                        var close_part = '</table>' + '</div>';
                        if (overdraft === 0 && available !== 0) {
                            tooltip_label = disk_tape_part + available_part + close_part;
                        }
                        if (overdraft !== 0 && available === 0) {
                            tooltip_label = disk_tape_part + overdraft_part + close_part;
                        }
                        if (overdraft === 0 && available === 0) {
                            tooltip_label = disk_tape_part + available_part + close_part;
                        }
                        return tooltip_label;

                    } else {
                        // set unit to TB
                        unit = 'TB';
                        var u_disk_tape_part = '<div style="padding: 5px 5px 5px 5px; font-size: 11px;">' +
                            '<table>' +
                            '<tr>' +
                            '<td><span style="background-color:#ddcc77; border: solid 1px #5a5a5a"> &nbsp;&nbsp;&nbsp;&nbsp;</span></td>' +
                            '<td align="right"> Used (Disk): </td>' +
                            '<td>&nbsp;</td>' +
                            '<td align="right"> <b>' + getTBWithCommas(used) + '</b>&nbsp; </td>' +
                            '<td align="left"> ' + unit + ' </td>' +
                            '</tr>' +
                            '<tr>' +
                            '<td><span style="background-color:#999933; border: solid 1px #5a5a5a"> &nbsp;&nbsp;&nbsp;&nbsp;</span></td>' +
                            '<td align="right"> HSM (Tape): </td>' +
                            '<td>&nbsp;</td>' +
                            '<td align="right"> <b>' + getTBWithCommas(hsm) + '</b>&nbsp; </td>' +
                            '<td align="left"> ' + unit + ' </td>' +
                            '</tr>' +
                            '<tr>';
                        var u_overdraft_part =
                            '<td><span style="background-color:#cc6677; border: solid 1px #5a5a5a">&nbsp;&nbsp;&nbsp;&nbsp;</span></td>' +
                            '<td align="right"> Overdraft: </td>' +
                            '<td>&nbsp;</td>' +
                            '<td align="right"> <b>' + getTBWithCommas(overdraft) + '</b>&nbsp; </td>' +
                            '<td align="left"> ' + unit + ' </td>' +
                            '</tr>';
                        var u_available_part =
                            '<tr>' +
                            '<td width="10%"><span style="background-color:#88ccee; border: solid 1px #5a5a5a">&nbsp;&nbsp;&nbsp;&nbsp;</span></td>' +
                            '<td width="35%"  align="right"> Available: </td>' +
                            '<td width="5%">&nbsp;</td>' +
                            '<td width="40%" align="right"> <b>' + getTBWithCommas(available) + '</b>&nbsp; </td>' +
                            '<td width="10%" align="left"> ' + unit + ' </td>' +
                            '</tr>';
                        var u_close_part = '</table>' + '</div>';
                        if (overdraft === 0 && available !== 0) {
                            tooltip_label = u_disk_tape_part + u_available_part + u_close_part;
                        }
                        if (overdraft !== 0 && available === 0) {
                            tooltip_label = u_disk_tape_part + u_overdraft_part + u_close_part;
                        }
                        if (overdraft === 0 && available === 0) {
                            tooltip_label = u_disk_tape_part + u_available_part + u_close_part;
                        }
                        return tooltip_label;
                    }
                }
            }
        };
    }
})();