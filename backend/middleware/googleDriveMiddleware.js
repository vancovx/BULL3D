const { google } = require('googleapis');
const multer = require('multer');
const streamifier = require('streamifier');
const path = require('path');
const fs = require('fs-extra');

// Configuración de almacenamiento en memoria para multer
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 1 * 1024 * 1024 * 1024 } 
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
      const credentials = JSON.parse(credentialsFile).web;  // Cambiado para acceder a la propiedad .web
  
      const client = new google.auth.OAuth2(
        credentials.client_id,
        credentials.client_secret,
        credentials.redirect_uris[0]  // Usar el primer URI de redirección
      );
  
      // Asegurarse de que el refresh token existe en el archivo de credenciales
      if (!credentials.refresh_token) {
        throw new Error('Falta el refresh token en el archivo de credenciales. Ejecuta getRefreshToken.js primero.');
      }
  
      client.setCredentials({ refresh_token: credentials.refresh_token });
      
      this.drive = google.drive({ version: 'v3', auth: client });
      console.log('Google Drive API inicializada correctamente');
    } catch (error) {
      console.error('Error al inicializar Google Drive API:', error);
      throw error;  // Re-lanzar el error para hacerlo visible
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
          type: 'anyone',
          allowFileDiscovery: false
        },
        sendNotificationEmail: false
      });

      // En lugar de devolver una URL directa de Google Drive, 
      // devolvemos una URL que apunta a nuestro propio proxy
      const fileId = response.data.id;
      const directUrl = `/api/proxy/image/${fileId}`;
      
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
          type: 'anyone',
          allowFileDiscovery: false
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

      // Usar nuestro proxy en lugar de URL directa de Google Drive
      const directUrl = `/api/proxy/image/${fileId}`;
      
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