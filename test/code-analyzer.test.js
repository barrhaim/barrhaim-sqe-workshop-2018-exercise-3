import assert from 'assert';
import {parseCode} from '../src/js/code-analyzer';
import {makegraph, make_vars_string} from '../src/js/graph-gen';

describe('The javascript parser', () => {
    it('is parsing an empty function correctly', () => {
        assert.equal(
            JSON.stringify(parseCode('')),
            '{"type":"Program","body":[],"sourceType":"script"}'
        );
    });

    it('is parsing a simple variable declaration correctly', () => {
        assert.equal(
            JSON.stringify(parseCode('let a = 1;')),
            '{"type":"Program","body":[{"type":"VariableDeclaration","declarations":[{"type":"VariableDeclarator","id":{"type":"Identifier","name":"a"},"init":{"type":"Literal","value":1,"raw":"1"}}],"kind":"let"}],"sourceType":"script"}'
        );
    });
});

describe('dot format resulted from if elseif else', () => {
    it('if else branching test', () => {
        const source = 'function foo(x, y, z){\n' + '    let a = x + 1;\n' + '    let b = a + y;\n' + '    let c = 0;\n' + '    \n' + '    if (b < z) {\n' + '        c = c + 5;\n' + '    } else if (b < z * 2) {\n' + '        c = c + x + 5;\n' + '    } else {\n' + '        c = c + z + 5;\n' + '    }\n' + '    \n' + '    return c;\n' + '}\n';
        const input = '[1,5,0]';
        let dot = makegraph(source, input);
        let expect = 'digraph cfg { forcelabels=true\n n0 [label="let a = x + 1;;\nlet b = a + y;;\nlet c = 0;;",xlabel="0", shape=rectangle, style = filled, fillcolor=green ]\nn1 [label="b < z;",xlabel="1", shape=diamond, style = filled, fillcolor=green ]\nn2 [label="c = c + 5;",xlabel="2", shape=rectangle]\nn3 [label="return c;;",xlabel="3", shape=rectangle, style = filled, fillcolor=green ]\nn4 [label="b < z * 2;",xlabel="4", shape=diamond, style = filled, fillcolor=green ]\nn5 [label="c = c + x + 5;",xlabel="5", shape=rectangle]\nn6 [label="c = c + z + 5;",xlabel="6", shape=rectangle, style = filled, fillcolor=green ]\nn0 -> n1 []\nn1 -> n2 [label="true"]\nn1 -> n4 [label="false"]\nn2 -> n3 []\nn4 -> n5 [label="true"]\nn4 -> n6 [label="false"]\nn5 -> n3 []\nn6 -> n3 []\n }';
        assert.equal(expect, dot);
    });
});

describe('dot format resulted from while example', () => {
    it('while branching test', () => {
        const source = 'function foo(x, y, z){\n' + '   let a = x + 1;\n' + '   let b = a + y;\n' + '   let c = 0;\n' + '   \n' + '   while (a < z) {\n' + '       c = a + b;\n' + '       z = c * 2;\n' + '       a++;\n' + '   }\n' + '   \n' + '   return z;\n' + '}\n';
        const input = '[80,5,0]';
        let dot = makegraph(source, input);
        let expect = 'digraph cfg { forcelabels=true\n n0 [label="let a = x + 1;;\nlet b = a + y;;\nlet c = 0;;",xlabel="0", shape=rectangle, style = filled, fillcolor=green ]\nn1 [label="a < z;",xlabel="1", shape=diamond, style = filled, fillcolor=green ]\nn2 [label="c = a + b;\nz = c * 2;\na++;",xlabel="2", shape=rectangle]\nn3 [label="return z;;",xlabel="3", shape=rectangle, style = filled, fillcolor=green ]\nn0 -> n1 []\nn1 -> n2 [label="true"]\nn1 -> n3 [label="false"]\nn2 -> n1 []\n }';
        assert.equal(expect, dot);
    });
});

describe('all is green peace', () => {
    it('fully green test', () => {
        const source = 'function foo(x, y, z){\n' + '   let a = x;\n' + '   let b = a;\n' + '   let c = 0;\n' + '   \n' + '   if(a > z) {\n' + '       c = a + b;\n' + '       z = c * 2;\n' + '       a++;\n' + '   }\n' + '   \n' + '   return z;\n' + '}\n';
        const input = '[80,5,0]';
        let dot = makegraph(source, input);
        let expect = 'digraph cfg { forcelabels=true\n n0 [label="let a = x;;\nlet b = a;;\nlet c = 0;;",xlabel="0", shape=rectangle, style = filled, fillcolor=green ]\nn1 [label="a > z;",xlabel="1", shape=diamond, style = filled, fillcolor=green ]\nn2 [label="c = a + b;\nz = c * 2;\na++;",xlabel="2", shape=rectangle, style = filled, fillcolor=green ]\nn3 [label="return z;;",xlabel="3", shape=rectangle, style = filled, fillcolor=green ]\nn0 -> n1 []\nn1 -> n2 [label="true"]\nn1 -> n3 [label="false"]\nn2 -> n3 []\n }';
        assert.equal(expect, dot);
    });
});

