# Inicio del Proyecto

## Requisitos Previos

*   Asegúrate de tener Docker Desktop instalado y en ejecución.
*   Necesitarás PowerShell 7 o una versión superior.
*   Node.js y npm deben estar instalados en tu sistema.

## Pasos para Iniciar

1.  **Abrir una terminal de PowerShell.**
    Puedes ejecutar el script directamente desde la terminal integrada de tu IDE (como VS Code, WebStorm, etc.) o abriendo una terminal de PowerShell manualmente.

2.  **Navegar a la raíz del proyecto.**
    Utiliza el comando `cd` para moverte al directorio donde clonaste o descomprimiste el proyecto. Por ejemplo:
    ```powershell
    cd ruta/a/tu/proyecto
    ```

3.  **Ejecutar el script `start.dev.ps1`:**
    Una vez en la raíz del proyecto, ejecuta el siguiente comando:
    ```powershell
    ./start.dev.ps1
    ```
    Si encuentras problemas de permisos para ejecutar scripts, puede que necesites cambiar la política de ejecución de PowerShell. Puedes hacerlo (con precaución) ejecutando PowerShell como Administrador y luego:
    ```powershell
    Set-ExecutionPolicy RemoteSigned -Scope Process
    ```
    Luego intenta ejecutar `./start.dev.ps1` de nuevo en tu terminal no administrativa.

4.  **Proceso del Script:**
    El script `start.dev.ps1` automatizará los siguientes pasos:
    *   Verificará que Docker esté corriendo.
    *   Levantará la base de datos PostgreSQL utilizando `docker-compose up -d postgres`.
    *   Esperará unos segundos para que PostgreSQL se inicie correctamente.
    *   Navegará al directorio `backend/`, instalará las dependencias (`npm install`), generará el cliente Prisma (`npx prisma generate`), aplicará las migraciones (`npx prisma migrate dev`) y ejecutará el seed de la base de datos (`npx prisma db seed`).
    *   Iniciará el servidor backend en segundo plano (`npm run dev`).
    *   Navegará al directorio `frontend/`, instalará las dependencias (`npm install`).
    *   Iniciará el servidor frontend en segundo plano (`npm run dev`).

5.  **Acceso a los servicios:**
    *   **Backend:** Estará disponible en `http://localhost:3003`
    *   **Frontend:** Estará disponible en `http://localhost:8081`

## Para Detener los Servicios

*   **Para detener los servidores de backend y frontend:** Simplemente cierra la ventana de PowerShell donde ejecutaste el script `start.dev.ps1`. Esto detendrá los procesos que el script mantiene activos.
*   **Para detener la base de datos PostgreSQL (docker):** Abre una nueva terminal en la raíz del proyecto y ejecuta:
    ```powershell
    docker-compose stop postgres
    ```

¡Y eso es todo! Tu entorno de desarrollo debería estar funcionando. 
 
## Enlaces Memoria

*   [Documentación de la API](http://localhost:3003/api/docs) 

    