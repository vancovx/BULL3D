// Instala los paquetes necesarios
// npm install googleapis google-auth-library multer streamifier fs-extra

/*const { google } = require('googleapis');
const multer = require('multer');
const streamifier = require('streamifier');
const fs = require('fs-extra');
const path = require('path');

// Configuración de autenticación con Google Drive API
class GoogleDriveService {
  constructor() {
    this.drive = null;
    this.initialize();
  }

  initialize() {
    // Credenciales obtenidas del panel de Google Cloud Platform
    const credentials = {
      client_id: process.env.GOOGLE_DRIVE_CLIENT_ID,
      client_secret: process.env.GOOGLE_DRIVE_CLIENT_SECRET,
      redirect_uri: process.env.GOOGLE_DRIVE_REDIRECT_URI,
      refresh_token: process.env.GOOGLE_DRIVE_REFRESH_TOKEN
    };

    const client = new google.auth.OAuth2(
      credentials.client_id,
      credentials.client_secret,
      credentials.redirect_uri
    );

    client.setCredentials({ refresh_token: credentials.refresh_token });
    this.drive = google.drive({ version: 'v3', auth: client });
  }

  // Subir un archivo a Google Drive y obtener la URL pública
  async uploadFile(fileBuffer, mimeType, fileName, folderId = null) {
    try {
      const fileMetadata = {
        name: fileName,
        parents: folderId ? [folderId] : []
      };

      const media = {
        mimeType,
        body: streamifier.createReadStream(fileBuffer)
      };

      const response = await this.drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id,webViewLink'
      });

      // Configurar permisos para hacer el archivo accesible públicamente
      await this.drive.permissions.create({
        fileId: response.data.id,
        requestBody: {
          role: 'reader',
          type: 'anyone'
        }
      });

      // Obtener el enlace directo de descarga
      const downloadUrl = `https://drive.google.com/uc?export=download&id=${response.data.id}`;
      
      return {
        id: response.data.id,
        viewUrl: response.data.webViewLink,
        downloadUrl
      };
    } catch (error) {
      console.error('Error al subir archivo a Google Drive:', error);
      throw error;
    }
  }

  // Crear una carpeta en Google Drive
  async createFolder(folderName, parentFolderId = null) {
    try {
      const fileMetadata = {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: parentFolderId ? [parentFolderId] : []
      };

      const response = await this.drive.files.create({
        resource: fileMetadata,
        fields: 'id'
      });

      return response.data.id;
    } catch (error) {
      console.error('Error al crear carpeta en Google Drive:', error);
      throw error;
    }
  }

  // Eliminar un archivo o carpeta de Google Drive
  async deleteFile(fileId) {
    try {
      await this.drive.files.delete({
        fileId
      });
      return true;
    } catch (error) {
      console.error('Error al eliminar archivo de Google Drive:', error);
      throw error;
    }
  }
}

module.exports = new GoogleDriveService();*/