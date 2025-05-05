const fs = require('fs-extra');
const path = require('path');
const { google } = require('googleapis');
const readline = require('readline');

// Cargar credenciales desde el archivo
const credentialsPath = path.join(__dirname, './config/google-drive-credentials.json');
const credentialsFile = fs.readFileSync(credentialsPath);
const credentials = JSON.parse(credentialsFile).web;

// Crear cliente OAuth2
const oauth2Client = new google.auth.OAuth2(
  credentials.client_id,
  credentials.client_secret,
  credentials.redirect_uris[0]
);

// Generar URL de autorización
const scopes = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.appdata'
];

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: scopes,
  prompt: 'consent'
});

console.log('Autoriza esta aplicación visitando esta URL:', authUrl);

// Crear interfaz de readline
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Obtener el código de autorización e intercambiarlo por tokens
rl.question('Ingresa el código de esa página aquí: ', (code) => {
  rl.close();
  oauth2Client.getToken(code, (err, token) => {
    if (err) {
      console.error('Error al obtener el token de acceso', err);
      return;
    }
    console.log('Token:', token);

    // Guardar el token en tu archivo de credenciales
    const updatedCredentials = {
      ...credentials,
      refresh_token: token.refresh_token
    };

    fs.writeFileSync(
      credentialsPath,
      JSON.stringify({ web: updatedCredentials }, null, 2)
    );
    
    console.log('El refresh token ha sido guardado en el archivo de credenciales');
  });
});