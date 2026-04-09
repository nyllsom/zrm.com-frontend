**Livecode API 规范**

`livecode` 现在是“文档 + 独立 blocks”的结构。文档只保存 `blockIds` 的顺序，前端负责维护顺序；后端不再计算 `order`。整体设计和路由主要在 [internal/livecode/model.go](e:/AIA/nju-aia-site-backend/internal/livecode/model.go)、[internal/livecode/handler.go](e:/AIA/nju-aia-site-backend/internal/livecode/handler.go)、[cmd/server/main.go](e:/AIA/nju-aia-site-backend/cmd/server/main.go)。

**鉴权规则**

- `GET /api/livecodes` 和 `GET /api/livecodes/:id` 公开可访问
- 其余写操作都需要管理员 token
- 登录后多端可同时保持 token 有效

**文档模型**

`Document` 返回字段：

```json
{
  "id": "lc001234",
  "slug": "python-basic-demo",
  "publishedAt": "2026-04-09",
  "blockIds": ["blk1", "blk2"],
  "blocks": [...]
}
```

说明：
- `blockIds` 决定 blocks 展示顺序
- `blocks` 是按 `blockIds` 顺序组装后的完整内容
- `publishedAt` 是手动设置日期，不是自动时间

`Block` 字段：

```json
{
  "id": "blk000000001",
  "type": "code",
  "content": "print('hello world')",
  "language": "python"
}
```

**接口列表**

1. `GET /api/livecodes`
- 获取 livecode 列表
- 返回基础信息，不包含 blocks 明细

返回示例：

```json
{
  "items": [
    {
      "id": "lc001234",
      "slug": "python-basic-demo",
      "publishedAt": "2026-04-09"
    }
  ]
}
```

2. `GET /api/livecodes/:id`
- 获取单个 livecode 详情
- 返回 `blockIds` 和按顺序展开后的 `blocks`

3. `POST /api/livecodes`
- 创建一个空 livecode 文档
- 只创建文档本身，不创建 blocks

请求体：

```json
{
  "slug": "python-basic-demo",
  "publishedAt": "2026-04-09"
}
```

返回：

```json
{
  "id": "lc001234"
}
```

4. `PUT /api/livecodes/:id/block-ids`
- 更新 blocks 顺序
- 前端把新的 block ID 顺序完整传给后端
- 后端只保存 `blockIds`，不计算顺序号

请求体：

```json
{
  "blockIds": ["blk2", "blk1", "blk3"]
}
```

5. `POST /api/livecodes/:id/blocks`
- 给指定 livecode 新增一个 block
- 后端生成 block id
- 新 block 会自动追加到该文档的 `blockIds` 末尾

请求体：

```json
{
  "type": "code",
  "content": "print('hello world')",
  "language": "python"
}
```

6. `PUT /api/livecodes/:id/blocks/:blockId`
- 修改某一个 block
- 只改 block 内容本身，不改文档顺序

请求体同新增：

```json
{
  "type": "markdown",
  "content": "这里是说明",
  "language": ""
}
```

7. `DELETE /api/livecodes/:id/blocks/:blockId`
- 删除某个 block
- 同时会把它从该文档的 `blockIds` 中移除

8. `DELETE /api/livecodes/:id`
- 删除整个 livecode 文档

**Block 规则**

- `type` 只允许 `markdown` 或 `code`
- `code` block 必须带 `language`
- `markdown` block 不能带 `language`
- 后端不会自动生成或维护 `order`
- 前端只要根据返回的 `blockIds` 或自己维护的顺序渲染即可

**建议前端交互方式**

- 新建文档时，先调 `POST /api/livecodes`
- 然后不断调 `POST /api/livecodes/:id/blocks` 添加 block
- 拖拽排序后，调 `PUT /api/livecodes/:id/block-ids`
- 编辑单个块时，调 `PUT /api/livecodes/:id/blocks/:blockId`
- 删除块后，刷新文档详情或本地同步 `blockIds`

**校验和错误**

- `slug` 必填且唯一
- `publishedAt` 必填，格式 `YYYY-MM-DD`
- `blockIds` 不能包含重复或空值
- `blockId` 必须属于该文档，否则返回 404
- 不合法的 `type/language/content` 会返回 400
