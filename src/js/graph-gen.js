import * as esprima from 'esprima';
const esgraph = require('esgraph');
import * as escodegen from 'escodegen';

function makegraph(source,inputs){
    let ast = esprima.parse(source, { range: true });
    let params = extract_params(ast);
    let env = make_vars_string(inputs,params)
    let cfg = esgraph(handle_ast(ast));
    handle_cfg(cfg);
    let dot = esgraph.dot(cfg, { counter: 0, source: source });
    dot = `digraph cfg { forcelabels=true\n ${dot} }`;

    return dot;
}

function make_vars_string(inputs,params){
    let data = eval(inputs);
    let vs = [];
    for(let i =0 ; i<data.length ; i++){
        vs.push(`let ${params[i]} = ${data[i]};`);
    }
    return vs.join('');
}

function extract_params(ast) {
    let param_names =[];
    ast.body[0].params.forEach(p=>param_names.push(p.name));
    return param_names;
}








//////////////////////////////////////////////////////////
function handle_ast(ast){
    return ast.body[0].body;
}

function del_exit_node(gnodes) {
    gnodes.forEach(x => {
        if (x.astNode.type === 'ReturnStatement') {
            delete x.normal;
            x.next = [];
        }
    });
}

function lables_and_exceptions(gnodes) {
    gnodes.forEach(x => {
        if (x.astNode !== undefined) {
            x.label = escodegen.generate(x.astNode);
            delete x.exception;
        }
    });
}

function handle_cfg(cfg) {
    let gnodes = cfg[2];
    gnodes.splice(0,1);
    gnodes.splice(gnodes.length-1,1);
    lables_and_exceptions(gnodes);
    del_exit_node(gnodes);
    merge(gnodes);
}

function set_label(node) {
    node.label = node.label + '\n' + node.normal.label;
}

function merge(cfg) {
    for (let i = 0; i < cfg.length; i++) {
        let node = cfg[i];
        while (node.normal && node.normal.normal && node.normal.prev.length === 1) {
            cfg.splice(cfg.indexOf(node.normal), 1);
            set_label(node);
            node.next = node.normal.next;
            node.normal = node.normal.normal;
        }
    }
}

//////////////////////////////////////////////////////////


export {makegraph};