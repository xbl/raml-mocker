export default class Parameter {
  static build(jsonObject: object): Parameter[] {
    return Object.keys(jsonObject).map((key) => {
      return { name: key, example: jsonObject[key] };
    });
  }

  static toJSON(params: Parameter[]): object {
    const jsonObj = {};
    params.forEach((param) => {
      jsonObj[param.name] = param.example;
    });
    return jsonObj;
  }

  name: string;
  type?: string;
  description?: string;
  example?: string;
  required?: boolean;
}
