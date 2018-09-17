var express = require('express');
var app = express();
var raml = require('raml-1-parser');

var apiJSON = raml.loadApiSync('./api.raml', {serializeMetadata: false});

const webApiArr = [];
apiJSON.allResources().forEach(resource => {
  const absoluteUri = resource.absoluteUri();
  resource.methods().forEach(method => {
    const webApi = {absoluteUri, method: method.method()};
    // console.log(method.toJSON())
    method.annotations().forEach(annotation => {
      const json = annotation.toJSON();
      if (json.name !== 'controller')
        return
      webApi.controller = json.structuredValue;
      webApiArr.push(webApi);
    })

    if (webApi.controller)
      return ;
    webApi.responses = []
    method.responses().forEach(response => {
      const code = response.code().value();
      response.body().forEach(typeDeclaration => {
        const mimeType = typeDeclaration.name();
        const example = typeDeclaration.example();
        if (example) {
          webApi.responses.push({code, body: example.value(), mimeType});
        }
      })
    })
    webApiArr.push(webApi);
  })
});

// console.log(webApiArr);

webApiArr.forEach(webApi => {
  app[webApi.method](webApi.absoluteUri, (req, res) => {
    if (webApi.controller) {
      const controller = webApi.controller.split('#');
      require(`./controller/${controller[0]}`)[controller[1]].call(app, req, res, webApi);
      return ;
    }

    const response = webApi.responses[0];
    if (!response)
      return res.status(404).send('no set reponse or example');
    res.type(response.mimeType);
    res.send(response.body);
  });
});

app.listen(3000, () => console.log('Example app listening on port 3000!'));
