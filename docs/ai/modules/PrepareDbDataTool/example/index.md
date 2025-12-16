# PrepareDbDataTool 代码示例

本目录包含模块的代码示例。

## 实体定义

```typescript
// backend/packages/core/src/modules/PrepareDbDataTool/entity/DbProfile.ts
@Entity('db_profile')
export class DbProfile {
  @PrimaryGeneratedColumn('uuid') id: string
  @Column({ type: 'text' }) name: string
  @Column({ type: 'text' }) host: string
  @Column({ type: 'integer' }) port: number
  @Column({ type: 'text' }) user: string
  @Column({ type: 'text' }) password: string
  @Column({ type: 'text' }) database: string
  @Column({ type: 'boolean', default: false }) isActive: boolean
}
```

## 连接测试

```typescript
async testConnection(profile: DbProfile): Promise<boolean> {
  const dataSource = new DataSource({
    type: 'mysql',
    host: profile.host,
    port: profile.port,
    username: profile.user,
    password: profile.password,
    database: profile.database,
  })
  try {
    await dataSource.initialize()
    await dataSource.destroy()
    return true
  } catch { return false }
}
```
