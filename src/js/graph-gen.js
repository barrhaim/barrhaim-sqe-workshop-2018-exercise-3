import * as esprima from 'esprima';

const esgraph = require('esgraph');
import * as escodegen from 'escodegen';

function makegraph(source, inputs) {
    let ast = esprima.parse(source, {range: true});
    let params = extract_params(ast);
    let env = make_vars_string(inputs, params);
    let cfg = esgraph(handle_ast(ast));
    handle_cfg(cfg);
    color_nodes(cfg, env);
    let myformat = my_dot_format(cfg);
    let dot = esgraph.dot(cfg, {counter: 0, source: source});
    dot = `digraph cfg { forcelabels=true\n ${myformat} }`;
    return dot;
}


function my_dot_format(cfg) {
    let nodes = make_nodes(cfg);
    let edges = make_edges(cfg);
    return nodes.concat(edges).join('');
}

function specify_node(current, i, s) {
    let temp = `n${i} [label="${current.label}",xlabel="${i}"`;
    if (current.true && current.false) {
        temp += ', shape=diamond';
    }
    else {
        temp += ', shape=rectangle';
    }
    if (current.color && current.color === 'green') {
        temp += ', style = filled, fillcolor=green ';
    }
    s.push(temp + ']\n');
}

function make_nodes(cfg) {
    let s = [];
    let nodes = cfg[2];
    for (let i = 0; i < nodes.length; i++) {
        let current = nodes[i];
        specify_node(current, i, s);
    }
    return s;
}

function gen_edge(x, nodes, edges) {
    if (x.true) {
        let from = 'n' + nodes.indexOf(x);
        let to = 'n' + nodes.indexOf(x.true);
        edges.push(`${from} -> ${to} [label="true"]\n`);
    }
    if (x.false) {
        let from = 'n' + nodes.indexOf(x);
        let to = 'n' + nodes.indexOf(x.false);
        edges.push(`${from} -> ${to} [label="false"]\n`);
    }
    if (x.normal) {
        let from = 'n' + nodes.indexOf(x);
        let to = 'n' + nodes.indexOf(x.normal);
        edges.push(`${from} -> ${to} []\n`);
    }
}

function make_edges(cfg) {
    let edges = [];
    let nodes = cfg[2];
    nodes.forEach(x => {
        gen_edge(x, nodes, edges);

    });
    return edges;
}


///////////////////////////
function color_nodes(cfg, env) {
    let gnodes = cfg[2];
    rec_coloring(gnodes[0], env);
}

//FINITE VERSION
// function rec_coloring(node, env) {
//     if (node && node.color === undefined){
//         if(node.true && node.false){
//             handle_condition(node,env);
//         }
//         else{
//             node.color='green';
//             rec_coloring(node.normal,env+node.label);
//         }
//     }
//
// }

//ENDLESS IN SOME CASES
function rec_coloring(node, env) {
    if (node) {
        if (node.true && node.false) {
            handle_condition(node, env);
        }
        else {
            node.color = 'green';
            rec_coloring(node.normal, env + node.label);
        }
    }

}

function handle_condition(node, env) {
    node.color = 'green';

    if (eval(env + node.label)) {
        rec_coloring(node.true, env);
    }
    else {
        rec_coloring(node.false, env);
    }
}

function make_vars_string(inputs, params) {
    let data = eval(inputs);
    let vs = [];
    for (let i = 0; i < data.length; i++) {
        if (Array.isArray(data[i])) {
            vs.push(`let ${params[i]} = [${data[i]}];`);
        }
        else {
            vs.push(`let ${params[i]} = ${data[i]};`);
        }

    }
    return vs.join('');
}

function extract_params(ast) {
    let param_names = [];
    ast.body[0].params.forEach(p => param_names.push(p.name));
    return param_names;
}


//////////////////////////////////////////////////////////
function handle_ast(ast) {
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
        // if (x.astNode !== undefined) {
        x.label = escodegen.generate(x.astNode) + ';';
        delete x.exception;
        // }
    });
}

function handle_cfg(cfg) {
    let gnodes = cfg[2];
    gnodes.splice(0, 1);
    gnodes.splice(gnodes.length - 1, 1);
    lables_and_exceptions(gnodes);
    del_exit_node(gnodes);
    merge(gnodes);
}

function set_label(node) {
    node.label = node.label + '\n' + node.normal.label;
}

function link_next_node(node) {
    node.next = node.normal.next;
    node.normal = node.normal.normal;
}

function merge(cfg) {
    for (let i = 0; i < cfg.length; i++) {
        let node = cfg[i];
        while (node.normal && node.normal.normal && node.normal.prev.length === 1) {
            cfg.splice(cfg.indexOf(node.normal), 1);
            set_label(node);
            link_next_node(node);
        }
    }
}

//////////////////////////////////////////////////////////


export {makegraph, make_vars_string};