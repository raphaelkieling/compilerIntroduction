let types = require('./types')
let regex = require('./regex')

let code = `
	{{title}}

  {{path}}

  {{#city}}{{name}}{{/city}}

  {{#person}}

    {{name}}
    {{#job}}
      {{name}}
    {{/job}}

  {{/person}}

  <?php class {{person.name}}{
    private $var;
  }?>
`;

let data = {
  title:'Titulo',
  person:{
    name: 'Name'
  }
}

function clearTag(text){
  return text.replace(/\{\{|\}\}/g,'')
}

function tokenizer(code){
	// {{variable}}
	let TOKEN_TAG_REGEX = /(\{\{(\#|\/)?([0-9A-Za-z\.])+\}\})/g;
  let matched   = [];
  let tokens    = [];

 	while(matched){
    matched = TOKEN_TAG_REGEX.exec(code);

    if(matched){
      let [value] = matched;
      tokens.push([value, TOKEN_TAG_REGEX.lastIndex - value.length, TOKEN_TAG_REGEX.lastIndex]);
    }
  }

  return tokens;
}

function parser(tokens){
  let ast = {
    type: types.Program,
    body:[]
  }
  let position = 0;

  let peek = () => tokens[position]
  let consume = () => tokens[++position];

  let parserToken = () =>{
    let [value] = peek()
    let tag_cleared = clearTag(value);

    let createNode = (type, value) => ({ type, value, body:[] })

    if(tag_cleared.match(regex.Object)){
      // console.log(`Object: (${tag_cleared})`)
      return createNode(types.Object, tag_cleared);
    }
    else if(tag_cleared.match(regex.InitParent)){
      // console.log(`InitParent: (${tag_cleared})`)
      let node = createNode(types.InitParent, tag_cleared.slice(1));
      return node;
    }
    else if(tag_cleared.match(regex.FinalParent)){
      // console.log(`FinalParent: (${tag_cleared})`)
      return createNode(types.FinalParent, tag_cleared.slice(1))
    }
    else if (tag_cleared.match(regex.Name)) {
      // console.log(`Name: (${tag_cleared})`)
      return createNode(types.Name, tag_cleared)
    }
  }

  while(tokens[position]){
    ast.body.push(parserToken())
    position++;
  }

  return ast;
}

let tokenized = tokenizer(code);
let parsed    = parser(tokenized);

// console.log('---')
console.log(parsed)
