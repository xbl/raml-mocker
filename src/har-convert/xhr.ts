const isXHR = mimeType => /\/json/.test(mimeType);

export default (entries) =>
  entries
    .filter(({ response }) => {
      const { mimeType } = response.content;
      return isXHR(mimeType);
    });
