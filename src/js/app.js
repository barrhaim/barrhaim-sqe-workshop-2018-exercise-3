import $ from 'jquery';
import {makegraph} from './graph-gen';
import Viz from 'viz.js';
import {Module, render} from 'viz.js/full.render.js';
$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        let codeToParse = $('#codePlaceholder').val(); //plain text
        let inputs = $('#inputs').val();
        var dot = makegraph(codeToParse,inputs);
        const viz = new Viz({Module, render});

        viz.renderSVGElement(dot)
            .then(function (element) {
                $('#output').innerHTML = '';
                $('#output').append(element);
            });
    });

});

