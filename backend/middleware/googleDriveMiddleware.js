const { google } = require('googleapis');
const multer = require('multer');
const streamifier = require('streamifier');
const path = require('path');
const fs = require('fs-extra');

// Configuración de almacenamiento en memoria para multer
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 1 * 1024 * 1024 * 1024 } // Límite de 1GB por archivo
});

// Configuración de autenticación con Google Drive API
class GoogleDriveService {
  constructor() {
    this.drive = null;
    this.initialize();
  }

  initialize() {
    try {
      // Cargar credenciales desde el archivo JSON
      const credentialsPath = path.join(__dirname, '../config/google-drive-credentials.json');
      const credentialsFile = fs.readFileSync(credentialsPath);
      const credentials = JSON.parse(credentialsFile);

      const client = new google.auth.OAuth2(
        credentials.client_id,
        credentials.client_secret,
        credentials.redirect_uri
      );

      client.setCredentials({ refresh_token: credentials.refresh_token });
      this.drive = google.drive({ version: 'v3', auth: client });
      console.log('Google Drive API initialized successfully');
    } catch (error) {
      console.error('Error initializing Google Drive API:', error);
    }
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

      // Obtener el enlace directo de visualización/descarga
      const directUrl = `https://drive.google.com/uc?export=view&id=${response.data.id}`;
      
      return {
        id: response.data.id,
        viewUrl: response.data.webViewLink,
        directUrl
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
        fields: 'id,webViewLink'
      });

      // Configurar permisos para hacer la carpeta accesible públicamente
      await this.drive.permissions.create({
        fileId: response.data.id,
        requestBody: {
          role: 'reader',
          type: 'anyone'
        }
      });

      return {
        id: response.data.id,
        viewUrl: response.data.webViewLink
      };
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

  // Actualizar un archivo existente
  async updateFile(fileId, fileBuffer, mimeType) {
    try {
      const media = {
        mimeType,
        body: streamifier.createReadStream(fileBuffer)
      };

      const response = await this.drive.files.update({
        fileId: fileId,
        media: media,
        fields: 'id,webViewLink'
      });

      const directUrl = `https://drive.google.com/uc?export=view&id=${response.data.id}`;
      
      return {
        id: response.data.id,
        viewUrl: response.data.webViewLink,
        directUrl
      };
    } catch (error) {
      console.error('Error al actualizar archivo en Google Drive:', error);
      throw error;
    }
  }
}

// Exportamos una instancia del servicio y el middleware de multer
const driveService = new GoogleDriveService();

module.exports = {
  driveService,
  uploadMiddleware: upload
};