describe('translate user input to env', () => {
    it('simple env', () => {
        const input = '[1,2,3]';
        const params = ['x', 'y', 'z'];
        let makeVarsString = make_vars_string(input, params);
        const expect = 'let x = 1;let y = 2;let z = 3;';
        assert.equal(expect, makeVarsString);
    });
});

describe('simple branching false taken', () => {
    it('false path taken', () => {
        const source = 'function foo(x){\n' + 'if(x>3){\n' + 'return 4;\n' + '}\n' + 'else {\n' + 'return 5;\n' + '}\n' + '\n' + '}\n';
        const input = '[1]';
        let dot = makegraph(source, input);
        let expect = 'digraph cfg { forcelabels=true\n n0 [label="x > 3;",xlabel="0", shape=diamond, style = filled, fillcolor=green ]\nn1 [label="return 4;;",xlabel="1", shape=rectangle]\nn2 [label="return 5;;",xlabel="2", shape=rectangle, style = filled, fillcolor=green ]\nn0 -> n1 [label="true"]\nn0 -> n2 [label="false"]\n }';
        assert.equal(expect, dot);
    });
});

describe('simple branching true taken', () => {
    it('true path taken', () => {
        const source = 'function foo(x){\n' + 'if(x>3){\n' + 'return 4;\n' + '}\n' + 'else {\n' + 'return 5;\n' + '}\n' + '\n' + '}\n';
        const input = '[10]';
        let dot = makegraph(source, input);
        let expect = 'digraph cfg { forcelabels=true\n n0 [label="x > 3;",xlabel="0", shape=diamond, style = filled, fillcolor=green ]\nn1 [label="return 4;;",xlabel="1", shape=rectangle, style = filled, fillcolor=green ]\nn2 [label="return 5;;",xlabel="2", shape=rectangle]\nn0 -> n1 [label="true"]\nn0 -> n2 [label="false"]\n }';
        assert.equal(expect, dot);
    });
});

describe('just return in body', () => {
    it('return only and string input', () => {
        const source = 'function foo(x){\n' + 'return x;\n' + '}\n';
        const input = ['bla'];
        let dot = makegraph(source, input);
        let expect = 'digraph cfg { forcelabels=true\n n0 [label="return x;;",xlabel="0", shape=rectangle, style = filled, fillcolor=green ]\n }';
        assert.equal(expect, dot);
    });
});

describe('parse boolean', () => {
    it('its boolean age', () => {
        const source = 'function foo(x){\n' + 'return x;\n' + '}\n';
        const input = ['true'];
        let dot = makegraph(source, input);
        let expect = 'digraph cfg { forcelabels=true\n n0 [label="return x;;",xlabel="0", shape=rectangle, style = filled, fillcolor=green ]\n }';
        assert.equal(expect, dot);
    });
});


describe('array parsing', () => {
    it('array parsing', () => {
        const source = 'function foo(x){\n' + 'return x;\n' + '}\n';
        const input = [[1, 2]];
        let dot = makegraph(source, input);
        let expect = 'digraph cfg { forcelabels=true\n n0 [label="return x;;",xlabel="0", shape=rectangle, style = filled, fillcolor=green ]\n }';
        assert.equal(expect, dot);
    });
});

describe('complex parsing', () => {
    it('arrays and whiles and ifs', () => {
        const source = 'function foo(x ,y){\n' + '\n' + 'if (x[0] < 3) {\n' + '   c = c + 5;\n' + '} \n' + '\n' + 'while(y<10) {\n' + ' y++;\n' + '}\n' + '    \n' + 'return c;\n' + '}\n';
        const input = [[10], 1];
        let dot = makegraph(source, input);
        let expect = 'digraph cfg { forcelabels=true\n n0 [label="x[0] < 3;",xlabel="0", shape=diamond, style = filled, fillcolor=green ]\nn1 [label="c = c + 5;",xlabel="1", shape=rectangle]\nn2 [label="y < 10;",xlabel="2", shape=diamond, style = filled, fillcolor=green ]\nn3 [label="y++;",xlabel="3", shape=rectangle, style = filled, fillcolor=green ]\nn4 [label="return c;;",xlabel="4", shape=rectangle, style = filled, fillcolor=green ]\nn0 -> n1 [label="true"]\nn0 -> n2 [label="false"]\nn1 -> n2 []\nn2 -> n3 [label="true"]\nn2 -> n4 [label="false"]\nn3 -> n2 []\n }';
        assert.equal(expect, dot);
    });
});