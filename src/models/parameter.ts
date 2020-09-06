export default class Parameter {
  name: string;
  type?: string;
  description?: string;
  example?: unknown;
  required?: boolean;

  static build(jsonObject: unknown): Parameter[] {
    return Object.keys(jsonObject).map((key) => ({ name: key, example: jsonObject[key] as unknown }));
  }

  static toJSON(params: Parameter[]): Record<string, unknown> {
    const jsonObj = {};
    params.forEach((param) => {
      jsonObj[param.name] = param.example;
    });
    return jsonObj;
  }
}
