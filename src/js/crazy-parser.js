import Trow from "./Trow";

function parseBody(toParse) {
  return [""]
    .concat(toParse["body"])
    .reduce((accumulator, currentValue) => accumulator + parse(currentValue));
}

function parseFunction(toParse) {
  let name = toParse["id"]["name"];
  let type = "function declaration";
  let line = toParse["loc"]["start"]["line"];

  return (
    template(line, type, name, "", "") +
    paramsSlayer(toParse["params"]) +
    parse(toParse["body"])
  );
}
function paramsSlayer(listOfParams) {
  return [""]
    .concat(listOfParams)
    .reduce((accumulator, currentValue) => accumulator + parse(currentValue));
}
function parseIndentifer(toParse) {
  let name = toParse["name"];
  let type = "variable declaration";
  let line = toParse["loc"]["start"]["line"];
  return template(line, type, name, "", "");
}
function parseVariableDeclaration(toParse) {
  return [""]
    .concat(toParse["declarations"])
    .reduce((accumulator, currentValue) => accumulator + parse(currentValue));
}
function parseVariableDeclarator(toParse) {
  let line = toParse["loc"]["start"]["line"];
  let type = "variable declaration";
  let name = toParse["id"]["name"];
  let value =
    toParse["init"] !== null ? binaryExpressionToString(toParse["init"]) : "";
  return template(line, type, name, "", value);
}
function parseBlockStatement(toParse) {
  return parseBody(toParse);
}
function parseExpressionStatement(toParse) {
  return parse(toParse["expression"]);
}
function parseAssignmentExpression(toParse) {
  let name = binaryExpressionToString(toParse["left"]);
  let line = toParse["left"]["loc"]["start"]["line"];
  let type = "assignment expression";
  let value = binaryExpressionToString(toParse["right"]);
  return template(line, type, name, "", value);
}

//& becomes &amp;
//< becomes &lt;
//> becomes &gt;
function binaryExpressionToString(toParse) {
  switch (toParse["type"]) {
    case "Identifier":
      return toParse["name"];
    case "Literal":
      return toParse["value"];
    case "MemberExpression":
      return (
        toParse["object"]["name"] +
        `[${binaryExpressionToString(toParse["property"])}]`
      );
    case "UnaryExpression":
      return (
        toParse["operator"] + binaryExpressionToString(toParse["argument"])
      );
    default:
      // must be binary
      let op = toParse["operator"];
      let mymap = {
        "&": "&amp",
        "&&": "&amp&amp",
        "<": "&lt",
        ">": "&gt"
      };
      return (
        binaryExpressionToString(toParse["left"]) +
        (op in mymap ? mymap[op] : op) +
        binaryExpressionToString(toParse["right"])
      );
  }
}

function parseWhileStatement(toParse) {
  let condition = binaryExpressionToString(toParse["test"]);
  let type = "while statement";
  let line = toParse["loc"]["start"]["line"];
  return template(line, type, "", condition, "") + parseBody(toParse);
}
function parseIfStatement(toParse, isFirst) {
  let condition = binaryExpressionToString(toParse["test"]);
  let type = "";
  type = isFirst ? "if statement" : "else if statement";
  let line = toParse["loc"]["start"]["line"];
  return (
    template(line, type, "", condition, "") +
    parse(toParse["consequent"]) +
    (toParse["alternate"] !== null &&
    toParse["alternate"]["type"] !== "IfStatement"
      ? template(
          toParse["alternate"]["loc"]["start"]["line"] - 1,
          "else statement",
          "",
          "",
          ""
        ) + parse(toParse["alternate"], false)
      : toParse["alternate"] !== null
      ? parse(toParse["alternate"], false)
      : "")
  );
}

function parseReturnStatement(toParse) {
  let type = "return statement";
  let line = toParse["loc"]["start"]["line"];
  let value = binaryExpressionToString(toParse["argument"]);
  return template(line, type, "", "", value);
}
function parseForStatement(toParse) {
  let condition = binaryExpressionToString(toParse["test"]);
  let type = "for statement";
  let line = toParse["loc"]["start"]["line"];
  return (
    template(line, type, "", condition, "") +
    parseVariableDeclaration(toParse["init"]) +
    parseBody(toParse)
  );
}
function parseProgram(toParse) {
  return parseBody(toParse);
}
///////////////////////////////////////////////////////////////////////////////////////////
function template(line, type, name, condition, value) {
  return new Trow(line, type, name, condition, value).toHtml();
  //return `<tr><td>${line}</td><td>${type}</td><td>${name}</td><td>${condition}</td><td>${value}</td></tr>`;
}
function parse(toParse, controlFlag) {
  switch (toParse["type"]) {
    case "Program":
      return parseProgram(toParse);
    case "FunctionDeclaration":
      return parseFunction(toParse);
    case "VariableDeclaration":
      return parseVariableDeclaration(toParse);
    case "Identifier":
      return parseIndentifer(toParse);
    case "BlockStatement":
      return parseBlockStatement(toParse);
    case "VariableDeclarator":
      return parseVariableDeclarator(toParse);
    case "ExpressionStatement":
      return parseExpressionStatement(toParse);
    case "AssignmentExpression":
      return parseAssignmentExpression(toParse);
    case "WhileStatement":
      return parseWhileStatement(toParse);
    case "IfStatement":
      return controlFlag === undefined
        ? parseIfStatement(toParse, true) // means its first if
        : parseIfStatement(toParse, controlFlag);
    case "ReturnStatement":
      return parseReturnStatement(toParse);
    case "ForStatement":
      return parseForStatement(toParse);
    default:
      return "";
  }
}

export { parse };
