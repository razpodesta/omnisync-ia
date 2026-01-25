# 🛡️ Module Boundaries Manifest

1. **Domain (type:domain)**: Solo puede depender de otros `type:domain` (Shared) o ser totalmente autónomo. Prohibido importar `infrastructure` o `application`.
2. **Application (type:application)**: Puede depender de `domain`. Prohibido importar `infrastructure`.
3. **Infrastructure (type:infrastructure)**: Puede depender de `domain` y `application`.
4. **Shared (scope:shared)**: No puede depender de scopes específicos (`scope:tenant`, `scope:global`).