# 都是测试代码：
```javascript
  test(() => {
    const bar = {
      foo: {
        x: 1,
        y: 2,
      },
    };

    expect(bar).toMatchSnapshot();
  });
```
