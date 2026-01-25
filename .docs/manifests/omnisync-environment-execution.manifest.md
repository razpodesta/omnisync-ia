/** .docs/manifests/omnisync-environment-execution.manifest.md */

# 🏁 Omnisync Environment & Execution Manifest (OEEE)

## 1. Estándar de Plataforma
- **Sistema Operativo**: Windows 10.
- **Terminal**: CMD (Command Prompt).
- **Editor**: Visual Studio Code (VS Code).

## 2. Formato de Comandos
- Los comandos deben entregarse en bloques de código limpios.
- Ejecución secuencial línea por línea.
- **Sin comentarios internos** para evitar errores de pegado en CMD.

## 3. Protocolo de Cierre de Ciclo (Git)
Al finalizar cada nivelación de aparato exitosa, se entregará un bloque de código final con:
1. `git add .`
2. `git commit -m "[tipo]: [descripción nivelada]"` (Sin saltos de línea).
3. `git push`