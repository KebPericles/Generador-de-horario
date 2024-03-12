# Prerrequisitos
- NodeJS (testeado v18.16.1)
- pnpm (testeado en v8.6.5)

# Instrucciones de uso

1. Clonar el repositorio
2. Instalar las dependencias con `pnpm install`
3. (***Opcional***) Cambiar el nombre del archivo `.env.example` a `.env` y rellenar los campos con los datos necesarios.

> [!INFO]
> En caso de hacer el paso 3, no será necesario ingresar las credenciales en los inicios de sesión correspondientes.

4. Ejecutar el programa con `pnpm start` y seguir las instrucciones de consola (en las siguientes subsecciones se detallan los pasos a seguir, en caso de ser insuficiente la información proporcionada por consola)

## Etapa de SAES

1. Iniciar sesión en SAES (en caso de haber puesto las credenciales en el archivo `.env`, solo será necesario rellenar el CAPTCHA y pulsar ENTER)
2. Presionar ENTER en la consola.

## Etapa de Google Calendar

1. Esperar el inicio de sesión en GOOGLE
2. Iniciar sesión en GOOGLE (omitir en caso de haber puesto las credenciales en el archivo `.env`)
3. Marcar el doble factor de autenticación en el móvil
4. Pulsar ENTER en la consola
5. Será redirigido a la página de Google Calendar, donde deberá activar unicamente el calendario en el que se desea agregar los horarios.
6. Una vez hecho esto, pulsar ENTER en la consola.
7. Se empezarán a registrar los eventos, esperar hasta que termine y presionar ENTER.