# Link Check Report

## 参考资料

- [Link Check Delegation](./LinkCheckDelegation.md)
- [Link Check Scope](./LinkCheckScope.md)
- [Resolved Specification Link](./ResolvedSpecificationLink.md)

## 定义

**Link Check Report** 是执行 **Link Check Delegation** 任务成功完成后的原始检查结果。

## 关键属性

- **Check Delegation：**
- **Check Scope：**
- **Dead Resolved Specification Links：**

### 数据模型

```ts
interface LinkCheckReport {
  delegation: LinkCheckDelegation;
  scope: LinkCheckScope;
  deadLinks: DeadResolvedSpecificationLink[];
}
```

### 数据模型案例

```json
{
  "delegation": {
    "root": "/var/specs",
    "base": "/var/specs",
    "files": ["guide.md"],
    "mode": "shallow"
  },
  "scope": {
    "files": ["guide.md"],
    "issues": []
  },
  "deadLinks": [
    {
      "status": "dead",
      "location": {
        "root": "/var/specs",
        "filePath": "guide.md"
      },
      "link": {
        "type": "local-file",
        "text": "[Missing](missing.md)",
        "name": "Missing",
        "path": "missing.md"
      },
      "target": {
        "filePath": "/var/specs/missing.md"
      },
      "reason": "file-not-found"
    }
  ]
}
```

## 规则与约束

无。
