var MarkdownIt = require('markdown-it');
var md = new MarkdownIt();
const vm = require('vm');
const jest = require('jest');

// https://github.com/raml-org/raml-spec/blob/master/versions/raml-10/raml-10.md/#annotations
// annotation 可以自定义属性，这样就方便我们通过解析找到指定的方法

var output = (obj) => {
  // console.log(obj)
  console.log('----------------------------------------')
  if (obj.resources) {
    // console.log(obj.resources)
    obj.resources.forEach((newObj) => {
      output(newObj);
    })
    if(obj.methods) {
      console.log(JSON.stringify(obj.methods[0], null, 2));
    }
  } else {
    // console.log(obj);
    if(obj.methods) {
      console.log(JSON.stringify(obj.methods[0].responses, null, 2));
    }
  }
}

// console.log(jest);
var raml = require('raml-1-parser');
raml.loadApi('./api.raml', { rejectOnErrors: false, serializeMetadata: false})
  .then(result => {
    console.log(result.RAMLVersion())
    // var ramlObj = result.expand(true).toJSON({ serializeMetadata: false });
    // console.log(JSON.stringify(ramlObj, null, 2));

    // output(ramlObj)
    // console.log(ramlObj)
    // ramlObj.resources.forEach(function (obj, i) {

      // console.log(obj.resources)
      // if (obj.displayName === '/song') {
      //   obj.methods.forEach(method => {
      //     var description = method.description;
      //     if(!description)
      //       return ;
      //     // console.log(description);
      //     md.parse(description).forEach(block => {
      //       if(block.tag === 'code' && block.info === 'javascript') {
      //         // console.log(block.content);
      //         // vm.runInThisContext(block.content)(NodeEnvironment);
      //         console.log(jest.run.toString());
      //       }
      //     });
      //   });
      // }
    // });
  });
