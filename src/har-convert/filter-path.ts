export default (entries: any[], condition: string): any[] =>
  entries
    .filter(({ request }) => {
      const { url } = request;
      return url.includes(condition);
    });
