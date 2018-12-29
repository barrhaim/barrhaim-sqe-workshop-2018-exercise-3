import assert from 'assert';
import {parseCode} from '../src/js/code-analyzer';
import {makegraph} from '../src/js/graph-gen';

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
    it('ex1 dot format', () => {
        const source = 'function foo(x, y, z){\n' + '    let a = x + 1;\n' + '    let b = a + y;\n' + '    let c = 0;\n' + '    \n' + '    if (b < z) {\n' + '        c = c + 5;\n' + '    } else if (b < z * 2) {\n' + '        c = c + x + 5;\n' + '    } else {\n' + '        c = c + z + 5;\n' + '    }\n' + '    \n' + '    return c;\n' + '}\n';
        const input='[1,5,0]';
        let dot = makegraph(source,input);
        let expect = 'digraph cfg { forcelabels=true\n n0 [label="let a = x + 1;;\nlet b = a + y;;\nlet c = 0;;",xlabel="0", shape=rectangle, style = filled, fillcolor=green ]\nn1 [label="b < z;",xlabel="1", shape=diamond, style = filled, fillcolor=green ]\nn2 [label="c = c + 5;",xlabel="2", shape=rectangle]\nn3 [label="return c;;",xlabel="3", shape=rectangle, style = filled, fillcolor=green ]\nn4 [label="b < z * 2;",xlabel="4", shape=diamond, style = filled, fillcolor=green ]\nn5 [label="c = c + x + 5;",xlabel="5", shape=rectangle]\nn6 [label="c = c + z + 5;",xlabel="6", shape=rectangle, style = filled, fillcolor=green ]\nn0 -> n1 []\nn1 -> n2 [label="true"]\nn1 -> n4 [label="false"]\nn2 -> n3 []\nn4 -> n5 [label="true"]\nn4 -> n6 [label="false"]\nn5 -> n3 []\nn6 -> n3 []\n }';
        assert.equal(expect,dot);
    });
});

describe('dot format resulted from while example', () => {
    it('ex1 dot format', () => {
        const source ='function foo(x, y, z){\n' + '   let a = x + 1;\n' + '   let b = a + y;\n' + '   let c = 0;\n' + '   \n' + '   while (a < z) {\n' + '       c = a + b;\n' + '       z = c * 2;\n' + '       a++;\n' + '   }\n' + '   \n' + '   return z;\n' + '}\n';
        const input='[80,5,0]';
        let dot = makegraph(source,input);
        let expect ='digraph cfg { forcelabels=true\n n0 [label="let a = x + 1;;\nlet b = a + y;;\nlet c = 0;;",xlabel="0", shape=rectangle, style = filled, fillcolor=green ]\nn1 [label="a < z;",xlabel="1", shape=diamond, style = filled, fillcolor=green ]\nn2 [label="c = a + b;\nz = c * 2;\na++;",xlabel="2", shape=rectangle]\nn3 [label="return z;;",xlabel="3", shape=rectangle, style = filled, fillcolor=green ]\nn0 -> n1 []\nn1 -> n2 [label="true"]\nn1 -> n3 [label="false"]\nn2 -> n1 []\n }';
        assert.equal(expect,dot);
    });
});

describe('all is green peace', () => {
    it('ex1 dot format', () => {
        const source='function foo(x, y, z){\n' + '   let a = x;\n' + '   let b = a;\n' + '   let c = 0;\n' + '   \n' + '   if(a > z) {\n' + '       c = a + b;\n' + '       z = c * 2;\n' + '       a++;\n' + '   }\n' + '   \n' + '   return z;\n' + '}\n';
        const input='[80,5,0]';
        let dot = makegraph(source,input);
        let expect = 'digraph cfg { forcelabels=true\n n0 [label="let a = x;;\nlet b = a;;\nlet c = 0;;",xlabel="0", shape=rectangle, style = filled, fillcolor=green ]\nn1 [label="a > z;",xlabel="1", shape=diamond, style = filled, fillcolor=green ]\nn2 [label="c = a + b;\nz = c * 2;\na++;",xlabel="2", shape=rectangle, style = filled, fillcolor=green ]\nn3 [label="return z;;",xlabel="3", shape=rectangle, style = filled, fillcolor=green ]\nn0 -> n1 []\nn1 -> n2 [label="true"]\nn1 -> n3 [label="false"]\nn2 -> n3 []\n }';
        assert.equal(expect,dot);
    });
});